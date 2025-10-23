# Contributing to Vehicle Management

Thank you for contributing — we appreciate your time and effort.

This document explains the preferred workflow for issues, branches, commits, and pull requests so reviews are fast and consistent.

1) Report issues
- Search existing issues before creating a new one.
- Use a clear title and reproduce steps, expected vs actual, environment (browser/node), and attach screenshots or logs if helpful.

2) Branching
- Base new work on the `development` branch.
- Branch name format: `feat/<short-description>`, `fix/<short-description>`, `chore/<short-description>`.

3) Commits
- Keep commits small and focused (one logical change per commit).
- Use present-tense subject lines and keep them under ~72 chars.
- Include an emoji at the start of the commit message to indicate intent (see emoji cheat-sheet below).
3) Commits
- Keep commits small and focused (one logical change per commit).
- Use present-tense subject lines and keep them under ~72 chars.
- Optional: you may include an emoji at the start of the commit message to indicate intent (see emoji cheat-sheet below).

Note: Commit-message validation via git hooks has been disabled for this repository. Using the suggested emoji+keyword format is optional and intended only to improve readability and PR hygiene.

Emoji cheat-sheet (short):
- 🔒 Authentication / security
- ✨ New feature
- 🐛 Bug fix
- ♻️ Refactor
- ✅ Completing tasks / approve
- 💸 Payments / finance
- 📤 Upload / 📥 Export
- 🧪 Tests
- 📝 Docs / README
- 🎨 Style (format / UI polish)
- 🚀 Performance
- ⚙️ CI / config
- � Chore / cleanup
- 🛠️ Build tooling
- 🔧 Config tweak
- 🗑️ Removal / deprecation

4) Tests & linting
- Add or update tests for any behavior change.
- Run the project's linting and test suite before opening a PR.

Run locally (from repo root):

```powershell
cd web
npm install
npm run lint
npm run test
```

If tests or linters fail in CI, fix them in the branch before merging.

5) Pull Request checklist
- Create a PR from your branch into `development`.
- Use the PR template (this repo includes a template that will be pre-filled).
- Keep PR descriptions concise and include the issue number if applicable.

6) PR size and review
- Prefer PRs under ~500 lines of changes.
- For larger refactors, open an RFC-style PR or split into smaller PRs.

7) Security & sensitive data
- Never commit secrets, API keys, or credentials.
- If you must add secrets for testing, document them and ensure they are removed before merge.

8) Releases and changelogs
- Feature branches merged to `development`. Release branches or tags will be created from `development` as needed.

9) Need help?
- Mention `@owner` in the issue or PR and add context. If urgent, create a small demo or failing test so reviewers can reproduce the problem quickly.

---

Thank you — your contributions make this project better.
