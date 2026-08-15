
export interface IVolunteerApplication {
  opportunity: string;
  volunteer: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
} 