"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/form-input/FormInput";
import { FormTextarea } from "@/components/form-input/FormTextarea";
import { FormSelect } from "@/components/form-input/FormSelect";
import {
  MentorProfileUpdateData,
  MentorProfileUpdateSchema,
  STATES_OPTIONS,
  SKILL_OPTIONS,
} from "@/utils/constants";
import { MultiSelectField } from "@/components/form-input/MultiSelectField";
import { PhoneField } from "@/components/form-input/PhoneField";
import { suburbs } from "@/utils/constants/suburb";
import { trpc } from "@/utils/trpc";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import BackButton from "@/components/buttons/BackButton";
import { useSession } from "next-auth/react";
import { formatText } from "@/utils/helpers/formatText";
import countryList from "react-select-country-list";
import { useMemo } from "react";
import {
  ProfileCard,
  InformationCard,
  InfoField,
  InfoGrid,
  BadgeList,
  SubmitButton,
} from "@/components/layout/shared";
import { SkillsMultiSelect } from "@/components/form-input/SkillsMultiSelectSelect";
import RandomAvatar from "@/components/ui/random-avatar";
import { ProfilePhotoInput } from "@/components/form-input/ProfilePhotoInput";

export function MentorProfileForm() {
  const [editMode, setEditMode] = useState<"none" | "personal">("none");
  const [isImageUploading, setIsImageUploading] = useState(false);
  const { data: mentorProfile, isLoading } =
    trpc.mentorProfile.getMentorProfile.useQuery();
  const { data: session, update: updateSession } = useSession();
  const utils = trpc.useUtils();

  const countryOptions = useMemo(() => countryList().getData(), []);

  const mentorProfileUpdateMutation =
    trpc.mentorProfile.updateMentorProfile.useMutation({
      onSuccess: async () => {
        await utils.mentorProfile.getMentorProfile.invalidate();
        await updateSession();
        toast.success("Mentor profile updated successfully!");
        setEditMode("none");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to update profile");
      },
    });

  const createSkillMutation = trpc.skills.create.useMutation();

  const form = useForm<MentorProfileUpdateData>({
    resolver: zodResolver(MentorProfileUpdateSchema),
    defaultValues: {
      name: "",
      phone_number: "",
      bio: "",
      interested_on: [],
      interested_categories: [],
      state: "",
      area: "",
      postcode: "",
      // Academic fields
      student_type: "",
      home_country: "",
      course: "",
      major: "",
      major_other: "",
      is_currently_studying: "",
      non_student_type: undefined,
      university: "",
      graduation_year: "",
      study_area: "",
    },
  });

  useEffect(() => {
    if (mentorProfile) {
      let defaultIsCurrentlyStudying = mentorProfile.is_currently_studying;
      if (!defaultIsCurrentlyStudying) {
        if (mentorProfile.student_type || mentorProfile.course) {
          defaultIsCurrentlyStudying = "yes";
        } else {
          defaultIsCurrentlyStudying = "no";
        }
      }

      form.reset({
        name: mentorProfile.name || "",
        phone_number: mentorProfile.phone_number || "",
        bio: mentorProfile.bio || "",
        interested_on: mentorProfile.interested_on || [],
        interested_categories: mentorProfile.interested_categories || [],
        state: mentorProfile.state || "",
        area: mentorProfile.area?.replace(/_/g, " ") || "",
        // Academic fields
        student_type: mentorProfile.student_type || "no",
        home_country: mentorProfile.home_country || "",
        course: mentorProfile.course || "",
        major: mentorProfile.major || "",
        major_other: mentorProfile.major_other || "",
        is_currently_studying: defaultIsCurrentlyStudying || "yes",
        non_student_type: mentorProfile.non_student_type || "general_public",
        university: mentorProfile.university || "",
        graduation_year: mentorProfile.graduation_year || "",
        study_area: mentorProfile.study_area || "",
        image: mentorProfile.image || "",
      });
    }
  }, [mentorProfile, form]);

  const onSubmit = async (data: MentorProfileUpdateData) => {
    try {
      const newSkills =
        data.interested_on?.filter(
          (skill) =>
            !SKILL_OPTIONS.find(
              (opt: { value: string; label: string }) => opt.value === skill,
            ),
        ) || [];

      for (const skillName of newSkills) {
        try {
          await createSkillMutation.mutateAsync({ name: skillName });
        } catch (error) {
          console.error("Failed to create skill:", error);
        }
      }

      const formattedData = {
        ...data,
        area: data.area?.replace(/_/g, " "),
      };

      await mentorProfileUpdateMutation.mutateAsync(formattedData);
    } catch {}
  };

  const handleCancelEdit = () => setEditMode("none");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto p-3 md:p-6">
        <BackButton className="mb-4" />

        <div className="space-y-6">
          {/* Profile Picture Card */}
          <ProfileCard className="mb-6">
            <div className="flex flex-col items-center space-y-4">
              <RandomAvatar
                name={mentorProfile?.name || session?.user?.name || "User"}
                imageUrl={mentorProfile?.image || session?.user?.image}
                size={120}
                className="h-24 w-24 lg:h-28 lg:w-28 ring-3 ring-gray-100 shadow-lg"
              />
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {mentorProfile?.name || session?.user?.name || "User"}
                </h3>
              </div>
            </div>
          </ProfileCard>

          {/* Personal Information Card */}
          <InformationCard
            title="Personal Information"
            editMode={editMode === "personal" ? "active" : "inactive"}
            onEditClick={() => setEditMode("personal")}
            onCancelClick={handleCancelEdit}
          >
            {editMode === "personal" ? (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <InfoGrid>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Profile Photo
                      </label>
                      <ProfilePhotoInput
                        name="image"
                        defaultValue={
                          mentorProfile?.image ||
                          session?.user?.image ||
                          undefined
                        }
                        setValue={form.setValue as any}
                        onUploadStateChange={setIsImageUploading}
                      />
                    </div>
                    <FormInput
                      control={form.control}
                      name="name"
                      label="Name"
                      placeholder="Enter your full name"
                    />
                  </InfoGrid>

                  <InfoGrid>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        value={session?.user?.email || ""}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Role
                      </label>
                      <input
                        type="text"
                        value="Mentor"
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                  </InfoGrid>

                  <PhoneField
                    label="Phone Number"
                    id="phone_number"
                    placeholder="+61 1243 5978"
                    register={form.register}
                    registerName="phone_number"
                    error={form.formState.errors.phone_number?.message}
                    value={form.watch("phone_number")}
                    setValue={form.setValue}
                  />

                  <InfoGrid>
                    <FormSelect
                      label="State"
                      id="state"
                      placeholder="Select your state"
                      control={form.control}
                      registerName="state"
                      error={form.formState.errors.state?.message}
                      options={STATES_OPTIONS}
                      searchEnabled
                    />

                    <FormSelect
                      label="Area"
                      id="area"
                      placeholder="Select your area"
                      control={form.control}
                      registerName="area"
                      error={form.formState.errors.area?.message}
                      options={suburbs}
                      searchEnabled
                    />
                  </InfoGrid>

                  <FormTextarea
                    control={form.control}
                    name="bio"
                    label="About You (optional)"
                    placeholder="Tell us about yourself, your interests, and your experience as a mentor..."
                  />

                  <SkillsMultiSelect
                    label="Expertise"
                    placeholder="Select your areas of expertise"
                    error={form.formState.errors.interested_on?.message}
                    value={form.watch("interested_on") || []}
                    onChange={(value: string[]) =>
                      form.setValue("interested_on", value)
                    }
                  />

                  <MultiSelectField
                    label="Interested In Mentoring"
                    id="interested_categories"
                    placeholder="Select categories you're interested in mentoring"
                    register={form.register}
                    registerName="interested_categories"
                    error={form.formState.errors.interested_categories?.message}
                    options={[
                      {
                        value: "Community & Social Services",
                        label: "Community & Social Services",
                      },
                      {
                        value: "Education & Mentorship",
                        label: "Education & Mentorship",
                      },
                      {
                        value: "Healthcare & Medical Volunteering",
                        label: "Healthcare & Medical Volunteering",
                      },
                      {
                        value: "Corporate & Skilled Volunteering",
                        label: "Corporate & Skilled Volunteering",
                      },
                      {
                        value: "Technology & Digital Volunteering",
                        label: "Technology & Digital Volunteering",
                      },
                      { value: "Animal Welfare", label: "Animal Welfare" },
                      {
                        value: "Arts, Culture & Heritage",
                        label: "Arts, Culture & Heritage",
                      },
                      {
                        value: "Environmental & Conservation",
                        label: "Environmental & Conservation",
                      },
                    ]}
                    setValue={form.setValue}
                    value={form.watch("interested_categories")}
                  />

                  {/* Academic Information Section */}
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">
                      Academic Background
                    </h3>

                    <div className="space-y-4">
                      <FormSelect
                        label="Are you currently studying?"
                        id="is_currently_studying"
                        placeholder="Select your status"
                        control={form.control}
                        registerName="is_currently_studying"
                        error={
                          form.formState.errors.is_currently_studying?.message
                        }
                        options={[
                          { value: "yes", label: "Yes" },
                          { value: "no", label: "No" },
                        ]}
                        onChange={(value) => {
                          if (value === "yes") {
                            form.setValue("non_student_type", "");
                            form.setValue("university", "");
                            form.setValue("graduation_year", "");
                            form.setValue("study_area", "");
                          } else if (value === "no") {
                            form.setValue("student_type", "");
                            form.setValue("home_country", "");
                            form.setValue("course", "");
                            form.setValue("major", "");
                            form.setValue("major_other", "");
                          }
                        }}
                      />

                      {form.watch("is_currently_studying") === "yes" && (
                        <>
                          <FormSelect
                            label="Are you an international student?"
                            id="student_type"
                            placeholder="Select your type"
                            control={form.control}
                            registerName="student_type"
                            error={form.formState.errors.student_type?.message}
                            options={[
                              { value: "yes", label: "Yes" },
                              { value: "no", label: "No" },
                            ]}
                          />

                          {form.watch("student_type") === "yes" && (
                            <FormSelect
                              label="Home Country"
                              id="home_country"
                              placeholder="Select your country"
                              control={form.control}
                              registerName="home_country"
                              error={
                                form.formState.errors.home_country?.message
                              }
                              options={countryOptions}
                            />
                          )}

                          <FormSelect
                            label="Course"
                            id="course"
                            placeholder="Select your course"
                            control={form.control}
                            registerName="course"
                            error={form.formState.errors.course?.message}
                            options={[
                              { value: "phd", label: "Doctorate / PhD" },
                              {
                                value: "masters",
                                label: "Master's Degree (Postgraduate)",
                              },
                              {
                                value: "bachelor",
                                label: "Bachelor's Degree (Undergraduate)",
                              },
                              {
                                value: "diploma",
                                label: "Diploma / Certificate",
                              },
                              {
                                value: "professional",
                                label: "Professional / Industry Expert",
                              },
                            ]}
                          />

                          <FormSelect
                            label="Major"
                            id="major"
                            placeholder="Select your major"
                            control={form.control}
                            registerName="major"
                            error={form.formState.errors.major?.message}
                            options={[
                              { value: "business", label: "Business" },
                              { value: "engineering", label: "Engineering" },
                              { value: "it", label: "Information Technology" },
                              { value: "science", label: "Science" },
                              { value: "arts", label: "Arts" },
                              { value: "education", label: "Education" },
                              { value: "health", label: "Health" },
                              { value: "other", label: "Other" },
                            ]}
                          />

                          {form.watch("major") === "other" && (
                            <FormInput
                              control={form.control}
                              name="major_other"
                              label="Please specify your major"
                              placeholder="Enter your major"
                            />
                          )}
                        </>
                      )}

                      {form.watch("is_currently_studying") === "no" && (
                        <>
                          <FormSelect
                            label="What type of member are you?"
                            id="non_student_type"
                            placeholder="Select your type"
                            control={form.control}
                            registerName="non_student_type"
                            error={
                              form.formState.errors.non_student_type?.message
                            }
                            options={[
                              { value: "staff", label: "Staff Member" },
                              { value: "alumni", label: "University Alumni" },
                              {
                                value: "general_public",
                                label: "General Public Member",
                              },
                            ]}
                          />

                          {form.watch("non_student_type") === "alumni" && (
                            <>
                              <FormInput
                                control={form.control}
                                name="university"
                                label="University"
                                placeholder="e.g. University of Technology Sydney, University of Sydney, etc."
                              />

                              <FormSelect
                                label="Graduation Year"
                                id="graduation_year"
                                placeholder="Select graduation year"
                                control={form.control}
                                registerName="graduation_year"
                                error={
                                  form.formState.errors.graduation_year?.message
                                }
                                options={Array.from({ length: 30 }, (_, i) => {
                                  const year = new Date().getFullYear() - i;
                                  return {
                                    value: year.toString(),
                                    label: year.toString(),
                                  };
                                })}
                              />

                              <FormInput
                                control={form.control}
                                name="study_area"
                                label="Study Area"
                                placeholder="e.g. Business, Engineering, Arts, etc."
                              />
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <SubmitButton
                    isPending={
                      mentorProfileUpdateMutation.isPending || isImageUploading
                    }
                  />
                </form>
              </Form>
            ) : (
              <div className="space-y-3">
                <InfoGrid>
                  <InfoField label="Full Name" value={mentorProfile?.name} />
                  <InfoField
                    label="Email"
                    value={session?.user?.email || undefined}
                  />
                </InfoGrid>

                <InfoGrid>
                  <InfoField label="Role" value="Mentor" />
                  {mentorProfile?.phone_number && (
                    <InfoField
                      label="Phone Number"
                      value={mentorProfile.phone_number}
                    />
                  )}
                </InfoGrid>

                {mentorProfile?.state && (
                  <InfoField
                    label="Location"
                    value={
                      mentorProfile?.area && mentorProfile?.state
                        ? formatText(mentorProfile.area, mentorProfile.state)
                        : mentorProfile.state
                    }
                  />
                )}

                {mentorProfile?.bio && (
                  <InfoField label="About" value={mentorProfile.bio} />
                )}

                <BadgeList
                  label="Expertise"
                  items={mentorProfile?.interested_on}
                  badgeColor="blue"
                  emptyMessage="No expertise specified"
                />

                <BadgeList
                  label="Interests"
                  items={mentorProfile?.interested_categories}
                  badgeColor="green"
                  emptyMessage="No interests specified"
                />

                {/* Academic Information Section */}
                {(mentorProfile?.is_currently_studying &&
                  mentorProfile.is_currently_studying !== "yes") ||
                (mentorProfile?.student_type &&
                  mentorProfile.student_type !== "no") ||
                mentorProfile?.course ||
                mentorProfile?.major ||
                mentorProfile?.home_country ||
                (mentorProfile?.non_student_type &&
                  mentorProfile.non_student_type !== "general_public") ||
                mentorProfile?.university ||
                mentorProfile?.graduation_year ||
                mentorProfile?.study_area ? (
                  <div className="border-t border-gray-200 pt-3 mt-4">
                    <h3 className="text-base font-semibold text-gray-900 mb-3">
                      Academic Background
                    </h3>

                    <div className="space-y-3">
                      <InfoGrid>
                        {mentorProfile?.is_currently_studying &&
                          mentorProfile.is_currently_studying !== "yes" && (
                            <InfoField
                              label="Currently Studying"
                              value={
                                mentorProfile.is_currently_studying === "yes"
                                  ? "Yes"
                                  : mentorProfile.is_currently_studying === "no"
                                  ? "No"
                                  : "Not specified"
                              }
                            />
                          )}

                        {mentorProfile?.is_currently_studying === "yes" &&
                          mentorProfile?.student_type &&
                          mentorProfile.student_type !== "no" && (
                            <InfoField
                              label="International Student"
                              value={
                                mentorProfile.student_type === "yes"
                                  ? "Yes"
                                  : "No"
                              }
                            />
                          )}
                      </InfoGrid>

                      {mentorProfile?.is_currently_studying === "yes" && (
                        <>
                          {mentorProfile?.student_type === "yes" &&
                            mentorProfile?.home_country && (
                              <InfoField
                                label="Home Country"
                                value={mentorProfile.home_country}
                              />
                            )}

                          {mentorProfile?.course && (
                            <InfoField
                              label="Course"
                              value={
                                mentorProfile.course === "phd"
                                  ? "Doctorate / PhD"
                                  : mentorProfile.course === "masters"
                                  ? "Master's Degree (Postgraduate)"
                                  : mentorProfile.course === "bachelor"
                                  ? "Bachelor's Degree (Undergraduate)"
                                  : mentorProfile.course === "diploma"
                                  ? "Diploma / Certificate"
                                  : mentorProfile.course === "professional"
                                  ? "Professional / Industry Expert"
                                  : mentorProfile.course
                              }
                            />
                          )}

                          {mentorProfile?.major && (
                            <InfoField
                              label="Major"
                              value={
                                mentorProfile.major === "business"
                                  ? "Business"
                                  : mentorProfile.major === "engineering"
                                  ? "Engineering"
                                  : mentorProfile.major === "it"
                                  ? "Information Technology"
                                  : mentorProfile.major === "science"
                                  ? "Science"
                                  : mentorProfile.major === "arts"
                                  ? "Arts"
                                  : mentorProfile.major === "education"
                                  ? "Education"
                                  : mentorProfile.major === "health"
                                  ? "Health"
                                  : mentorProfile.major === "other"
                                  ? mentorProfile.major_other || "Other"
                                  : mentorProfile.major
                              }
                            />
                          )}
                        </>
                      )}

                      {mentorProfile?.is_currently_studying === "no" && (
                        <>
                          {mentorProfile?.non_student_type &&
                            mentorProfile.non_student_type !==
                              "general_public" && (
                              <InfoField
                                label="Member Type"
                                value={
                                  mentorProfile.non_student_type === "staff"
                                    ? "Staff Member"
                                    : mentorProfile.non_student_type ===
                                      "alumni"
                                    ? "University Alumni"
                                    : mentorProfile.non_student_type ===
                                      "general_public"
                                    ? "General Public Member"
                                    : mentorProfile.non_student_type
                                }
                              />
                            )}

                          {mentorProfile?.non_student_type === "alumni" && (
                            <InfoGrid>
                              {mentorProfile?.university && (
                                <InfoField
                                  label="University"
                                  value={mentorProfile.university}
                                />
                              )}

                              {mentorProfile?.graduation_year && (
                                <InfoField
                                  label="Graduation Year"
                                  value={mentorProfile.graduation_year}
                                />
                              )}
                            </InfoGrid>
                          )}

                          {mentorProfile?.non_student_type === "alumni" &&
                            mentorProfile?.study_area && (
                              <InfoField
                                label="Study Area"
                                value={mentorProfile.study_area}
                              />
                            )}
                        </>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </InformationCard>
        </div>
      </div>
    </div>
  );
}
