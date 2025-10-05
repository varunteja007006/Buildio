import * as z from "zod";

export const contactUsSchema = z.object({
  name: z
    .string()
    .min(3, {
      message: "Name is too small",
    })
    .max(255, {
      message: "Name is too long",
    }),
  description: z.string().optional(),
  email: z.string().email(),
});

