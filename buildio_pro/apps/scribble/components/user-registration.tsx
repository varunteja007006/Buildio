"use client";

import React, { useState } from "react";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
// import {
// 	Form,
// 	FormControl,
// 	FormDescription,
// 	FormField,
// 	FormItem,
// 	FormLabel,
// 	FormMessage,
// } from "@workspace/ui/components/form";

import { SendHorizontal } from "lucide-react";

import { toast } from "sonner";

// import { z } from "zod";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { createUserSchema } from "@/lib/validators";
import { useMutation } from "convex/react";
import { api } from "@workspace/games-convex-backend/convex/_generated/api";
import { useUserStore } from "@/lib/store/user.store";

// type CreateUserSchema = z.infer<typeof createUserSchema>;

export function UserRegistration({
  onSuccess,
}: Readonly<{
  onSuccess?: () => void;
}>) {
  const { handleSetUserToken } = useUserStore();
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createUserMutation = useMutation(api.user.createUser);

  // const form = useForm<CreateUserSchema>({
  // 	resolver: zodResolver(createUserSchema),
  // 	defaultValues: {
  // 		name: "",
  // 	},
  // });

  // const onSubmit = async (data: CreateUserSchema) => {
  // 	try {
  // 		const res = await createUserMutation({
  // 			name: data.name,
  // 		});
  // 		if (res.token) {
  // 			handleSetUserToken?.(res.token);
  // 		}
  // 		toast.success("User registered successfully!");
  // 		form.reset();
  // 		onSuccess?.();
  // 	} catch (error) {
  // 		toast.error("Failed to register user. Please try again.");
  // 		console.error(error);
  // 	}
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await createUserMutation({
        name: name,
      });
      if (res.token) {
        handleSetUserToken?.(res.token);
      }
      toast.success("User registered successfully!");
      setName("");
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to register user. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-sm lg:w-md space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-primary">
          Username
        </label>
        <div className="flex gap-4 items-center">
          <Input
            placeholder="Eg: John Doe"
            className="flex-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSubmitting}
          />
          <Button
            type="submit"
            size={"icon"}
            disabled={isSubmitting || !name.trim()}
            className="cursor-pointer"
          >
            <SendHorizontal />
          </Button>
        </div>
        <p className="text-[0.8rem] text-muted-foreground">
          This is your public display name.
        </p>
      </div>
    </form>
    // <Form {...form}>
    // 	<form onSubmit={form.handleSubmit(onSubmit)} className="w-sm lg:w-md">
    // 		<FormField
    // 			control={form.control}
    // 			name="name"
    // 			render={({ field }) => (
    // 				<FormItem>
    // 					<FormLabel className="text-primary">Username</FormLabel>
    // 					<FormControl>
    // 						<div className="flex gap-4 items-center">
    // 							<Input
    // 								placeholder="Eg: John Doe"
    // 								className="flex-1"
    // 								{...field}
    // 							/>
    // 							<Button
    // 								type="submit"
    // 								size={"icon"}
    // 								disabled={form.formState.isSubmitting}
    // 								className="cursor-pointer"
    // 							>
    // 								<SendHorizontal />
    // 							</Button>
    // 						</div>
    // 					</FormControl>
    // 					<FormDescription>
    // 						This is your public display name.
    // 					</FormDescription>
    // 					<FormMessage />
    // 				</FormItem>
    // 			)}
    // 		/>
    // 	</form>
    // </Form>
  );
}
