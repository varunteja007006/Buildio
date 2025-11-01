"use client";

import { Button } from "@workspace/ui/components/button";

export const SendEmailBtn = () => {
  const sendEmail = async () => {
    fetch("/api/send", {
      method: "POST",
      body: "",
    })
      .then((res) => console.log(res))
      .catch((error) => console.error(error));
  };

  return <Button onClick={sendEmail}>Send Email</Button>;
};
