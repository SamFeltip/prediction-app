import { Resend } from "resend";

export async function sendInviteEmail(emailRequestDetails: {
  user: { id: string; name: string | null; email: string };
  room: { id: number; title: string };
  url: string;
}) {
  const resend = new Resend(process.env.RESENT_API_KEY!);

  const html = `
  <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #ddd; border-radius: 8px; background-color: #fafafa;">
    <h1 style="color: #2c3e50; text-align: center;">You're Invited!</h1>
    <p style="font-size: 16px; line-height: 1.5;">
      Hello ${emailRequestDetails.user.name || "there"},
    </p>
    <p style="font-size: 16px; line-height: 1.5;">
      You have been invited to join the room: <strong>${
        emailRequestDetails.room.title
      }</strong>.
    </p>
    <p style="font-size: 16px; line-height: 1.5;">
      Click the button below to enter the room:
    </p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${
        emailRequestDetails.url
      }" style="background-color: #007bff; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">
        Join Room
      </a>
    </div>
    <p style="font-size: 14px; color: #666;">
      If the button doesn't work, you can also join the room by copying and pasting this link into your browser:
    </p>
    <p style="word-break: break-all; font-size: 14px;">
      <a href="${emailRequestDetails.url}" style="color: #007bff;">${
    emailRequestDetails.url
  }</a>
    </p>
    <p style="font-size: 14px; color: #999; margin-top: 40px; text-align: center;">
      This link will expire shortly for security reasons.
    </p>
  </div>
`;

  resend.emails.send({
    from: "predict@samfelton.com",
    to: emailRequestDetails.user.email,
    subject: "Room invitation",
    html: html,
  });
}

export async function sendSingupEmail(emailRequestDetails: {
  id: string;
  name: string;
  email: string;
  url: string;
  token: string;
}): Promise<void> {
  const signupUrl = new URL(
    `/api/auth/verify-email`,
    process.env.NEXT_PUBLIC_APP_URL
  );

  signupUrl.searchParams.append("token", emailRequestDetails.token);
  signupUrl.searchParams.append("callbackURL", "/");

  console.log("email sending: ", emailRequestDetails);

  const resend = new Resend(process.env.RESENT_API_KEY!);

  const html = `
  <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #ddd; border-radius: 8px; background-color: #fafafa;">
    <h1 style="color: #2c3e50; text-align: center;">Verify Your Email</h1>
    <p style="font-size: 16px; line-height: 1.5;">
      Hello, ${emailRequestDetails.name},
    </p>
    <p style="font-size: 16px; line-height: 1.5;">
      Please click the button below to verify your email address:
    </p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${signupUrl}" style="background-color: #007bff; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">
        Verify Email
      </a>
    </div>
    <p style="font-size: 14px; color: #666;">
      If the button doesn't work, you can also verify your email by copying and pasting this link into your browser:
    </p>
    <p style="word-break: break-all; font-size: 14px;">
      <a href="${signupUrl}" style="color: #007bff;">${signupUrl}</a>
    </p>
    <p style="font-size: 14px; color: #999; margin-top: 40px; text-align: center;">
      This link will expire shortly for your security.
    </p>
  </div>
`;

  resend.emails.send({
    from: "predict@samfelton.com",
    to: emailRequestDetails.email,
    subject: "email authorization",
    html: html,
  });
}
