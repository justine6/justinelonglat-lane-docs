import accessModel from "@/config/access-model.json";
import type { AccessProfile, JltRole } from "./types";

type ProfilesMap = Record<string, AccessProfile>;

const profiles = accessModel.authorizationProfiles as ProfilesMap;

export function getAccessProfile(role: JltRole): AccessProfile {
  const profile = profiles[role];

  if (!profile) {
    throw new Error(`No access profile found for role: ${role}`);
  }

  return profile;
}
