"use client";

import React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Textarea } from "@workspace/ui/components/textarea";
import { Send } from "lucide-react";

import { toast } from "sonner";

import { useTRPC } from "@/lib/trpc/client";
import { useMutation } from "@tanstack/react-query";
import {
  ContactUsInsertFormValues,
  contactUsInsertZSchema,
} from "@/lib/drizzle/db/zod/contact-us.zod";

const formSchema = contactUsInsertZSchema;

function ContactUsForm() {
  const trpc = useTRPC();

  const form = useForm<ContactUsInsertFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      description: "",
    },
  });

  const createContactUs = useMutation(
    trpc.contactUs.contactUsCreate.mutationOptions()
  );

  async function onSubmit(values: ContactUsInsertFormValues) {
    createContactUs.mutate(values, {
      onSuccess: () => {
        toast.success("Added successfully");
        form.reset({
          name: "",
          email: "",
          description: "",
        });
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
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
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Your message..."
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">
          <Send className="size-4" />
          Send
        </Button>
      </form>
    </Form>
  );
}

export { ContactUsForm };
