export type OpportunityFormValues = {
    title: string;
    description: string;
    category: string[];
    required_skills: string[];
    commitment_type: string;
    location: string;
    number_of_volunteers: number;
    email_contact?: string;
    phone_contact?: string;
    internal_reference?: string;
    external_event_link?: string;
    start_date: string;
    start_time: string;
    end_date?: string;
    end_time?: string;
    is_recurring: boolean;
    recurrence?: {
        type: string;
        days: string[];
        date_range: {
            start_date: string;
            end_date?: string;
        };
        time_range: {
            start_time: string;
            end_time: string;
        };
        occurrences?: number;
    };
    banner_img?: string;
    requirements?: string[];
    organization_id?: string;
};
