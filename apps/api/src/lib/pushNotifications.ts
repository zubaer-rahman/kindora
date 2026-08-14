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
}

export async function sendPushNotifications(
  expoPushTokens: string[],
  title: string,
  body: string,
  data?: any,
  categoryId?: string
): Promise<void> {
}
