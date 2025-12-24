import type { APIRoute } from 'astro';
import { db } from '../../db';
import { filmmakers } from '../../db/schema';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, email, phone, roles, company, website, socialMedia, gear } = body;

    if (!name || !email || !roles) {
      return new Response(
        JSON.stringify({ error: 'Name, email, and roles are required' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
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
        await resend.emails.send({
          from: 'AVL Film Directory <noreply@avlfilm.com>',
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
            <p><a href="https://avlfilm.com/admin/filmmakers">Review in Admin</a></p>
          `,
        });
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
      }
    }

    return new Response(
      JSON.stringify({ success: true, filmmaker }),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error submitting filmmaker:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to submit filmmaker' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};
