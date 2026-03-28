import prisma from '../lib/prisma.js'
import sgMail from '@sendgrid/mail'

export default async function contactRoutes(app) {
  app.post('/', async (request, reply) => {
    const { name, email, message } = request.body

    if (!name || !email || !message) {
      return reply.status(400).send({ error: 'All fields are required' })
    }

    // Save to DB
    await prisma.contactMessage.create({
      data: { name, email, message },
    })

    // Send email via SendGrid
    if (process.env.SENDGRID_API_KEY) {
      try {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY)
        await sgMail.send({
          from: 'noreply@openmindplus.com',
          to: process.env.CONTACT_EMAIL || 'benbrr@gmail.com',
          replyTo: email,
          subject: `New message from ${name} — OpenMind+`,
          html: `
            <h2>New contact form submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
          `,
        })
      } catch (err) {
        app.log.error('SendGrid error: ' + (err.response?.body?.errors?.[0]?.message || err.message))
      }
    }

    return { ok: true }
  })
}
