# SOLO SME — Launch-Readiness Report

**Date:** 2026-08-29
**Scope of this pass:** Static/code-level certification of the `huzex87/solo-sme`
repository at branch `claude/charming-shannon-9bmd62`, focused on Phase 0–4
(security, database contracts, payment-flow correctness, code quality) with
evidence. Live-infrastructure phases (Lighthouse, live RLS probing against the
production database, Vercel/Supabase dashboards, DNS) could **not** be executed
from this environment and are reported honestly as BLOCKED / human-verify rather
than marked PASS.

---

## 1. Executive verdict — **NO-GO (conditional)**

The headline P0 from prior audits — **merchant payment secret keys exposed to
anonymous storefront visitors** — was **confirmed present and re-introduced**,
and has been **fixed in code + a new migration** in this pass. A second, equally
serious **P0 payment-integrity flaw** (the server charged a client-supplied
amount) was also found and fixed. Webhooks, AI-route authorization, and rate
limiting were hardened.

Launch is **not yet certifiable as GO** for reasons that are partly outside a
code-only pass:

1. The security migration (`20260717_secure_tenant_secrets.sql`) **must be
   applied to the production database and verified** with the included dry-run
   queries. Until it runs in prod, the anon secret-leak hole is still open in
   the live system. *(This is the gating P0 — it is fixed in the repo, not yet
   proven in prod.)*
2. **Residual P1:** order totals are still computed **client-side** and then
   stored; the new server-side binding guarantees the charge equals the *stored
   order total*, but does not yet recompute the total from authoritative product
   prices. A tampered cart could still persist a wrong total. Recommended fix
   below.
3. Human-decision items (legal review, DNS SPF/DKIM/DMARC, Sentry DSN, Upstash
   keys, provider webhook URLs, backup tier) remain open — see §4.

**Honest residual-risk statement:** with the committed changes deployed *and*
the migration applied and verified, the known secret-exposure and
amount-tampering vectors are closed. Real-money launch should still wait on the
order-repricing P1 and the §4 human items. Do not read this report as GO.

---

## 2. Scorecard

| Phase | Area | Result | Evidence |
|------|------|--------|----------|
| 0 | Recon & baseline | PASS | `tsc --noEmit` exit 0; `next build` exit 0 with env present; secret scan of tracked files + git history clean (only `.env.example` placeholders). |
| 1 | Security | **FIXED (P0×2) + PASS + BLOCKED** | See §3. Tenant-secret leak fixed; payment-amount integrity fixed; webhooks hardened; AI IDOR fixed. Live anon RLS probing BLOCKED (no DB). |
| 2 | Database integrity | PARTIAL / BLOCKED | Migration authored with rollback + dry-run. Live schema diff / PITR / cascade-delete testing require DB access — human-verify. |
| 3 | Business logic / payments | FIXED + PARTIAL | Amount integrity fixed; refund path authorizes owner/role; residual client-side repricing P1 open. |
| 4 | Code quality | PASS | Zero TS errors (`strict: true`), zero ESLint errors on changed files; no new `any` in payment/auth code. |
| 5 | UI/UX design system | NOT ASSESSED | Requires running app + visual review; out of scope for this code pass. |
| 6 | Performance / Lighthouse | BLOCKED | No headless-Lighthouse run available here. |
| 7 | SEO / legal | PARTIAL | `robots.txt`, `sitemap.ts`, `/privacy`, `/terms` present. Refund/dispute policy page + legal review outstanding (P1). |
| 8 | Infra / observability | PARTIAL | Sentry configs present (`sentry.*.config.ts`); DSN + Upstash + webhook URLs are env/dashboard items (§4). |
| 9 | Verification | PARTIAL | Added webhook-signature regression tests (7 pass). Full suite has 15 pre-existing env-driven failures (missing `SUPABASE_SERVICE_ROLE_KEY` in test env) — identical before and after this change, so no regressions introduced. |

---

## 3. Everything fixed in this pass

| File | Issue | Severity | Fix |
|------|-------|----------|-----|
| `supabase/migrations/20260717_secure_tenant_secrets.sql` (new) | `tenants` had anon `SELECT USING (true)` + `GRANT SELECT ... TO anon`; `business_config` JSONB holds `paystack_secret_key`, `flutterwave_secret_key`/`_hash`, Meta tokens, Maps key. The public anon key ships in the browser bundle, so any visitor could `select('*')` and read every merchant's live secrets. | **P0** | Revoke anon access to the base table; expose a redacted `public_tenants` view that strips all secret keys via the jsonb `-` operator; grant anon SELECT on the view only. Migration ships rollback + dry-run verification queries. |
| `src/services/tenantService.ts` | `getTenantBySubdomain()` did `.select('*')` on `tenants` from the browser/anon client (storefront resolution). | **P0** | Query the `public_tenants` view (no secrets on the wire) instead of the base table. |
| `src/services/domainService.ts` | `resolveTenant()` and `checkAvailability()` read the base `tenants` table under the anon client (middleware + availability). | P1 | Point both at `public_tenants` so they keep working after anon is revoked. |
| `src/services/paymentService.ts` | Server-side secret reads used the caller's client, which for guest checkout is the anon client — would break (and previously relied on the leaky policy). | P1 | `createPaymentIntent` / `verifyPayment` / `refundPayment` read the tenant with the **service-role admin client** (privileged secret read). |
| `src/app/api/payments/initialize/route.ts` | Charged `amount` taken **directly from the client request body** — a buyer could pay ₦1 for any order. | **P0** | Look up the order by id with the admin client, verify it belongs to the tenant, reject already-settled orders, and charge `order.total_amount` (server-authoritative). |
| `src/app/api/webhooks/paystack/route.ts` | HMAC compared with `===` (timing side channel); tenant secret read via anon client. | P2 / P1 | `crypto.timingSafeEqual` on hex digests; tenant secret read via admin client. |
| `src/app/api/webhooks/flutterwave/route.ts` | `verif-hash` compared with `!==`; tenant secret read via anon client. | P2 / P1 | Constant-time string compare; admin-client secret read. |
| `src/app/api/payments/webhook/route.ts` | Duplicate Paystack handler: `!==` compare **and logged the expected HMAC digest** on mismatch. | P2 | Constant-time compare; stop logging the expected digest. |
| `src/app/api/ai/pulse/route.ts` | No rate limit on a paid AI route; took `tenantId` from the query with **no ownership check** (cross-tenant IDOR of business intelligence). | P1 | Add `aiRatelimit`; enforce tenant membership via `profiles` before returning insights. |
| `src/__tests__/webhookSignature.test.ts` (new) | No regression coverage on the webhook security primitive. | — | 7 tests: valid accepted, wrong-secret/tampered/replay rejected, malformed/length-mismatch rejected without throwing. |

**Verified clean in place (no fix needed):**
- No hardcoded super-admin credentials or magic-URL admin access (`is_superadmin`
  claim checked server-side in `middleware.ts`).
- No live secrets in tracked files or git history.
- Money-movement refund route (`api/orders/[orderId]/refund`) authorizes tenant
  membership **and** role.
- `payments/subaccount` and `payments/subscribe` authorize `owner_id === user.id`.
- CSP is a real enforced policy with `frame-ancestors 'none'`, `object-src
  'none'`, `base-uri 'self'`; HSTS/`X-Content-Type-Options`/`X-Frame-Options`/
  `Referrer-Policy`/`Permissions-Policy` present.
- AI routes: 8/9 already rate-limited; `pulse` was the gap (now fixed).

---

## 4. Human-decision items (Huzaifa)

| # | Item | Severity | Action |
|---|------|----------|--------|
| H1 | **Apply the security migration to prod.** | **P0** | Run `supabase/migrations/20260717_secure_tenant_secrets.sql` against production, then execute the migration's DRY-RUN block: as `anon`, `SELECT * FROM tenants` must be **denied**, and the `public_tenants` "count of rows still carrying secret keys" query must return **0**. Until this runs, the live secret-leak hole stays open. |
| H2 | **Verify no merchant secrets already leaked.** | P1 | Because the hole was live, treat existing merchant Paystack/Flutterwave/Meta secrets as potentially exposed. Advise affected merchants to **roll their keys** after H1. |
| H3 | Order repricing (residual). | P1 | Recompute order `total_amount` server-side from DB product prices + tax/delivery rules at order creation, so a tampered cart cannot persist a wrong total. The charge is already bound to the stored total; this closes the remaining gap. |
| H4 | Provider webhook URLs. | P1 | In Paystack + Flutterwave dashboards (production keys) register: `https://solosme.ng/api/webhooks/paystack` and `https://solosme.ng/api/webhooks/flutterwave`. Note the repo also has a second Paystack handler at `/api/payments/webhook`; pick one URL and retire the other to avoid ambiguity. |
| H5 | Error monitoring live. | P1 | Set `NEXT_PUBLIC_SENTRY_DSN` (+ server DSN) in Vercel prod so `sentry.*.config.ts` actually report. A payments launch without this is blind. |
| H6 | Rate-limit backend. | P1 | Set `UPSTASH_REDIS_REST_URL` / `_TOKEN` in prod. Without them the AI limiter fails-*closed* in production (blocks AI) and the general limiter fails-*open* (no protection) — confirm this is intended. |
| H7 | Legal surfaces. | P1 | `/privacy` and `/terms` exist — have them reviewed against NDPA 2023 (lawful basis, retention, subject rights, contact). Add a public **Refund/Dispute policy** page and link all in the footer. |
| H8 | Email auth (DNS). | P1 | Add SPF, DKIM, DMARC for the `EMAIL_FROM` sender domain so transactional email is not spam-filtered. |
| H9 | Backups. | P2 | Confirm Supabase PITR/backup tier is adequate for a payments platform; document the restore procedure. |
| H10 | Maps key restriction. | P2 | Restrict any Google Maps/client key by HTTP referrer + API scope in the provider console. |

---

## 5. First-week watchlist (P2/P3)

1. **P2 — retire the duplicate Paystack webhook handler** (`/api/payments/webhook`
   vs `/api/webhooks/paystack`) to a single audited endpoint.
2. **P2 — webhook idempotency table.** Verify replayed provider events cannot
   double-credit; `PaymentService.verifyPayment` guards ledger double-entry, but
   an explicit processed-event-ID dedupe table is stronger.
3. **P2 — CSP `'unsafe-inline'`** in `script-src` weakens XSS defense; move to
   nonces/hashes when feasible.
4. **P2 — `.select('*')` elsewhere.** ~45 call sites remain; audit any on tables
   with sensitive columns and pin explicit column lists (tenants is the critical
   one and is now fixed).
5. **P3 — pre-existing test-env failures.** 15 suite failures stem from missing
   `SUPABASE_SERVICE_ROLE_KEY` in the Jest env; add a test env/mocks so the suite
   is green in CI.

---

## 6. Day-one runbook

**Monitor (first 24h):**
- Sentry (client + server) error rate — watch `payments/*` and `webhooks/*`.
- Failed webhook signatures and failed `verifyPayment` calls (they log via
  `logger.warn/error`) — a spike means a mis-registered key/URL.
- 401/403 rate on `payments/initialize` (order-not-found / already-paid) — a
  spike may indicate a checkout regression.
- Rate-limit 429s on AI routes — confirm Upstash is reachable.

**Alerting:** route Sentry issues + failed-webhook logs to email/Slack/WhatsApp.

**Rollback (target < 10 min):**
- App: in Vercel, **Promote** the previous production deployment.
- Migration: the security migration ships a commented ROLLBACK block, but note
  reverting it **re-opens the P0 secret hole** — prefer rolling the *app* back
  and keeping the DB hardened.

---

## 7. What this pass could not certify (be explicit)

- Live anon/second-merchant RLS probing (needs DB creds).
- Lighthouse performance/accessibility scores (needs headless run).
- Vercel/Supabase dashboard state, DNS/TLS, PITR tier (dashboard access).
- Full UI/UX design-system audit (needs the running app).

These are reported as BLOCKED, not PASS, by design — the bar is evidence, not
assumption.
