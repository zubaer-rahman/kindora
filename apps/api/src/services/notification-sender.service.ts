import User from '../db/models/user';
import Opportunity from '../db/models/opportunity';
import Notification from '../db/models/notification';

export interface NotificationData {
  type: 'opportunity_archived' | 'opportunity_unarchived' | 'volunteer_withdrew' | string;
  title: string;
  message: string;
  opportunityId: string;
  opportunityTitle: string;
  organizationId: string;
  organizationName: string;
  archivedAt?: Date;
  unarchivedAt?: Date;
}

interface UserWithDetails {
  _id: string;
  name?: string;
  email?: string;
  role?: string;
}

export class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Send notification when an opportunity is archived
   */
  public async sendOpportunityArchivedNotification(
    opportunityId: string,
    opportunityTitle: string,
    organizationId: string,
    organizationName: string,
    customMessage?: string
  ): Promise<void> {
    try {

      // Debug: Check current notification count
      await this.debugNotificationCount(opportunityId);

      // Get the opportunity creator and organization members
      const OpportunityModel = Opportunity as any;
      const opportunity = await OpportunityModel.findById(opportunityId)
        .populate('created_by', 'name email')
        .populate('organization_profile', 'title contact_email');

      if (!opportunity) {
        console.error(`❌ Opportunity not found for notification: ${opportunityId}`);
        return;
      }

      // Find all users associated with this organization only
      const UserModel = User as any;
      const organizationUsers = await UserModel.find({
        organization_profile: organizationId,
        role: { $in: ['organization', 'admin', 'mentor'] }
      });

      organizationUsers.forEach(user => {
      });

      // Only notify users from this specific organization
      const allUsers = [...organizationUsers];


      // Create notification data
      const notificationData: NotificationData = {
        type: 'opportunity_archived',
        title: 'Opportunity Archived',
        message: customMessage || `The opportunity "${opportunityTitle}" has been automatically archived.`,
        opportunityId: opportunityId,
        opportunityTitle: opportunityTitle,
        organizationId: organizationId,
        organizationName: organizationName,
        archivedAt: new Date()
      };

      // Send notifications to all relevant users
      for (const user of allUsers) {
        // Check if this user already has a notification for this opportunity
        
        // Use a more robust duplicate check with a time window
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
        const NotificationModel = Notification as any;
        const existingNotification = await NotificationModel.findOne({
          user: user._id,
          opportunity_id: opportunityId,
          type: 'opportunity_archived',
          createdAt: { $gte: oneHourAgo }
        });


        if (existingNotification) {
          continue;
        }

        await this.sendNotificationToUser(user as any, notificationData);
      }

      // Note: We're now only sending notifications to users from the specific organization
      // that created the opportunity, ensuring privacy and preventing cross-organization notifications

      
      // Debug: Check final notification count
      await this.debugNotificationCount(opportunityId);
      
    } catch (error) {
      console.error('❌ Error sending archive notification:', error);
    }
  }

  /**
   * Send notification when an opportunity is unarchived
   */
  public async sendOpportunityUnarchivedNotification(
    opportunityId: string,
    opportunityTitle: string,
    organizationId: string,
    organizationName: string,
    customMessage?: string
  ): Promise<void> {
    try {

      // Get the opportunity to find all users who should be notified
      const OpportunityModel = Opportunity as any;
      const opportunity = await OpportunityModel.findById(opportunityId)
        .populate('created_by', 'name email')
        .populate('organization_profile', 'title contact_email');

      if (!opportunity) {
        console.error(`❌ Opportunity not found for unarchive notification: ${opportunityId}`);
        return;
      }

      // Find all users associated with this organization
      const UserModel = User as any;
      const allUsers = await UserModel.find({
        organization_profile: organizationId,
        is_deleted: { $ne: true }
      }).select('name email _id');


      // Create notification data
      const notificationData: NotificationData = {
        type: 'opportunity_unarchived',
        title: 'Opportunity Restored',
        message: customMessage || `The opportunity "${opportunityTitle}" has been restored from the archive.`,
        opportunityId: opportunityId,
        opportunityTitle: opportunityTitle,
        organizationId: organizationId,
        organizationName: organizationName,
        unarchivedAt: new Date()
      };

      // Send notifications to all relevant users
      for (const user of allUsers) {
        // Check if this user already has a notification for this opportunity
        
        // Use a more robust duplicate check with a time window
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
        const NotificationModel = Notification as any;
        const existingNotification = await NotificationModel.findOne({
          user: user._id,
          opportunity_id: opportunityId,
          type: 'opportunity_unarchived',
          createdAt: { $gte: oneHourAgo }
        });

        if (existingNotification) {
          continue;
        }


        // Create the notification
        const notification = new Notification({
          user: user._id,
          type: notificationData.type,
          title: notificationData.title,
          message: notificationData.message,
          opportunity_id: opportunityId,
          data: {
            opportunityTitle: notificationData.opportunityTitle,
            organizationId: notificationData.organizationId,
            organizationName: notificationData.organizationName,
            unarchivedAt: notificationData.unarchivedAt
          }
        });

        try {
          await notification.save();
        } catch (saveError: any) {
          if (saveError.code === 11000) {
          } else {
            console.error(`   ❌ Error saving unarchive notification for ${user.name}:`, saveError);
          }
        }
      }

      
    } catch (error) {
      console.error('❌ Error sending unarchive notification:', error);
    }
  }

  /**
   * Send notification when a volunteer withdraws from an opportunity
   */
  public async sendVolunteerWithdrewNotification(
    opportunityId: string,
    opportunityTitle: string,
    organizationId: string,
    organizationName: string,
    volunteerName: string,
    customMessage?: string
  ): Promise<void> {
    try {
      // Get the opportunity creator and organization members
      const OpportunityModel = Opportunity as any;
      const opportunity = await OpportunityModel.findById(opportunityId)
        .populate('created_by', 'name email')
        .populate('organization_profile', 'title contact_email');

      if (!opportunity) {
        console.error(`❌ Opportunity not found for notification: ${opportunityId}`);
        return;
      }

      // Find all users associated with this organization only
      const UserModel = User as any;
      const organizationUsers = await UserModel.find({
        organization_profile: organizationId,
        role: { $in: ['organization', 'admin', 'mentor'] }
      });

      // Only notify users from this specific organization
      const allUsers = [...organizationUsers];

      // Create notification data
      const notificationData = {
        type: 'volunteer_withdrew',
        title: 'Volunteer Withdrew Application',
        message: customMessage || `Volunteer ${volunteerName} has withdrawn their application from the opportunity "${opportunityTitle}".`,
        opportunityId: opportunityId,
        opportunityTitle: opportunityTitle,
        organizationId: organizationId,
        organizationName: organizationName,
        archivedAt: new Date() // For compatibility, though not strictly an archive event
      };

      // Send notifications to all relevant users
      for (const user of allUsers) {
        // Prevent duplicate notifications within a short window
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const NotificationModel = Notification as any;
        const existingNotification = await NotificationModel.findOne({
          user: user._id,
          opportunity_id: opportunityId,
          type: 'volunteer_withdrew',
          createdAt: { $gte: oneHourAgo }
        });
        if (existingNotification) {
          continue;
        }
        await this.sendNotificationToUser(user as any, notificationData);
      }
    } catch (error) {
      console.error('❌ Error sending volunteer withdrew notification:', error);
    }
  }

  /**
   * Send notification to a specific user
   */
  private async sendNotificationToUser(user: UserWithDetails, notificationData: NotificationData): Promise<void> {
    try {
      // Store notification in database for in-app display
      await this.storeInAppNotification(user._id, notificationData);

      // Log the notification

      // TODO: Implement additional notification delivery methods
      // await this.sendEmail(user.email, notificationData);
      // await this.sendPushNotification(user.pushToken, notificationData);

    } catch (error) {
      console.error(`❌ Error sending notification to user ${user.email || user.name}:`, error);
    }
  }

  /**
   * Send email notification (placeholder for future implementation)
   */
  private async sendEmail(email: string, notificationData: NotificationData): Promise<void> {
    // TODO: Implement email sending using nodemailer or similar
  }

  /**
   * Send push notification (placeholder for future implementation)
   */
  private async sendPushNotification(pushToken: string, notificationData: NotificationData): Promise<void> {
    // TODO: Implement push notification using Firebase or similar
  }

  /**
   * Debug function to check notification count
   */
  private async debugNotificationCount(opportunityId: string): Promise<void> {
    const NotificationModel = Notification as any;
    const count = await NotificationModel.countDocuments({
      opportunity_id: opportunityId,
      type: 'opportunity_archived'
    });
  }

  /**
   * Store in-app notification (placeholder for future implementation)
   */
  private async storeInAppNotification(userId: string, notificationData: NotificationData): Promise<void> {
    try {
      const notificationDataToStore = {
        user: userId,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        opportunity_id: notificationData.opportunityId,
        data: {
          opportunityId: notificationData.opportunityId,
          opportunityTitle: notificationData.opportunityTitle,
          organizationId: notificationData.organizationId,
          organizationName: notificationData.organizationName,
          archivedAt: notificationData.archivedAt
        },
        isRead: false
      };


      const NotificationModel = Notification as any;
      const notification = await NotificationModel.create(notificationDataToStore);
    } catch (error) {
      // Handle duplicate key error (E11000)
      if (error instanceof Error && error.message.includes('E11000')) {
        return;
      }
      
      console.error(`❌ Error storing in-app notification for user ${userId}:`, error);
      console.error(`❌ Error details:`, {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        userId,
        notificationData
      });
    }
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance(); 