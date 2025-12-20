import { z } from "zod";

export const OfertaPremiumProfileSchema = z.object({
  id: z.string(),
  username: z.string(),
  full_name: z.string().optional(),
  biography: z.string().optional(),
  profile_pic_url: z.string().optional(),
  follower_count: z.number().optional(),
  following_count: z.number().optional(),
  post_count: z.number().optional(),
  media_count: z.number().optional(),
  is_private: z.boolean().optional(),
});

export const OfertaPremiumFollowingUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  full_name: z.string().optional(),
  profile_pic_url: z.string().optional(),
  is_private: z.boolean().optional(),
  is_verified: z.boolean().optional(),
});

export const OfertaPremiumFollowingResponseSchema = z.object({
  users: z.array(OfertaPremiumFollowingUserSchema).optional(),
  following: z.array(OfertaPremiumFollowingUserSchema).optional(),
});

export type OfertaPremiumProfile = z.infer<typeof OfertaPremiumProfileSchema>;
export type OfertaPremiumFollowingUser = z.infer<
  typeof OfertaPremiumFollowingUserSchema
>;
export type OfertaPremiumFollowingResponse = z.infer<
  typeof OfertaPremiumFollowingResponseSchema
>;

