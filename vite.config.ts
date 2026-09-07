import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'gmail-otp-middleware',
        configureServer(server) {
          // Route 1: General Automated Email Middleware (/api/send-email)
          server.middlewares.use('/api/send-email', async (req, res, next) => {
            if (req.method === 'POST') {
              let body = '';
              req.on('data', (chunk) => { body += chunk; });
              req.on('end', async () => {
                try {
                  const { to, subject, html, emailType } = JSON.parse(body || '{}');
                  const nodemailer = await import('nodemailer');

                  const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                      user: process.env.GMAIL_USER || 'madhumithamalu6@gmail.com',
                      pass: process.env.GMAIL_APP_PASSWORD || 'joveqnifgljlrsxp'
                    }
                  });

                  const info = await transporter.sendMail({
                    from: '"The Mayflower Sanctuary" <madhumithamalu6@gmail.com>',
                    to,
                    subject,
                    html
                  });

                  console.log(`[Gmail Automated Email - ${emailType || 'GENERAL'}] Sent to ${to}:`, info.response);
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: true, response: info.response }));
                } catch (err: any) {
                  console.error('[Gmail Email Error]:', err);
                  res.statusCode = 500;
                  res.end(JSON.stringify({ error: err.message }));
                }
              });
            } else {
              next();
            }
          });

          // Route 2: OTP Verification Email Middleware (/api/send-otp)
          server.middlewares.use('/api/send-otp', async (req, res, next) => {
            if (req.method === 'POST') {
              let body = '';
              req.on('data', (chunk) => { body += chunk; });
              req.on('end', async () => {
                try {
                  const { email, otp, name } = JSON.parse(body || '{}');
                  const nodemailer = await import('nodemailer');

                  const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                      user: process.env.GMAIL_USER || 'madhumithamalu6@gmail.com',
                      pass: process.env.GMAIL_APP_PASSWORD || 'joveqnifgljlrsxp'
                    }
                  });

                  const emailHtml = `
                    <div style="font-family: Georgia, serif; max-width: 550px; margin: 0 auto; background: #ffffff; padding: 32px; border-radius: 16px; border: 1px solid #E8E4DB; box-shadow: 0 4px 15px rgba(0,0,0,0.04);">
                      <div style="text-align: center; margin-bottom: 24px;">
                        <div style="display: inline-block; width: 48px; height: 48px; background: #FAF7F2; border: 1px solid #2D4030; border-radius: 14px; line-height: 48px; font-size: 24px; font-weight: bold; color: #2D4030;">M</div>
                        <h2 style="font-size: 20px; letter-spacing: 3px; text-transform: uppercase; margin-top: 12px; color: #1A1A1A;">MAYFLOWER CAFE</h2>
                        <div style="font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: #5A5A40; margin-top: 2px;">Cafe &amp; Dining • Chennai</div>
                      </div>
                      <h3 style="font-size: 18px; color: #1A1A1A; text-align: center; font-weight: normal; margin-top: 20px;">Email Verification Code</h3>
                      <p style="font-family: Arial, sans-serif; font-size: 14px; color: #333; line-height: 1.6;">Hello <strong>${name || 'Valued Guest'}</strong>,</p>
                      <p style="font-family: Arial, sans-serif; font-size: 14px; color: #555; line-height: 1.6;">Your 6-digit Mayflower Sanctuary account verification code is:</p>
                      <div style="background: #1E3932; color: #FAF7F2; font-family: 'Courier New', monospace; font-size: 34px; font-weight: bold; letter-spacing: 12px; text-align: center; padding: 18px; border-radius: 12px; margin: 24px 0; border: 1px solid #00754A;">${otp}</div>
                      <p style="font-family: Arial, sans-serif; font-size: 12px; color: #777; text-align: center;">This code is valid for 10 minutes. If you did not request this code, please ignore this message.</p>
                      <div style="font-family: Arial, sans-serif; font-size: 11px; color: #999; text-align: center; margin-top: 24px; border-top: 1px solid #E8E4DB; padding-top: 16px;">
                        © ${new Date().getFullYear()} Mayflower Restaurants Pvt Ltd • Poes Garden • Palavakkam • Egmore • Anna Nagar
                      </div>
                    </div>
                  `;

                  const info = await transporter.sendMail({
                    from: '"The Mayflower Sanctuary" <madhumithamalu6@gmail.com>',
                    to: email,
                    subject: `${otp} is your Mayflower Verification Code`,
                    html: emailHtml
                  });

                  console.log(`[Gmail SMTP Success] OTP ${otp} sent to ${email}:`, info.response);
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: true, response: info.response }));
                } catch (err: any) {
                  console.error('[Gmail SMTP Error]:', err);
                  res.statusCode = 500;
                  res.end(JSON.stringify({ error: err.message }));
                }
              });
            } else {
              next();
            }
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
