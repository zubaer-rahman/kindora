/**
 * Push Notifications Helper
 * 
 * Note: Expo has been removed as per project requirements.
 * These functions are currently stubs for Firebase or another future push provider.
 */

export async function sendPushNotification(
  expoPushToken: string,
  title: string,
  body: string,
  data?: any,
  categoryId?: string
): Promise<void> {
  console.log(`[PUSH NOTIFICATION STUB] To: ${expoPushToken} | Title: ${title}`);
}

export async function sendPushNotifications(
  expoPushTokens: string[],
  title: string,
  body: string,
  data?: any,
  categoryId?: string
): Promise<void> {
  console.log(`[PUSH NOTIFICATIONS STUB] To ${expoPushTokens.length} devices | Title: ${title}`);
}
