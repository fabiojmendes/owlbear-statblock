# Owlbear Rodeo Statblock Extension

A highly polished, interactive D&D 5e monster stat block renderer for
[Owlbear Rodeo](https://www.owlbear.rodeo/). This extension allows GMs to view
detailed monster information directly within their VTT, featuring a classic 5e
layout, modern 2024 styling, and powerful interactive rolling capabilities.

## Features

- **Classic 5e Visuals**: A beautiful, parchment-themed stat block with
  authentic typography and fluid scaling.
- **Interactive Rolls**:
  - **Advantage/Disadvantage Support**: Hold **Shift** while clicking to roll
    with Advantage (`2d20kh1`), or **Ctrl/Cmd** to roll with Disadvantage
    (`2d20kl1`).
  - **Attacks**: Click on hit modifiers (e.g., `+7`) or damage formulas (e.g.,
    `2d6 + 4`).
  - **Attributes**: Integrated 3-column grid showing Score, Modifier (MOD), and
    Saving Throw (SAVE) side-by-side—all clickable.
  - **Initiative**: Click the initiative bonus next to AC to roll for turn
    order.
  - **Recharges**: Click on recharge ranges (e.g., `5-6`) to roll a `1d6`
    recharge check.
- **Improved UX**:
  - **Sticky Header**: The monster's name and controls stay visible at the top
    while scrolling.
  - **Minimize/Expand**: Quickly collapse the stat block to just the header to
    save screen space.
  - **5etools Integration**: The monster name links directly to its full entry
    on [5etools](https://5etools.juzam.pro/).
- **Security**: Access is restricted to the **GM role only** to prevent players
  from seeing monster statistics.
- **Multi-Source Data**: Automatically loads and caches monster data from
  multiple JSON bestiaries (5etools compatible).

## How to Use

1. **Select a Token**: Select a single monster token on your Owlbear Rodeo
   scene.
2. **Open the Extension**: Click the Statblock icon in the Owlbear Rodeo
   toolbar.
3. **Interact**: The stat block renders instantly for recognized monsters. Use
   keyboard modifiers (Shift/Ctrl) for quick advantage/disadvantage rolls.

## Technical Details

Built with a focus on performance and developer experience:

- **React + TypeScript**: Type-safe component architecture.
- **Custom Vite Plugin**: Automatically syncs `manifest.json` versions with
  `package.json` and appends a `(DEV)` flag during local development.
- **Custom 5etools Parser**: Robust regex-based parser handling complex tags
  like `{@hit}`, `{@damage}`, `{@recharge}`, `{@actSave}`, and more.
- **Battle Board Integration**: Includes hooks for initializing combat and
  syncing metadata with the Battle Board extension.

## Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Local Development**:
   ```bash
   npm run dev
   ```
3. **Quality Control**: Formatting, linting and import sorting
   ```bash
   npm run check
   ```
4. **Production Build**:
   ```bash
   npm run build
   ```

## License

MIT
