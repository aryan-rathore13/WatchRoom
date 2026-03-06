# Watch Party App — Implementation Plan

## Context
Build a private watch-party web app for friends. Users create rooms, share invite links, and one person shares their screen (browser tab, local file, or any app window like VLC). All participants watch in sync with voice chat and a toggleable text chat. Closed-source personal use; designed to be monetizable later.

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Frontend | Next.js 15 (App Router) + TypeScript | SSR for landing/invite pages, React ecosystem |
| UI | Tailwind CSS v4 + shadcn/ui | Accessible primitives, owned as source |
| Video/Audio | LiveKit (`@livekit/components-react`) | Best-in-class WebRTC SFU, great TS SDK |
| Backend | Fastify v5 + TypeScript | REST API for room management + token generation |
| Database | PostgreSQL 16 via Prisma ORM | Room/invite persistence |
| Cache | Redis 7 via ioredis | Fast invite code lookup, session state |
| SFU | LiveKit self-hosted (Go, Docker) | Includes built-in TURN; single docker-compose |
| Reverse Proxy | Caddy 2 | Auto TLS, simple config |
| Hosting | Hetzner CX22 VPS (~€4.51/mo) | Cheap, 20TB bandwidth |
| Package manager | pnpm workspaces + Turborepo | Monorepo: web + api + shared types |

---

## Repository Structure

```
/
├── apps/
│   ├── web/                          # Next.js 15 frontend
│   │   ├── app/
│   │   │   ├── page.tsx              # Landing — create room CTA
│   │   │   ├── join/[inviteCode]/page.tsx   # Invite landing + name entry
│   │   │   └── room/[roomId]/page.tsx       # Main room view
│   │   ├── components/
│   │   │   ├── room/
│   │   │   │   ├── RoomView.tsx
│   │   │   │   ├── VideoStage.tsx         # Full-viewport screen share renderer
│   │   │   │   ├── ControlBar.tsx         # Bottom strip (share, mic, chat, fullscreen)
│   │   │   │   ├── ScreenShareButton.tsx
│   │   │   │   ├── FullscreenButton.tsx
│   │   │   │   ├── MicToggle.tsx
│   │   │   │   └── ParticipantStrip.tsx
│   │   │   ├── chat/
│   │   │   │   ├── ChatPanel.tsx          # Slide-in panel (shadcn Sheet)
│   │   │   │   ├── ChatMessage.tsx
│   │   │   │   └── ChatInput.tsx
│   │   │   └── lobby/
│   │   │       ├── LobbyView.tsx          # Pre-join: name input + mic test
│   │   │       └── MicLevelMeter.tsx
│   │   ├── hooks/
│   │   │   ├── useScreenShare.ts    # getDisplayMedia with audio constraints
│   │   │   ├── useRoomToken.ts      # Fetch JWT, connect Room object
│   │   │   ├── useChat.ts           # DataChannel send/receive
│   │   │   └── useFullscreen.ts     # Fullscreen API wrapper
│   │   └── lib/
│   │       ├── livekit.ts           # Room config constants
│   │       └── api.ts               # Typed fetch wrappers
│   │
│   └── api/                         # Fastify backend
│       ├── src/
│       │   ├── server.ts
│       │   ├── routes/
│       │   │   ├── rooms.ts         # POST /rooms, GET /rooms/:id
│       │   │   ├── tokens.ts        # POST /tokens (generate LiveKit JWT)
│       │   │   └── invite.ts        # GET /invite/:code
│       │   ├── services/
│       │   │   ├── livekit.ts       # LiveKit Server SDK wrapper
│       │   │   ├── rooms.ts         # Room CRUD
│       │   │   └── invites.ts       # Invite code gen + Redis cache
│       │   └── db/
│       │       ├── prisma.ts
│       │       └── redis.ts
│       └── prisma/
│           └── schema.prisma
│
├── infra/
│   ├── docker-compose.yml           # LiveKit + Postgres + Redis + Caddy
│   ├── livekit.yaml                 # LiveKit server config
│   └── Caddyfile
│
├── packages/types/index.ts          # Shared TypeScript types
├── pnpm-workspace.yaml
└── turbo.json
```

---

## Implementation Steps

### Step 1 — Monorepo Scaffold
- Init pnpm workspace + Turborepo
- Create `apps/web` (Next.js 15, TypeScript, Tailwind v4, shadcn/ui)
- Create `apps/api` (Fastify v5, TypeScript, Prisma, ioredis)
- Create `packages/types` for shared types (Room, Token, ChatMessage)

#### shadcn/ui Setup Requirements
The project must be initialized via the shadcn CLI so `components/ui` exists at the correct path:
```bash
pnpm dlx shadcn@latest init
```
This sets up:
- `apps/web/components/ui/` — all shadcn primitives live here (Button, Card, Sheet, Badge, Avatar, etc.)
- `apps/web/lib/utils.ts` — exports the `cn()` helper used by every UI component
- `apps/web/app/globals.css` — CSS variable tokens for theming

If `components/ui` does not exist at this path, custom components that import from `@/components/ui/*` or use `cn()` from `@/lib/utils` will fail to resolve. Always verify this folder exists before copying in custom components.

#### Custom UI Components to Integrate
As custom components are provided they must be dropped into `apps/web/components/ui/` and their npm deps installed. Currently required:

**1. `glowing-effect.tsx`**
- Copy to: `apps/web/components/ui/glowing-effect.tsx`
- Install dep: `pnpm add motion` (inside `apps/web`)
- Depends on: `cn` from `@/lib/utils`, `animate` from `motion/react`
- Usage: wrap any Card's inner `<div>` with `<GlowingEffect>` as an absolute-positioned sibling. Set `disabled={false}` to activate mouse-tracking. Key props:
  - `spread={40}` — arc width of the glow sweep
  - `proximity={64}` — px outside the element that still activates glow
  - `inactiveZone={0.01}` — dead zone at card center (keep low for cards)
  - `borderWidth={3}` — glow border thickness
  - `glow={true}` — always-on base glow even without mouse proximity
- Best placement: Feature strip cards, lobby/room cards, CTA card, invite card
- The companion `demo.tsx` shows the `GridItem` pattern — use this as reference for wrapping any card in the app with the effect

**2. `colorful-wave-pattern-1.tsx`** (ElectricWavesShader)
- Copy to: `apps/web/components/ui/colorful-wave-pattern-1.tsx`
- Install dep: `pnpm add three` + `pnpm add -D @types/three` (inside `apps/web`)
- Add `"use client"` directive at the top — uses `useRef`, `useState`, `useEffect` and WebGL canvas
- Depends on: `three` (WebGLRenderer, ShaderMaterial, OrthographicCamera, Clock)
- What it does: renders a full-screen animated GLSL shader via a WebGL canvas — electric colored sine waves that drift and pulse over time. Fully GPU-driven, zero CPU animation overhead once started.
- **Landing page integration — Hero background:**
  - Remove the `position: fixed` / `zIndex: -1` from the container style. Instead render it as `position: absolute; inset: 0` inside the hero section wrapper which is `position: relative; height: 100vh; overflow: hidden`
  - The hero text (headline, subtext, CTAs) sits on top via `position: relative; z-index: 10`
  - Remove the control panel (`<div style={controlPanelStyle}>`) for production — use fixed shader params that match the landing page aesthetic: `waveCount=8`, `amplitude=0.08`, `frequency=3.0`, `brightness=0.004`, `colorSeparation=0.12`
  - Layout: hero section is `min-h-screen` with the shader as a full-bleed background. The 60/40 text+mockup content is centered vertically inside it.
  - On scroll past the hero, the shader canvas is naturally clipped by `overflow: hidden` on the section — no JS needed.
  - Add a gradient fade at the bottom of the hero (`absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-b from-transparent to-background-dark`) to blend cleanly into the feature strip below.

**3. `container-scroll-animation.tsx`** (ContainerScroll)
- Copy to: `apps/web/components/ui/container-scroll-animation.tsx`
- Install dep: `pnpm add framer-motion` (inside `apps/web`)
- `"use client"` already present at top of file
- Exports: `ContainerScroll`, `Header`, `Card` — only import `ContainerScroll` at usage sites
- Depends on: `framer-motion` (`useScroll`, `useTransform`, `motion`, `MotionValue`)
- What it does: as the user scrolls into the section, a large card starts rotated 20° on the X axis (perspective tilt) and unflattens to 0° by the end of the scroll range, while scaling 1.05→1. Creates a cinematic "product reveal" 3D unfold effect.
- **Landing page integration — Product reveal section** (placed immediately after hero, before feature strip):
  - `titleComponent` prop: landing page styled text — e.g. a small lime ALL-CAPS eyebrow + large `font-black tracking-tighter` headline `"THE ROOM."` with a subline `"Share any screen. Everyone watches live."`. Override the built-in `text-center` on `Header` to `text-left` to stay consistent with the non-centered layout rule.
  - Children: a styled dark mockup of the watch party room — `bg-[#0a0a08]` fill, fake screen-share preview area (dark rectangle with lime glow border), participant avatar strip, control bar icons. Override the inner `Card` wrapper's `dark:bg-zinc-900` to `bg-[#0a0a08]` to match the obsidian theme.
  - Section wrapper background: `bg-[#0a0a08]` so it blends with the hero bottom gradient.
  - The built-in `h-[80rem]` scroll distance gives a slow dramatic reveal — no changes needed.
  - Mobile: built-in `[0.7, 0.9]` scale range handles smaller screens automatically.

---

### Step 1b — Landing Page (`apps/web/app/page.tsx`)

**Design reference:** `screens/landing_page.html` — replicate this design exactly in React/Tailwind. Do not use a generic template.

**Design tokens (must match):**
| Token | Value |
|---|---|
| Accent | `#dfff00` (Hyper-Lime) — named `primary` in Tailwind config |
| Background | `#0a0a08` (Obsidian) |
| Surface | `#1a1a16` (slate-custom) |
| Font | Manrope (Google Fonts) — weights 200/300/400/500/600/700/800 |
| Text style | ALL left-aligned or asymmetric. Never a centered hero. |

**Sections to implement (in order):**

1. **Sticky nav** — logo left (`filter_none` icon + "WATCHROOM" wordmark in lime), nav links center-left (Discover / Gallery / Pricing), right: pulse-dot live counter + "Join Now" primary button. `bg-background-dark/80 backdrop-blur-md border-b border-primary/10`.

2. **Hero — full-viewport with shader background:**
   - Outer wrapper: `relative min-h-screen overflow-hidden` (clips the WebGL canvas)
   - `<ElectricWavesShader>` renders as `position: absolute; inset: 0; z-index: 0` — fills the entire hero section. Use fixed params: `waveCount=8`, `amplitude=0.08`, `frequency=3.0`, `brightness=0.004`, `colorSeparation=0.12`. Remove the control panel UI for production.
   - Bottom fade overlay: `absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-b from-transparent to-[#0a0a08]` — blends the shader into the feature strip below on scroll.
   - All hero content sits on top via `relative z-index: 10`.
   - **60/40 split grid** inside the hero (`lg:grid-cols-10`, vertically centered):
     - Left (col-span-6): eyebrow line (`h-px` + tiny ALL-CAPS label in lime), huge editorial headline (`text-8xl font-black tracking-tighter leading-[0.9]`) — "THE ART OF **SHARED** VIEWING." with "SHARED" in lime italic. Subtext in `text-slate-400 font-light`. Two CTAs: "Create Master Room" (lime, `shadow-[0_0_30px_rgba(223,255,0,0.2)]`) + "Explore Catalog" (ghost, `border-primary/30`).
     - Right (col-span-4): tall image card (`aspect-[4/5]`, `rounded-xl border border-primary/20 bg-black/40 backdrop-blur-sm`), image grayscale → colour on hover (`transition-all duration-700`), gradient overlay `from-background-dark`. Floating glass UI mockup at bottom: participant avatars stack, "+12" lime badge, "Live Sync 4K" label, lime progress bar. Corner L-brackets as aesthetic accents (`border-t border-r border-primary/20`).
   - Scroll behavior: the hero is exactly `min-h-screen`. When the user scrolls down, the hero exits and the product reveal section enters next.

3. **Product reveal** (`<ContainerScroll>`) — section background `bg-[#0a0a08]`, placed directly after the hero:
   - `titleComponent`: left-aligned eyebrow + large `font-black tracking-tighter` headline `"THE ROOM."` + subline `"Share any screen. Everyone watches live."`. Override the built-in `text-center` class on the `Header` motion div to `text-left` for layout consistency.
   - Children (inside the 3D card): a styled mockup of the watch party room UI — dark `bg-[#0a0a08]` background, centered screen-share preview area (dark rectangle with `border border-primary/20` and a subtle lime glow), participant avatar strip along the bottom, simple control bar with mic/screenshare/chat icon placeholders. This is a static HTML/CSS mockup, not a live component.
   - Override `Card` inner div: `bg-[#0a0a08]` instead of `dark:bg-zinc-900`.
   - As user scrolls down through the section, the card unflattens from 20° tilt to flat — the room UI "reveals" dramatically before the features list.

4. **Feature strip** — `border-y border-primary/10 bg-slate-custom/50 py-16`. Three columns, each with `border-t-2 border-primary pt-6` (first always lime, rest `border-primary/30` → lime on hover). Icon (lucide-react), bold ALL-CAPS title, light subtext. Features: HYPER-SYNC / SPATIAL CHAT / OBSIDIAN PRIVACY. **Apply `<GlowingEffect>` to each feature card.**

5. **The Blueprint (How it works)** — Left-aligned heading "THE BLUEPRINT". Three steps in staggered grid (`lg:grid-cols-3`), middle step offset down (`lg:mt-24`). Each step: ghost number (`text-9xl font-black text-primary/5`, brightens to `text-primary/10` on group hover), tiny ALL-CAPS category label in lime, bold step title, light body text.

6. **Quote band** — Full-width `bg-primary` section. Large italic quote in black, attribution line with `h-px` divider. *(This section is centered — the only exception in the design.)*

7. **CTA footer band** — `flex-row justify-between` on desktop. Left: "READY TO **SYNC**?" headline (SYNC in lime italic), subtext. Right: large "Get Started Free" lime button.

8. **Footer links grid** — 4 columns (Platform / Company / Legal / Social). Bottom bar: copyright + "Obsidian Encryption Enabled" badge, both at `opacity-30`.

**Tailwind config additions needed** (`tailwind.config.ts` in `apps/web`):
```ts
colors: {
  primary: '#dfff00',
  'background-dark': '#0a0a08',
  'slate-custom': '#1a1a16',
},
fontFamily: { display: ['Manrope', 'sans-serif'] },
```

**CSS to add to `globals.css`:**
```css
.glass-border {
  border: 1px solid rgba(223, 255, 0, 0.15);
  backdrop-filter: blur(8px);
}
.text-glow { text-shadow: 0 0 15px rgba(223, 255, 0, 0.3); }
.pulse-dot {
  box-shadow: 0 0 0 0 rgba(223, 255, 0, 0.7);
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0%   { transform: scale(0.95); box-shadow: 0 0 0 0   rgba(223,255,0,0.7); }
  70%  { transform: scale(1);    box-shadow: 0 0 0 6px rgba(223,255,0,0);   }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0   rgba(223,255,0,0);   }
}
```

**Animations (Framer Motion):**
- Hero image card: slow float (`translateY 0 → -12px → 0`, 6s loop)
- Feature cards: `whileInView` fade-up with staggered delay (0 / 0.1 / 0.2s)
- Background: two slow radial blob gradients drifting (20s loop, low opacity)
- CTA button: shimmer sweep on hover

---

### Step 2 — Infrastructure (infra/)
- `docker-compose.yml`: LiveKit SFU, PostgreSQL, Redis, Caddy
- `livekit.yaml`: enable TURN on 443 UDP/TCP + 3478 UDP; set API key/secret; WebRTC port range 50000-60000
- `Caddyfile`: reverse-proxy `/api/*` to Fastify; serve Next.js; HTTPS via Let's Encrypt
- Required open ports: 80, 443 TCP/UDP, 3478 UDP, 7881 TCP, 50000-60000 UDP

### Step 3 — Database Schema & API

**`prisma/schema.prisma`:**
```prisma
model Room {
  id          String   @id @default(cuid())
  inviteCode  String   @unique @db.VarChar(12)
  livekitRoom String   @unique
  hostName    String
  createdAt   DateTime @default(now())
  expiresAt   DateTime
  isActive    Boolean  @default(true)
  @@index([inviteCode])
}
```

**API routes:**
- `POST /rooms` → create LiveKit room, store in Postgres, cache invite code in Redis (TTL 24h), return `{ roomId, inviteCode, token, livekitUrl }`
- `GET /invite/:code` → Redis fast-path lookup → return `{ roomId, hostName }`
- `POST /tokens` → validate room, generate LiveKit JWT with role-based grants:
  - Host: can publish camera, mic, screenshare, screenshare-audio
  - Guest: can publish mic only; can subscribe all

### Step 4 — Core Room Experience

**`useScreenShare.ts`** — the critical hook:
```typescript
const stream = await navigator.mediaDevices.getDisplayMedia({
  video: { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 30 } },
  audio: {
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false,
    sampleRate: 48000,
    channelCount: 2,
    suppressLocalAudioPlayback: true,  // Chrome 109+, prevents echo feedback
  }
});
// Publish video at 8 Mbps, no simulcast (screen share = single quality layer)
// Publish audio at 320 kbps, dtx: false (don't silence quiet passages)
```

**`VideoStage.tsx`** — renders screen share track filling entire viewport (`object-fit: contain`, black letterbox). Subscribes to `Track.Source.ScreenShare` on any participant.

**`useFullscreen.ts`** — `document.documentElement.requestFullscreen()`. VideoStage uses `position: fixed; inset: 0; z-index: 9999`. ControlBar auto-hides after 3s of inactivity in fullscreen; reappears on mouse move.

**`MicToggle.tsx`** — publishes/unpublishes local mic track on click. Separate from screen share audio. `RoomAudioRenderer` (LiveKit built-in component) plays all remote audio tracks automatically.

### Step 5 — Text Chat (DataChannel, ephemeral)
```typescript
// Send
room.localParticipant.publishData(
  encoder.encode(JSON.stringify({ type: 'chat', name, text, ts: Date.now() })),
  { reliable: true }
)
// Receive — fires on all participants
room.on(RoomEvent.DataReceived, (payload) => { /* decode + append to chat state */ })
```
`ChatPanel` uses shadcn `Sheet` component sliding in from the right. Toggle button in `ControlBar`.

### Step 6 — Responsive Layout
- **Desktop**: video fills ~75% width, chat panel 25% (collapsible)
- **Tablet/iPad**: full-width video, chat as overlay bottom Sheet
- **Mobile**: stacked layout; hide "Share Screen" button (getDisplayMedia not supported); show informational banner
- Mobile detection: `typeof navigator.mediaDevices?.getDisplayMedia === 'undefined'`

### Step 7 — Invite Link Flow
- Room created → shareable URL: `https://yourdomain.com/join/{inviteCode}`
- `/join/[inviteCode]` page: resolves room via `GET /invite/:code`, shows LobbyView (name input, mic level meter)
- On "Join": fetches guest token, redirects to `/room/[roomId]`

---

## Key Architectural Decisions

**Why SFU over peer mesh:** Host on consumer internet would saturate upload at 4+ peer connections sending 1080p. SFU receives one stream from host and forwards to all viewers. Also simplifies NAT traversal — each client only connects to one server.

**Why LiveKit over mediasoup/Cloudflare Calls:** Single `docker-compose` deploys SFU + TURN + TLS termination. First-class TypeScript SDK with React hooks. Self-hosted = $0 software cost. Cloudflare Calls is a better option later for global PoP distribution.

**VLC audio on Windows:** Works natively — Chrome uses WASAPI loopback to capture per-window audio. Audio constraints (`echoCancellation: false`, `noiseSuppression: false`) preserve movie audio fidelity.

**VLC audio on macOS:** Window-level audio capture is NOT supported by macOS. Show a UI tip: "For audio on Mac, share Entire Screen and check 'Share system audio', or open your video in a browser tab and share that tab."

**No video sync logic needed for Phase 1:** When host shares a VLC/app window, the stream is inherently live — all viewers see the same live capture. RTCP NTP timestamps keep inter-viewer drift < 50ms. No explicit seek-sync protocol required.

---

## Audio Quality Settings

| Setting | Value | Reason |
|---|---|---|
| echoCancellation | false | Movie audio ≠ mic; preserve it |
| noiseSuppression | false | Preserve film audio texture |
| autoGainControl | false | Preserve dynamic range |
| sampleRate | 48000 | DVD/Blu-ray native sample rate |
| channelCount | 2 | Stereo |
| audioBitrate | 320 kbps | Near-lossless over WebRTC Opus |
| dtx | false | Don't silence quiet passages |

---

## Critical WebRTC Flows

### Room Creation
```
POST /rooms { hostName }
  → create LiveKit room
  → store in Postgres + Redis (TTL 24h)
  → return { roomId, inviteCode, token, livekitUrl }
  → frontend redirects to /room/{roomId}
  → UI shows shareable link: https://app.com/join/{inviteCode}
```

### Guest Joins via Invite Link
```
/join/{inviteCode}
  → GET /invite/{inviteCode} → { roomId, hostName }
  → LobbyView: guest enters name + tests mic
  → POST /tokens { roomId, participantName, role: "viewer" }
  → redirect to /room/{roomId} with token
```

### Screen Share Publish (Host)
```
getDisplayMedia() → OS picker (tabs / windows / VLC)
  → publishTrack(videoTrack, { maxBitrate: 8_000_000, simulcast: false })
  → publishTrack(audioTrack, { audioBitrate: 320_000, dtx: false })
  → SFU forwards to all subscribers
  → guests: TrackSubscribed event → VideoStage renders stream
```

---

## Verification Plan

1. **Local dev**: `pnpm dev` — Next.js on 3000, Fastify on 3001, LiveKit in Docker on 7880
2. **Screen share smoke test**: Two browser windows — host shares a browser tab, guest sees 1080p video + audio < 300ms delay
3. **VLC test (Windows)**: Share VLC window, verify guests hear clean stereo audio
4. **Mobile test**: iOS Safari + Chrome Android — verify video plays as viewer, mic works, no screen share button shown
5. **Fullscreen test**: Video fills viewport edge-to-edge, ControlBar hides, Escape exits cleanly
6. **TURN test**: One participant behind mobile hotspot (restrictive NAT) — verify connection established via TURN on port 443
7. **Invite expiry**: Set Redis TTL to 60s in dev, verify `/join/:code` returns graceful 404 after expiry

---

## Phase 2 Roadmap (Post-MVP)
- Persistent chat (Fastify WebSocket + Postgres)
- Auth (Lucia or NextAuth)
- Room password protection
- Host controls: kick participant, mute all, end room
- Emoji reactions via DataChannel
- Picture-in-picture support
- React Native app with LiveKit Native SDK (real mobile screen share via ReplayKit/MediaProjection)
- Migrate SFU to Cloudflare Calls for global anycast PoP distribution
