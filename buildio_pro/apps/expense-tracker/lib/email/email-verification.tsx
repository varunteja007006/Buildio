import * as React from "react";

interface EmailTemplateProps {
  url: string;
}

export function EmailVerificationTemplate({
  url,
}: Readonly<EmailTemplateProps>) {
  return (
    <div>
      <h1>
        Welcome User, Please verify your email, click this link to verify -{" "}
        {url}
      </h1>
      <a target="_blank" href={url}>
        Verify
      </a>
    </div>
  );
}
