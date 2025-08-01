// /pages/api/check-username.ts
import type { NextApiRequest, NextApiResponse } from "next";
import userService from "@/lib/services/user-service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { username } = req.query;
  if (!username || typeof username !== "string") {
    return res.status(400).json({ error: "Username is required" });
  }
  try {
    const result = await userService.checkUsernameAvailability(username);
    res.status(200).json({ exists: !result.available });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
}
