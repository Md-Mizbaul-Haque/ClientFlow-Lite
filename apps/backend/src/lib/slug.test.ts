import { describe, expect, it, vi } from "vitest";

import { allocateSubdomain, slugify } from "./slug.js";

describe("slugify", () => {
  it("lowercases and hyphenates an agency name", () => {
    expect(slugify("DesignGuru Studio")).toBe("designguru-studio");
  });

  it("collapses separators and trims edge hyphens", () => {
    expect(slugify("  Webflow & Co.!! ")).toBe("webflow-co");
  });

  it("falls back to agency when nothing usable remains", () => {
    expect(slugify("!!!")).toBe("agency");
  });

  it("caps the slug at 60 characters", () => {
    expect(slugify("a".repeat(100)).length).toBeLessThanOrEqual(60);
  });
});

describe("allocateSubdomain", () => {
  it("returns the base slug when free", async () => {
    const tx = { agency: { findUnique: vi.fn().mockResolvedValue(null) } };
    await expect(allocateSubdomain(tx, "Fresh Studio")).resolves.toBe("fresh-studio");
    expect(tx.agency.findUnique).toHaveBeenCalledWith({ where: { subdomain: "fresh-studio" } });
  });

  it("appends a numeric suffix on collision", async () => {
    const tx = {
      agency: { findUnique: vi.fn().mockResolvedValueOnce({ id: "taken" }).mockResolvedValue(null) },
    };
    await expect(allocateSubdomain(tx, "Fresh Studio")).resolves.toBe("fresh-studio-2");
  });
});
