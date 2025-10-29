"use client";

import React from "react";
import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@workspace/ui/components/form";

import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  image: z.url("Invalid URL").optional().or(z.literal("")),
});

export function SignUpForm() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [serverError, setServerError] = React.useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      image: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setServerError("");

    const { email, password, name, image } = values;

    await authClient.signUp.email(
      {
        email,
        password,
        name,
        image,
        callbackURL: "/",
      },
      {
        onRequest: () => setLoading(true),
        onSuccess: () => router.push("/"),
        onError: (ctx) => {
          setServerError(ctx.error.message);
          toast.error(ctx.error.message ?? "Something went wrong!!");
        },
      },
    );

    setLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="********" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile Image (optional)</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {serverError && (
          <p className="text-red-500 text-sm text-center">{serverError}</p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            "Sign Up"
          )}
        </Button>
      </form>
    </Form>
  );
}
