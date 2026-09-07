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

  const { email, otp, name } = req.body || {};

  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required' });
  }

  const userName = name || 'Valued Guest';
  const GMAIL_USER = process.env.GMAIL_USER || 'madhumithamalu6@gmail.com';
  const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || 'joveqnifgljlrsxp';

  const emailHtml = `
    <div style="font-family: Georgia, serif; max-width: 550px; margin: 0 auto; background: #ffffff; padding: 32px; border-radius: 16px; border: 1px solid #E8E4DB; box-shadow: 0 4px 15px rgba(0,0,0,0.04);">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; width: 48px; height: 48px; background: #FAF7F2; border: 1px solid #2D4030; border-radius: 14px; line-height: 48px; font-size: 24px; font-weight: bold; color: #2D4030;">M</div>
        <h2 style="font-size: 20px; letter-spacing: 3px; text-transform: uppercase; margin-top: 12px; color: #1A1A1A;">MAYFLOWER CAFE</h2>
        <div style="font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: #5A5A40; margin-top: 2px;">Cafe &amp; Dining • Chennai</div>
      </div>
      <h3 style="font-size: 18px; color: #1A1A1A; text-align: center; font-weight: normal; margin-top: 20px;">Email Verification Code</h3>
      <p style="font-family: Arial, sans-serif; font-size: 14px; color: #333; line-height: 1.6;">Hello <strong>${userName}</strong>,</p>
      <p style="font-family: Arial, sans-serif; font-size: 14px; color: #555; line-height: 1.6;">Your 6-digit Mayflower Sanctuary account verification code is:</p>
      <div style="background: #1E3932; color: #FAF7F2; font-family: 'Courier New', monospace; font-size: 34px; font-weight: bold; letter-spacing: 12px; text-align: center; padding: 18px; border-radius: 12px; margin: 24px 0; border: 1px solid #00754A;">${otp}</div>
      <p style="font-family: Arial, sans-serif; font-size: 12px; color: #777; text-align: center;">This code is valid for 10 minutes. If you did not request this code, please ignore this message.</p>
      <div style="font-family: Arial, sans-serif; font-size: 11px; color: #999; text-align: center; margin-top: 24px; border-top: 1px solid #E8E4DB; padding-top: 16px;">
        © ${new Date().getFullYear()} Mayflower Restaurants Pvt Ltd • Poes Garden • Palavakkam • Egmore • Anna Nagar
      </div>
    </div>
  `;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD
      }
    });

    const info = await transporter.sendMail({
      from: `"The Mayflower Sanctuary" <${GMAIL_USER}>`,
      to: email,
      subject: `${otp} is your Mayflower Verification Code`,
      html: emailHtml
    });

    console.log(`[Vercel Serverless Gmail SMTP Success] Sent OTP ${otp} to ${email}:`, info.response);
    return res.status(200).json({ success: true, provider: 'gmail_smtp', response: info.response });
  } catch (err: any) {
    console.error('Failed to send email via Gmail SMTP:', err);
    return res.status(500).json({ error: err.message });
  }
}
