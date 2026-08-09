"use client";

import { UseFormReturn, Path } from "react-hook-form";
import { FormInput } from "@/components/form-input/FormInput";
import { MultiSelectField } from "@/components/form-input/MultiSelectField";
import { FormRichTextEditor } from "@/components/form-input/FormRichTextEditor";
import { SkillsMultiSelect } from "@/components/form-input/SkillsMultiSelectSelect";
import { FormImageInput } from "@/components/form-input/FormImageInput";
import { CATEGORIES_OPTIONS } from "@/utils/constants";
import { OpportunityFormValues } from "./types";

import { FormSelect } from "@/components/form-input/FormSelect";
import { trpc } from "@/utils/trpc";

export default function StepOne({
    form,
    onImageUploadStateChange,
    userRole,
}: {
    form: UseFormReturn<OpportunityFormValues>;
    onImageUploadStateChange?: (isUploading: boolean) => void;
    userRole?: string;
}) {
    const isMentor = userRole === "mentor";
    const { data: organisations, isLoading: isLoadingOrgs } = trpc.organizationProfile.getOrganizationNames.useQuery(undefined, {
        enabled: isMentor,
    });
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Form Instructions */}
            <div className="mb-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs sm:text-sm text-blue-800">
                    <strong>Note:</strong> Fields marked with{" "}
                    <span className="text-red-500">*</span> are required. Please fill
                    in all required fields to create your opportunity.
                </p>
            </div>

            {/* Title & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {isMentor && (
                    <div className="space-y-1 col-span-1 md:col-span-2">
                        <h2 className="text-base sm:text-lg font-medium flex items-center">
                            Select Organisation
                            <span className="text-red-500 ml-1">*</span>
                        </h2>
                        <p className="text-xs text-gray-500 mb-2">
                            Select the organisation this opportunity belongs to.
                        </p>
                        <FormSelect
                            id="organization_id"
                            label="Organisation"
                            placeholder="Search and select an organisation"
                            control={form.control}
                            registerName="organization_id"
                            options={(organisations || []) as { value: string; label: string }[]}
                            loading={isLoadingOrgs}
                            searchEnabled={true}
                            error={form.formState.errors.organization_id?.message}
                        />
                    </div>
                )}
                <div className="space-y-1">
                    <h2 className="text-base sm:text-lg font-medium flex items-center">
                        Opportunity title
                        <span className="text-red-500 ml-1">*</span>
                    </h2>
                    <p className="text-xs text-gray-500 mb-2">
                        Succinct and easily understood.
                    </p>
                    <FormInput
                        name={"title" as Path<OpportunityFormValues>}
                        placeholder="Enter opportunity title"
                        control={form.control}
                        className="w-full"
                    />
                </div>
                <div className="space-y-1">
                    <h2 className="text-base sm:text-lg font-medium flex items-center">
                        Location
                        <span className="text-red-500 ml-1">*</span>
                    </h2>
                    <p className="text-xs text-gray-500 mb-2">
                        Where should they work from?
                    </p>
                    <FormInput
                        name={"location" as Path<OpportunityFormValues>}
                        placeholder="21 Darling Dr, Sydney, Australia"
                        control={form.control}
                        className="w-full"
                    />
                </div>
            </div>

            {/* Banner Image */}
            <div>
                <h2 className="text-base sm:text-lg font-medium mb-1 flex items-center">
                    Banner Image
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mb-4">
                    Add a banner image to make your opportunity stand out.
                </p>
                <FormImageInput
                    name={"banner_img" as Path<OpportunityFormValues>}
                    control={form.control}
                    setValue={form.setValue}
                    className="w-full"
                    onUploadStateChange={onImageUploadStateChange}
                />
            </div>

            {/* Description */}
            <div>
                <h2 className="text-base sm:text-lg font-medium mb-1 flex items-center">
                    Description
                    <span className="text-red-500 ml-1">*</span>
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mb-4">
                    Describe the role, responsibilities, and impact.
                </p>
                <FormRichTextEditor
                    name={"description" as Path<OpportunityFormValues>}
                    placeholder="Describe the opportunity"
                    control={form.control}
                    className="min-h-[150px] w-full"
                />
            </div>

            {/* Categories & Skills */}
            <div>
                <h2 className="text-base sm:text-lg font-medium mb-1 flex items-center">
                    Categories & Skills
                    <span className="text-red-500 ml-1">*</span>
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mb-4">
                    Helping volunteers find opportunities they are interested in.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <MultiSelectField
                        id="category"
                        placeholder="Select categories"
                        register={form.register}
                        registerName="category"
                        error={form.formState.errors.category?.message}
                        options={CATEGORIES_OPTIONS}
                        setValue={form.setValue}
                        value={form.watch("category")}
                        className="w-full"
                    />
                    <SkillsMultiSelect
                        placeholder="Select required skills"
                        error={form.formState.errors.required_skills?.message}
                        value={form.watch("required_skills") || []}
                        onChange={(value: string[]) =>
                            form.setValue(
                                "required_skills",
                                value as [string, ...string[]]
                            )
                        }
                        className="w-full"
                    />
                </div>
            </div>
        </div>
    );
}
