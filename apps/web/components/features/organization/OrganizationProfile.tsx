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
import { organizationProfileSchema } from "@/utils/validation/user.validator";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAxiosAuth } from "@/hooks/useAxiosAuth";
import { PhoneField } from "@/components/form-input/PhoneField";
import { useEffect, useState } from "react";
import NextImage from "next/image";
import toast from "react-hot-toast";
import { z } from "zod";
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
} from "@/components/features/shared";
import RandomAvatar from "@/components/common/RandomAvatar";
import { ProfilePhotoInput } from "@/components/form-input/ProfilePhotoInput";
import { FormImageInput } from "@/components/form-input/FormImageInput";
import { userService } from "@/services/user.service";
import { profileService } from "@/services/profile.service";
import { skillService } from "@/services/skill.service";

type OrganizationProfileData = Omit<
  z.infer<typeof organizationProfileSchema>,
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
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['profileCheckup'],
    queryFn: () => userService.getMe(axiosAuth),
  });

  // Organization profile mutation
  const createSkillMutation = useMutation({
    mutationFn: (payload: { name: string }) => skillService.createSkill(axiosAuth, payload.name),
  });
  const organizationProfileUpdateMutation = useMutation({
    mutationFn: (data: OrganizationProfileData) => profileService.updateOrganizationProfile(axiosAuth, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profileCheckup'] });
      if (variables.title && variables.contact_email) {
        toast.success('Organization profile updated successfully!');
        setEditMode('none');
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update profile');
    },
  });

  const form = useForm<OrganizationProfileData>({
    resolver: zodResolver(organizationProfileSchema),
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
      <div className="w-full h-[calc(100vh-2rem)] sm:h-[calc(100vh-4rem)] max-w-7xl mx-auto p-2 sm:p-4 lg:p-6 overflow-hidden">
        <div className="w-full h-full border border-border rounded-lg overflow-hidden">
          <div className="flex flex-col h-full">
            <div className="flex-shrink-0 flex items-center gap-4 p-4 sm:p-6 border-b border-border">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-muted animate-pulse flex-shrink-0" />
              <div className="space-y-3 min-w-0 flex-1">
                <div className="h-6 sm:h-7 w-48 sm:w-64 max-w-full bg-muted animate-pulse rounded" />
                <div className="h-4 w-32 sm:w-40 max-w-full bg-muted animate-pulse rounded" />
              </div>
            </div>
            <div className="flex-1 min-h-0 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3"></div>
                <p className="text-muted-foreground text-sm">Loading profile...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const profile = profileData?.organizationProfile;

  return (
    <div className="w-full h-[calc(100vh-2rem)] sm:h-[calc(100vh-4rem)] max-w-7xl mx-auto p-2 sm:p-4 lg:p-6 overflow-hidden">
      <div className="w-full h-full border border-border rounded-lg overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Profile header */}
          <div className="flex-shrink-0 border-b border-border bg-card">
            {/* Banner Background */}
            <div className="relative h-24 sm:h-32 w-full bg-muted">
              {profile?.cover_img ? (
                <NextImage
                  src={profile.cover_img}
                  alt="Organization Cover"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-primary/40 to-primary/60 opacity-20" />
              )}
            </div>
            
            {/* Avatar and Title Info */}
            <div className="relative px-4 sm:px-6 pb-4 sm:pb-6 flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-5">
              {/* Overlapping Avatar */}
              <div className="relative -mt-10 sm:-mt-12">
                <RandomAvatar
                  name={profile?.title || "Organization"}
                  imageUrl={profile?.profile_img}
                  size={96}
                  className="h-20 w-20 sm:h-24 sm:w-24 ring-4 ring-background shadow-lg"
                />
              </div>
              
              <div className="text-left min-w-0 pb-1">
                <h3 className="text-lg sm:text-xl font-bold text-foreground break-words leading-tight">
                  {profile?.title || "Organization"}
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Organization
                </p>
              </div>
            </div>
          </div>

          {/* Scrollable profile content */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6">
            <div className="space-y-6">

              {/* Organization Information Card */}
              <InformationCard
                noBg
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
                      <label className="block text-sm font-medium text-foreground mb-2">Organisation Logo</label>
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
      </div>
    </div>
  );
}
