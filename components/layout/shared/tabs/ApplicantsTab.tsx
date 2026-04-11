"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Applicant, ApplicantsCard } from "@/components/layout/organisation/opportunities/ApplicantsCard";
import MessageApplicantModal from "@/components/layout/organisation/opportunities/MessageApplicantModal";
import { trpc } from "@/utils/trpc";

interface ApplicantsTabProps {
  opportunityId: string;
  userRole?: "volunteer" | "organisation";
  isCurrentUserMentor: boolean;
  currentUserId?: string;
  opportunity?: {
    created_by?: { _id: string };
    organization_profile?: { _id: string };
  };
}

export function ApplicantsTab({
  opportunityId,
  isCurrentUserMentor,
  currentUserId,
  opportunity,
}: ApplicantsTabProps) {
  const [applicantsSearchQuery, setApplicantsSearchQuery] = useState("");
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);

  const { data: applicants, isLoading } = trpc.applications.getOpportunityApplicants.useQuery(
    { opportunityId },
    { enabled: !!opportunityId }
  );

  // Filter applicants based on search query
  const filteredApplicants = applicants?.filter(
    (applicant) =>
      applicant.name
        .toLowerCase()
        .includes(applicantsSearchQuery.toLowerCase()) ||
      applicant.location
        .toLowerCase()
        .includes(applicantsSearchQuery.toLowerCase()) ||
      applicant.skills.some((skill) =>
        skill.toLowerCase().includes(applicantsSearchQuery.toLowerCase())
      )
  );

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
          </div>
        </div>
        <div className="text-center text-gray-500 py-8">Loading applicants...</div>
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
              value={applicantsSearchQuery || ""}
              onChange={(e) => setApplicantsSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
      {filteredApplicants?.map((applicant) => (
        <ApplicantsCard
          key={applicant.id}
          applicant={applicant}
          onMessageClick={() => handleOpenMessageModal(applicant)}
          opportunityId={opportunityId}
          showMarkAsMentor={false}
          isCurrentUser={applicant.id === currentUserId}
          opportunity={opportunity}
          isCurrentUserMentor={isCurrentUserMentor}
        />
      ))}
      {filteredApplicants?.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          {applicantsSearchQuery
            ? "No matching applicants found"
            : "No applicants yet"}
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