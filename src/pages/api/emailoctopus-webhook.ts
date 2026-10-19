// Internal imports
import { trackEvent } from "@lib/analytics-server";
import { errorResponse, successResponse } from "@lib/api";
import { sendSlackNotification } from "@lib/slack";
// Astro types
import type { APIRoute } from "astro";

interface EmailOctopusEvent {
  type: string;
  contact_email_address: string;
  [key: string]: unknown;
}

// EmailOctopus doesn't document where it puts the bounce type, so find a "soft"/"hard" value anywhere in the event.
function bounceType(value: unknown): string | null {
  if (typeof value === 'string') return /^(soft|hard)$/i.test(value) ? value.toLowerCase() : null;
  if (value && typeof value === 'object') {
    for (const v of Object.values(value)) {
      const found = bounceType(v);
      if (found) return found;
    }
  }
  return null;
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
          // Full event kept so payload details (like bounce type) can be checked later.
          properties: { ...e, email: e.contact_email_address },
          visitorId: null,
          userAgent: null,
          location: null,
        });

        // Send to Slack
        const bounce = e.type === 'contact.bounced' ? bounceType(e) : null;
        const text = `${e.contact_email_address}: \`${e.type}\`${bounce ? ` (${bounce})` : ''}`;
        await sendSlackNotification(text);
      }),
    );

    return successResponse({ posted: webhookEvents.length });
  } catch (err) {
    return errorResponse("Failed to process webhook", err, request);
  }
};
