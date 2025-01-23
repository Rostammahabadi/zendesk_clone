import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../../lib/supabaseClient";

type Step = 1 | 2 | 3;

interface TeamMember {
  email: string;
  role: "admin" | "agent";
}

interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: 'admin' | 'agent' | 'customer';
  company_id: string | null;
  created_at: string;
  updated_at: string;
}

interface SignupWalkthroughProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userProfile: UserProfile;
}

export const SignupWalkthrough = ({ open, onOpenChange, userProfile }: SignupWalkthroughProps) => {
  const [step, setStep] = useState<Step>(1);
  const [firstName, setFirstName] = useState(userProfile.first_name || "");
  const [lastName, setLastName] = useState(userProfile.last_name || "");
  const [companyName, setCompanyName] = useState("");
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [emailDomain, setEmailDomain] = useState<string>("");

  const handleNext = async () => {
    if (step === 1) {
      if (!companyName) {
        toast.error("Please enter your company name");
        return;
      }
      if (!firstName) {
        toast.error("Please enter your first name");
        return;
      }
      if (!lastName) {
        toast.error("Please enter your last name");
        return;
      }

      setIsLoading(true);
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error("No user found");
        if (!user.email) throw new Error("User email not found");

        // Extract domain from user's email and store it
        const domain = user.email.split('@')[1];
        setEmailDomain(domain);

        // Create company
        const { data: newCompany, error: createError } = await supabase
          .from('companies')
          .insert({ 
            name: companyName,
            domain: domain
          })
          .select()
          .single();

        await supabase.auth.updateUser({
          data: { company_id: newCompany.id }
        })

        await supabase.from('user_roles').insert({
          user_id: user.id,
          role: 'admin',
        })

        if (createError) throw createError;
        if (!newCompany) throw new Error("Failed to create company");
        
        // Store the company ID for later use
        setCompanyId(newCompany.id);

        // Create user profile as admin
        const { error: profileError } = await supabase
          .from('users')
          .insert({ 
            id: user.id,
            email: user.email,
            first_name: firstName,
            last_name: lastName,
            company_id: newCompany.id,
            role: 'admin'
          });

        if (profileError) throw profileError;

        toast.success("Company created successfully!");
        setStep(2);
      } catch (error: any) {
        console.error('Error creating company:', error);
        toast.error(error.message || "Failed to create company");
      } finally {
        setIsLoading(false);
      }
    } else if (step === 2) {
      if (!teamName) {
        toast.error("Please enter a team name");
        return;
      }
      
      if (!companyId) {
        toast.error("Company information is missing. Please go back to step 1.");
        return;
      }

      setIsLoading(true);
      try {
        // Create team
        const { data: newTeam, error: teamError } = await supabase
          .from('teams')
          .insert({
            name: teamName,
            company_id: companyId
          })
          .select()
          .single();

        if (teamError) throw teamError;
        if (!newTeam) throw new Error("Failed to create team");

        toast.success("Team created successfully!");
        setStep(3);
      } catch (error: any) {
        console.error('Error creating team:', error);
        toast.error(error.message || "Failed to create team");
      } finally {
        setIsLoading(false);
      }
    } else if (step === 3) {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error("No user found");

        // Process team member invites
        for (const member of members) {
          const { error: inviteError } = await supabase
            .from('users')
            .insert({
              email: member.email,
              company_id: companyId,
              role: member.role
            });

          if (inviteError) {
            console.error(`Failed to create user for ${member.email}:`, inviteError);
            toast.error(`Failed to invite ${member.email}`);
          }
        }

        // Update user metadata with role
        const { error: updateError } = await supabase.auth.updateUser({
          data: { role: 'admin' }
        });

        if (updateError) throw updateError;

        toast.success("Setup completed successfully!");
        onOpenChange(false);
      } catch (error: any) {
        console.error('Error completing setup:', error);
        toast.error(error.message || "Failed to complete setup");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const addMember = () => {
    if (!newMemberEmail) {
      toast.error("Please enter an email address");
      return;
    }
    const fullEmail = `${newMemberEmail}@${emailDomain}`;
    if (members.some((m) => m.email === fullEmail)) {
      toast.error("This email has already been added");
      return;
    }
    setMembers([...members, { email: fullEmail, role: "agent" }]);
    setNewMemberEmail("");
  };

  const removeMember = (email: string) => {
    setMembers(members.filter((m) => m.email !== email));
  };

  // Handle dialog close attempts
  const handleOpenChange = (newOpen: boolean) => {
    // If trying to close (newOpen is false)
    if (!newOpen) {
      // If on first step, prevent closing and show message
      if (step === 1) {
        toast.error("Please complete the company setup first");
        return;
      }
      
      // For later steps, confirm before closing
      if (window.confirm("Are you sure you want to exit the setup? Your progress will be lost.")) {
        // Reset state when confirmed
        setStep(1);
        setCompanyName("");
        setTeamName("");
        setMembers([]);
        setNewMemberEmail("");
        onOpenChange(false);
      }
    } else {
      onOpenChange(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]" onPointerDownOutside={e => {
        // Prevent closing on clicking outside if on first step
        if (step === 1) {
          e.preventDefault();
          toast.error("Please complete the company setup first");
        }
      }}>
        {step === 1 && (
          <>
            <DialogHeader>
              <DialogTitle>Welcome to Your Support Desk</DialogTitle>
              <DialogDescription>
                Let's start by getting to know you and your company.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter your first name"
                  autoFocus
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter your last name"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Enter your company name"
                  disabled={isLoading}
                />
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <DialogHeader>
              <DialogTitle>Create Your First Team</DialogTitle>
              <DialogDescription>
                Teams help organize your support staff effectively.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="teamName">Team Name</Label>
                <Input
                  id="teamName"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g., Customer Support"
                  autoFocus
                  disabled={isLoading}
                />
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <DialogHeader>
              <DialogTitle>Invite Team Members</DialogTitle>
              <DialogDescription>
                Add members to your {teamName} team.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    value={newMemberEmail}
                    onChange={(e) => {
                      // Remove any @ symbols or spaces from input
                      const sanitizedInput = e.target.value.replace(/[@\s]/g, '');
                      setNewMemberEmail(sanitizedInput);
                    }}
                    placeholder="Enter username"
                    type="text"
                    autoFocus
                    disabled={isLoading}
                    className="pr-[100px]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    @{emailDomain}
                  </span>
                </div>
                <Button onClick={addMember} size="icon" variant="outline" disabled={isLoading}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                {members.map((member) => (
                  <div
                    key={member.email}
                    className="flex items-center justify-between p-2 bg-muted rounded-md"
                  >
                    <span className="text-sm">{member.email}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMember(member.email)}
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <DialogFooter>
          <div className="flex justify-end gap-2 w-full">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep((prev) => (prev - 1) as Step)}
                disabled={isLoading}
                className="text-gray-700 hover:text-gray-900"
              >
                Back
              </Button>
            )}
            <Button 
              onClick={handleNext} 
              disabled={isLoading}
              variant="default"
              className="bg-indigo-600 text-white hover:bg-indigo-700"
            >
              {isLoading ? "Please wait..." : step === 3 ? "Complete Setup" : "Next"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};