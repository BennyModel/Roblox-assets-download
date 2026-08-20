import { robloxFetch } from "./http";

interface UsernameLookupResponse {
  data: Array<{ requestedUsername: string; id: number; name: string; displayName: string }>;
}

export interface ResolvedRobloxUser {
  id: number;
  name: string;
  displayName?: string;
}

export async function resolveUser(input: string): Promise<ResolvedRobloxUser> {
  const trimmed = input.trim();
  if (/^\d+$/.test(trimmed)) return { id: Number(trimmed), name: trimmed };

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
  return { id: user.id, name: user.name, displayName: user.displayName };
}

export async function resolveUserId(input: string): Promise<number> {
  return (await resolveUser(input)).id;
}
