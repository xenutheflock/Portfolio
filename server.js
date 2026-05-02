import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { Resend } from 'resend';

const app = express();
const port = process.env.PORT || 3000;

const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body ?? {};

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    if (!process.env.RESEND_API_KEY || !process.env.CONTACT_TO_EMAIL || !process.env.CONTACT_FROM_EMAIL) {
      return res.status(500).json({ error: 'Server email configuration is missing.' });
    }

    const subject = `Portfolio Contact: ${name}`;

    await resend.emails.send({
      from: process.env.CONTACT_FROM_EMAIL,
      to: process.env.CONTACT_TO_EMAIL,
      reply_to: email,
      subject,
      html: `
        <div style="font-family: Inter, Arial, sans-serif; line-height:1.6; color:#111;">
          <h2>New Portfolio Contact Message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${String(message).replace(/\n/g, '<br>')}</p>
        </div>
      `,
      text: `New Portfolio Contact Message\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Contact API error:', error);
    return res.status(500).json({ error: 'Failed to send message.' });
  }
});

app.listen(port, () => {
  console.log(`Contact API running on http://localhost:${port}`);
});

