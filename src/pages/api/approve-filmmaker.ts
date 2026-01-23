// Internal imports
import { db } from '@db';
import { filmmakers } from '@db/schema';
import { errorResponse, successResponse } from '@lib/api';
import { generateApprovalEmailHtml } from '@lib/approval-email';
import { requireAdmin } from '@lib/auth';
// Astro types
import type { APIRoute } from 'astro';
// External packages
import { eq } from 'drizzle-orm';
import { Resend } from 'resend';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async (context) => {
  const { request, url } = context;

  // Require admin authentication
  try {
    await requireAdmin(context);
  } catch {
    return errorResponse('Unauthorized', 401);
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return errorResponse('Filmmaker ID is required');
    }

    // Check if we're approving the filmmaker
    const isApprovingFilmmaker = updates.status === 'approved';
    let previousStatus: string | undefined;

    if (isApprovingFilmmaker) {
      // Fetch current filmmaker to check if already approved
      const [currentFilmmaker] = await db
        .select()
        .from(filmmakers)
        .where(eq(filmmakers.id, id))
        .limit(1);

      if (currentFilmmaker) {
        previousStatus = currentFilmmaker.status;
      }
    }

    // Drizzle accepts Partial<Filmmaker> for updates
    const updateData = {
      ...updates,
      updatedAt: new Date(),
    };

    const [filmmaker] = await db
      .update(filmmakers)
      .set(updateData)
      .where(eq(filmmakers.id, id))
      .returning();

    if (!filmmaker) {
      return errorResponse('Filmmaker not found', 404);
    }

    // Send approval email if status changed to approved
    if (isApprovingFilmmaker && previousStatus !== 'approved') {
      try {
        const directoryUrl = `${url.origin}/directory`;
        const emailHtml = generateApprovalEmailHtml(
          filmmaker.name,
          filmmaker.roles,
          directoryUrl
        );

        await resend.emails.send({
          from: import.meta.env.RESEND_FROM_EMAIL || 'AVL Film <onboarding@resend.dev>',
          replyTo: import.meta.env.ADMIN_EMAIL,
          to: filmmaker.email,
          subject: "You've been approved for the AVL Film Directory!",
          html: emailHtml,
        });
      } catch (emailError) {
        // Don't fail the approval if email fails
        console.error('Failed to send approval email:', emailError);
      }
    }

    return successResponse({ filmmaker });
  } catch (error) {
    return errorResponse('Failed to update filmmaker', error, request);
  }
};
