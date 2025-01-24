import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from '../../hooks/useAuth'

type Step = 1 | 2 | 3;

interface TeamMember {
  email: string;
  role: "admin" | "agent";
}

export const SignupWalkthrough = () => {
  const navigate = useNavigate();
  const { userData } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [firstName, setFirstName] = useState(userData?.first_name || "");
  const [lastName, setLastName] = useState(userData?.last_name || "");
  const [companyName, setCompanyName] = useState("");
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [_, setEmailDomain] = useState<string>("");

  const handleNext = async () => {
    if (step === 1) {
      // Validate required fields
      if (!firstName.trim()) {
        toast.error("First name is required");
        return;
      }
      if (!lastName.trim()) {
        toast.error("Last name is required");
        return;
      }
      if (!companyName.trim()) {
        toast.error("Company name is required");
        return;
      }
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
        navigate('/admin/dashboard');
      } catch (error: any) {
        console.error('Error completing setup:', error);
        toast.error(error.message || "Failed to complete setup");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {step === 1 ? "Welcome to Your Support Desk" : step === 2 ? "Create Your Team" : "Review and Finish"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {step === 1 
              ? "Let's start by getting to know you and your company."
              : step === 2 
                ? "Add team members to get started quickly."
                : "Review your setup before finishing."}
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="firstName" className="text-gray-900">First Name *</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1"
                  placeholder="John"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-gray-900">Last Name *</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1"
                  placeholder="Doe"
                  required
                />
              </div>
              <div>
                <Label htmlFor="companyName" className="text-gray-900">Company Name *</Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="mt-1"
                  placeholder="Acme Inc."
                  required
                />
              </div>
              <p className="text-sm text-gray-500">* Required fields</p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="teamName" className="text-gray-900">Team Name</Label>
                <Input
                  id="teamName"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="mt-1"
                  placeholder="Support Team"
                />
              </div>
              <div>
                <Label className="text-gray-900">Team Members</Label>
                <div className="mt-2 space-y-2">
                  {members.map((member, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={member.email}
                        readOnly
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setMembers(members.filter((_, i) => i !== index));
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex items-center space-x-2">
                    <Input
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      placeholder="team@company.com"
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (newMemberEmail) {
                          setMembers([...members, { email: newMemberEmail, role: "agent" }]);
                          setNewMemberEmail("");
                        }
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900">Company Details</h3>
                <p className="text-sm text-gray-500">{companyName}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Team</h3>
                <p className="text-sm text-gray-500">{teamName}</p>
                <ul className="mt-2 text-sm text-gray-500">
                  {members.map((member, index) => (
                    <li key={index}>{member.email}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setStep((s) => Math.max(1, s - 1) as Step)}
              disabled={step === 1 || isLoading}
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={isLoading}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {isLoading ? "Loading..." : step === 3 ? "Finish" : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};