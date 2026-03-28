import prisma from '../lib/prisma.js'
import { Resend } from 'resend'

export default async function contactRoutes(app) {
  // POST /api/contact
  app.post('/', async (request, reply) => {
    const { name, email, message } = request.body

    if (!name || !email || !message) {
      return reply.status(400).send({ error: 'All fields are required' })
    }

    // Save to DB
    await prisma.contactMessage.create({
      data: { name, email, message },
    })

    // Send email notification via Resend
    if (process.env.RESEND_API_KEY && process.env.CONTACT_EMAIL) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY)
        await resend.emails.send({
          from: 'OpenMindPlus <onboarding@resend.dev>',
          to: process.env.CONTACT_EMAIL,
          subject: `New message from ${name}`,
          html: `
            <h2>New contact form submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
          `,
          replyTo: email,
        })
      } catch (err) {
        // Don't fail the request if email sending fails
        app.log.error('Failed to send email:', err.message)
      }
    }

    return { ok: true }
  })
}
