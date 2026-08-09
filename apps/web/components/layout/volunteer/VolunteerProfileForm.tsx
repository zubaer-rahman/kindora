"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/form-input/FormInput";
import { FormTextarea } from "@/components/form-input/FormTextarea";
import { FormSelect } from "@/components/form-input/FormSelect";
import {
  VolunteerProfileUpdateData,
  VolunteerProfileUpdateSchema,
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

export function VolunteerProfileForm() {
  const [editMode, setEditMode] = useState<"none" | "personal">("none");
  const [isImageUploading, setIsImageUploading] = useState(false);
  const { data: volunteerProfile, isLoading } =
    trpc.volunteers.getVolunteerProfile.useQuery();
  const { data: session } = useSession();
  const utils = trpc.useUtils();

  const countryOptions = useMemo(() => countryList().getData(), []);

  const volunteerProfileUpdateMutation =
    trpc.volunteers.updateVolunteerProfile.useMutation({
      onSuccess: () => {
        utils.volunteers.getVolunteerProfile.invalidate();
        toast.success("Volunteer profile updated successfully!");
        setEditMode("none");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to update profile");
      },
    });

  const createSkillMutation = trpc.skills.create.useMutation();

  const form = useForm<VolunteerProfileUpdateData>({
    resolver: zodResolver(VolunteerProfileUpdateSchema),
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
      availability_date: {
        start_date: "",
        end_date: "",
      },
      is_available: false,
    },
  });

  useEffect(() => {
    if (volunteerProfile) {
      let defaultIsCurrentlyStudying = volunteerProfile.is_currently_studying;
      if (!defaultIsCurrentlyStudying) {
        if (volunteerProfile.student_type || volunteerProfile.course) {
          defaultIsCurrentlyStudying = "yes";
        } else {
          defaultIsCurrentlyStudying = "no";
        }
      }

      form.reset({
        name: volunteerProfile.name || "",
        phone_number: volunteerProfile.phone_number || "",
        bio: volunteerProfile.bio || "",
        interested_on: volunteerProfile.interested_on || [],
        interested_categories: volunteerProfile.interested_categories || [],
        state: volunteerProfile.state || "",
        area: volunteerProfile.area?.replace(/_/g, " ") || "",
        availability_date: volunteerProfile.availability_date || {
          start_date: "",
          end_date: "",
        },
        // Academic fields
        student_type: volunteerProfile.student_type || "no",
        home_country: volunteerProfile.home_country || "",
        course: volunteerProfile.course || "",
        major: volunteerProfile.major || "",
        major_other: volunteerProfile.major_other || "",
        is_currently_studying: defaultIsCurrentlyStudying || "yes",
        non_student_type: volunteerProfile.non_student_type || "general_public",
        university: volunteerProfile.university || "",
        graduation_year: volunteerProfile.graduation_year || "",
        study_area: volunteerProfile.study_area || "",
        is_available: volunteerProfile.is_available ?? false,
        image: volunteerProfile.image || "",
      });
    }
  }, [volunteerProfile, form]);

  const onSubmit = async (data: VolunteerProfileUpdateData) => {
    try {
      const newSkills =
        data.interested_on?.filter(
          (skill) =>
            !SKILL_OPTIONS.find(
              (opt: { value: string; label: string }) => opt.value === skill
            )
        ) || [];

      for (const skillName of newSkills) {
        try {
          await createSkillMutation.mutateAsync({ name: skillName });
        } catch (error) {
          // Skills creation now returns existing skill instead of throwing error
          console.error("Failed to create skill:", error);
        }
      }

      const formattedData = {
        ...data,
        area: data.area?.replace(/_/g, " "),
      };

      await volunteerProfileUpdateMutation.mutateAsync(formattedData);
    } catch {
    }
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
                name={volunteerProfile?.name || session?.user?.name || "User"}
                imageUrl={volunteerProfile?.image || session?.user?.image}
                size={120}
                className="h-24 w-24 lg:h-28 lg:w-28 ring-3 ring-gray-100 shadow-lg"
              />
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {volunteerProfile?.name || session?.user?.name || "User"}
                </h3>
                {session?.user?.organization_profile?.title && (
                  <p className="text-sm text-gray-500">
                    {session.user.organization_profile.title}
                  </p>
                )}
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
                      <ProfilePhotoInput
                        name="image"
                        defaultValue={session?.user?.image || undefined}
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
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        value={session?.user?.email || ""}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Role</label>
                      <input
                        type="text"
                        value="Volunteer"
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
                    placeholder="Tell us about yourself, your interests, and why you want to volunteer..."
                  />

                  <SkillsMultiSelect
                    label="Skills"
                    placeholder="Select your skills"
                    error={form.formState.errors.interested_on?.message}
                    value={form.watch("interested_on") || []}
                    onChange={(value: string[]) =>
                      form.setValue("interested_on", value)
                    }
                  />

                  <MultiSelectField
                    label="Interested In"
                    id="interested_categories"
                    placeholder="Select opportunity categories you're interested in"
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
                      Academic Information
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
                            // Reset alumni-related fields when switching to "currently studying"
                            form.setValue("non_student_type", "");
                            form.setValue("university", "");
                            form.setValue("graduation_year", "");
                            form.setValue("study_area", "");
                          } else if (value === "no") {
                            // Reset student-related fields when switching to "not currently studying"
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
                    isPending={volunteerProfileUpdateMutation.isPending || isImageUploading}
                  />
                </form>
              </Form>
            ) : (
              <div className="space-y-3">
                <InfoGrid>
                  <InfoField
                    label="First Name"
                    value={volunteerProfile?.name}
                  />
                  <InfoField
                    label="Email"
                    value={session?.user?.email || undefined}
                  />
                </InfoGrid>

                <InfoGrid>
                  <InfoField label="Role" value="Volunteer" />
                  {volunteerProfile?.phone_number && (
                    <InfoField
                      label="Phone Number"
                      value={volunteerProfile.phone_number}
                    />
                  )}
                </InfoGrid>

                {volunteerProfile?.state && (
                  <InfoField
                    label="Location"
                    value={
                      volunteerProfile?.area && volunteerProfile?.state
                        ? formatText(
                          volunteerProfile.area,
                          volunteerProfile.state
                        )
                        : volunteerProfile.state
                    }
                  />
                )}

                {volunteerProfile?.bio && (
                  <InfoField label="About" value={volunteerProfile.bio} />
                )}

                <BadgeList
                  label="Skills"
                  items={volunteerProfile?.interested_on}
                  badgeColor="blue"
                  emptyMessage="No skills specified"
                />

                <BadgeList
                  label="Interests"
                  items={volunteerProfile?.interested_categories}
                  badgeColor="green"
                  emptyMessage="No interests specified"
                />

                {/* Academic Information Section */}
                {/* Only show academic section if user has updated fields beyond defaults */}
                {(volunteerProfile?.is_currently_studying &&
                  volunteerProfile.is_currently_studying !== "yes") ||
                  (volunteerProfile?.student_type &&
                    volunteerProfile.student_type !== "no") ||
                  volunteerProfile?.course ||
                  volunteerProfile?.major ||
                  volunteerProfile?.home_country ||
                  (volunteerProfile?.non_student_type &&
                    volunteerProfile.non_student_type !== "general_public") ||
                  volunteerProfile?.university ||
                  volunteerProfile?.graduation_year ||
                  volunteerProfile?.study_area ? (
                  <div className="border-t border-gray-200 pt-3 mt-4">
                    <h3 className="text-base font-semibold text-gray-900 mb-3">
                      Academic Information
                    </h3>

                    <div className="space-y-3">
                      <InfoGrid>
                        {/* Only show "Currently Studying" if it's not the default "yes" */}
                        {volunteerProfile?.is_currently_studying &&
                          volunteerProfile.is_currently_studying !== "yes" && (
                            <InfoField
                              label="Currently Studying"
                              value={
                                volunteerProfile.is_currently_studying === "yes"
                                  ? "Yes"
                                  : volunteerProfile.is_currently_studying === "no"
                                    ? "No"
                                    : "Not specified"
                              }
                            />
                          )}

                        {/* Only show "International Student" if it's not the default "no" */}
                        {volunteerProfile?.is_currently_studying === "yes" &&
                          volunteerProfile?.student_type &&
                          volunteerProfile.student_type !== "no" && (
                            <InfoField
                              label="International Student"
                              value={
                                volunteerProfile.student_type === "yes"
                                  ? "Yes"
                                  : "No"
                              }
                            />
                          )}
                      </InfoGrid>

                      {volunteerProfile?.is_currently_studying === "yes" && (
                        <>
                          {volunteerProfile?.student_type === "yes" &&
                            volunteerProfile?.home_country && (
                              <InfoField
                                label="Home Country"
                                value={volunteerProfile.home_country}
                              />
                            )}

                          {volunteerProfile?.course && (
                            <InfoField
                              label="Course"
                              value={
                                volunteerProfile.course === "phd"
                                  ? "Doctorate / PhD"
                                  : volunteerProfile.course === "masters"
                                    ? "Master's Degree (Postgraduate)"
                                    : volunteerProfile.course === "bachelor"
                                      ? "Bachelor's Degree (Undergraduate)"
                                      : volunteerProfile.course === "diploma"
                                        ? "Diploma / Certificate"
                                        : volunteerProfile.course === "professional"
                                          ? "Professional / Industry Expert"
                                          : volunteerProfile.course
                              }
                            />
                          )}

                          {volunteerProfile?.major && (
                            <InfoField
                              label="Major"
                              value={
                                volunteerProfile.major === "business"
                                  ? "Business"
                                  : volunteerProfile.major === "engineering"
                                    ? "Engineering"
                                    : volunteerProfile.major === "it"
                                      ? "Information Technology"
                                      : volunteerProfile.major === "science"
                                        ? "Science"
                                        : volunteerProfile.major === "arts"
                                          ? "Arts"
                                          : volunteerProfile.major === "education"
                                            ? "Education"
                                            : volunteerProfile.major === "health"
                                              ? "Health"
                                              : volunteerProfile.major === "other"
                                                ? volunteerProfile.major_other || "Other"
                                                : volunteerProfile.major
                              }
                            />
                          )}
                        </>
                      )}

                      {volunteerProfile?.is_currently_studying === "no" && (
                        <>
                          {/* Only show "Member Type" if it's not the default "general_public" */}
                          {volunteerProfile?.non_student_type &&
                            volunteerProfile.non_student_type !== "general_public" && (
                              <InfoField
                                label="Member Type"
                                value={
                                  volunteerProfile.non_student_type === "staff"
                                    ? "Staff Member"
                                    : volunteerProfile.non_student_type === "alumni"
                                      ? "University Alumni"
                                      : volunteerProfile.non_student_type ===
                                        "general_public"
                                        ? "General Public Member"
                                        : volunteerProfile.non_student_type
                                }
                              />
                            )}

                          {volunteerProfile?.non_student_type === "alumni" && (
                            <InfoGrid>
                              {volunteerProfile?.university && (
                                <InfoField
                                  label="University"
                                  value={volunteerProfile.university}
                                />
                              )}

                              {volunteerProfile?.graduation_year && (
                                <InfoField
                                  label="Graduation Year"
                                  value={volunteerProfile.graduation_year}
                                />
                              )}
                            </InfoGrid>
                          )}

                          {volunteerProfile?.non_student_type === "alumni" &&
                            volunteerProfile?.study_area && (
                              <InfoField
                                label="Study Area"
                                value={volunteerProfile.study_area}
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
