import { useState } from 'react';
import { UserSearch } from '../UserSearch';
import { CreateUser } from '../CreateUser';
import { NewTicketModal } from './NewTicketModal';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';

interface CreateTicketFlowProps {
  isOpen: boolean;
  onClose: () => void;
}

type FlowStep = 'search' | 'create' | 'ticket';

export function CreateTicketFlow({ isOpen, onClose }: CreateTicketFlowProps) {
  const [currentStep, setCurrentStep] = useState<FlowStep>('search');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const { userData } = useAuth();

  if (!isOpen) return null;

  const handleCreateUser = async (newUserData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }) => {
    try {
      // Create the user in the users table
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          first_name: newUserData.firstName,
          last_name: newUserData.lastName,
          email: newUserData.email,
          phone_number: newUserData.phone,
          role: 'customer',
          company_id: userData?.company_id
        })
        .select()
        .single();

      if (error) throw error;

      setSelectedUser(newUser);
      setCurrentStep('ticket');
      toast.success('User created successfully');
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    }
  };

  const handleUserSelect = (user: any) => {
    setSelectedUser(user);
    setCurrentStep('ticket');
  };

  const handleClose = () => {
    setCurrentStep('search');
    setSelectedUser(null);
    onClose();
  };

  return (
    <>
      {currentStep === 'search' && (
        <div className="fixed inset-0 bg-black/30 z-50">
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <UserSearch
                onUserSelect={handleUserSelect}
                onCreateNewUser={() => setCurrentStep('create')}
              />
            </div>
          </div>
        </div>
      )}

      {currentStep === 'create' && (
        <div className="fixed inset-0 bg-black/30 z-50">
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <CreateUser
                onBack={() => setCurrentStep('search')}
                onSubmit={handleCreateUser}
              />
            </div>
          </div>
        </div>
      )}

      {currentStep === 'ticket' && selectedUser && (
        <NewTicketModal
          isOpen={true}
          onClose={handleClose}
          initialCustomer={selectedUser}
        />
      )}
    </>
  );
} 