import { randomUUID } from "node:crypto";

import bcrypt from "bcryptjs";

// Cost 10 is ~100ms on current hardware — slow enough to make offline cracking
// expensive, fast enough to keep login under a second.
const SALT_ROUNDS = 10;

/** True when bcrypt would drop bytes, i.e. the password exceeds 72 UTF-8 bytes. */
export function exceedsBcryptLimit(password: string): boolean {
  return bcrypt.truncates(password);
}

export async function hashPassword(password: string): Promise<string> {
  if (bcrypt.truncates(password)) {
    // bcrypt ignores everything past 72 bytes. Refuse rather than store a hash
    // that weaker-than-typed passwords can also satisfy. Input length is capped
    // by RegisterSchema; this is the defense for any other caller.
    throw new Error("Password exceeds bcrypt's 72-byte limit");
  }
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

let decoyHash: Promise<string> | null = null;

/**
 * A hash of a random value, generated once per process. Login compares against
 * this when the email is unknown so a miss costs the same ~100ms as a hit —
 * otherwise response time alone tells an attacker which emails are registered.
 */
export function getDecoyPasswordHash(): Promise<string> {
  decoyHash ??= bcrypt.hash(randomUUID(), SALT_ROUNDS);
  return decoyHash;
}
