import * as z from "zod/v3";

export const example = z.object({
  text: z
    .string()
    .min(3, {
      message: "Name is too small",
    })
    .max(255, {
      message: "Name is too long",
    }),
});
