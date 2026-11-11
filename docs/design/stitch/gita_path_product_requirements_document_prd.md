# Product Requirements Document (PRD) & Product Brief
## **Project:** Gita Path — Everyday Sacred Wisdom (10-Minute Daily Sadhana)
**Document Version:** 1.0.0 • **Status:** Approved / Production-Ready Baseline • **Target Ecosystem:** iOS, Android & Web Admin Studio

---

## 1. Executive Summary & Vision

### 1.1 Mission
**Gita Path** is a daily habit and spiritual sanctuary mobile application designed to make the timeless wisdom of the *Bhagavad Gita* accessible, practical, and personally transformative for modern seekers in just **10 mindful minutes a day**. 

Rather than treating the scripture as an intimidating scholarly text, Gita Path distills all 18 Chapters and 700 canonical verses into an actionable, contemplative daily habit loop. It bridges ancient Vedic scholarship with modern habit psychology, featuring 22-language constitutional inclusion, AI pastoral guidance with strict doctrinal guardrails, an intergenerational family circle, and a dedicated, child-safe sanctuary mode called **"Moru the Peacock"**.

### 1.2 Core Value Proposition
- **Micro-Sadhana (10 Mins/Day):** Verse recitation, syllable-by-syllable Sanskrit phonetic chant training at 432 Hz, word-by-word grammatical breakdowns (*Pada-Artha*), and concrete modern workplace/family applications.
- **Constitutional Linguistic Equity:** Full coverage across all 22 official languages of India (Eighth Schedule) with tri-script toggles (Devanagari, Roman/IAST, and Regional Scripts).
- **Theologically Grounded AI Companion:** "Ask the Gita" conversational guidance grounded in canonical commentaries (Adi Shankara, Ramanuja, Madhva), backed by an enterprise theological guardrails engine.
- **Intergenerational Sangha & Kids Mode:** A dual-interface architecture—dignified, serene adult contemplation on one side, and whimsical, gamified storytelling with Moru the Peacock on the other.

---

## 2. Target Personas & User Archetypes

| Persona | Demographics & Mindset | Core Jobs-to-be-Done (JTBD) | Key Features Leveraged |
| :--- | :--- | :--- | :--- |
| **Arjun (The Stressed Professional)** | 28–42 yrs, Tech/Corporate, urban, high stress, time-poor | *"Help me manage anxiety, find clarity on my duty (Svadharma), and perform work without obsessive attachment to results (Nishkama Karma)."* | Today 10-Min Loop, Interactive Chant Practice, "Ask the Gita" Guidance AI, Daily Streak Anchor |
| **Meera (The Intentional Parent)** | 32–45 yrs, parent of children aged 4–9, diaspora or metro | *"Help me pass our cultural wisdom and moral values to my children in a joyful, guilt-free, screen-healthy environment."* | Kids Mode ("Moru the Peacock"), Story Done Celebrations, Shloka Sing-Along, Parent PIN Gate |
| **Dada Ji (The Elder Practitioner)** | 65+ yrs, retired, devout seeker, prefers regional language | *"Provide an authentic, large-type, distraction-free reading and audio chanting sanctuary in my native tongue (e.g., Marathi/Bengali)."* | 22-Language Matrix, Regional Scripts, Pandit Ji Studio Chants (432 Hz), Offline Mode |
| **Dr. Radhakrishnan (Lead Sanskrit Scholar / Admin)** | Scholarly trustee, Vedic council reviewer | *"Ensure 100% orthographic accuracy, prevent AI hallucinations or doctrinal distortion, and monitor audio alignment."* | Desktop Admin Studio, Canonical Sanskrit Lockbox, AI Guardrails Engine |

---

## 3. Product Architecture & Ecosystem Map

The Gita Path platform spans **46 high-fidelity screens** organized across three primary surfaces:

```
                                  ┌───────────────────────────────┐
                                  │      Gita Path Ecosystem      │
                                  └───────────────┬───────────────┘
                                                  │
       ┌──────────────────────────────────────────┼──────────────────────────────────────────┐
       │                                          │                                          │
       ▼                                          ▼                                          ▼
┌─────────────────────────────┐        ┌─────────────────────────────┐        ┌─────────────────────────────┐
│ 1. Seeker Mobile Sanctuary  │        │ 2. Kids Mode ("Moru")       │        │ 3. Desktop Admin Studio     │
│    (Screens 1–33)           │        │    (Screens 34–43)          │        │    (Screens 44–46)          │
│ • Sacred Clarity Theme      │        │ • Moru Peacock Theme        │        │ • Desktop 1280px Grid       │
│ • Onboarding & Matrix       │        │ • Child Profile & PIN Gate  │        │ • Canonical Content Library │
│ • 10-Min Daily Sadhana Loop │        │ • Illustrated Katha Tales   │        │ • Verse & Audio Editor      │
│ • Study & Interactive Chant │        │ • Sing Shloka & Match Game  │        │ • AI Guardrail Rule Engine  │
│ • Visual Narrative Player   │        │ • Sticker Album & Certs     │        │ • Theological Review Queue  │
│ • Family Circle & Sangha    │        │ • Parent Screen-Time Limits │        │ • 432 Hz Audio Mastering    │
│ • Profile & Account Dissolve│        │ • 100% Ad-Free, COPPA-Safe  │        │                             │
└─────────────────────────────┘        └─────────────────────────────┘        └─────────────────────────────┘
```

---

## 4. Key Features & Functional Requirements

### 4.1 Onboarding & Linguistic Sovereignty (Screens 1–7)
- **FR-ONB-01: Frictionless Auth:** Mobile OTP login with automatic SMS/WhatsApp call fallback. Includes a **3-Day Zero-Credential Guest Pass** to eliminate conversion drop-off.
- **FR-ONB-02: Intent Calibration:** Seeker selects daily study rhythm (5 min / 10 min / 15 min) and top life anchors (Stress/Anxiety, Career/Duty, Relationships, Daily Discipline, Philosophy).
- **FR-ONB-03: 22-Language Matrix:**
  - Full catalog of all 22 official Eighth Schedule languages plus English.
  - Script switcher: Devanagari (देवनागरी), Roman/IAST transliteration, and native regional alphabets.
  - Audio narrator toggle: Traditional *Pandit Ji Vedic Chanting* vs. *Gentle Modern Contemporary*.

### 4.2 The 10-Minute Daily Habit Loop (Screens 8–12, 81, 83, 85, 3)
- **FR-LOOP-01: Verse of the Day:** Sequential chapter progression (starting with Chapter 2: Sankhya Yoga) with daily completion checkmarks and streak trackers.
- **FR-LOOP-02: Interactive Chant Practice (Screen 3):**
  - Millisecond-accurate word/syllable karaoke spotlighting in Devanagari and IAST.
  - Tap-to-chant microphone recording with on-device vocal pitch resonance scoring (e.g., *96% Satva Harmony*).
  - Clickable 11-bead Japa Mala repetition counter.
  - Dynamic tempo cycler: 0.75x Slow (🐢), 1.0x Flow (🪷), 1.25x Swift (⚡).
- **FR-LOOP-03: Deep Study & Pada-Artha (Screen 85):**
  - Grammatical sandhi breakdown, case declensions, and philosophical commentaries contrasting classical bhashyas (Shankara, Ramanuja) with contemporary workplace metaphors.
- **FR-LOOP-04: "Ask the Gita" Guidance AI (Screen 79):**
  - Conversational query interface with suggested prompts (*"Dealing with imposter syndrome"*, *"Anger at a coworker"*).
  - Answers cite specific chapter and verse numbers with collapsible verification links.

### 4.3 Visual Narratives & Video Player (Screens 67 & 69)
- **FR-STR-01: Cinematic Narrative Hub:** Episodic storytelling broken into bite-sized chapters (e.g., *"Arjuna Lays Down His Bow"*).
- **FR-STR-02: Dedicated Story Player:** Full-screen immersive player with audio-synced transcript, verse bookmarks, and contemplative pause reflections.

### 4.4 Family Circle & Sangha (Screens 61, 63, 65)
- **FR-FAM-01: Shared Circles:** Private family/friend circles with collective streak counters, shared daily reflections, and milestone feeds.
- **FR-FAM-02: Frictionless Invite & Join:** 6-character sanctuary codes and deep links for immediate circle onboarding.

### 4.5 Kids Mode: "Moru the Peacock" (Screens 25, 27, 29, 31, 33, 35, 37, 39, 41, 43, 45)
- **FR-KID-01: Safety & Access Gate:** COPPA/GDPR-K compliant. Restricted behind a 4-digit Parent PIN Gate with a multiplication challenge fallback.
- **FR-KID-02: Playful Interactive Chanting:** "Sing Shloka" with animated bouncing ball guidance, pitch-friendly sing-alongs, and celebration confetti.
- **FR-KID-03: Sacred Match Game (Screen 25):** Animated tile-matching memory puzzle pairing sacred symbols, virtues, and Moru characters with haptic and audio feedback.
- **FR-KID-04: Positive Reinforcement:** "Aarav's Sticker Book" and printable "Milestone Certificate" for completing chapters and stories.
- **FR-KID-05: Parent Control Zone (Screen 27):** Configurable daily screen-time caps (5–20 mins), bedtime auto-lock, and offline download management.

### 4.6 Offline, Errors & Ethical Sovereignty (Screens 47, 49, 51, 53)
- **FR-OFF-01: Offline Sanctuary:** Complete offline caching of current chapter verses, translations, and Pandit Ji chanting masters.
- **FR-ERR-02: Mindful Recovery:** Zen-inspired reconnection states offering calming Gita verses (*"Equanimity is Yoga"*) rather than alarming error codes.
- **FR-PRV-03: Dissolve Sadhana Archive (Screen 53):** Transparent, ethical account deletion permitting users to download a full PDF/JSON archive of their notes, bookmarks, and streaks before complete server-side data purging.

### 4.7 Desktop Admin Studio & Theological Governance (Screens 5, 7, 9)
- **FR-ADM-01: Canonical Content & Asset Library (Screen 9):**
  - Complete index of all 700 verses across 18 chapters with audio master statuses (432 Hz) and 22-language translation readiness pills.
- **FR-ADM-02: Verse & Curriculum Editor (Screen 7):**
  - Cryptographically hashed Sanskrit lockbox (`#SHA256-700-047`) preventing accidental canonical drift.
  - Interactive phonetic breakdown and multi-language Pada-Artha table editor.
  - Multi-track audio scrubber with millisecond lyric synchronization.
  - Kids mode story attachment hook.
- **FR-ADM-03: AI Theological Guardrails Engine (Screen 5):**
  - Real-time quarantined answer review queue.
  - Triple-check validation: Hallucination blocking, scripture citation verification, and Sanctuary Pastoral Voice scoring (preventing cold ascetic detachment or fatalism).
  - Dynamic rule authoring interface with regex triggers and prompt boundary injections.

---

## 5. Design Systems & Visual Specifications

The product utilizes two distinct, highly tailored design systems:

```
┌───────────────────────────────────────┬───────────────────────────────────────┐
│        1. Sacred Clarity              │        2. Moru the Peacock            │
│      (Adult & General Seeker)         │       (Kids Mode Sanctuary)           │
├───────────────────────────────────────┼───────────────────────────────────────┤
│ • Primary: Deep Indigo (#24205A)      │ • Background: Warm Cream (#FFF9EE)    │
│ • Accent: Sacred Saffron (#C2410C)    │ • Primary: Peacock Blue (#1E40AF)     │
│ • Secondary: Peacock Teal (#0F5E63)   │ • Accent: Sunny Mango (#FFC94D)       │
│ • Canvas: Soft Milk (#F8F9FD)         │ • Contrast: Leaf Green (#16A34A)      │
│ • Typography: Sora (Display/Headings) │ • Typography: Sora Rounded & Chubby   │
│   paired with Inter (Body/Lexical)    │ • Geometry: rounded-3xl & squircle    │
│ • Geometry: 8px–12px radius, clean    │ • Targets: 60px–72px tactile hit-areas│
│ • Mood: Meditative, crisp, reverent   │ • Mood: Playful, warm, joyful, safe   │
└───────────────────────────────────────┴───────────────────────────────────────┘
```

---

## 6. Technical & Non-Functional Requirements

### 6.1 Performance & Latency
- **NFR-PERF-01: Cold Startup:** Native splash to interactive home screen in `<1.2 seconds`.
- **NFR-PERF-02: Chanting Audio Sync:** On-device vocal pitch detection and karaoke highlight latency `<120ms`.
- **NFR-PERF-03: Offline Footprint:** Core chapter bundle (text, audio, commentary) compressed to `<25MB` per active chapter.

### 6.2 Privacy, Data Protection & Children's Safety
- **NFR-SEC-01: Voice Processing:** Chanting microphone input is processed **strictly on-device**. No user audio recordings or vocal telemetry leave the device.
- **NFR-SEC-02: Zero Advertising / Zero Monetization of Data:** The platform is 100% ad-free; user progress and reflection journal entries are client-side encrypted.
- **NFR-SEC-03: COPPA/GDPR-K Compliance:** Kids Mode has no social mechanics, no outbound internet links, no external chat, and no analytics tracking.

### 6.3 Accessibility (a11y)
- **NFR-A11Y-01:** Minimum target touch sizes: `48x48px` on adult mobile; `60x60px` in Kids Mode.
- **NFR-A11Y-02:** Contrast compliance: AAA standard across all body copy and Sanskrit verses (`>7:1` ratio against light backgrounds).
- **NFR-A11Y-03:** Screen reader support with phonetically structured ARIA labels for Sanskrit ligatures and IAST diacritics.

---

## 7. Success Metrics & Key Performance Indicators (KPIs)

1. **Habit Stickiness (D30 Retention):** Target `>42%` of onboarding seekers completing at least 4 out of 7 daily 10-minute sadhana loops per week.
2. **Chanting Completion Rate:** Target `>70%` of seekers who begin a verse practice completing all 11 Japa Mala repetitions.
3. **Linguistic Adoption:** Over `50%` of daily active users engaging in non-English Indian regional languages or Devanagari script.
4. **Theological Safety Efficacy:** `<0.1%` AI hallucination flag rate in the Admin Review Queue; zero ungrounded scriptural citations delivered to seekers.
5. **Family Sangha Expansion:** Average circle size of `3.2 members`, fostering intergenerational daily engagement.

---

## 8. Rollout Plan & Milestones

- **Phase 1: Alpha Pilot (Chapters 1 & 2):** Launch Core Daily Loop, Interactive Chant Player, and Devanagari/Hindi/English language matrix to 1,000 beta seekers.
- **Phase 2: Kids Mode & Family Circles:** Introduce *Moru the Peacock* storytelling, Sing Shloka, Match Game, and Family Circles.
- **Phase 3: Constitutional 22-Language Scale:** Roll out Phase 2 and Phase 3 regional languages (Tamil, Marathi, Bengali, Telugu, Gujarati, Kannada, Odia, Punjabi, Malayalam, etc.).
- **Phase 4: Admin Studio & Enterprise AI Guardrails:** Deploy production desktop studio for scriptural scholars and automated theological monitoring.