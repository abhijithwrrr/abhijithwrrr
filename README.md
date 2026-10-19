<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&height=180&color=0:D86A45,100:9B3A1C&text=Abhijith%20Warrier&textBg=false&fontSize=40&fontColor=F2EFE8&animation=fadeIn&fontAlignY=36" width="100%" alt="Abhijith Warrier">
</div>

<div align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Inter&weight=700&size=30&pause=1000&color=D86A45&center=true&vCenter=true&width=760&lines=I+build+offline-first+mobile+apps%3BKotlin+%C2%B7+Compose+%C2%B7+SwiftUI%3BOn-device+AI+%C2%B7+BLE%2FLoRa+%C2%B7+IoT%3BCurrently%3A+AuraSpend+%28open+source%29" width="760" alt="I build offline-first mobile apps">
</div>

<p align="center">
  Mobile engineer building <strong>offline-first Android &amp; iOS</strong> products —
  local-first data, hardware integration, and on-device intelligence.
</p>

<p align="center">
  <a href="https://abhijithwarrier.com/"><img src="https://img.shields.io/badge/abhijithwarrier.com-9B3A1C?style=flat-square&logo=google-chrome&logoColor=white" alt="Portfolio"></a>
  <a href="https://github.com/abhijithwrrr"><img src="https://img.shields.io/badge/GitHub-5C2210?style=flat-square&logo=github&logoColor=white" alt="GitHub"></a>
  <a href="https://linkedin.com/in/abhijith-warrier"><img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white" alt="LinkedIn"></a>
  <a href="mailto:warrierabhijith@gmail.com"><img src="https://img.shields.io/badge/Email-D86A45?style=flat-square&logo=gmail&logoColor=white" alt="Email"></a>
</p>

---

## Now

- **AuraSpend** — open-source expense parsing that runs entirely on-device
- **Bolt v2** — rental operations for power-tool shops, private build
- **ZenTask** — RPG-style task manager, in closed testing

## Selected work

### AuraSpend · on-device expense parsing

<sub><code>Kotlin</code> <code>Compose</code> <code>MVI</code> <code>Room</code> <code>ONNX</code> · Android · AGPL-3.0 · <a href="https://github.com/auraspend/auraspend">source</a> · <a href="https://abhijithwarrier.com/auraspend/">case study</a></sub>

Bank SMS in, structured transactions out — no server, no telemetry, no ads.

**Constraint** — It has to run on mid-range phones, and a wrong call *deletes a real debit*. A 468 MB decoder pushed through the same pipeline removed 8 of 46 real transactions by mistaking them for OTPs.

**Approach** — Sender-routed regex parsers own amount, merchant and date. A 22 MB int8 MiniLM encoder fills only what's left: category, subscription, income-vs-expense. `AiSignalFusion` lets the parser veto the model, and the model may never discard a transaction on its own. The download is consent-gated, resumable and SHA-256 verified.

**Result** — Fully offline, 22 MB instead of 468 MB, zero false deletions across the eval set.

<details>
<summary>Engineering notes</summary>

- Sender-routed parsers per bank (Axis, Canara, SBI) resolve messages that carry both a real amount and a decoy available-limit figure
- Budgets, recurring subscriptions, Canvas-drawn analytics, CSV import/export, Drive backup
- Light, dark and true-black AMOLED themes; AGPL-3.0 with CI on every push

</details>

### Bolt · offline-first rental operations

<sub><code>Kotlin</code> <code>Compose</code> <code>Hilt</code> <code>Room</code> <code>Firebase</code> <code>CameraX</code> · Android · private build · <a href="https://abhijithwarrier.com/bolt/">case study</a></sub>

A business-in-a-box for Indian power-tool shops: rentals, repairs, inventory, CRM and finance.

**Constraint** — Shop floors have unreliable connectivity, and nine entity types have to stay consistent across rentals, repairs, bookings and transactions.

**Approach** — Room is the source of truth. Every write lands locally first and WorkManager reconciles with Firestore in the background. CameraX captures damage evidence at handover, and a community suspicious-contact registry scores repeat-fraud risk across shops.

**Result** — Runs the shop's day-to-day operations end to end. Commercial build, no public listing.

<details>
<summary>Entity model</summary>

Rentals · repairs · inventory · CRM · bookings · transactions · sales · notifications · brands

</details>

### Hydra · gamified hydration tracking

<sub><code>Kotlin</code> <code>Compose</code> <code>Clean Arch</code> <code>Hilt</code> <code>Room</code> <code>Health Connect</code> · Android · 4.9★ · 1,000+ downloads · <a href="https://play.google.com/store/apps/details?id=com.awbuilds.hydra">Google Play</a> · <a href="https://abhijithwarrier.com/hydra/">case study</a></sub>

A hydration tracker that adapts its goal to the weather and keeps reminders alive through Doze.

**Constraint** — Reminders must land on time without a foreground service, and goals have to react to outdoor temperature without draining the battery.

**Approach** — Dual scheduling with WorkManager and AlarmManager so reminders survive Doze. Weather is fetched on a coarse interval and cached, with GPS only when a goal is recalculated. The progress indicator is a three-layer sine wave drawn on Canvas — no animation library, no image assets.

**Result** — 4.9★ across 1,000+ installs, localized into 60+ locales, with Drive backup and Health Connect sync.

**ZenTask** — RPG-style task manager: 100 rank tiers across 11 titles, a quadratic XP engine, four Pomodoro presets, task dependencies, recurring tasks and Drive sync · 7 locales · closed testing · [case study](https://abhijithwarrier.com/zentask/)

## How I build

- **Local-first is the default.** Room is the source of truth; sync is a background concern, never a UI blocker.
- **Deterministic before probabilistic.** Regex and state machines own the facts; models fill gaps and can be overruled.
- **Battery and lifecycle are correctness.** Doze-proof scheduling, process-death recovery, no leaked collectors.
- **Tests that run offline.** No network in unit tests, and Compose UI tests for the paths that actually break.

## Stack

<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://skillicons.dev/icons?i=kotlin,java,swift,androidstudio,xcode,gradle,firebase,git,github,postman,figma,sqlite&perline=12&theme=dark">
    <img src="https://skillicons.dev/icons?i=kotlin,java,swift,androidstudio,xcode,gradle,firebase,git,github,postman,figma,sqlite&perline=12&theme=light" alt="Kotlin, Java, Swift, Android Studio, Xcode, Gradle, Firebase, Git, GitHub, Postman, Figma, SQLite">
  </picture>
</div>

- **Android** — Kotlin, Jetpack Compose, Material 3, Coroutines & Flow, Hilt, Room, WorkManager
- **iOS** — Swift, SwiftUI, UIKit, async/await, Core Bluetooth
- **Architecture** — MVVM, MVI, Clean Architecture, modularisation, SOLID
- **Data & cloud** — Room, DataStore, Retrofit, OkHttp, Firebase, Drive API, Cloudflare R2
- **Hardware & on-device** — USB, LoRa, BLE, firmware parsing, binary decoding, CameraX, Health Connect, ONNX Runtime
- **Testing & delivery** — JUnit, Mockito, Espresso, Compose UI Test, XCTest, GitHub Actions

## Experience

| Period | Role | Company |
|--------|------|---------|
| Nov 2025 – Present | **Mobile App Developer** | Digitide Solutions Ltd. |
| Jun 2022 – Nov 2025 | **Android App Developer** | Primemover Solutions Pvt Ltd. |
| Sep 2021 – Nov 2021 | Data Annotator for AI | Digiyoda Media Pvt Ltd. |

## Activity

<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/contributions-dark.svg">
    <img src="assets/contributions-light.svg" width="100%" alt="Contribution calendar for the last 12 months">
  </picture>

  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/activity-dark.svg">
    <img src="assets/activity-light.svg" width="100%" alt="Contributions by month over the last 12 months">
  </picture>
</div>

---

<p align="center">
  <sub>Kerala, India · Open to remote and hybrid mobile roles · <a href="https://abhijithwarrier.com/">abhijithwarrier.com</a></sub>
</p>
