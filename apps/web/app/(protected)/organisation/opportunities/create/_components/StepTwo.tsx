"use client";

import { UseFormReturn, Path } from "react-hook-form";
import { FormInput } from "@/components/form-input/FormInput";
import { OpportunityFormValues } from "./types";

export default function StepTwo({
    form,
}: {
    form: UseFormReturn<OpportunityFormValues>;
}) {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Commitment Type */}
            <div>
                <h2 className="text-base sm:text-lg font-medium mb-1 flex items-center">
                    Commitment type
                    <span className="text-red-500 ml-1">*</span>
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mb-4">
                    How much time does the volunteer need to commit to?
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                    <label className="flex items-center space-x-2">
                        <input
                            type="radio"
                            id="workbased"
                            {...form.register("commitment_type")}
                            value="workbased"
                            checked={form.watch("commitment_type") === "workbased"}
                            className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm font-medium">Work based</span>
                    </label>

                    <label className="flex items-center space-x-2">
                        <input
                            type="radio"
                            id="eventbased"
                            {...form.register("commitment_type")}
                            value="eventbased"
                            checked={form.watch("commitment_type") === "eventbased"}
                            className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm font-medium">Event based</span>
                    </label>
                </div>
            </div>

            {/* Start Date & Time */}
            <div>
                <h2 className="text-base sm:text-lg font-medium mb-1 flex items-center">
                    Start Date & Time
                    <span className="text-red-500 ml-1">*</span>
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mb-4">
                    When does this opportunity start?
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput
                        name={"start_date" as Path<OpportunityFormValues>}
                        type="date"
                        control={form.control}
                        className="w-full"
                    />
                    <FormInput
                        name={"start_time" as Path<OpportunityFormValues>}
                        type="time"
                        control={form.control}
                        className="w-full"
                    />
                </div>
            </div>

            {/* End Date & Time */}
            {(form.watch("commitment_type") === "workbased" || form.watch("commitment_type") === "eventbased") && (
                <div>
                    <h2 className="text-base sm:text-lg font-medium mb-1 flex items-center">
                        End Date & Time
                        {form.watch("commitment_type") === "workbased" && <span className="text-red-500 ml-1">*</span>}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {form.watch("commitment_type") === "workbased" && (
                            <FormInput
                                name={"end_date" as Path<OpportunityFormValues>}
                                type="date"
                                control={form.control}
                                className="w-full"
                            />
                        )}
                        <FormInput
                            name={"end_time" as Path<OpportunityFormValues>}
                            type="time"
                            control={form.control}
                            className="w-full"
                        />
                    </div>
                </div>
            )}

            {/* Volunteers & External Link */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h2 className="text-base sm:text-lg font-medium mb-1 flex items-center">
                        Number of volunteers
                        <span className="text-red-500 ml-1">*</span>
                    </h2>
                    <FormInput
                        name={"number_of_volunteers" as Path<OpportunityFormValues>}
                        placeholder="20"
                        type="number"
                        control={form.control}
                        className="w-full"
                    />
                </div>
                <div>
                    <h2 className="text-base sm:text-lg font-medium mb-1 flex items-center">
                        External Link
                    </h2>
                    <FormInput
                        name={"external_event_link" as Path<OpportunityFormValues>}
                        placeholder="https://example.com/event"
                        type="url"
                        control={form.control}
                        className="w-full"
                    />
                </div>
            </div>

            {/* Contact Information */}
            <div>
                <h2 className="text-base sm:text-lg font-medium mb-1 flex items-center">
                    Contact Information
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mb-4">
                    How can volunteers reach out to you? (Optional)
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput
                        name={"email_contact" as Path<OpportunityFormValues>}
                        placeholder="contact@organization.com"
                        type="email"
                        control={form.control}
                        className="w-full"
                    />
                    <FormInput
                        name={"phone_contact" as Path<OpportunityFormValues>}
                        placeholder="+61 123 456 789"
                        control={form.control}
                        className="w-full"
                    />
                </div>
            </div>

            {/* Requirements */}
            <div>
                <h2 className="text-base sm:text-lg font-medium mb-1 flex items-center">
                    Requirements
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mb-4">
                    What requirements do volunteers need to meet?
                </p>
                <div className="space-y-4 w-full sm:w-[382px]">
                    {/* Standard Requirements */}
                    <div>
                        <h3 className="text-sm font-medium mb-3">Standard Requirements</h3>
                        <div className="space-y-2">
                            {["Police Check", "Working with Children Check", "First Aid Training"].map((requirement) => (
                                <label key={requirement} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        value={requirement}
                                        checked={form.watch("requirements")?.includes(requirement) || false}
                                        onChange={(e) => {
                                            const currentRequirements = form.watch("requirements") || [];
                                            if (e.target.checked) {
                                                form.setValue("requirements", [...currentRequirements, requirement]);
                                            } else {
                                                form.setValue("requirements", currentRequirements.filter((r) => r !== requirement));
                                            }
                                        }}
                                        className="h-4 w-4 border-gray-300 text-primary focus:ring-primary rounded"
                                    />
                                    <span className="text-sm">{requirement}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Custom Requirements */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium mb-3">Custom Requirements</h3>
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                id="custom-requirement-input"
                                placeholder="Add a custom requirement"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-full"
                                onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        const input = e.target as HTMLInputElement;
                                        const value = input.value.trim();
                                        if (value) {
                                            const currentRequirements = form.watch("requirements") || [];
                                            if (!currentRequirements.includes(value)) {
                                                form.setValue("requirements", [...currentRequirements, value]);
                                                input.value = "";
                                            }
                                        }
                                    }
                                }}
                            />
                            <button
                                type="button"
                                className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                                onClick={() => {
                                    const input = document.getElementById('custom-requirement-input') as HTMLInputElement;
                                    if (input) {
                                        const value = input.value.trim();
                                        if (value) {
                                            const currentRequirements = form.watch("requirements") || [];
                                            if (!currentRequirements.includes(value)) {
                                                form.setValue("requirements", [...currentRequirements, value]);
                                                input.value = "";
                                            }
                                        }
                                    }
                                }}
                            >
                                Add
                            </button>
                        </div>
                        <div className="space-y-2">
                            {(form.watch("requirements") || [])
                                .filter((req) => !["Police Check", "Working with Children Check", "First Aid Training"].includes(req))
                                .map((requirement, index) => (
                                    <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                                        <span className="text-sm">{requirement}</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const currentRequirements = form.watch("requirements") || [];
                                                form.setValue("requirements", currentRequirements.filter((r) => r !== requirement));
                                            }}
                                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
