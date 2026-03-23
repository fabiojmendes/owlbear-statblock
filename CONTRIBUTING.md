# Contributing to Owlbear Statblock

Thank you for your interest in contributing! This document provides an overview
of the technical stack, how to get the project running locally, and the general
architecture of the extension.

## Tech Stack

- **React 19**: The core UI library.
- **Vite**: The build tool and development server.
- **TypeScript**: For static typing across the application.
- **Zod**: Used for runtime schema validation of the bestiary JSON files.
- **IndexedDB (via `idb`)**: Used to store custom bestiary packs locally in the
  browser.
- **Owlbear Rodeo SDK**: The official SDK used to interact with the virtual
  tabletop.

## Local Development Setup

To run the project locally, you will need [Node.js](https://nodejs.org/)
installed.

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   This will start a Vite dev server. You can then add this local URL (usually
   `http://localhost:5173`) as a custom extension in your Owlbear Rodeo room for
   testing.

3. **Linting and Formatting**: Use [Biome](https://biomejs.dev/) for fast
   formatting and linting.
   ```bash
   npm run check
   ```

4. **Running Tests**: Tests are written using `vitest` and `jsdom` to ensure the
   parsing logic remains accurate.
   ```bash
   npm test
   ```

5. **Building for Production**:
   ```bash
   npm run build
   ```

## Architecture Overview

### `src/main.tsx` & `src/App.tsx`

`main.tsx` is the entry point for the React application. It wraps `App.tsx` in a
`PluginGate` which ensures that the application only renders once the Owlbear
Rodeo SDK is fully initialized (`OBR.isReady`).

### `src/hooks/useMonsterSync.ts`

This hook contains the core business logic of the extension. When initialized by
a Game Master, it:

1. Fetches the core bestiary data from `public/data/bestiary.json`.
2. Listens to changes on the Owlbear Rodeo scene via `OBR.scene.items.onChange`.
3. Looks for new tokens added to the `CHARACTER` layer that do not yet have a
   stat block attached.
4. Checks the token's name against custom packs in IndexedDB, then against the
   core bestiary.
5. Resolves, parses (via Zod), and injects the monster data into the token's
   metadata.

### Data Storage & `IndexedDB`

Custom packs are parsed using Zod (`src/utils/schema.ts`) to ensure structural
integrity before they are saved to the browser's IndexedDB (`src/utils/idb.ts`).
Save the raw JSON data so that internal cross-references (like `_copy`) remain
intact, and then resolve them at runtime.

### Text Parsing (`src/utils/parser.tsx`)

The standard 5e bestiary format includes many inline tags (e.g., `{@atk mw}`,
`{@hit 5}`, `{@damage 1d6+2}`). The `parseText` function uses regex to find
these tags and replaces them with interactive React components, such as bold
text or clickable buttons that trigger dice rolls.

### Integrations (Dice+)

The extension integrates with Dice+ by detecting if the user clicks a
`.rollable` button. In `src/utils/roll.ts`, the `handleD20RollClick` and
`handleRollClick` functions format standard RPG dice notation (like `1d20+5`)
and use the Owlbear Rodeo SDK's broadcast or dice APIs to send those rolls to
the table, triggering the 3D dice tray if the Dice+ extension is active.
