# Local setup

Start with the [README quickstart](../README.md#run-locally-with-your-chatgpt-account--no-api-key). All commands below run inside your cloned `mindlight` directory.

| Situation | What to do |
| --- | --- |
| First run | `npm ci`, then `npm run setup`, then `npm run local`. |
| Already signed in to Codex | `setup` reuses that login. Mindlight never copies account credentials. |
| ChatGPT is signed in only in a browser | Run `npm run codex:login`; the CLI needs its own official sign-in. |
| An assistant's terminal cannot complete login | Run `npm run codex:login` yourself in a terminal and finish the browser flow. |
| Browser callback cannot finish | Try `npm run codex:login -- --device-auth` if your account allows device authentication. Use only the official URL shown by Codex. |
| Signed in with an API key | Mindlight's local launcher stops. Run `npm run codex:login` to choose ChatGPT; it will not silently bill an API key. |
| CLI missing or incompatible | Run `npm ci`; unset `CODEX_BIN` if you previously configured an override. The repository pins a compatible official CLI. |
| CLI native binary is missing | Ensure optional npm dependencies are enabled; try `npm ci --include=optional`. On Windows, use WSL2 if needed. |
| Port 5173 or 8788 is occupied | Close the previous Mindlight terminal with Ctrl+C. The launcher does not stop unrelated processes or rotate a running instance's token. |
| Footer still says Demo | Start with `npm run local`, not just `npm run dev`, and refresh the browser after startup. |
| Codex is connected but replies fail | Run `npm run doctor`, then check Codex itself for account access, exhausted usage, workspace restrictions, or network problems. A healthy bridge cannot guarantee model access. |
| Need to reconnect after Disconnect | Refresh the local page while the bridge is running. |
| Want to use OpenRouter instead | Disconnect Codex in the footer, then select Connect AI. Its API key is optional and uses separate billing. |

`npm run doctor` is read-only: it checks the installed CLI and login method without opening a sign-in or generating configuration. `npm run setup` adds interactive sign-in when required. The local launcher alone writes the generated bridge token to ignored `.dev.vars`. Don't share that file.

Mindlight sends your conversation and saved notes to OpenAI through your local Codex CLI. The model still runs in the cloud and requires internet. The repository creator does not provide an account, shared quota, or proxy. A public Mindlight URL cannot use the Codex installed on a visitor's computer; each user runs this local copy.

## Availability and validation

A ChatGPT account must have access to the **CLI**, not just ChatGPT chat or a desktop-only Codex rollout. Check [current Codex plans](https://learn.chatgpt.com/docs/pricing) and [official authentication documentation](https://learn.chatgpt.com/docs/auth). Your account's usage limits and organization controls apply.

The launcher and real model replies are tested on macOS. Linux and Windows/WSL2 are intended targets but are not yet verified end to end. The app supports WebGL and a Canvas fallback of the same anatomical model.
