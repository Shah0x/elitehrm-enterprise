import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

// Lazy initialize transporter to avoid startup crash if SMTP settings are missing
export async function getTransporter(): Promise<nodemailer.Transporter> {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    console.log('📬 Initializing production SMTP transporter...');
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for other ports
      auth: { user, pass },
    });
  } else {
    console.log('📬 SMTP configuration missing. Initializing local console-logger email fallback...');
    // A secure log-only transport that prints email details to the console instead of throwing errors
    transporter = nodemailer.createTransport({
      jsonTransport: true // prints output as JSON structure
    });
  }

  return transporter;
}

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) {
  try {
    const client = await getTransporter();
    const fromName = 'EliteHRM Alerts';
    const fromEmail = process.env.SMTP_FROM || 'alerts@elitehrm.com';

    const info = await client.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      text,
      html: html || text.replace(/\n/g, '<br>'),
    });

    console.log(`✉️ Email dispatched to ${to} | Subject: "${subject}"`);
    if (process.env.SMTP_HOST === undefined) {
      console.log('[LOG] Email content (dev log):', info.message);
    }
    return info;
  } catch (error) {
    console.error('[ERROR] Nodemailer dispatch error:', error);
    // Silent fail in dev, don't crash the server
    return null;
  }
}

/**
 * Onboarding confirmation email
 */
export async function sendOnboardingEmail(userEmail: string, userName: string, passwordText: string) {
  const subject = 'Welcome to EliteHRM - Account Provisioned';
  const text = `Hello ${userName},

Your professional profile has been securely provisioned on EliteHRM by Shahmeer Akram.

Access Details:
- Workspace Portal: EliteHRM Enterprise
- Your Username: ${userEmail}
- Auto-Generated Password: ${passwordText}

Please sign in immediately and update your credentials under settings.

Best Regards,
The EliteHRM Provisioning Team
Owner: Shahmeer`;

  const html = `
    <div style="font-family: sans-serif; padding: 24px; color: #1e293b; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; rounded: 12px;">
      <h2 style="color: #4f46e5; margin-bottom: 16px;">Welcome to EliteHRM Enterprise</h2>
      <p>Hello <strong>${userName}</strong>,</p>
      <p>Your professional profile has been securely provisioned on EliteHRM by <strong>Shahmeer Akram</strong>.</p>
      <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0 0 8px 0;"><strong>Access Credentials:</strong></p>
        <p style="margin: 0 0 4px 0;">📧 Email: <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${userEmail}</code></p>
        <p style="margin: 0;">🔑 Password: <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${passwordText}</code></p>
      </div>
      <p>Please sign in immediately and update your credentials under administrative settings.</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="font-size: 11px; color: #64748b;">This notification is automated. Owner: Shahmeer | Crafted by Shahmeer Akram</p>
    </div>
  `;

  return sendEmail({ to: userEmail, subject, text, html });
}

/**
 * Leave request approval/rejection alert
 */
export async function sendLeaveStatusEmail(userEmail: string, userName: string, leaveType: string, status: string, duration: string) {
  const subject = `Leave Request Actioned - ${status.toUpperCase()}`;
  const text = `Hello ${userName},

Your request for ${leaveType} leave for the duration of ${duration} has been updated to: ${status.toUpperCase()}.

Please log in to your dashboard to view complete comments.

Sincerely,
EliteHRM HR Operations`;

  const html = `
    <div style="font-family: sans-serif; padding: 24px; color: #1e293b; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; rounded: 12px;">
      <h3 style="color: ${status === 'approved' ? '#16a34a' : '#dc2626'};">Leave Request Status Updated</h3>
      <p>Hello <strong>${userName}</strong>,</p>
      <p>Your request for <strong>${leaveType}</strong> leave has been actioned.</p>
      <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0 0 6px 0;">🗓️ Duration: ${duration}</p>
        <p style="margin: 0;">Status: <strong style="color: ${status === 'approved' ? '#16a34a' : '#dc2626'}">${status.toUpperCase()}</strong></p>
      </div>
      <p>Please log in to your dashboard to view complete details.</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="font-size: 11px; color: #64748b;">EliteHRM Platform | Owner: Shahmeer</p>
    </div>
  `;

  return sendEmail({ to: userEmail, subject, text, html });
}
