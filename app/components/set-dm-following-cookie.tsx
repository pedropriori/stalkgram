"use client";

import { useEffect } from "react";

interface StoredFollowingUser {
  id: string;
  username: string;
  profilePicUrl: string;
}

interface SetDmFollowingCookieProps {
  username: string;
  followingUsers: StoredFollowingUser[];
}

export default function SetDmFollowingCookie({
  username,
  followingUsers,
}: SetDmFollowingCookieProps) {
  useEffect(() => {
    if (!username || followingUsers.length === 0) {
      return;
    }

    const cookieName = `sg_dm_following_${username}`;
    const encodedValue = encodeURIComponent(JSON.stringify(followingUsers));

    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    document.cookie = `${cookieName}=${encodedValue}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
  }, [username, followingUsers]);

  return null;
}









