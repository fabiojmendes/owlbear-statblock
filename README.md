# Owlbear Rodeo Statblock Extension

A highly polished, interactive D&D 5e monster stat block renderer for
[Owlbear Rodeo](https://www.owlbear.rodeo/). This extension allows GMs to view
detailed monster information directly within their VTT, featuring a classic 5e
layout and interactive rolling capabilities.

## Features

- **Classic 5e Visuals**: A beautiful, parchment-themed stat block that mimics
  the look and feel of the official monster manuals.
- **Interactive Rolls**:
  - Click on **Attack Hit Modifiers** (e.g., `+7`) to roll to hit.
  - Click on **Damage Formulas** (e.g., `2d6 + 4`) to roll damage.
  - Click on **Attribute Modifiers** or **Saving Throws** to roll ability checks
    or saves.
  - Click on **Initiative** to roll for turn order.
- **Sticky Header**: The monster's name and a close icon stay visible at the top
  of the window while you scroll through long lists of traits and actions.
- **Dynamic 2024 Grid**: Features the new 3-column attribute grid showing Score,
  Modifier (MOD), and Saving Throw (SAVE) side-by-side.
- **Multi-Source Data**: Supports loading monster data from multiple JSON
  bestiaries (5etools compatible format).
- **Responsive Layout**: Designed to fit perfectly within the Owlbear Rodeo
  popover system.

## How to Use

1. **Select a Token**: Select a single monster token on your Owlbear Rodeo
   scene.
2. **Open the Extension**: Click the Statblock icon in the Owlbear Rodeo
   toolbar.
3. **Interact**: If the token has the required metadata (`monster` data in JSON
   format), the stat block renders instantly. Click on any blue/red highlighted
   number to trigger a roll.

## Technical Details

This extension is built using:

- **React + TypeScript**: For a robust and type-safe UI.
- **Vite**: For fast development and optimized production builds.
- **Owlbear Rodeo SDK**: To communicate with the VTT, handle selections, and
  broadcast rolls.
- **Custom 5etools Parser**: A regex-based parser that converts special tags
  (like `{@hit 7}` or `{@damage 2d6+4}`) into interactive UI elements.

### Metadata Format

The extension expects the monster data to be stored in the item's metadata under
the key `${ID}/monster`. The format should follow the standard 5etools JSON
structure.

## Development

To run the project locally:

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Linter and formatter
   ```bash
   npm run format && npm run check
   ```
5. Build for production:
   ```bash
   npm run build
   ```

## License

MIT
