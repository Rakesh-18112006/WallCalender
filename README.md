# Interactive Wall Calendar

A polished, highly interactive React/Next.js component built to simulate the physical aesthetic and tactile feel of a real-world wall calendar. 

> **Live Demo:** [Insert Vercel Link Here]
> **Video Walkthrough:** [Insert Loom/YouTube Link Here]

## ✨ Features & "Stand Out" Implementations

This project satisfies all baseline requirements from the engineering challenge and introduces several advanced UI/UX concepts:

- **Realistic Physical Aesthetics:** Utilizes a custom 3D environment, realistic CSS-based spiral bindings, and a subtle keyframe "breeze" animation (`wall-sway`) to simulate a hanging calendar.
- **Vertical 3D Flipbook Engine:** Leveraged and heavily customized `react-pageflip` (rotated by 90 degrees) to simulate an authentic vertical page-tearing/flipping motion, complete with **synchronized page-turn audio**.
- **Dynamic Theming:** Each month uses a custom data structure to inject beautiful, thematic accent colors mapping exactly to the high-quality hero images.
- **Day Range Selector & State Management:** Users can select start and end date ranges elegantly. Global state is managed efficiently using a custom decoupled vanilla store without heavy framework dependencies, and state is gracefully persisted via `localStorage`.
- **Integrated Sticky Notes System:** A fully functional localized CRUD note-taking feature. Notes are beautifully textured with handwritten web fonts (`Caveat`) and automatically associate themselves with the user's active Date Range selection. 
- **Flawless Responsiveness:** Uses Tailwind CSS to shift the layout intelligently. Desktop features a side-by-side component mapping; mobile collapses into a scrollable, touch-friendly interface with specialized native bottom-navigation controls that bypass frustrating touch-screen clipping issues.

## 🏗 Modular Architecture

The codebase strictly adheres to modern Frontend engineering principles. The architecture isolates concerns to keep the view layer extremely clean:

- `/app/components/`: Reusable, single-responsibility UI (e.g., `MonthContent.tsx`, `DesktopPageUI.tsx`).
- `/app/store/`: Vanilla event-driven state store for global selection/hover states.
- `/app/utils/`: Pure functions for local storage logic and string extractions.
- `/app/mocks/`: Clean extraction of all static configuration data mapping out the UI structures.
- `/app/types/`: Centralized TypeScript interfaces ensuring strict type safety across the board.

## 🚀 Getting Started

First, install the required dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🛠 Tech Stack
- **Framework:** Next.js 14 (App Router) / React
- **Styling:** Tailwind CSS + Vanilla CSS 3D Transforms
- **Animation Engine:** `react-pageflip`
- **Languages:** TypeScript
- **Storage Strategy:** Client-side `localStorage` API integration
