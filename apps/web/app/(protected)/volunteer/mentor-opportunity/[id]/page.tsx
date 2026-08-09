"use client";

import { useState } from "react";
import {
  FileSpreadsheet,
  MessageCircleCode,
  Hand,
  Search,
  Users,
} from "lucide-react";
import { OpportunityDetail } from "@/components/layout/volunteer/home-page/OpportunityDetail";
import { useParams, useRouter } from "next/navigation";
import ProtectedLayout from "@/components/layout/ProtectedLayout";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DynamicTabs, TabItem } from "@/components/layout/shared/DynamicTabs";
import {
  Applicant,
  ApplicantsCard,
} from "@/components/layout/organisation/opportunities/ApplicantsCard";
import MessageApplicantModal from "@/components/layout/organisation/opportunities/MessageApplicantModal";
import Image from "next/image";
import BackButton from "@/components/buttons/BackButton";
import { useSession } from "next-auth/react";
import Loading from "@/app/loading";
import placeholderCoverImage from "../../../../../public/images/banners/cover_placeholder.png"

export default function MentorOpportunityDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const opportunityId = params.id as string;
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(
    null
  );
  const [applicantsSearchQuery, setApplicantsSearchQuery] = useState("");
  const [recruitsSearchQuery, setRecruitsSearchQuery] = useState("");

  const {
    data: opportunity,
    isLoading,
    error,
  } = trpc.opportunities.getOpportunity.useQuery(opportunityId, {
    enabled: !!opportunityId,
  });

  // Check if current user is a mentor for this opportunity
  const { data: opportunityMentors } =
    trpc.mentors.getOpportunityMentors.useQuery(
      { opportunityId },
      { enabled: !!opportunityId }
    );

  const { data: applicants, isLoading: isLoadingApplicants } =
    trpc.applications.getOpportunityApplicants.useQuery(
      { opportunityId },
      { enabled: !!opportunityId }
    );

  const { data: recruitedApplicants, isLoading: isLoadingRecruitedApplicants } =
    trpc.recruits.getRecruitedApplicants.useQuery(
      { opportunityId },
      { enabled: !!opportunityId }
    );

  // Check if current user is a mentor for this opportunity
  const isCurrentUserMentor = opportunityMentors?.some(
    (mentor) => mentor.volunteer._id === session?.user?.id
  );

  const handleCloseMessageModal = () => {
    setIsMessageModalOpen(false);
    setSelectedApplicant(null);
  };

  const handleOpenMessageModal = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setIsMessageModalOpen(true);
  };

  // Filter applicants based on search query and exclude current mentor
  const filteredApplicants = applicants?.filter((applicant) => {
    // Exclude current user if they are a mentor
    if (applicant.id === session?.user?.id) {
      return false;
    }

    return (
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
  });

  // Filter recruited applicants based on search query and exclude current mentor
  const filteredRecruitedApplicants = recruitedApplicants?.filter(
    (applicant) => {
      // Exclude current user if they are a mentor
      if (applicant.id === session?.user?.id) {
        return false;
      }

      return (
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
    }
  );

  if (!opportunityId) {
    return (
      <ProtectedLayout>
        <div className="container mx-auto px-4 py-8">
          <p className="text-gray-600">Invalid opportunity ID.</p>
        </div>
      </ProtectedLayout>
    );
  }

  if (isLoading || isLoadingApplicants || isLoadingRecruitedApplicants) {
    return (
      <ProtectedLayout>
        <Loading size="medium">
          <p className="text-gray-600 mt-2">Wait a sec...</p>
        </Loading>
      </ProtectedLayout>
    );
  }

  if (error || !opportunity) {
    return (
      <ProtectedLayout>
        <div className="bg-[#F5F7FA] py-6 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-xl min-h-screen p-4 sm:p-8">
              <p className="text-red-600">
                Error loading opportunity. Please try again later.
              </p>
            </div>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  // If user is not a mentor for this opportunity, redirect to dashboard
  if (!isCurrentUserMentor) {
    const role = session?.user?.role?.toLowerCase();
    router.push(role === "mentor" ? "/mentor/dashboard" : "/find-opportunity/most-recent");
    return null;
  }

  // Define tab content for mentor view
  const postContent = (
    <OpportunityDetail opportunity={opportunity} userRole="volunteer" />
  );

  const applicantsContent = (
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
          <Button
            variant="outline"
            className="h-10 px-4 flex items-center gap-2 w-full sm:w-auto"
          >
            Filter
          </Button>
        </div>
      </div>
      {filteredApplicants?.map((applicant) => (
        <ApplicantsCard
          key={applicant.id}
          applicant={applicant}
          onMessageClick={() => handleOpenMessageModal(applicant)}
          opportunityId={opportunityId}
          showMarkAsMentor={true}
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
    </div>
  );

  const recruitsContent = (
    <div className="space-y-6">
      <div className="space-y-6">
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
          <Button
            variant="outline"
            className="h-10 px-4 flex items-center gap-2 w-full sm:w-auto"
          >
            Filter
          </Button>
        </div>
        <div className="w-full border-b border-[#F1F1F1]" />
      </div>
      {filteredRecruitedApplicants?.map((applicant) => (
        <ApplicantsCard
          key={applicant.id}
          applicant={applicant}
          onMessageClick={() => handleOpenMessageModal(applicant)}
          hideRecruitButton={true}
          opportunityId={opportunityId}
          showMarkAsMentor={true}
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
    </div>
  );

  const tabs: TabItem[] = [
    {
      value: "post",
      label: "Post Details",
      icon: <FileSpreadsheet />,
      content: postContent,
    },
    {
      value: "review",
      label: "Applicants",
      icon: <MessageCircleCode />,
      count: applicants?.length || 0,
      content: applicantsContent,
    },
    {
      value: "recruits",
      label: "Recruits",
      icon: <Hand />,
      count: recruitedApplicants?.length || 0,
      content: recruitsContent,
    },
  ];

  return (
    <ProtectedLayout>
      <div className=" border py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="min-h-screen">
            <div className="p-4 sm:p-8">
              <div className="mb-6 sm:mb-8">
                <BackButton />
                <div className="w-full h-[160px] sm:h-[220px] relative mb-4 sm:mb-6 rounded-xl overflow-hidden group">
                  {opportunity.banner_img ? (
                    <>
                      <Image
                        src={opportunity.banner_img}
                        alt={`${opportunity.title} Banner`}
                        fill
                        className="object-cover"
                      />
                      {/* Gradient Overlay for light/dark images */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    </>
                  ) : (
                    /* Elegant fallback gradient matching mobile app aesthetic */
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1570EF] to-[#1d4ed8]" />
                  )}

                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 flex flex-col justify-end">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-white/80" />
                          <span className="text-sm text-white/90 font-medium">
                            Mentor View
                          </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
                          {opportunity.title}
                        </h1>
                        <p className="text-white/80 text-sm sm:text-base flex items-center gap-2">
                          <span className="inline-block w-4 h-[1px] bg-white/40" />
                          {opportunity.location || "Location not specified"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <DynamicTabs
                defaultValue="post"
                tabs={tabs}
                className="mb-6 sm:mb-8"
              />
            </div>
          </div>
        </div>
      </div>
      <MessageApplicantModal
        isOpen={isMessageModalOpen}
        onClose={handleCloseMessageModal}
        applicant={selectedApplicant}
      />
    </ProtectedLayout>
  );
}
