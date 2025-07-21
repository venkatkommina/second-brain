import { z } from "zod";

export const userValidation = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, { message: "Password should have minimum length of 8" })
    .max(20, "Password is too long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/,
      {
        message:
          "Should Contain at least one uppercase letter, one lowecase letter, one number, one specail char. and have a minimum length of 8, maximum length of 20 characters.",
      }
    ),
});

export const contentValidation = z.object({
  link: z.string(),
  type: z.string(),
  title: z.string(),
  notes: z.string().optional(), // Optional notes field for markdown content
  isShared: z.boolean().optional(), // Optional selective sharing field
  tags: z.string().array(),
});

export const tagValidation = z.object({
  title: z.string(),
});

export type TagValidation = z.infer<typeof tagValidation>;
export type UserValidation = z.infer<typeof userValidation>;
export type ContentValidation = z.infer<typeof contentValidation>;
