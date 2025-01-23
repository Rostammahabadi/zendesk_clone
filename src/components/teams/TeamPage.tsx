import { useState, useEffect, useRef } from "react";
import { useTeamUserGroups, useUpdateTeam, useDeleteTeam, useAddTeamMember } from "../../hooks/queries/useTeams";
import { toast } from "sonner";
import {
  Users,
  Plus,
  UserPlus,
  BarChart2,
  MoreVertical,
  MessageSquare,
  Clock,
  Trash2,
  Pencil,
} from "lucide-react";
import { NewTeamModal } from "./NewTeamModal";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import { SelectUsersModal } from "./SelectUsersModal";

export function TeamPage() {
  const [isNewTeamModalOpen, setIsNewTeamModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; teamId: string; teamName: string; } | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const [addMembersModal, setAddMembersModal] = useState<{ isOpen: boolean; teamId: string; teamName: string; currentTeamMembers: any[]; } | null>(null);
  
  const { data: teamUserGroups, isLoading } = useTeamUserGroups();
  const { mutate: updateTeam } = useUpdateTeam();
  const { mutate: deleteTeam } = useDeleteTeam();
  const { mutate: addTeamMember } = useAddTeamMember();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Focus input when editing starts
  useEffect(() => {
    if (editingTeamId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingTeamId]);

  const handleMenuClick = (e: React.MouseEvent, teamId: string) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === teamId ? null : teamId);
  };

  const startEditing = (e: React.MouseEvent, team: { id: string; name: string }) => {
    e.stopPropagation();
    setEditingTeamId(team.id);
    setEditingName(team.name);
    setOpenMenuId(null);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingName(e.target.value);
  };

  const handleNameSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (!editingTeamId) return;
      
      updateTeam(
        { 
          teamId: editingTeamId, 
          name: editingName.trim() 
        },
        {
          onSuccess: () => {
            toast.success('Team name updated successfully');
            setEditingTeamId(null);
          },
          onError: (error) => {
            toast.error('Failed to update team name');
            console.error('Error updating team name:', error);
          }
        }
      );
    } else if (e.key === 'Escape') {
      setEditingTeamId(null);
    }
  };

  const handleNameBlur = () => {
    setEditingTeamId(null);
  };

  const handleDeleteTeam = (e: React.MouseEvent, teamId: string, teamName: string) => {
    e.stopPropagation();
    setDeleteConfirmation({ isOpen: true, teamId, teamName });
    setOpenMenuId(null);
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmation) return;
    
    deleteTeam(deleteConfirmation.teamId, {
      onSuccess: () => {
        toast.success('Team deleted successfully');
        setDeleteConfirmation(null);
      },
      onError: (error) => {
        toast.error('Failed to delete team');
        console.error('Error deleting team:', error);
      }
    });
  };

  const handleAddMembers = (selectedUserIds: string[]) => {
    if (!addMembersModal?.teamId) return;
    
    Promise.all(
      selectedUserIds.map(userId =>
        addTeamMember(
          { teamId: addMembersModal.teamId, userId },
          {
            onError: () => toast.error(`Failed to add member to ${addMembersModal.teamName}`)
          }
        )
      )
    ).then(() => {
      toast.success(`Members added to ${addMembersModal.teamName}`);
      setAddMembersModal(null);
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Teams
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage your support teams and members
            </p>
          </div>
          <button 
            onClick={() => setIsNewTeamModalOpen(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Team
          </button>
        </div>
        <div className="grid gap-6">
          {teamUserGroups?.map((team: any) => (
            <div
              key={team.team_id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm"
            >
              <div className="p-6">
                {/* Team Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {editingTeamId === team.team_id ? (
                          <input
                            ref={editInputRef}
                            type="text"
                            value={editingName}
                            onChange={handleNameChange}
                            onKeyDown={handleNameSubmit}
                            onBlur={handleNameBlur}
                            className="bg-transparent border-b border-blue-500 focus:outline-none focus:border-blue-600 px-0 py-1 w-full text-lg font-medium text-gray-900 dark:text-white"
                          />
                        ) : (
                          team.team_name
                        )}
                      </h3>
                    </div>
                  </div>
                  <div className="relative">
                    <button 
                      onClick={(e) => handleMenuClick(e, team.team_id)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                      <MoreVertical className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                    {openMenuId === team.team_id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                        <div className="py-1">
                          <button
                            onClick={(e) => startEditing(e, { id: team.team_id, name: team.team_name })}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Pencil className="w-4 h-4 mr-2" />
                            Update {team.team_name}
                          </button>
                          <button
                            onClick={(e) => handleDeleteTeam(e, team.team_id, team.team_name)}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete {team.team_name}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {/* Team Metrics */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>Open Tickets</span>
                    </div>
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {team.open_tickets}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                      <Clock className="w-4 h-4" />
                      <span>In Progress Tickets</span>
                    </div>
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {team.in_progress_tickets}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                      <BarChart2 className="w-4 h-4" />
                      <span>Closed Tickets</span>
                    </div>
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {team.closed_tickets}
                    </div>
                  </div>
                </div>
                {/* Team Members */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Team Members
                    </h4>
                    <button 
                      onClick={() => setAddMembersModal({ 
                        isOpen: true, 
                        teamId: team.team_id, 
                        teamName: team.team_name,
                        currentTeamMembers: team.users || []
                      })}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center"
                    >
                      <UserPlus className="w-4 h-4 mr-1" />
                      Add Member
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {team.users?.map((user: any) => (
                      <div
                        key={user?.id}
                        className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                          {user?.first_name?.[0]}{user?.last_name?.[0]}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {user?.first_name} {user?.last_name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user?.role}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <NewTeamModal 
          isOpen={isNewTeamModalOpen}
          onClose={() => setIsNewTeamModalOpen(false)}
        />
        <DeleteConfirmationModal
          isOpen={!!deleteConfirmation?.isOpen}
          onClose={() => setDeleteConfirmation(null)}
          onConfirm={handleConfirmDelete}
          teamName={deleteConfirmation?.teamName ?? ''}
        />
        <SelectUsersModal
          isOpen={!!addMembersModal?.isOpen}
          onClose={() => setAddMembersModal(null)}
          onConfirm={handleAddMembers}
          title={`Add Members to ${addMembersModal?.teamName}`}
          currentTeamMembers={addMembersModal?.currentTeamMembers}
        />
      </div>
    </div>
  );
}
