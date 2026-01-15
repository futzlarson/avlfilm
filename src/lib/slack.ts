// Shared Slack notification utility

/**
 * Sends a message to the configured Slack webhook
 * @param text The message text to send
 * @returns Promise<boolean> - true if successful, false if failed or not configured
 */
export async function sendSlackNotification(text: string): Promise<boolean> {
  const slackWebhookUrl = import.meta.env.SLACK_WEBHOOK_URL;

  if (!slackWebhookUrl) {
    console.warn('SLACK_WEBHOOK_URL not configured');
    return false;
  }

  try {
    const response = await fetch(slackWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to send Slack notification:', error);
    return false;
  }
}
