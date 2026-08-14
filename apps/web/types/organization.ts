export interface Volunteer {
  _id: string;
  id?: string;
  name: string;
  image?: string;
  role: string;
  area?: string;
  state?: string;
  volunteer_profile?: {
    student_type?: "yes" | "no";
    course?: string;
    availability_date?: {
      start_date?: string;
      end_date?: string;
    };
    interested_on?: string[];
    bio?: string;
  };
}

export interface RecruitedApplicant {
  readonly name: string;
  readonly email: string;
  readonly bio: string;
  readonly id: string;
  readonly location: string;
  readonly applicationId: string;
  readonly profileImg: string;
  readonly skills: string[];
  readonly completedProjects: number;
  readonly availability: string;
  readonly opportunity?: {
    readonly id: string;
    readonly title: string;
    readonly description: string;
    readonly category: string[];
    readonly location: string;
    readonly commitment_type: string;
  } | null;
}

export interface ActiveContract {
  id: string;
  profileImg?: string;
  jobTitle: string;
  freelancerName: string;
  startedAt: string;
  opportunityTitle?: string;
  opportunityId?: string;
  uniqueKey: string;
  opportunities: Array<{ id: string; title: string }>;
}
