# Games Convex Backend

Shared Convex backend used by `apps/poker-planner`, `apps/scribble`, and `apps/housie-game`.

## Source of truth

- Function/style rules: `packages/games-convex-backend/convex_rules.txt`
- App config: `packages/games-convex-backend/convex/convex.config.ts`
- Schema: `packages/games-convex-backend/convex/schema.ts`

## Commands

Run from `buildio_pro/`:

```bash
pnpm --filter=@workspace/games-convex-backend dev
pnpm --filter=@workspace/games-convex-backend setup
```

`setup` runs `convex dev --until-success` and is useful after fresh env setup.

## Important notes

- Keep using the new Convex function syntax with explicit `args` and `returns` validators.
- Generated files in `convex/_generated` are generated artifacts; do not hand-edit them.
- Game clients import APIs from `@workspace/games-convex-backend/convex/_generated/api`.
- `poker-planner` and `scribble` require `NEXT_PUBLIC_CONVEX_URL` at runtime.
