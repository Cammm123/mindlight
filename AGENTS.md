# Mindlight: local setup for coding assistants

When the user asks to run this project, follow the README's local Codex quickstart. The goal is a working brain and chat interface at http://localhost:5173, authenticated using that user's own ChatGPT account. No application code changes or API keys are needed for ordinary setup.

1. Check Node.js (22.13+) and install the locked dependencies with `npm ci`. The official Codex CLI is included locally; do not change the user's global CLI or Codex configuration.
2. Run `npm run doctor`. If signed out, ask the user to complete `npm run codex:login` in their terminal/browser, or run `npm run setup` in an interactive terminal and let them complete the official sign-in. Never request or inspect passwords, access tokens, `auth.json`, or browser cookies. If login uses an API key, explain how to sign in with ChatGPT; don't silently change their login or use API billing.
3. Run `npm run local` and retain the server process. If ports 5173 or 8788 are occupied, inspect the existing Mindlight instance before restarting anything; do not kill unrelated applications.
4. Check `GET http://localhost:5173/api/chat` returns `{"provider":"codex"}`. Verify a real reply with a short, non-sensitive test question in the browser or `POST /api/chat` with `{"messages":[{"role":"user","content":"Say hello in one short sentence."}],"notes":[]}`. This consumes a little of the user's Codex allowance. Health status alone does not prove model entitlement or available quota.
5. Open the local site and report what actually worked. Explain any account/usage restriction honestly. Leave the server running unless the user asks to stop.

Keep both services local. Never tunnel or deploy the personal Codex bridge. `.dev.vars` and all credentials must remain ignored. No Sites or Cloudflare account is needed for local use. The public site and optional OpenRouter provider are separate from local Codex authentication.

Keep the UI minimal: brain, chat, Center, and explanations on demand. Highlights are illustrative topic rules, not measured human/AI neural activity.

For code changes, run `npm test` and `npx tsc --noEmit`; use `npm run build` when changing app/server/build code. Preserve the replaceable provider boundary and anatomy licensing. Do not change production deployment unless the task calls for it.
