import * as React from "react";

interface EmailTemplateProps {
  url: string;
}

export function PasswordResetTemplate({ url }: Readonly<EmailTemplateProps>) {
  return (
    <div>
      <h1>Hi User, Please reset your password by clicking this link - {url}</h1>
      <a target="_blank" href={url}>
        Verify
      </a>
    </div>
  );
}
