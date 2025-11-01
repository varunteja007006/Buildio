"server-only";

import { Resend } from "resend";
import { EmailVerificationTemplate } from "@/lib/email/email-verification";
import { PasswordResetTemplate } from "./email-password-reset";

const resend = new Resend(process.env.RESEND_API_KEY);

const devEnv = process.env.NEXT_PUBLIC_ENV === "dev";

export const emailVerification = async ({
  to,
  subject,
  url,
}: {
  to: Array<string>;
  subject: string;
  url: string;
}) => {
  const { data, error } = await resend.emails.send({
    from: "Acme <onboarding@resend.dev>",
    to: devEnv ? ["delivered@resend.dev"] : to,
    subject: subject,
    react: EmailVerificationTemplate({ url }),
  });
};

export const emailResetPassword = async ({
  to,
  subject,
  url,
}: {
  to: Array<string>;
  subject: string;
  url: string;
}) => {
  await resend.emails.send({
    from: "Acme <onboarding@resend.dev>",
    to: devEnv ? ["delivered@resend.dev"] : to,
    subject: subject,
    react: PasswordResetTemplate({ url }),
  });
};
