import { getSettings } from "@/lib/services/settings";

type InvitationEmail = {
  to: string;
  name: string;
  roleLabel: string;
  inviteLink: string;
  expiresInHours: number;
};

/**
 * Sends the invitation with Resend when RESEND_API_KEY is configured.
 * Without it, the admin UI shows the invite link to share manually so the
 * invitation flow still works end to end.
 */
export async function sendInvitationEmail(input: InvitationEmail): Promise<{
  sent: boolean;
  reason?: string;
}> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { sent: false, reason: "Email delivery is not configured (RESEND_API_KEY missing)." };
  }

  const settings = await getSettings();
  const from = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${settings.businessName} <${from}>`,
        to: [input.to],
        subject: `You have been invited to ${settings.businessName} admin`,
        html: `
          <div style="font-family:Arial,sans-serif;color:#121916;line-height:1.6">
            <h2 style="font-family:Georgia,serif;font-weight:400">${settings.businessName}</h2>
            <p>Hello ${input.name},</p>
            <p>You have been invited as <strong>${input.roleLabel}</strong> to the ${settings.businessName} management dashboard.</p>
            <p><a href="${input.inviteLink}" style="background:#121916;color:#faf6ee;padding:12px 22px;text-decoration:none;display:inline-block;border-radius:6px">Accept invitation</a></p>
            <p style="font-size:13px;color:#6f675d">This link expires in ${input.expiresInHours} hours. If you were not expecting this invitation, you can ignore this email.</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error("[mailer] Resend error:", response.status, body);
      return { sent: false, reason: "The email provider rejected the message. Share the link manually." };
    }
    return { sent: true };
  } catch (error) {
    console.error("[mailer] failed:", (error as Error).message);
    return { sent: false, reason: "The email could not be sent. Share the link manually." };
  }
}
