import { eq } from "drizzle-orm";
import { db } from ".";
import { localProfileTable as profile } from "./schema";

export interface CachedProfile {
  name: string;
  photoUri: string | null;
  publicKey: string | null;
}

export const getLocalProfile = async (
  userId: string,
): Promise<CachedProfile | null> => {
  const [userProfile] = await db
    .select({
      name: profile.name,
      photoUri: profile.photoUri,
      publicKey: profile.publicKey,
    })
    .from(profile)
    .where(eq(profile.userId, userId));
  return userProfile;
};

export const saveLocalProfile = async (
  userId: string,
  name: string,
  photoUri: string | null,
  publicKey: string | null,
) => {
  db.insert(profile).values({ userId, name, photoUri, publicKey });
};
