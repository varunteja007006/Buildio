---
description: Wipe the cortex-ai Postgres database and re-apply all Drizzle migrations from scratch (destructive)
---

Read and follow the instructions in `.github/prompts/fresh-db.prompt.md`
exactly, including the safety confirmation step. $ARGUMENTS is optional extra
context from the user (e.g. "data only" for a truncate-without-migrate wipe, or
a different app name).
