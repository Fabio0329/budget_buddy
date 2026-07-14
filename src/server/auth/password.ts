import "server-only";

import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;
const DUMMY_PASSWORD_HASH = [
  "scrypt",
  Buffer.alloc(16).toString("base64url"),
  Buffer.alloc(KEY_LENGTH).toString("base64url"),
].join("$");

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const derivedKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;

  return `scrypt$${salt.toString("base64url")}$${derivedKey.toString("base64url")}`;
}

export async function verifyPassword(password: string, storedHash?: string) {
  const [algorithm, saltValue, hashValue] = (
    storedHash ?? DUMMY_PASSWORD_HASH
  ).split("$");

  if (algorithm !== "scrypt" || !saltValue || !hashValue) {
    return false;
  }

  try {
    const salt = Buffer.from(saltValue, "base64url");
    const expectedHash = Buffer.from(hashValue, "base64url");

    if (expectedHash.length !== KEY_LENGTH) {
      return false;
    }

    const actualHash = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
    return timingSafeEqual(actualHash, expectedHash);
  } catch {
    return false;
  }
}
