import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { trpc } from "@/utils/trpc";
import toast from "react-hot-toast";
import { OpportunityFormValues } from "@/app/(protected)/organisation/opportunities/create/_components/types";
import { formatDateForInput } from "@/utils/helpers/formatDateForInput";
import { useCallback } from "react";

export const useEditOpportunity = () => {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const utils = trpc.useUtils();
  const opportunityId = params.id as string;
  const role = session?.user?.role as string | undefined;

  // Fetch the opportunity data
  const { data: opportunity, isLoading: isLoadingOpportunity } = trpc.opportunities.getOpportunity.useQuery(
    opportunityId,
    {
      enabled: !!opportunityId,
    }
  );

  // Update opportunity mutation
  const updateOpportunity = trpc.opportunities.updateOpportunity.useMutation({
    onSuccess: () => {
      toast.success("Opportunity updated successfully!");
      // Invalidate necessary queries
      utils.opportunities.getOrganizationOpportunities.invalidate();
      utils.opportunities.getOpportunity.invalidate(opportunityId);
      const dashboardPath = role === "mentor" ? "/mentor/dashboard" : "/organisation/dashboard";
      router.push(dashboardPath);
    },
    onError: (error) => {
      // Handle validation errors
      if (error.data && 'zodError' in error.data) {
        const fieldErrors = (error.data as { zodError: { fieldErrors: Record<string, string[]> } }).zodError.fieldErrors;
        Object.entries(fieldErrors).forEach(([field, errors]) => {
          if (errors?.[0]) {
            toast.error(`${field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ')}: ${errors[0]}`);
          }
        });
      } else {
        toast.error(error.message || "Failed to update opportunity. Please check all required fields and try again.");
      }
    },
  });

  // Transform opportunity data to form values
  const getDefaultValues = useCallback((): OpportunityFormValues => {
    if (!opportunity) {
      return {
        title: "",
        description: "",
        category: [],
        required_skills: [],
        requirements: [],
        commitment_type: "workbased",
        location: "",
        number_of_volunteers: 1,
        email_contact: "",
        phone_contact: "",
        internal_reference: "",
        external_event_link: "",
        start_date: "",
        start_time: "",
        end_date: "",
        end_time: "",
        is_recurring: false,
        recurrence: {
          type: "weekly",
          days: [],
          date_range: { start_date: "", end_date: "" },
          time_range: { start_time: "", end_time: "" },
          occurrences: undefined,
        },
        banner_img: "",
      };
    }

    // Format dates for form inputs using utility function

    return {
      title: opportunity.title || "",
      description: opportunity.description || "",
      category: opportunity.category || [],
      required_skills: opportunity.required_skills || [],
      requirements: opportunity.requirements || [],
      commitment_type: opportunity.commitment_type || "workbased",
      location: opportunity.location || "",
      number_of_volunteers: opportunity.number_of_volunteers || 1,
      email_contact: opportunity.email_contact || "",
      phone_contact: opportunity.phone_contact || "",
      internal_reference: opportunity.internal_reference || "",
      external_event_link: opportunity.external_event_link || "",
      start_date: opportunity.date?.start_date ? formatDateForInput(opportunity.date.start_date) : "",
      start_time: opportunity.time?.start_time || "",
      end_date: opportunity.date?.end_date ? formatDateForInput(opportunity.date.end_date) : "",
      end_time: opportunity.time?.end_time || "",
      is_recurring: opportunity.is_recurring || false,
      recurrence: opportunity.recurrence ? {
        type: opportunity.recurrence.type || "weekly",
        days: opportunity.recurrence.days || [],
        date_range: {
          start_date: opportunity.recurrence.date_range?.start_date ? formatDateForInput(opportunity.recurrence.date_range.start_date) : "",
          end_date: opportunity.recurrence.date_range?.end_date ? formatDateForInput(opportunity.recurrence.date_range.end_date) : "",
        },
        time_range: {
          start_time: opportunity.recurrence.time_range?.start_time || "",
          end_time: opportunity.recurrence.time_range?.end_time || "",
        },
        occurrences: opportunity.recurrence.occurrences,
      } : {
        type: "weekly",
        days: [],
        date_range: { start_date: "", end_date: "" },
        time_range: { start_time: "", end_time: "" },
        occurrences: undefined,
      },
      banner_img: opportunity.banner_img || "",
    };
  }, [opportunity]);

  const handleUpdate = async (data: OpportunityFormValues) => {
    if (!opportunityId) {
      toast.error("Opportunity ID is missing");
      return;
    }

    try {
      // Validate email if provided
      if (data.email_contact && data.email_contact.trim() !== "") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email_contact)) {
          toast.error("Please enter a valid email address");
          return;
        }
      }
      
      const formattedData = {
        ...data,
        email_contact: data.email_contact || "",
        phone_contact: data.phone_contact || "",
        internal_reference: data.internal_reference || "",
        external_event_link: data.external_event_link || "",
        end_date: data.end_date || "",
        end_time: data.end_time || "",
        banner_img: data.banner_img || "",
      };
      await updateOpportunity.mutateAsync({
        id: opportunityId,
        ...formattedData,
      });
    } catch (error) {
      // Error is already handled by the onError callback in useMutation
      console.error("Error updating opportunity:", error);
    }
  };

  return {
    opportunity,
    isLoadingOpportunity,
    updateOpportunity,
    getDefaultValues,
    handleUpdate,
    isUpdating: updateOpportunity.isPending,
  };
}; 