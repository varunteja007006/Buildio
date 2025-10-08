import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { schema } from "../schema";
import { z } from "zod/v4";

export const contactUsSelectZSchema = createSelectSchema(schema.contactUs);

export const contactUsInsertZSchema = createInsertSchema(schema.contactUs, {
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

export const contactUsUpdateZSchema = createUpdateSchema(schema.contactUs);

export type ContactUsInsertFormValues = z.infer<typeof contactUsInsertZSchema>;
