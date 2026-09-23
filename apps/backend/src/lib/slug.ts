const MAX_SUBDOMAIN_LENGTH = 60;

/** "DesignGuru Studio" -> "designguru-studio". System-owned: users never type this. */
export function slugify(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_SUBDOMAIN_LENGTH)
    .replace(/-+$/g, "");
  return slug === "" ? "agency" : slug;
}

interface SubdomainLookup {
  agency: {
    findUnique: (args: { where: { subdomain: string } }) => Promise<unknown>;
  };
}

/**
 * First free `base`, `base-2`, `base-3`, … — the pre-check loop, not the
 * guarantee. The `subdomain` unique constraint is the guarantee; callers
 * retry on a P2002 against it (see auth.ts).
 */
export async function allocateSubdomain(tx: SubdomainLookup, agencyName: string): Promise<string> {
  const base = slugify(agencyName);
  if (!(await tx.agency.findUnique({ where: { subdomain: base } }))) return base;
  for (let n = 2; ; n++) {
    const candidate = `${base}-${n}`;
    if (!(await tx.agency.findUnique({ where: { subdomain: candidate } }))) return candidate;
  }
}
