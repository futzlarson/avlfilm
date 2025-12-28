import type { APIRoute } from 'astro';
import { db } from '../../db';
import { filmmakers } from '../../db/schema';
import { Resend } from 'resend';
import { errorResponse, jsonResponse } from '../../lib/api';

const resend = new Resend(process.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request, url }) => {
  try {
    const body = await request.json();
    const { name, email, phone, roles, company, website, socialMedia, gear } = body;

    if (!name || !email || !roles) {
      return errorResponse('Name, email, and roles are required');
    }

    const [filmmaker] = await db.insert(filmmakers).values({
      name,
      email,
      phone: phone || null,
      roles,
      company: company || null,
      website: website || null,
      socialMedia: socialMedia || null,
      gear: gear || null,
      status: 'pending',
    }).returning();

    if (process.env.RESEND_API_KEY && process.env.ADMIN_EMAIL) {
      try {
        const adminUrl = `${url.origin}/admin/filmmakers`;

        await resend.emails.send({
          from: 'AVL Film <onboarding@resend.dev>',
          replyTo: process.env.ADMIN_EMAIL,
          to: process.env.ADMIN_EMAIL,
          subject: 'New Filmmaker Directory Submission',
          html: `
            <h2>New Filmmaker Directory Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
            <p><strong>Roles:</strong> ${roles}</p>
            <p><strong>Company:</strong> ${company || 'N/A'}</p>
            <p><strong>Website:</strong> ${website || 'N/A'}</p>
            <p><strong>Social Media:</strong> ${socialMedia || 'N/A'}</p>
            <p><strong>Gear:</strong> ${gear || 'N/A'}</p>
            <p><a href="${adminUrl}">Review in Admin</a></p>
          `,
        });
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
      }
    }

    return jsonResponse({ success: true, filmmaker }, 201);
  } catch (error) {
    console.error('Error submitting filmmaker:', error);
    return errorResponse('Failed to submit filmmaker', 500);
  }
};
