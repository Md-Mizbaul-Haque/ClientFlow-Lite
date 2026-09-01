# ClientFlow Lite — Reset

> **Sunset Notice:** The previous version and architecture (v1) has been deprecated and removed. See [Issue #1](https://github.com/Md-Mizbaul-Haque/ClientFlow-Lite/issues/1) for context.

This repository has been reset to a clean slate. All previous code (Next.js app, `src/`, `public/`, `scripts/`, configs, etc.) was removed via PR from `chore/sunset-v1`.

## History

Previous code is **not lost** — it is preserved in Git history on `main` prior to this reset:

- Last v1 commit: `d3c557f fix: resolve JSX parsing error in why-clientflow page`
- Browse history: `git log --oneline` or `git checkout main~1 -- <path>`

To restore a file from v1:

```bash
git checkout d3c557f -- <path>
```

## Next Steps

A new project will be started from scratch on this repository. This README is a placeholder until the new architecture is initialized.

## Getting Started (placeholder)

No application code exists yet. After scaffolding the new project:

```bash
npm install
npm run dev
```

---

*This reset was approved via PR review on `main`.*
