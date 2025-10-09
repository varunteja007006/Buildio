import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { schema } from "../schema";
import { z } from "zod/v4";

const { contactUs } = schema;

export const contactUsSelectZSchema = createSelectSchema(contactUs);

export const contactUsInsertZSchema = createInsertSchema(contactUs, {
  name: (schema) =>
    schema
      .min(3, {
        message: "Minimum 3 characters",
      })
      .max(255, {
        message: "Max 255 characters",
      }),
  email: (schema) =>
    schema
      .min(3, {
        message: "Minimum 3 characters",
      })
      .max(255, {
        message: "Max 255 characters",
      }),
  description: (schema) =>
    schema
      .min(5, {
        message: "Minimum 5 characters",
      })
      .max(500, {
        message: "Max 500 characters",
      }),
});

export const contactUsUpdateZSchema = createUpdateSchema(contactUs);

export type ContactUsInsertFormValues = z.infer<typeof contactUsInsertZSchema>;
