import type { APIRoute } from 'astro';
import { errorResponse, successResponse } from '../../lib/api';

export const POST: APIRoute = async ({ request }) => {
  try {
    const events = await request.json(); // EmailOctopus sends a JSON array

    console.log('All env vars:', process.env);
    console.log('Slack webhook raw:', process.env.SLACK_WEBHOOK_URL);

    if (!Array.isArray(events)) {
      return errorResponse('Invalid payload: expected an array', 400);
    }

    const slackWebhookUrl = import.meta.env.SLACK_WEBHOOK_URL;
    if (!slackWebhookUrl) {
      return errorResponse('Slack webhook URL not configured', 500);
    }

    // Send each event to Slack
    await Promise.all(
      events.map(async (e: any) => {
        const text = `${e.contact_email_address}: \`${e.type}\``;

        await fetch(slackWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });
      })
    );

    return successResponse({ posted: events.length });
  } catch (err) {
    console.error('Error handling webhook:', err);
    return errorResponse('Failed to process webhook', 500);
  }
};