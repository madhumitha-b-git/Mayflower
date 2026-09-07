import nodemailer from 'nodemailer';

interface VercelRequest {
  method?: string;
  body?: any;
  headers: Record<string, string | string[] | undefined>;
}

interface VercelResponse {
  setHeader(name: string, value: string): void;
  status(code: number): VercelResponse;
  json(data: any): VercelResponse;
  end(): void;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, subject, html, emailType } = req.body || {};

  if (!to || !subject || !html) {
    return res.status(400).json({ error: 'Recipient email, subject, and html content are required' });
  }

  const GMAIL_USER = process.env.GMAIL_USER || 'madhumithamalu6@gmail.com';
  const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || 'joveqnifgljlrsxp';
  const FROM_ADDRESS = process.env.FROM_EMAIL || 'reservations@mayflower-sanctuary.com';

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD
      }
    });

    const info = await transporter.sendMail({
      from: `"The Mayflower Sanctuary Concierge" <${FROM_ADDRESS}>`,
      to,
      subject,
      html
    });

    console.log(`[Gmail Automated Email - ${emailType || 'GENERAL'}] Sent to ${to}:`, info.response);
    return res.status(200).json({ success: true, provider: 'gmail_smtp', response: info.response });
  } catch (err: any) {
    console.error(`[Gmail Automated Email Failed - ${emailType}]:`, err);
    return res.status(500).json({ error: err.message });
  }
}
