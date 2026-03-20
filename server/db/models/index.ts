// Import models in the correct order to ensure proper registration
import User from './user';
import VolunteerProfile from './volunteer-profile';
import OrganizationProfile from './organization-profile';
import { Message } from './message';
import Opportunity from './opportunity';
import VolunteerApplication from './volunteer-application';
import FavoriteOpportunity from './favorite-opportunity';
import Referral from './referral';
import OpportunityMentor from './opportunity-mentor';
import Skill from './skill';
import { Feedback } from './feedback';
import RosterShift from './roster-shift';

// Export all models
export {
  User,
  VolunteerProfile,
  OrganizationProfile,
  Message,
  Opportunity,
  VolunteerApplication,
  FavoriteOpportunity,
  Referral,
  OpportunityMentor,
  Skill,
  Feedback,
  RosterShift,
};