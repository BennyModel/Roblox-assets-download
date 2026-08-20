import { robloxFetch } from "./http";

interface UsernameLookupResponse {
  data: Array<{ requestedUsername: string; id: number; name: string; displayName: string }>;
}

export async function resolveUserId(input: string): Promise<number> {
  const trimmed = input.trim();
  if (/^\d+$/.test(trimmed)) return Number(trimmed);

  const response = await robloxFetch<UsernameLookupResponse>("https://users.roblox.com/v1/usernames/users", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      usernames: [trimmed],
      excludeBannedUsers: false,
    }),
  });

  const user = response.data?.[0];
  if (!user) throw new Error("User not found.");
  return user.id;
}
