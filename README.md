# Interactive Wall Calendar

A polished, highly interactive React/Next.js application built to simulate the physical aesthetic and tactile feel of a real-world wall calendar. 



## ✨ Features & "Stand Out" Implementations

This project goes beyond a standard date picker and introduces several advanced UI/UX concepts:

- **Realistic Physical Aesthetics:** Utilizes a custom 3D environment, metallic nails, realistic CSS-based spiral bindings, and a subtle keyframe "breeze" animation (`wall-sway` and `calendar-3d-wind`) to simulate a hanging calendar reacting to its environment.
- **Vertical 3D Flipbook Engine:** Leveraged and heavily customized `react-pageflip` (rotated by 90 degrees) to simulate an authentic vertical page-tearing/flipping motion. It features a custom `PrevFlipOverlay` to accurately render backwards flips, complete with **synchronized page-turn audio**.
- **Dynamic Theming & Glassmorphism:** Each month uses a custom data structure to inject beautiful, thematic accent colors matching the high-quality hero image, backed by modern glassmorphic overlays.
- **Smart Date Range & Selection:** Users can select start and end date ranges effortlessly. Selections are smartly scoped—navigating to a new month automatically clears the selection to prevent confusing cross-month artifacts.
- **Integrated Sticky Notes System:** A fully functional localized CRUD note-taking feature. Notes automatically associate themselves with the user's active Date Range selection. It includes comprehensive edge-case handling, such as scalable success/error toast notifications when users forget to select a date.
- **Smart Scroll Propagation:** Custom event listeners intercept scroll events within the Notes panel. The `smartWheel` logic allows users to easily read their notes, and seamlessly cascades leftover scroll momentum into full-page calendar turns.
- **Flawless Responsiveness:** Uses intelligent layout shifts. Desktop features a side-by-side component mapping; mobile collapses into a scrollable interface with specialized native bottom-navigation controls and touch-gesture support (swipe up/down) to flip months.

## 🏗 Modular Architecture

The codebase strictly adheres to modern Frontend engineering principles. The architecture isolates concerns into highly focused, reusable modules:

- `/app/components/`: Reusable, single-responsibility UI components (`MonthContent.tsx`, `AttachmentSystem.tsx`, `SpiralRings.tsx`, `MobileNavigation.tsx`).
- `/app/store/`: Vanilla event-driven state store for global selection/hover states, allowing inter-component communication without heavy framework dependencies.
- `/app/utils/`: Pure functions handling LocalStorage CRUD operations and text parsing logic.
- `/app/mocks/`: Clean extraction of all static configuration data mapping out the UI structures.
- `/app/types/`: Centralized TypeScript interfaces ensuring strict type-safety across the codebase.

## 🚀 Getting Started

First, install the required dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. You can use your keyboard arrows, mouse wheel, or intuitive click-and-drag to interact with the calendar!

## 🛠 Tech Stack
- **Framework:** Next.js 14 (App Router) / React
- **Styling:** Tailwind CSS + Custom CSS Variables + Advanced 3D Transforms
- **Animation Engine:** `react-pageflip`
- **Languages:** TypeScript
- **Storage:** Client-side `localStorage` API integration
