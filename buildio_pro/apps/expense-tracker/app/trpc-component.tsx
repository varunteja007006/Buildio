"use client";

import React from "react";

import { useTRPC } from "@/lib/trpc-client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { toast } from "sonner";

export default function TrpcComponent() {
  const [message, setMessage] = React.useState("");
  const [messageUser, setMessageUser] = React.useState("");

  const trpc = useTRPC();

  const hello = useQuery(trpc.hello.queryOptions());
  const helloUser = useQuery(trpc.helloUser.queryOptions());

  const createHello = useMutation(
    trpc.createHello.mutationOptions({
      onSuccess: (res) => toast.success(res.message),
      onError: (err) => toast.success(err.message),
    })
  );

  const createHelloUser = useMutation(
    trpc.createHelloUser.mutationOptions({
      onSuccess: (res) => toast.success(res.message),
      onError: (err) => toast.success(err.message),
    })
  );

  return (
    <div className="space-y-4">
      <div className="space-y-2 bg-card shadow border p-4 rounded-lg">
        <h5 className="text-base font-semibold">Un-Authenticated TRPC API Testing</h5>
        <div>{hello.data?.message}</div>
        <Input
          name="message"
          value={message}
          onChange={(e) => setMessage(e.target.value ?? "")}
          placeholder="Type a simple message"
        />
        <Button
          onClick={() => {
            createHello.mutate({
              message,
            });
          }}
        >
          Submit
        </Button>
      </div>
      <div className="space-y-2 bg-card shadow border p-4 rounded-lg">
        <h5 className="text-base font-semibold">Authenticated TRPC API Testing</h5>
        <div>{helloUser.data?.message}</div>
        <Input
          name="messageUser"
          value={messageUser}
          onChange={(e) => setMessageUser(e.target.value ?? "")}
          placeholder="Type a simple message"
        />
        <Button
          onClick={() => {
            createHelloUser.mutate({
              message: messageUser,
            });
          }}
        >
          Submit
        </Button>
      </div>
    </div>
  );
}
