"use client";

import { useState } from "react";
import RecurrenceModal from "./RecurrenceModal";
import { FormInput } from "@/components/form-input/FormInput";
import { UseFormReturn, Path } from "react-hook-form";
import type { OpportunityFormValues } from "./types";
import BackButton from "@/components/buttons/BackButton";

interface ScheduleRecurrenceProps {
  form: UseFormReturn<OpportunityFormValues>;
}

export default function ScheduleRecurrence({ form }: ScheduleRecurrenceProps) {
  const [isRecurrenceModalOpen, setIsRecurrenceModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <div className="container mx-auto py-12">
        <BackButton />
        <h1 className="text-2xl font-bold mb-6 pb-2">Schedule & Recurrence</h1>
        <h1 className="text-[14px] pb-12 font-normal">
          Fill out the information below so KINDORA can find you volunteers for
          your organisation.
        </h1>
        <div className="bg-white rounded-lg relative">
          <div className="absolute top-6 left-6 text-sm text-blue-600 font-medium">
            Step 2 of 2
          </div>
          <button
            onClick={() => setIsRecurrenceModalOpen(true)}
            className="absolute top-6 right-6 text-sm text-blue-600 font-medium hover:text-blue-700 rounded-[6px] border border-[#2563EB] bg-[#ECF5FD] flex w-[131.5px] h-[33px] px-3 py-[6px] justify-center items-center gap-[6px]"
          >
            Make recurring
          </button>
          <div className="pt-16 px-6 pb-6">
            <div className="space-y-8">
              {/* Commitment type */}
              <div>
                <h2 className="text-lg font-medium mb-1 flex items-center">
                  Commitment type
                  <span className="text-red-500 ml-1">*</span>
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  How much time does the volunteer need to commit to? Volunteers
                  use this to help find suitable opportunities.
                </p>
                <div className="flex gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="oneoff"
                      {...form.register("commitment_type" as Path<OpportunityFormValues>)}
                      checked={form.watch("commitment_type") === "oneoff"}
                    />
                    <span>One off</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="regular"
                      {...form.register("commitment_type" as Path<OpportunityFormValues>)}
                      checked={form.watch("commitment_type") === "regular"}
                    />
                    <span>Regular</span>
                  </label>
                </div>
              </div>
              {/* Location */}
              <div>
                <h2 className="text-lg font-medium mb-1 flex items-center">
                  Location
                  <span className="text-red-500 ml-1">*</span>
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Where does the volunteer need to work from? Be specific, but
                  flexible if you can. Does the work need to be done in person
                  (at a physical location) or could it be done online or
                  remotely? You can select up to 8 locations and only one state
                  or territory.
                </p>
                <FormInput
                  name={"location" as Path<OpportunityFormValues>}
                  label="Location"
                  placeholder="21 Darling Dr, Sydney, Australia"
                  control={form.control}
                  className="w-[382px]"
                />
              </div>
              {/* Number of volunteers */}
              <div>
                <h2 className="text-lg font-medium mb-1 flex items-center">
                  Number of volunteers
                  <span className="text-red-500 ml-1">*</span>
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Which category best represents this opportunity? Volunteers
                  use this to help find opportunities they are interested in
                  supporting.
                </p>
                <FormInput
                  name={"number_of_volunteers" as Path<OpportunityFormValues>}
                  label="Number of volunteers"
                  placeholder="20"
                  type="number"
                  control={form.control}
                  className="w-[382px]"
                />
              </div>
              {/* Add your email/contact */}
              <div>
                <h2 className="text-lg font-medium mb-1 flex items-center">
                  Add your email/contact
                  <span className="text-gray-400 text-sm ml-2">(optional)</span>
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Which email address should we send applications to?
                </p>
                <div className="space-y-4">
                  <FormInput
                    name={"email_contact" as Path<OpportunityFormValues>}
                    label="Email"
                    placeholder="arif@spotify.com"
                    type="email"
                    control={form.control}
                    className="w-[382px]"
                  />
                  <div>
                    <p className="text-sm text-gray-500 mb-2">
                      You can enter your own internal reference number here to
                      help keep track of it.
                    </p>
                    <FormInput
                      name={"phone_contact" as Path<OpportunityFormValues>}
                      label="Phone"
                      placeholder="+61 1243 5978"
                      type="tel"
                      control={form.control}
                      className="w-[382px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <RecurrenceModal
        isOpen={isRecurrenceModalOpen}
        onClose={() => setIsRecurrenceModalOpen(false)}
        form={form}
      />
    </div>
  );
}
