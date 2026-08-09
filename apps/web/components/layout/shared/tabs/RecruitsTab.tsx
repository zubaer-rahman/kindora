"use client";

import { useState } from "react";
import { Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Applicant, ApplicantsCard } from "@/components/layout/organisation/opportunities/ApplicantsCard";
import MessageApplicantModal from "@/components/layout/organisation/opportunities/MessageApplicantModal";
import { trpc } from "@/utils/trpc";
import toast from "react-hot-toast";

interface RecruitsTabProps {
  opportunityId: string;
  userRole: "volunteer" | "organisation";
  isCurrentUserMentor: boolean;
  currentUserId?: string;
  onCreateGroup: () => void;
  opportunity?: {
    created_by?: { _id: string };
    organization_profile?: { _id: string };
  };
}

export function RecruitsTab({
  opportunityId,
  userRole,
  isCurrentUserMentor,
  currentUserId,
  onCreateGroup,
  opportunity,
}: RecruitsTabProps) {
  const [recruitsSearchQuery, setRecruitsSearchQuery] = useState("");
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);

  const { data: recruitedApplicants, isLoading } = trpc.recruits.getRecruitedApplicants.useQuery(
    { opportunityId },
    { enabled: !!opportunityId }
  );

  // Filter recruited applicants based on search query
  const filteredRecruitedApplicants = recruitedApplicants?.filter(
    (applicant) =>
      applicant.name
        .toLowerCase()
        .includes(recruitsSearchQuery.toLowerCase()) ||
      applicant.location
        .toLowerCase()
        .includes(recruitsSearchQuery.toLowerCase()) ||
      applicant.skills.some((skill) =>
        skill.toLowerCase().includes(recruitsSearchQuery.toLowerCase())
      )
  );

  const handleCreateGroup = () => {
    if (!recruitedApplicants?.length) {
      toast.error("No recruited volunteers to create a group");
      return;
    }
    onCreateGroup();
  };

  const handleOpenMessageModal = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setIsMessageModalOpen(true);
  };

  const handleCloseMessageModal = () => {
    setIsMessageModalOpen(false);
    setSelectedApplicant(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="w-full border-b border-[#F1F1F1]" />
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="relative flex-1 max-w-[333px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <Input
                placeholder="Search volunteers"
                className="pl-10 bg-gray-50 border-0"
                value=""
                disabled
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                className="h-10 px-4 flex items-center gap-2 w-full sm:w-auto"
                disabled
              >
                <Users className="w-4 h-4" />
                Create Group
              </Button>
            </div>
          </div>
        </div>
        <div className="text-center text-gray-500 py-8">Loading recruited volunteers...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="w-full border-b border-[#F1F1F1]" />
        <div className="flex flex-col sm:flex-row justify-between gap-3">
          <div className="relative flex-1 max-w-[333px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
            <Input
              placeholder="Search volunteers"
              className="pl-10 bg-gray-50 border-0"
              value={recruitsSearchQuery || ""}
              onChange={(e) => setRecruitsSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="h-10 px-4 flex items-center gap-2 w-full sm:w-auto"
              onClick={handleCreateGroup}
              disabled={!recruitedApplicants?.length}
            >
              <Users className="w-4 h-4" />
              Create Group
            </Button>
          </div>
        </div>
      </div>
      {filteredRecruitedApplicants?.map((applicant) => (
        <ApplicantsCard
          key={applicant.id}
          applicant={applicant}
          onMessageClick={() => handleOpenMessageModal(applicant)}
          hideRecruitButton={true}
          opportunityId={opportunityId}
          showMarkAsMentor={(userRole === "volunteer" && isCurrentUserMentor) || userRole === "organisation"}
          isCurrentUser={applicant.id === currentUserId}
          opportunity={opportunity}
          isCurrentUserMentor={isCurrentUserMentor}
        />
      ))}
      {filteredRecruitedApplicants?.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          {recruitsSearchQuery
            ? "No matching volunteers found"
            : "No recruited volunteers yet"}
        </div>
      )}

      <MessageApplicantModal
        isOpen={isMessageModalOpen}
        onClose={handleCloseMessageModal}
        applicant={selectedApplicant}
      />
    </div>
  );
} 