import { describe, expect, it } from "vitest";

import { comparePassword, exceedsBcryptLimit, getDecoyPasswordHash, hashPassword } from "./password.js";

describe("password hashing", () => {
  it("verifies the password it hashed", async () => {
    const hash = await hashPassword("correct horse 1");

    await expect(comparePassword("correct horse 1", hash)).resolves.toBe(true);
    await expect(comparePassword("correct horse 2", hash)).resolves.toBe(false);
  });

  it("salts each hash so identical passwords differ", async () => {
    const [first, second] = await Promise.all([hashPassword("same-password-1"), hashPassword("same-password-1")]);

    expect(first).not.toBe(second);
  });

  it("refuses passwords past bcrypt's 72-byte limit", async () => {
    expect(exceedsBcryptLimit("a".repeat(73))).toBe(true);
    expect(exceedsBcryptLimit("a".repeat(72))).toBe(false);
    await expect(hashPassword("a".repeat(73))).rejects.toThrow(/72-byte/);
  });

  it("counts bytes, not characters, for the limit", () => {
    // 25 four-byte emoji = 100 bytes, well under the 72-character schema cap.
    expect(exceedsBcryptLimit("😀".repeat(25))).toBe(true);
  });

  it("reuses one decoy hash so unknown-email logins still pay for a compare", async () => {
    const first = await getDecoyPasswordHash();

    expect(await getDecoyPasswordHash()).toBe(first);
    await expect(comparePassword("anything", first)).resolves.toBe(false);
  });
});
