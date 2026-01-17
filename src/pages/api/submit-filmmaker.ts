// Internal imports
import { db } from '@db';
import { filmmakers } from '@db/schema';
import { errorResponse, jsonResponse } from '@lib/api';
import { subscribeToNewsletter } from '@lib/newsletter';
// Astro types
import type { APIRoute } from 'astro';
// External packages
import { Resend } from 'resend';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request, url }) => {
  try {
    const body = await request.json();
    const { name, email, phone, roles, company, website, socialMedia, gear, bio, notes, newsletter } = body;

    if (!name || !email || !roles) {
      return errorResponse('Name, email, and roles are required');
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
      socialMedia: socialMedia || null,
      gear: gear || null,
      bio: bio || null,
      status: 'pending',
    }).returning();

    // Subscribe to newsletter if requested
    if (subscribeToNewsletterRequested) {
      try {
        await subscribeToNewsletter(email);
      } catch (newsletterError) {
        // Don't fail the filmmaker submission if newsletter signup fails
        console.error('Failed to subscribe to newsletter:', newsletterError);
      }
    }

    if (import.meta.env.RESEND_API_KEY && import.meta.env.ADMIN_EMAIL) {
      try {
        const adminUrl = `${url.origin}/admin/filmmakers`;

        await resend.emails.send({
          from: 'AVL Film <onboarding@resend.dev>',
          replyTo: email,
          to: import.meta.env.ADMIN_EMAIL,
          subject: 'New Filmmaker Directory Submission',
          html: `
            <h2>New Filmmaker Directory Submission</h2>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr>
                <td style="padding: 10px; background: #4b5563; color: white; font-weight: 600; border: 1px solid #d1d5db; width: 150px;">NAME</td>
                <td style="padding: 10px; border: 1px solid #d1d5db;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px; background: #4b5563; color: white; font-weight: 600; border: 1px solid #d1d5db;">EMAIL</td>
                <td style="padding: 10px; border: 1px solid #d1d5db;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 10px; background: #4b5563; color: white; font-weight: 600; border: 1px solid #d1d5db;">PHONE</td>
                <td style="padding: 10px; border: 1px solid #d1d5db;">${phone || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 10px; background: #4b5563; color: white; font-weight: 600; border: 1px solid #d1d5db;">ROLES</td>
                <td style="padding: 10px; border: 1px solid #d1d5db;">${roles}</td>
              </tr>
              <tr>
                <td style="padding: 10px; background: #4b5563; color: white; font-weight: 600; border: 1px solid #d1d5db;">COMPANY</td>
                <td style="padding: 10px; border: 1px solid #d1d5db;">${company || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 10px; background: #4b5563; color: white; font-weight: 600; border: 1px solid #d1d5db;">WEBSITE</td>
                <td style="padding: 10px; border: 1px solid #d1d5db;">${website || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 10px; background: #4b5563; color: white; font-weight: 600; border: 1px solid #d1d5db;">SOCIAL MEDIA</td>
                <td style="padding: 10px; border: 1px solid #d1d5db;">${socialMedia || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 10px; background: #4b5563; color: white; font-weight: 600; border: 1px solid #d1d5db;">GEAR</td>
                <td style="padding: 10px; border: 1px solid #d1d5db; white-space: pre-wrap;">${gear || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 10px; background: #4b5563; color: white; font-weight: 600; border: 1px solid #d1d5db;">BIO</td>
                <td style="padding: 10px; border: 1px solid #d1d5db; white-space: pre-wrap;">${bio || 'N/A'}</td>
              </tr>
              ${notes ? `
              <tr>
                <td style="padding: 10px; background: #4b5563; color: white; font-weight: 600; border: 1px solid #d1d5db;">NOTES</td>
                <td style="padding: 10px; border: 1px solid #d1d5db; white-space: pre-wrap;">${notes}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 10px; background: #4b5563; color: white; font-weight: 600; border: 1px solid #d1d5db;">NEWSLETTER</td>
                <td style="padding: 10px; border: 1px solid #d1d5db;">${subscribeToNewsletterRequested ? 'Yes' : 'No'}</td>
              </tr>
            </table>
            <p><a href="${adminUrl}" style="color: #667eea; font-weight: 600;">Review in Admin</a></p>
          `,
        });
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
      }
    }

    return jsonResponse({ success: true, filmmaker }, 201);
  } catch (error) {
    return errorResponse('Failed to submit filmmaker', error, request);
  }
};
