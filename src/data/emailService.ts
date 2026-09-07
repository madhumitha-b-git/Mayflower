import { UserReservationRecord } from '../types';

export const dispatchAutomatedEmail = async (to: string, subject: string, html: string, emailType: string) => {
  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, html, emailType })
    });
    const data = await res.json();
    console.log(`[Email Dispatch ${emailType}]:`, data);
    return data;
  } catch (err) {
    console.error(`[Email Dispatch Error ${emailType}]:`, err);
    return { success: false, error: err };
  }
};

// 1. Welcome & Registration Confirmation Email
export const sendWelcomeConfirmationEmail = async (email: string, name: string, memberId: string) => {
  const subject = `🌸 Welcome to Mayflower Sanctuary — Account Registered (+200 PTS Credited)`;
  const html = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #FAF7F2; border: 1px solid #E8E4DB; border-radius: 20px; overflow: hidden;">
      <div style="background: #2D4030; color: #FAF7F2; padding: 36px; text-align: center;">
        <h1 style="font-size: 26px; margin: 0; font-weight: 400; letter-spacing: 3px;">THE MAYFLOWER</h1>
        <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 3px; color: #D1CDBC; margin-top: 8px;">CAFE &amp; DINING • CHENNAI</p>
      </div>
      <div style="padding: 36px; background: #ffffff;">
        <h2 style="font-size: 22px; color: #1A1A1A; margin-top: 0; font-weight: normal;">Welcome to the Sanctuary, ${name}!</h2>
        <p style="font-family: Arial, sans-serif; font-size: 14px; color: #4A4A4A; line-height: 1.6;">
          Your official Mayflower Rewards account has been successfully registered and verified.
        </p>
        <div style="background: #FAF7F2; border: 1px solid #E8E4DB; border-radius: 16px; padding: 24px; margin: 24px 0; text-align: center;">
          <span style="font-family: Arial, sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #5A5A40; font-weight: bold;">Member ID</span>
          <div style="font-family: monospace; font-size: 22px; font-weight: bold; color: #2D4030; margin-top: 6px;">${memberId}</div>
          <div style="margin-top: 14px; font-family: Arial, sans-serif; font-size: 14px; color: #00754A; font-weight: bold;">
            ⭐ +200 Welcome Bonus Reward Points Credited
          </div>
        </div>
        <p style="font-family: Arial, sans-serif; font-size: 13px; color: #666666; line-height: 1.6;">
          Use your member profile to reserve tables, earn reward points on gourmet dining, and claim exclusive Mayflower Moment Gift Cards.
        </p>
        <div style="font-family: Arial, sans-serif; font-size: 11px; color: #999999; text-align: center; margin-top: 32px; border-top: 1px solid #E8E4DB; padding-top: 20px;">
          Poes Garden • Palavakkam • Egmore • Anna Nagar • Chennai
        </div>
      </div>
    </div>
  `;
  return dispatchAutomatedEmail(email, subject, html, 'WELCOME_EMAIL');
};

// 2. Seat Table Reservation Confirmation Email
export const sendReservationConfirmationEmail = async (
  email: string,
  name: string,
  resData: UserReservationRecord
) => {
  const subject = `🍽️ Reservation Confirmed: Mayflower ${resData.outlet} (${resData.bookingCode})`;
  const html = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #FAF7F2; border: 1px solid #E8E4DB; border-radius: 20px; overflow: hidden;">
      <div style="background: #1E3932; color: #FAF7F2; padding: 36px; text-align: center;">
        <h1 style="font-size: 26px; margin: 0; font-weight: 400; letter-spacing: 3px;">MAYFLOWER</h1>
        <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 3px; color: #D1CDBC; margin-top: 8px;">TABLE RESERVATION CONFIRMED</p>
      </div>
      <div style="padding: 36px; background: #ffffff;">
        <h2 style="font-size: 20px; color: #1A1A1A; margin-top: 0; font-weight: normal;">Your Table is Prepared, ${name}!</h2>
        <p style="font-family: Arial, sans-serif; font-size: 14px; color: #4A4A4A; line-height: 1.6;">
          We are delighted to confirm your upcoming table reservation at our <strong>${resData.outlet}</strong> sanctuary.
        </p>
        
        <div style="background: #FAF7F2; border: 1px solid #E8E4DB; border-radius: 16px; padding: 24px; margin: 24px 0;">
          <table style="width: 100%; font-family: Arial, sans-serif; font-size: 13px; color: #333; border-collapse: collapse;">
            <tr style="border-b: 1px solid #E8E4DB;">
              <td style="padding: 10px 0; color: #5A5A40; font-weight: bold;">Booking Code:</td>
              <td style="padding: 10px 0; text-align: right; font-family: monospace; font-size: 16px; font-weight: bold; color: #1E3932;">${resData.bookingCode}</td>
            </tr>
            <tr style="border-b: 1px solid #E8E4DB;">
              <td style="padding: 10px 0; color: #5A5A40; font-weight: bold;">Outlet Location:</td>
              <td style="padding: 10px 0; text-align: right; font-weight: bold;">${resData.outlet}</td>
            </tr>
            <tr style="border-b: 1px solid #E8E4DB;">
              <td style="padding: 10px 0; color: #5A5A40; font-weight: bold;">Date &amp; Time:</td>
              <td style="padding: 10px 0; text-align: right;">${resData.date} • ${resData.timeSlot}</td>
            </tr>
            <tr style="border-b: 1px solid #E8E4DB;">
              <td style="padding: 10px 0; color: #5A5A40; font-weight: bold;">Guests / Seats:</td>
              <td style="padding: 10px 0; text-align: right;">${resData.guests} Guests (${resData.seatingArea})</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #5A5A40; font-weight: bold;">Bonus Points:</td>
              <td style="padding: 10px 0; text-align: right; color: #00754A; font-weight: bold;">+150 PTS Credited</td>
            </tr>
          </table>
        </div>

        <p style="font-family: Arial, sans-serif; font-size: 13px; color: #666666; line-height: 1.6; text-align: center;">
          We hold your table for 15 minutes past your reserved time. We look forward to welcoming you!
        </p>
        <div style="font-family: Arial, sans-serif; font-size: 11px; color: #999999; text-align: center; margin-top: 32px; border-top: 1px solid #E8E4DB; padding-top: 20px;">
          For changes or cancellations, please contact +91 44 4892 7700 or reply to this email.
        </div>
      </div>
    </div>
  `;
  return dispatchAutomatedEmail(email, subject, html, 'RESERVATION_EMAIL');
};

// 3. Happiness Gift Card Purchase & Claim Confirmation Email
export const sendGiftCardClaimEmail = async (
  email: string,
  name: string,
  cardTitle: string,
  code: string,
  pointsSpent: number
) => {
  const subject = `🎁 Mayflower Happiness Card Claimed: ${cardTitle} (${code})`;
  const html = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #FAF7F2; border: 1px solid #E8E4DB; border-radius: 20px; overflow: hidden;">
      <div style="background: #E25C38; color: #ffffff; padding: 36px; text-align: center;">
        <h1 style="font-size: 26px; margin: 0; font-weight: 400; letter-spacing: 3px;">HAPPINESS GIFT CARD</h1>
        <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 3px; color: #FAF7F2; margin-top: 8px;">MAYFLOWER MOMENTS</p>
      </div>
      <div style="padding: 36px; background: #ffffff;">
        <h2 style="font-size: 20px; color: #1A1A1A; margin-top: 0; font-weight: normal;">Congratulations, ${name}!</h2>
        <p style="font-family: Arial, sans-serif; font-size: 14px; color: #4A4A4A; line-height: 1.6;">
          You have successfully claimed your Mayflower Moment Happiness Gift Card for <strong>${cardTitle}</strong> using your reward points (-${pointsSpent} PTS).
        </p>
        
        <div style="background: #FAF7F2; border: 2px dashed #E25C38; border-radius: 16px; padding: 24px; margin: 24px 0; text-align: center;">
          <span style="font-family: Arial, sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #E25C38; font-weight: bold;">Gift Voucher Code</span>
          <div style="font-family: monospace; font-size: 26px; font-weight: bold; color: #1A1A1A; margin-top: 6px; letter-spacing: 4px;">${code}</div>
          <div style="margin-top: 12px; font-family: Arial, sans-serif; font-size: 13px; color: #5A5A40;">
            Valid at all Mayflower Outlets in Chennai
          </div>
        </div>

        <p style="font-family: Arial, sans-serif; font-size: 13px; color: #666666; line-height: 1.6; text-align: center;">
          Present this voucher code to your server or at the billing desk during your visit to redeem.
        </p>
      </div>
    </div>
  `;
  return dispatchAutomatedEmail(email, subject, html, 'GIFTCARD_EMAIL');
};
