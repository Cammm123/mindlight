# Mindlight

**A conversation, illuminated.** A 3D human brain you can explore while chatting about numbers, memories, feelings, and everyday ideas.

## What it does

- Real anatomical model, interactive rotation, an X-ray view, and explanations that appear only when a region is selected.
- Eight approachable functional groupings: frontal, parietal, temporal, occipital, hippocampus, amygdala, cerebellum, and brainstem.
- Topic-based educational highlights and explanations for each conversation turn.
- Guided demo available without an account. This is explicitly labeled and is **not an LLM**.
- OpenRouter chat with a visitor-supplied key kept only in tab memory and sent directly to OpenRouter.
- A replaceable `/api/chat` provider boundary for hosted OpenRouter or a personal, local Codex bridge.
- Explicit notes, stored only in browser localStorage, with recall and deletion controls. Conversation history is in memory only. New conversation clears history but preserves saved notes.
- Responsive layout, reduced-motion support, keyboard-accessible region controls, and optional WebMCP region exploration.

## Run locally with your ChatGPT account — no API key

Each person runs their own copy of Mindlight and signs into **their own Codex CLI**. Nothing connects to the repository creator’s account. The app includes the official Codex CLI as a pinned development dependency, so a separate global CLI install is unnecessary.

You need Git, **Node.js 22.13+**, an internet connection, and a ChatGPT account with **Codex CLI access and available usage**. This is a local interface to a cloud model, not an offline model. Replies count against your account’s Codex allowance. Check [OpenAI’s current plan availability](https://learn.chatgpt.com/docs/pricing): Free/Go access is currently listed for the desktop app, so a free ChatGPT account alone is not a guarantee of CLI access. Managed workspaces may restrict access.

```sh
git clone https://github.com/Cammm123/mindlight.git
cd mindlight
npm ci
npm run setup
npm run local
```

`setup` reuses an existing ChatGPT login or opens the official sign-in flow. Complete sign-in yourself in the browser. `local` starts the app and private bridge together; open **http://localhost:5173**. The footer says **Codex** when connected. Stop both servers with Ctrl+C. Next time, just run `npm run local`.

No API key, hosting account, configuration editing, or paid API billing setup is required. If Node is missing, install it from [nodejs.org](https://nodejs.org/). macOS is verified; on Windows, WSL2 is recommended. Native Windows and Linux have not yet been tested end to end.

### Ask ChatGPT or Codex to set it up

Copy this prompt into a **local coding session with access to your terminal/files**, such as Codex on your computer:

> Set up https://github.com/Cammm123/mindlight locally using my own ChatGPT/Codex login, with no API key. Read its README and AGENTS.md. Clone the repository if needed, install dependencies with npm ci, run npm run setup, and start npm run local. Let me complete any required official browser sign-in. Verify that /api/chat reports Codex, then send a short test message and open the local website. Never ask me to paste credentials or copy auth.json. Keep the connection on localhost.

An ordinary ChatGPT web conversation can guide you through the commands but cannot access your computer by itself. See [the setup guide](docs/LOCAL_SETUP.md) for troubleshooting.

## Chat providers

### Codex (default local setup)

The bridge uses the official CLI’s existing login without reading, extracting, or copying its credentials. Each response runs in an empty temporary workspace with read-only sandboxing, shell tools and integrations disabled, and personal configuration ignored. Conversation context and your saved notes are sent to Codex/OpenAI to answer your message. Your local browser stores notes; chat history stays in tab memory.

The launcher generates a private token in ignored `.dev.vars`, binds the app and bridge to loopback, and detects occupied ports before changing configuration. The bridge requires authentication, rejects direct browser-origin requests, limits input and concurrent requests, and times out long responses. The local API validates conversation payloads. **Do not publish or tunnel your Codex bridge**: the public website does not use it, and the server only allows this provider during development. Mindlight is an independent educational project, not an official OpenAI product.

`npm run dev:codex` remains an alias for `npm run local`. `npm run doctor` checks CLI compatibility and login without changing them. `npm run dev` starts the app alone for demo/OpenRouter development; `npm run build` emits the Cloudflare-compatible site.

### OpenRouter (optional, including the public site)

Tap **Connect AI** below the message box and enter your OpenRouter key. In a Codex-connected tab, tap **Disconnect** first. The key stays in tab memory and goes directly to OpenRouter. Recent conversation and saved notes go to OpenRouter and its selected model provider; its charges apply. The default is `openrouter/auto`.

The `/api/chat` boundary keeps the interface, memory, and brain mapping separate from the provider, so Codex can be replaced later.

### Hosted OpenRouter

Set server secrets `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, and `CHAT_PROVIDER=openrouter`. Public shared-key chat is disabled unless `ENABLE_PUBLIC_CHAT=true` is explicitly configured. Before enabling that opt-in for anonymous traffic, set a capped OpenRouter key and add durable rate limiting/abuse protection. The first release intentionally uses visitor-owned keys to avoid an unbounded shared bill. The UI, memory, and brain mapping do not depend on which provider implements `/api/chat`.

## Scientific limits

This is an **educational analogy**, not neural measurement, neural simulation, fMRI inference, diagnosis, or an explanation of an LLM's internal computation. Text is matched to a small set of transparent topic rules. Brain functions are distributed, overlap, and vary by task, person, and strategy. Unhighlighted areas are not inactive; vision and essential background functions continue throughout reading. Glow intensity is artistic, not a probability, measured signal, or firing rate. Talking about an action is different from doing it.

Sources:
- [NIH Brain Basics](https://www.ninds.nih.gov/health-information/public-education/brain-basics)
- [NIMH: Get to Know Your Brain](https://www.nimh.nih.gov/news/media/2023/get-to-know-your-brain)
- [The functional architectures of addition and subtraction](https://pmc.ncbi.nlm.nih.gov/articles/PMC6866939/)
- [Memory and cognitive control circuits in mathematical cognition and learning](https://pmc.ncbi.nlm.nih.gov/articles/PMC5811224/)

## Anatomy attribution

The unmodified `public/models/brain.glb` and metadata come from [Brain Project](https://github.com/itayinbarr/brainproject), based on **Z-Anatomy / BodyParts3D, © Z-Anatomy contributors and DBCLS**, under **CC BY-SA 4.0**. See `public/models/LICENSE.txt` for the upstream attribution, asset license, and registered-atlas credits. Some deeper structures are approximate, educational registrations. Mindlight changes runtime appearance and groups structures for teaching; it does not claim clinical accuracy. Any distributed model derivative must retain CC BY-SA 4.0 attribution and share-alike terms. The app code has its own MIT license; it does not relicense the anatomy assets. Three.js/Draco retain their upstream licenses.

## Future directions

- Classroom lessons and quizzes that compare memory, language, and arithmetic networks.
- A neuroscience tutor that explains uncertainty and competing theories.
- Language-learning exercises connecting listening, reading, and speaking.
- A study of how visual explanations affect learning and recall, with participant consent.
- A museum or science-center installation with guided prompts and accessible narration.
- A separate research viewer for real, consented EEG/fMRI data, carefully distinguished from this text-based illustration.
- Compare human cognition with AI computation without implying they are equivalent.
- Voice conversations, temporal network stories, and age-appropriate teaching modes.
