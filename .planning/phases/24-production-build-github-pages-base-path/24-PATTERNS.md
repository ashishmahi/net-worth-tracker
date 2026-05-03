# Phase 24 — Pattern map

Analogs in-repo for Phase 24 work:

| Planned touchpoint | Role | Closest analog | Notes |
|--------------------|------|----------------|-------|
| `vite.config.ts` | Build config, aliases | Current `vite.config.ts` at repo root | Extend with `defineConfig(({ mode }) => …)`, `loadEnv`, keep `@` alias to `./src` |
| Env-driven build | CI/local parity | Phase 25 will set `BASE_URL` in Actions; Phase 24 establishes the variable name and normalization | Same pattern as typical Vite + Pages docs |
| README | Developer docs | `README.md` already references Phases 24–25 for Pages | Add concrete `BASE_URL` example for `/net-worth-tracker/` |

No new React components or routes — app has no `basename`; Vite `base` alone is sufficient.

## PATTERN MAPPING COMPLETE
