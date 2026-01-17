// Internal imports
import { trackEvent } from "@lib/analytics-server";
import { errorResponse, successResponse } from "@lib/api";
import { sendSlackNotification } from "@lib/slack";
// Astro types
import type { APIRoute } from "astro";

interface EmailOctopusEvent {
  type: string;
  contact_email_address: string;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const webhookEvents = await request.json(); // EmailOctopus sends a JSON array

    if (!Array.isArray(webhookEvents)) {
      return errorResponse("Invalid payload: expected an array", 400);
    }

    // Track events and send to Slack
    await Promise.all(
      webhookEvents.map(async (e: EmailOctopusEvent) => {
        // Track in analytics database
        await trackEvent({
          eventName: `newsletter_${e.type}`,
          properties: {
            email: e.contact_email_address,
            type: e.type,
          },
          visitorId: null,
          userAgent: null,
          location: null,
        });

        // Send to Slack
        const text = `${e.contact_email_address}: \`${e.type}\``;
        await sendSlackNotification(text);
      }),
    );

    return successResponse({ posted: webhookEvents.length });
  } catch (err) {
    return errorResponse("Failed to process webhook", err, request);
  }
};
