import { z } from "zod";

const DeepgramUserSchema = z.object({
  pk: z.string().optional(),
  id: z.string().optional(),
  username: z.string(),
  full_name: z.string().optional(),
  biography: z.string().optional(),
  profile_pic_url: z.string().optional(),
  hd_profile_pic_url_info: z
    .object({
      url: z.string().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
    })
    .optional(),
  follower_count: z.number().optional(),
  following_count: z.number().optional(),
  media_count: z.number().optional(),
  is_private: z.boolean().optional(),
});

export const DeepgramProfileResponseSchema = z.union([
  z.object({
    user: DeepgramUserSchema.nullable(),
    status: z.literal("ok").optional(),
  }),
  z.object({
    error: z.string(),
    user: z.null(),
  }),
]);

export const DeepgramFollowingUserSchema = z.object({
  pk: z.string().optional(),
  id: z.string().optional(),
  username: z.string(),
  full_name: z.string().optional(),
  profile_pic_url: z.string().optional(),
  is_private: z.boolean().optional(),
  is_verified: z.boolean().optional(),
});

export const DeepgramFollowingResponseSchema = z.object({
  response: z.object({
    users: z.array(DeepgramFollowingUserSchema),
    status: z.literal("ok").optional(),
    big_list: z.boolean().optional(),
    page_size: z.number().optional(),
    next_max_id: z.string().optional(),
    has_more: z.boolean().optional(),
  }),
  next_page_id: z.string().optional(),
});

export type DeepgramProfileResponse = z.infer<typeof DeepgramProfileResponseSchema>;
export type DeepgramFollowingResponse = z.infer<typeof DeepgramFollowingResponseSchema>;
export type DeepgramUser = z.infer<typeof DeepgramUserSchema>;
export type DeepgramFollowingUser = z.infer<typeof DeepgramFollowingUserSchema>;







