import { z } from "zod";

export const HikerProfileSchema = z.object({
  pk: z.string(),
  username: z.string(),
  full_name: z.string().optional(),
  is_private: z.boolean().optional(),
  profile_pic_url: z.string().optional(),
  profile_pic_url_hd: z.string().optional(),
  is_verified: z.boolean().optional(),
  media_count: z.number().optional(),
  follower_count: z.number().optional(),
  following_count: z.number().optional(),
  biography: z.string().optional(),
  external_url: z.string().optional(),
  account_type: z.number().optional(),
  is_business: z.boolean().optional(),
  public_email: z.string().optional(),
  contact_phone_number: z.string().optional(),
  public_phone_country_code: z.string().optional(),
  public_phone_number: z.string().optional(),
  business_contact_method: z.string().optional(),
  business_category_name: z.string().optional(),
  category_name: z.string().optional(),
  category: z.string().optional(),
  address_street: z.string().optional(),
  city_id: z.string().optional(),
  city_name: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  zip: z.string().optional(),
  instagram_location_id: z.string().optional(),
  interop_messaging_user_fbid: z.string().optional(),
});

export const HikerFollowingUserSchema = z.object({
  pk: z.string(),
  id: z.string().optional(),
  username: z.string(),
  full_name: z.string().optional(),
  profile_pic_url: z.string().optional(),
  profile_pic_url_hd: z.string().optional(),
  is_private: z.boolean().optional(),
  is_verified: z.boolean().optional(),
});

export const HikerFollowingResponseSchema = z.array(HikerFollowingUserSchema);

export type HikerProfile = z.infer<typeof HikerProfileSchema>;
export type HikerFollowingUser = z.infer<typeof HikerFollowingUserSchema>;
export type HikerFollowingResponse = z.infer<typeof HikerFollowingResponseSchema>;



