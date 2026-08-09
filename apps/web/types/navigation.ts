export type NavItem = {
  label: string;
  href: string;
  className?: string;
};

export type UserRole = 'organization' | 'volunteer' | 'admin' | 'mentor';

export type SessionUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: UserRole;
  organization_profile?: {
    _id: string;
    title: string;
    type: string;
    contact_email: string;
    phone_number: string;
    bio: string;
    state: string;
    area: string;
    abn: string;
    website?: string;
    profile_img?: string;
    cover_img?: string;
    opportunity_types: string[];
    required_skills: string[];
  };
};

export type Session = {
  user?: SessionUser;
}; 