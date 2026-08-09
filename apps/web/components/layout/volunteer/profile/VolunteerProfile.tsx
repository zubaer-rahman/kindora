"use client";

import { trpc } from "@/utils/trpc";
import { Key, useState, useMemo } from "react";
import BackButton from "@/components/buttons/BackButton";
import MessageDialog from "@/components/layout/organisation/MessageDialog";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import countryList from "react-select-country-list";
import { formatText } from "@/utils/helpers/formatText";
import QueryStateWrapper from "@/components/layout/shared/QueryStateWrapper";
import VolunteerProfileBanner from "./VolunteerProfileBanner";

interface VolunteerProfileProps {
  volunteerId: string;
}

interface Application {
  _id: string;
  status: "pending" | "approved" | "rejected";
  opportunity: {
    _id: string;
    title: string;
    description: string;
    category: string[];
    location: string;
    commitment_type: string;
  } | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export function VolunteerProfile({ volunteerId }: VolunteerProfileProps) {
  const { data: volunteer, isLoading } =
    trpc.volunteers.getVolunteerById.useQuery(volunteerId);
  const { data: applications, isLoading: isLoadingApplications } =
    trpc.applications.getVolunteerApplications.useQuery(volunteerId);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

  const countryOptions = useMemo(() => countryList().getData(), []);

  // Function to get country name from ISO code
  const getCountryName = (isoCode: string) => {
    const country = countryOptions.find(option => option.value === isoCode);
    return country ? country.label : isoCode;
  };

  // Helper function to format commitment type
  const formatCommitmentType = (type: string | undefined) => {
    if (!type) return "Not specified";
    if (type === "workbased") return "Work based";
    if (type === "eventbased") return "Event based";
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Helper function to get display text for student status
  const getStudentStatusDisplay = () => {
    if (!volunteer) return "Not specified";
    if (volunteer.is_currently_studying) {
      if (volunteer.is_currently_studying === "yes") {
        return "Currently Studying";
      } else if (volunteer.is_currently_studying === "no") {
        if (volunteer.non_student_type === "staff") {
          return "Staff Member";
        } else if (volunteer.non_student_type === "alumni") {
          return "Alumni";
        } else if (volunteer.non_student_type === "general") {
          return "General Public";
        }
        return "Not Currently Studying";
      }
    }

    // Fallback for old users
    if (volunteer.student_type) {
      return volunteer.student_type === "yes" ? "Student" : "Non-Student";
    }

    return "Not specified";
  };

  // Helper function to get course/study area display
  const getCourseDisplay = () => {
    if (!volunteer) return null;
    if (volunteer.is_currently_studying === "yes" && volunteer.course) {
      return volunteer.course;
    }
    if (volunteer.is_currently_studying === "no" && volunteer.study_area) {
      return volunteer.study_area;
    }
    // Fallback for old users
    if (volunteer.course) {
      return volunteer.course;
    }
    return null;
  };

  // Helper function to get university display
  const getUniversityDisplay = () => {
    if (!volunteer) return null;
    if (volunteer.is_currently_studying === "yes" && volunteer.university) {
      return volunteer.university;
    }
    if (volunteer.is_currently_studying === "no" && volunteer.non_student_type === "alumni" && volunteer.university) {
      return volunteer.university;
    }
    return null;
  };

  return (
    <QueryStateWrapper
      isLoading={isLoading || isLoadingApplications}
      error={null}
      data={volunteer}
      loadingMessage="Wait a sec..."
      notFoundTitle="Volunteer not found"
      notFoundDescription="The volunteer you're looking for doesn't exist."
    >
      {volunteer && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          {/* Back Button */}
          <div className="pt-6">
            <BackButton />
          </div>

          <VolunteerProfileBanner
            volunteer={volunteer}
            getStudentStatusDisplay={getStudentStatusDisplay}
          />

          <div className="space-y-8 sm:space-y-10">
            {/* About Section */}
            {volunteer.bio && (
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-[#101828] mb-3 sm:mb-4">
                  About
                </h2>
                <p className="text-sm sm:text-base text-[#475467] leading-relaxed text-justify break-words">
                  {volunteer.bio}
                </p>
              </div>
            )}

            {/* Skills */}
            {volunteer.interested_on && volunteer.interested_on.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                <div className="flex-1">
                  <h2 className="text-lg sm:text-xl font-bold text-[#101828] mb-3 sm:mb-4">
                    Skills
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {volunteer.interested_on.map((skill: string, index: Key | null | undefined) => (
                      <span
                        key={index}
                        className="bg-[#EFF8FF] text-[#175CD3] border border-[#B2DDFF] px-3 py-1 rounded-full text-xs sm:text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Send Message Button Beside Skills */}
                <div className="flex-shrink-0 pt-2">
                  <Button
                    onClick={() => setIsMessageModalOpen(true)}
                    className="bg-white hover:bg-gray-50 text-blue-600 px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold shadow-sm border border-gray-100 transition-all duration-200"
                  >
                    <MessageCircle className="w-4 h-4 text-blue-600" />
                    <span>Send Message</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Additional Information Section */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#101828] mb-4 sm:mb-6">
                Additional Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {/* Member Type */}
                <div className="space-y-1.5 sm:space-y-2">
                  <h3 className="text-sm sm:text-base font-semibold text-[#344054]">Member Type</h3>
                  <p className="text-sm sm:text-base text-[#475467]">
                    {getStudentStatusDisplay()}
                  </p>
                </div>

                {/* Location */}
                {(volunteer.state || volunteer.area) && (
                  <div className="space-y-1.5 sm:space-y-2">
                    <h3 className="text-sm sm:text-base font-semibold text-[#344054]">Location</h3>
                    <p className="text-sm sm:text-base text-[#475467]">
                      {volunteer.area && volunteer.state
                        ? formatText(volunteer.area, volunteer.state)
                        : volunteer.state || formatText(volunteer.area)
                      }
                    </p>
                  </div>
                )}

                {/* Home Country */}
                {(volunteer.is_currently_studying === "yes" || (!volunteer.is_currently_studying && volunteer.student_type)) && (
                  <div className="space-y-1.5 sm:space-y-2">
                    <h3 className="text-sm sm:text-base font-semibold text-[#344054]">Home Country</h3>
                    <p className="text-sm sm:text-base text-[#475467]">
                      {volunteer.student_type === "yes" ? (volunteer.home_country ? getCountryName(volunteer.home_country) : "Australia") : "Australia"}
                    </p>
                  </div>
                )}

                {/* Course/Study Area */}
                {getCourseDisplay() && (
                  <div className="space-y-1.5 sm:space-y-2">
                    <h3 className="text-sm sm:text-base font-semibold text-[#344054]">
                      {volunteer.is_currently_studying === "yes" ? "Course" : "Study Area"}
                    </h3>
                    <p className="text-sm sm:text-base text-[#475467]">
                      {getCourseDisplay()}
                    </p>
                  </div>
                )}

                {/* Major */}
                {volunteer.major && (
                  <div className="space-y-1.5 sm:space-y-2">
                    <h3 className="text-sm sm:text-base font-semibold text-[#344054]">Major</h3>
                    <p className="text-sm sm:text-base text-[#475467]">
                      {volunteer.major === "other" ? volunteer.major_other : volunteer.major}
                    </p>
                  </div>
                )}

                {/* University */}
                {getUniversityDisplay() && (
                  <div className="space-y-1.5 sm:space-y-2">
                    <h3 className="text-sm sm:text-base font-semibold text-[#344054]">University</h3>
                    <p className="text-sm sm:text-base text-[#475467]">
                      {getUniversityDisplay()}
                    </p>
                  </div>
                )}

                {/* Graduation Year */}
                {volunteer.is_currently_studying === "no" &&
                  volunteer.non_student_type === "alumni" &&
                  volunteer.graduation_year && (
                    <div className="space-y-1.5 sm:space-y-2">
                      <h3 className="text-sm sm:text-base font-semibold text-[#344054]">Graduation Year</h3>
                      <p className="text-sm sm:text-base text-[#475467]">
                        {volunteer.graduation_year}
                      </p>
                    </div>
                  )}

                {/* Postcode */}
                {volunteer.postcode && (
                  <div className="space-y-1.5 sm:space-y-2">
                    <h3 className="text-sm sm:text-base font-semibold text-[#344054]">Postcode</h3>
                    <p className="text-sm sm:text-base text-[#475467]">
                      {volunteer.postcode}
                    </p>
                  </div>
                )}
              </div>

              {/* Interested Categories */}
              {volunteer.interested_categories && volunteer.interested_categories.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-sm sm:text-base font-semibold text-[#344054] mb-3">Interested Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {volunteer.interested_categories.map((category: string, index: number) => (
                      <span
                        key={index}
                        className="bg-[#ECFDF3] text-[#027A48] border border-[#ABEFC6] px-3 py-1 rounded-full text-xs sm:text-sm font-medium"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Experience & Applications Section */}
            {applications && applications.length > 0 && (
              <div className="pt-8 border-t border-[#E9EAEB]">
                <h2 className="text-lg sm:text-xl font-bold text-[#101828] mb-4 sm:mb-6">
                  Experience & Applications
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {(applications as Application[])
                    .filter(
                      (
                        application
                      ): application is Application & {
                        opportunity: NonNullable<Application["opportunity"]>;
                      } => Boolean(application.opportunity?.title)
                    )
                    .map((application) => (
                      <div
                        key={application._id}
                        className="border border-[#EAECF0] rounded-xl p-4 sm:p-5 hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex flex-col gap-3">
                          <div className="flex-1">
                            <h4 className="font-bold text-[#101828] text-base sm:text-lg">
                              {application.opportunity.title}
                            </h4>

                            <div className="flex flex-wrap gap-2 mt-2">
                              {application.opportunity.category?.map(
                                (category: string, index: number) => (
                                  <span
                                    key={index}
                                    className="bg-[#F9FAFB] text-[#344054] border border-[#EAECF0] px-2 py-0.5 rounded-full text-xs font-medium"
                                  >
                                    {category}
                                  </span>
                                )
                              )}
                            </div>
                          </div>

                          <div className="text-sm text-[#475467] space-y-1.5 pt-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Location:</span>
                              <span>{application.opportunity.location || "Not specified"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Commitment:</span>
                              <span>{formatCommitmentType(application.opportunity.commitment_type)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Message Dialog */}
          <MessageDialog
            isOpen={isMessageModalOpen}
            onOpenChange={setIsMessageModalOpen}
            volunteer={volunteer}
          />
        </div>
      )}
    </QueryStateWrapper>
  );
}
