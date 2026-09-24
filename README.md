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

## Run

Node 22.13+ required.

```sh
npm ci
npm run dev
```

Open the printed local URL. `npm run build` emits the Cloudflare-compatible site; `npx tsc --noEmit` checks types.

## Chat providers

### OpenRouter (works on the public site now)

Tap **Connect AI** below the message box and enter your OpenRouter key. The main interface is only the brain and the conversation, with no settings menus. The default `openrouter/auto` lets OpenRouter select a model; the provider adapter keeps model selection separate from the minimal UI. Charges use the supplied account. The key is not persisted or sent to the Mindlight server. Sending a message transmits recent conversation and saved notes to OpenRouter and its selected model provider. Do not enter secrets into a shared device.

### Personal Codex prototype

The bridge uses your installed, signed-in Codex CLI without extracting or copying its credentials. It runs with read-only sandboxing, tools disabled, user configuration ignored, and a temporary empty workspace. It is only for your own local prototype; it is **not enabled on the public website**, and it requires your computer to stay awake.

1. Generate a random bridge token: `openssl rand -hex 32`.
2. Set `CODEX_BRIDGE_TOKEN` in the shell that runs `node scripts/codex-bridge.mjs`.
3. Create ignored `.dev.vars` in the project with `CHAT_PROVIDER=codex` and the same `CODEX_BRIDGE_TOKEN` value.
4. Restart `npm run dev`. Type `/local` in the development chat to use the bridge.

Never put the token or your Codex login in Git. The bridge binds to `127.0.0.1`, requires bearer authentication, rejects browser-origin requests, limits input and concurrent requests, and times out long responses. Check that your CLI supports the documented flags before use. The bridge's end-to-end model call has not yet been verified on a signed-in runtime.

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
