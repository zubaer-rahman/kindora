"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/form-input/FormInput";
import { FormTextarea } from "@/components/form-input/FormTextarea";
import {
  ORGANIZATION_TYPES,
  CATEGORIES_OPTIONS,
  STATES_OPTIONS,
} from "@/utils/constants";
import { SKILL_OPTIONS } from "@/utils/constants";
import { userValidation } from "@/server/modules/users/users.validation";
import { PhoneField } from "@/components/form-input/PhoneField";
import { trpc } from "@/utils/trpc";
import { useEffect, useState } from "react";
import NextImage from "next/image";
import toast from "react-hot-toast";
import { z } from "zod";
import { TRPCClientErrorLike } from "@trpc/client";
import { AppRouter } from "@/server";
import { SelectField } from "@/components/form-input/SelectField";
import BackButton from "@/components/buttons/BackButton";
import { MultiSelectField } from "@/components/form-input/MultiSelectField";
import { formatText } from "@/utils/helpers/formatText";
import { SkillsMultiSelect } from "@/components/form-input/SkillsMultiSelectSelect";
import {
  ProfileCard,
  InformationCard,
  InfoField,
  InfoGrid,
  BadgeList,
  SubmitButton,
} from "@/components/layout/shared";
import RandomAvatar from "@/components/ui/random-avatar";
import { ProfilePhotoInput } from "@/components/form-input/ProfilePhotoInput";
import { FormImageInput } from "@/components/form-input/FormImageInput";

type OrganizationProfileData = Omit<
  z.infer<typeof userValidation.organizationProfileSchema>,
  "opportunity_types" | "required_skills"
> & {
  opportunity_types: string[];
  required_skills: string[];
  type: string | string[];
};

const defaultValues: OrganizationProfileData = {
  title: "",
  contact_email: "",
  phone_number: "",
  bio: "",
  type: "",
  opportunity_types: [],
  required_skills: [],
  state: "",
  area: "",
  abn: "",
  website: "",
  profile_img: "",
  cover_img: "",
};

export default function OrganizationProfile() {
  const [editMode, setEditMode] = useState<"none" | "organization">("none");
  const [isImageUploading, setIsImageUploading] = useState(false);
  const { data: profileData, isLoading } = trpc.users.profileCheckup.useQuery();
  const utils = trpc.useUtils();

  // Organization profile mutation
  const createSkillMutation = trpc.skills.create.useMutation();
  const organizationProfileUpdateMutation =
    trpc.users.setupOrgProfile.useMutation({
      onSuccess: (data, variables) => {
        utils.users.profileCheckup.invalidate();
        if (variables.title && variables.contact_email) {
          toast.success("Organization profile updated successfully!");
          setEditMode("none");
        }
      },
      onError: (error: TRPCClientErrorLike<AppRouter>) => {
        toast.error(error.message || "Failed to update profile");
      },
    });

  const form = useForm<OrganizationProfileData>({
    resolver: zodResolver(userValidation.organizationProfileSchema),
    defaultValues,
  });

  useEffect(() => {
    if (profileData?.organizationProfile && !isLoading) {
      const profile = profileData.organizationProfile;

      const formData = {
        title: profile.title || "",
        contact_email: profile.contact_email || "",
        phone_number: profile.phone_number || "",
        bio: profile.bio || "",
        type: profile.type || "",
        opportunity_types: Array.isArray(profile.opportunity_types)
          ? profile.opportunity_types
          : [],
        required_skills: Array.isArray(profile.required_skills)
          ? profile.required_skills
          : [],
        state: profile.state || "",
        area: profile.area?.replace(/_/g, " ") || "",
        abn: profile.abn || "",
        website: profile.website || "",
        profile_img: profile.profile_img || "",
        cover_img: profile.cover_img || "",
      };

      form.reset(formData, {
        keepErrors: false,
        keepDirty: false,
        keepIsSubmitted: false,
        keepTouched: false,
        keepIsValid: false,
        keepSubmitCount: false,
      });
    }
  }, [profileData?.organizationProfile, isLoading, form]);

  const handleCancelEdit = () => {
    setEditMode("none");
    if (profileData?.organizationProfile) {
      const profile = profileData.organizationProfile;
      const formData = {
        title: profile.title || "",
        contact_email: profile.contact_email || "",
        phone_number: profile.phone_number || "",
        bio: profile.bio || "",
        type: profile.type || "",
        opportunity_types: Array.isArray(profile.opportunity_types)
          ? profile.opportunity_types
          : [],
        required_skills: Array.isArray(profile.required_skills)
          ? profile.required_skills
          : [],
        state: profile.state || "",
        area: profile.area?.replace(/_/g, " ") || "",
        abn: profile.abn || "",
        website: profile.website || "",
        profile_img: profile.profile_img || "",
        cover_img: profile.cover_img || "",
      };
      form.reset(formData);
    }
  };

  const onSubmit = async (data: OrganizationProfileData) => {
    try {
      // Create new skills that don't exist in SKILL_OPTIONS
      const newSkills =
        data.required_skills?.filter(
          (skill) =>
            !SKILL_OPTIONS.find(
              (opt: { value: string; label: string }) => opt.value === skill
            )
        ) || [];

      // Create new skills in the database
      for (const skillName of newSkills) {
        try {
          await createSkillMutation.mutateAsync({ name: skillName });
        } catch (error) {
          console.error("Failed to create skill:", error);
        }
      }

      await organizationProfileUpdateMutation.mutateAsync(data);
    } catch (error) {
      console.error("Error updating organization profile:", error);
    }
  };

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

  const profile = profileData?.organizationProfile;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto p-3 md:p-6">
        <BackButton className="mb-4" />

        <div className="space-y-6">
          {/* Cover Image */}
          <div className="relative h-32 md:h-48 rounded-xl overflow-hidden bg-gray-200 shadow-sm border border-gray-100">
            {profile?.cover_img ? (
              <NextImage
                src={profile.cover_img}
                alt="Organization Cover"
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-400 to-indigo-500 opacity-20" />
            )}
          </div>

          {/* Organization Logo Card */}
          <ProfileCard className="mb-6 -mt-12 relative z-10 mx-auto max-w-[95%]">
            <div className="flex flex-col items-center space-y-4">
              <RandomAvatar
                name={profile?.title || "Organization"}
                imageUrl={profile?.profile_img}
                objectFit="contain"
                size={120}
                className="h-24 w-24 lg:h-28 lg:w-28 ring-3 ring-gray-100 shadow-lg"
              />
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {profile?.title || "Organization"}
                </h3>
              </div>
            </div>
          </ProfileCard>

          {/* Organization Information Card */}
          <InformationCard
            title="Organisation Information"
            editMode={editMode === "organization" ? "active" : "inactive"}
            onEditClick={() => setEditMode("organization")}
            onCancelClick={handleCancelEdit}
          >
            {editMode === "organization" ? (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Organisation Logo</label>
                      <ProfilePhotoInput
                        name="profile_img"
                        defaultValue={form.watch("profile_img")}
                        setValue={form.setValue}
                        onUploadStateChange={setIsImageUploading}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <FormImageInput
                        name="cover_img"
                        label="Cover Image"
                        control={form.control}
                        setValue={form.setValue}
                        onUploadStateChange={setIsImageUploading}
                      />
                    </div>

                    <FormInput
                      name="title"
                      label="Organisation Name"
                      placeholder="Enter organization name"
                      control={form.control}
                      className="md:col-span-2"
                    />

                    <FormInput
                      name="contact_email"
                      label="Contact Email"
                      placeholder="Enter contact email"
                      control={form.control}
                    />

                    <PhoneField
                      label="Phone Number"
                      id="phone_number"
                      placeholder="Enter phone number"
                      register={form.register}
                      registerName="phone_number"
                      error={form.formState.errors.phone_number?.message}
                      value={form.watch("phone_number")}
                      setValue={form.setValue}
                    />

                    <FormInput
                      name="website"
                      label="Website"
                      placeholder="e.g. www.organization.com"
                      control={form.control}
                    />

                    <SelectField
                      label="Organisation Type"
                      id="type"
                      placeholder="Select organisation type"
                      register={form.register}
                      registerName="type"
                      error={form.formState.errors.type?.message}
                      options={ORGANIZATION_TYPES}
                      setValue={form.setValue}
                      value={form.watch("type")}
                    />

                    <FormInput
                      name="abn"
                      label="ABN"
                      placeholder="Enter ABN"
                      control={form.control}
                    />

                    <SelectField
                      label="State"
                      id="state"
                      placeholder="Select state"
                      register={form.register}
                      registerName="state"
                      error={form.formState.errors.state?.message}
                      options={STATES_OPTIONS}
                      setValue={form.setValue}
                      value={form.watch("state")}
                    />

                    <FormInput
                      name="area"
                      label="Area/Suburb"
                      placeholder="Enter area/suburb"
                      control={form.control}
                    />
                  </div>

                  <FormTextarea
                    name="bio"
                    label="About Organisation"
                    placeholder="Tell us about your organisation"
                    control={form.control}
                    className="md:col-span-2"
                  />

                  <MultiSelectField
                    label="Opportunity Types"
                    id="opportunity_types"
                    placeholder="Select opportunity types"
                    register={form.register}
                    registerName="opportunity_types"
                    error={form.formState.errors.opportunity_types?.message}
                    options={CATEGORIES_OPTIONS}
                    setValue={form.setValue}
                    value={form.watch("opportunity_types")}
                  />

                  <SkillsMultiSelect
                    label="Required Skills"
                    placeholder="Select or add required skills"
                    error={form.formState.errors.required_skills?.message}
                    value={form.watch("required_skills") || []}
                    onChange={(value: string[]) =>
                      form.setValue("required_skills", value)
                    }
                  />

                  <SubmitButton
                    isPending={organizationProfileUpdateMutation.isPending || isImageUploading}
                  />
                </form>
              </Form>
            ) : (
              <div className="space-y-3">
                <InfoGrid>
                  <InfoField label="Organisation Name" value={profile?.title} />
                  <InfoField
                    label="Contact Email"
                    value={profile?.contact_email}
                  />
                </InfoGrid>

                {profile?.phone_number && (
                  <InfoField
                    label="Phone Number"
                    value={profile.phone_number}
                  />
                )}

                {profile?.website && (
                  <InfoField label="Website" value={profile.website} />
                )}

                {profile?.state && (
                  <InfoField
                    label="Location"
                    value={
                      profile?.area && profile?.state
                        ? formatText(profile.area, profile.state)
                        : profile.state
                    }
                  />
                )}

                {profile?.type && (
                  <InfoField
                    label="Organisation Type"
                    value={
                      ORGANIZATION_TYPES.find(
                        (type) => type.value === profile.type
                      )?.label || profile.type
                    }
                  />
                )}

                {profile?.abn && <InfoField label="ABN" value={profile.abn} />}

                {profile?.bio && (
                  <InfoField label="About" value={profile.bio} />
                )}

                <BadgeList
                  label="Opportunity Types"
                  items={profile?.opportunity_types}
                  badgeColor="blue"
                  emptyMessage="No opportunity types specified"
                />

                <BadgeList
                  label="Required Skills"
                  items={profile?.required_skills}
                  badgeColor="green"
                  emptyMessage="No required skills specified"
                />
              </div>
            )}
          </InformationCard>
        </div>
      </div>
    </div>
  );
}
