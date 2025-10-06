"use client";

import React from "react";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { toast } from "sonner";
import { useTRPC, useTRPCClient } from "@/lib/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader } from "lucide-react";

export default function Page() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(trpc.contactUsList.queryOptions());

  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    description: "",
  });

  const createContactUs = useMutation(trpc.contactUsCreate.mutationOptions());
  const handleSubmit = async () => {
    createContactUs.mutate(formData, {
      onSuccess: () => {
        toast.success("Added successfully");
        queryClient.invalidateQueries({
          queryKey: trpc.contactUsList.queryKey(),
        });
      },
    });
  };

  const handleOnChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: "name" | "email" | "description"
  ) => {
    const value = e.target.value ?? "";
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-4">
      {isLoading && <Loader className="animate-spin size-6" />}
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <Input
        value={formData.name}
        onChange={(e) => handleOnChange(e, "name")}
        placeholder="Enter name"
      />
      <Input
        value={formData.email}
        onChange={(e) => handleOnChange(e, "email")}
        placeholder="Enter email to contact you"
      />
      <Input
        value={formData.description}
        onChange={(e) => handleOnChange(e, "description")}
        placeholder="Share your thoughts"
      />
      <Button onClick={handleSubmit}>Submit</Button>
    </div>
  );
}
