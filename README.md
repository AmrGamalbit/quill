# Quill

## Overview

An offline-first, privacy-focused social journaling app. Create a diary, invite friends, and journal together.

## Screenshots

<p float="left">
  <img src="assets/images/screenshots/screen1.jpg" width="250" alt="Screen 1" />
  <img src="assets/images/screenshots/screen2.jpg" width="250" alt="Screen 2" />
  <img src="assets/images/screenshots/screen3.jpg" width="250" alt="Screen 3" />
</p>

## Features

- Create diaries and write entries, all available offline and stored in a local database
- View diary entries and revisit memories

## Upcoming Features

These features are planned but not yet implemented.

- Shared diaries: get invited by friends or invite them, and have a safe space to write and view each other's entries
- End-to-end encryption: sharing diaries requires a secure protocol to help ensure reliability, so we are planning to secure data from bad actors who want to exploit it
- More formats supported: we are aiming to support adding images and audio recordings, and support rich styling in the editor

The diagram below shows the planned design for encrypted syncing once this feature is implemented:

```mermaid
flowchart LR
    subgraph C1["Client 1"]
        C1db[(Local DB)]
        C1keys["Private key + Public key"]
    end

    subgraph BE["Backend (Supabase)"]
        BEkeys[(Public key directory)]
        BEwrapped[(Wrapped diary keys)]
        BEdata[(Ciphertext store)]
    end

    subgraph C2["Client 2"]
        C2db[(Local DB)]
        C2keys["Private key + Public key"]
    end

    C1keys -->|register public key| BEkeys
    C2keys -->|register public key| BEkeys

    BEkeys -->|fetch member's public key| C1keys

    C1keys -->|wrap diary key with member's public key| BEwrapped
    BEwrapped -->|download wrapped diary key| C2keys

    C1db -->|encrypt entry with diary key, upload| BEdata
    C2db -->|encrypt entry with diary key, upload| BEdata

    BEdata -->|download, decrypt with diary key| C1db
    BEdata -->|download, decrypt with diary key| C2db
```

## Tech Stack

- **React Native + Expo**
- **Expo Router** — used for navigation between screens
- **TypeScript**
- **Local database**: SQLite via `expo-sqlite`
- **Rich text editor**: `10tap-editor` — used for implementing the editor

---

**Curious to learn more?** See [ARCHITECTURE.md](./ARCHITECTURE.md) for the app's architecture, data models, and more.
