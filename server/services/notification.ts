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
      console.log(`📢 Sending archive notification for opportunity: ${opportunityTitle}`);
      console.log(`📊 Notification Details:`);
      console.log(`   - Opportunity ID: ${opportunityId} (type: ${typeof opportunityId})`);
      console.log(`   - Opportunity Title: ${opportunityTitle}`);
      console.log(`   - Organization ID: ${organizationId}`);
      console.log(`   - Organization Name: ${organizationName}`);
      console.log(`   - Timestamp: ${new Date().toISOString()}`);

      // Debug: Check current notification count
      await this.debugNotificationCount(opportunityId);

      // Get the opportunity creator and organization members
      const opportunity = await Opportunity.findById(opportunityId)
        .populate('created_by', 'name email')
        .populate('organization_profile', 'title contact_email');

      if (!opportunity) {
        console.error(`❌ Opportunity not found for notification: ${opportunityId}`);
        return;
      }

      // Find all users associated with this organization only
      const organizationUsers = await User.find({
        organization_profile: organizationId,
        role: { $in: ['organization', 'admin', 'mentor'] }
      });

      console.log(`👥 Organization users found: ${organizationUsers.length}`);
      organizationUsers.forEach(user => {
        console.log(`   - ${user.name} (${user.email}) - Role: ${user.role}`);
      });

      // Only notify users from this specific organization
      const allUsers = [...organizationUsers];

      console.log(`📧 Total users to notify: ${allUsers.length}`);

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
      console.log(`📤 Sending notifications to users...`);
      for (const user of allUsers) {
        // Check if this user already has a notification for this opportunity
        console.log(`   🔍 Checking for existing notification for ${user.name} (${user.email}) - Opportunity: ${opportunityId}`);
        console.log(`   🔍 User ID: ${user._id}, Opportunity ID: ${opportunityId}`);
        
        // Use a more robust duplicate check with a time window
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
        const existingNotification = await Notification.findOne({
          user: user._id,
          opportunity_id: opportunityId,
          type: 'opportunity_archived',
          createdAt: { $gte: oneHourAgo }
        });

        console.log(`   📊 Existing notification found: ${!!existingNotification}`);
        if (existingNotification) {
          console.log(`   📊 Existing notification details:`, {
            id: existingNotification._id,
            opportunity_id: existingNotification.opportunity_id,
            type: existingNotification.type,
            createdAt: existingNotification.createdAt
          });
        }

        if (existingNotification) {
          console.log(`   ⏭️ Skipping ${user.name} (${user.email}) - notification already exists (ID: ${existingNotification._id})`);
          continue;
        }

        console.log(`   📧 Sending to: ${user.name} (${user.email})`);
        await this.sendNotificationToUser(user, notificationData);
      }

      // Note: We're now only sending notifications to users from the specific organization
      // that created the opportunity, ensuring privacy and preventing cross-organization notifications

      console.log(`✅ Archive notification sent for opportunity: ${opportunityTitle}`);
      console.log(`📊 Summary: Notified ${allUsers.length} users for opportunity "${opportunityTitle}"`);
      
      // Debug: Check final notification count
      await this.debugNotificationCount(opportunityId);
      
      console.log(`⏰ Completed at: ${new Date().toISOString()}`);
      console.log(`---`);
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
      console.log(`📤 Starting unarchive notification for opportunity: ${opportunityTitle} (${opportunityId})`);
      console.log(`🏢 Organization: ${organizationName} (${organizationId})`);

      // Get the opportunity to find all users who should be notified
      const opportunity = await Opportunity.findById(opportunityId)
        .populate('created_by', 'name email')
        .populate('organization_profile', 'title contact_email');

      if (!opportunity) {
        console.error(`❌ Opportunity not found for unarchive notification: ${opportunityId}`);
        return;
      }

      // Find all users associated with this organization
      const allUsers = await User.find({
        organization_profile: organizationId,
        is_deleted: { $ne: true }
      }).select('name email _id');

      console.log(`📧 Total users to notify: ${allUsers.length}`);

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
      console.log(`📤 Sending unarchive notifications to users...`);
      for (const user of allUsers) {
        // Check if this user already has a notification for this opportunity
        console.log(`   🔍 Checking for existing unarchive notification for ${user.name} (${user.email}) - Opportunity: ${opportunityId}`);
        
        // Use a more robust duplicate check with a time window
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
        const existingNotification = await Notification.findOne({
          user: user._id,
          opportunity_id: opportunityId,
          type: 'opportunity_unarchived',
          createdAt: { $gte: oneHourAgo }
        });

        console.log(`   📊 Existing unarchive notification found: ${!!existingNotification}`);
        if (existingNotification) {
          console.log(`   ⏭️ Skipping ${user.name} (${user.email}) - unarchive notification already exists (ID: ${existingNotification._id})`);
          continue;
        }

        console.log(`   📝 Creating unarchive notification for ${user.name} (${user.email})`);

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
          console.log(`   ✅ Unarchive notification created for ${user.name} (${user.email}) - ID: ${notification._id}`);
        } catch (saveError: any) {
          if (saveError.code === 11000) {
            console.log(`   ⚠️ Duplicate unarchive notification prevented for ${user.name} (${user.email})`);
          } else {
            console.error(`   ❌ Error saving unarchive notification for ${user.name}:`, saveError);
          }
        }
      }

      console.log(`✅ Unarchive notification sent for opportunity: ${opportunityTitle}`);
      console.log(`📊 Summary: Notified ${allUsers.length} users for opportunity "${opportunityTitle}"`);
      
      console.log(`⏰ Completed at: ${new Date().toISOString()}`);
      console.log(`---`);
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
      const opportunity = await Opportunity.findById(opportunityId)
        .populate('created_by', 'name email')
        .populate('organization_profile', 'title contact_email');

      if (!opportunity) {
        console.error(`❌ Opportunity not found for notification: ${opportunityId}`);
        return;
      }

      // Find all users associated with this organization only
      const organizationUsers = await User.find({
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
        const existingNotification = await Notification.findOne({
          user: user._id,
          opportunity_id: opportunityId,
          type: 'volunteer_withdrew',
          createdAt: { $gte: oneHourAgo }
        });
        if (existingNotification) {
          continue;
        }
        await this.sendNotificationToUser(user, notificationData);
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
      console.log(`📧 Notification for user ${user.email || user.name}:`);
      console.log(`   Subject: ${notificationData.title}`);
      console.log(`   Message: ${notificationData.message}`);
      console.log(`   Opportunity: ${notificationData.opportunityTitle}`);
      console.log(`   Organization: ${notificationData.organizationName}`);
      console.log(`   Archived at: ${notificationData.archivedAt?.toISOString() || 'N/A'}`);

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
    console.log(`📧 Would send email to ${email}: ${notificationData.title}`);
  }

  /**
   * Send push notification (placeholder for future implementation)
   */
  private async sendPushNotification(pushToken: string, notificationData: NotificationData): Promise<void> {
    // TODO: Implement push notification using Firebase or similar
    console.log(`📱 Would send push notification to ${pushToken}: ${notificationData.title}`);
  }

  /**
   * Debug function to check notification count
   */
  private async debugNotificationCount(opportunityId: string): Promise<void> {
    const count = await Notification.countDocuments({
      opportunity_id: opportunityId,
      type: 'opportunity_archived'
    });
    console.log(`🔍 Total notifications for opportunity ${opportunityId}: ${count}`);
  }

  /**
   * Store in-app notification (placeholder for future implementation)
   */
  private async storeInAppNotification(userId: string, notificationData: NotificationData): Promise<void> {
    try {
      console.log(`💾 Attempting to store notification for user ${userId}...`);
      console.log(`📝 Notification data:`, {
        user: userId,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        opportunity_id: notificationData.opportunityId
      });

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

      console.log(`💾 Storing notification with data:`, notificationDataToStore);

      const notification = await Notification.create(notificationDataToStore);
      
      console.log(`✅ Successfully stored notification:`, {
        id: notification._id,
        user: userId,
        title: notificationData.title,
        opportunity_id: notification.opportunity_id,
        createdAt: notification.createdAt
      });
    } catch (error) {
      // Handle duplicate key error (E11000)
      if (error instanceof Error && error.message.includes('E11000')) {
        console.log(`⚠️ Duplicate notification prevented for user ${userId} and opportunity ${notificationData.opportunityId}`);
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