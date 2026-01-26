// Internal imports
import { db } from '@db';
import { filmmakers } from '@db/schema';
import * as filmmakerSubmissionEmail from '@emails/filmmaker-submission';
import { errorResponse, jsonResponse } from '@lib/api';
import { findUserByEmail } from '@lib/auth';
import { subscribeToNewsletter } from '@lib/newsletter';
import { sendPasswordResetEmail } from '@lib/send-reset-email';
// Astro types
import type { APIRoute } from 'astro';
// External packages
import { Resend } from 'resend';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request, url }) => {
  try {
    const body = await request.json();
    const { name, email, phone, roles, company, website, instagram, youtube, facebook, gear, bio, notes, newsletter } = body;

    if (!name || !email || !roles) {
      return errorResponse('Name, email, and roles are required');
    }

    // Check for duplicate (defensive)
    const existing = await findUserByEmail(email);
    if (existing) {
      return errorResponse('This email is already registered', 400);
    }

    // Normalize newsletter value to boolean
    const subscribeToNewsletterRequested = newsletter === 'on' || newsletter === true;

    const [filmmaker] = await db.insert(filmmakers).values({
      name,
      email,
      phone: phone || null,
      roles,
      company: company || null,
      website: website || null,
      instagram: instagram || null,
      youtube: youtube || null,
      facebook: facebook || null,
      gear: gear || null,
      bio: bio || null,
      status: 'pending',
    }).returning();

    // Subscribe to newsletter if requested
    if (subscribeToNewsletterRequested) {
      try {
        await subscribeToNewsletter(email, { tags: ['filmmaker_directory'] });
      } catch (newsletterError) {
        // Don't fail the filmmaker submission if newsletter signup fails
        console.error('Failed to subscribe to newsletter:', newsletterError);
      }
    }

    if (import.meta.env.RESEND_API_KEY && import.meta.env.ADMIN_EMAIL) {
      try {
        await resend.emails.send({
          from: 'AVL Film <onboarding@resend.dev>',
          replyTo: email,
          to: import.meta.env.ADMIN_EMAIL,
          subject: 'New Filmmaker Directory Submission',
          html: filmmakerSubmissionEmail.generate({
            ...filmmaker,
            notes,
            newsletter: subscribeToNewsletterRequested,
            adminUrl: `${url.origin}/admin/filmmakers`,
          }),
        });
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
      }
    }

    // Send password setup email to user
    try {
      await sendPasswordResetEmail({
        user: {
          id: filmmaker.id,
          email: filmmaker.email,
          name: filmmaker.name
        },
        origin: url.origin,
        subject: 'Welcome to AVL Film - Set Your Password',
      });
    } catch (emailError) {
      console.error('Failed to send password setup email:', emailError);
      // Don't fail the submission if email fails
    }

    return jsonResponse({ success: true, filmmaker }, 201);
  } catch (error) {
    return errorResponse('Failed to submit filmmaker', error, request);
  }
};
