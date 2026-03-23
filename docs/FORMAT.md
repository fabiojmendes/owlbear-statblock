# Custom Pack Formatting Guide

Game Masters can upload custom `.json` files to add their own monsters to the
Owlbear Statblock extension. This guide explains how to format those files.

## Basic Structure

The easiest way to upload monsters is to provide a JSON array containing one or
more monster objects. Alternatively, you can provide an object containing a
`"monster"` array.

```json
[
  {
    "name": "Custom Goblin",
    "size": ["S"],
    "type": "humanoid",
    "alignment": ["N", "E"],
    "ac": [15],
    "hp": {
      "average": 7,
      "formula": "2d6"
    },
    "speed": {
      "walk": 30
    },
    "str": 8,
    "dex": 14,
    "con": 10,
    "int": 10,
    "wis": 8,
    "cha": 8,
    "passive": 10,
    "languages": ["Common", "Goblin"],
    "cr": "1/4",
    "action": [
      {
        "name": "Scimitar",
        "entries": [
          "{@atk mw} {@hit 4} to hit. {@h} 5 ({@damage 1d6 + 2}) slashing damage."
        ]
      }
    ]
  }
]
```

## Required Fields

To successfully validate and upload a monster, the following fields must be
present:

- **`name`** (String): The exact name you will use for the token on the map
  (case-insensitive).
- **`size`** (Array of Strings): Usually a single letter representing the size
  (`T` = Tiny, `S` = Small, `M` = Medium, `L` = Large, `H` = Huge, `G` =
  Gargantuan).
- **`type`** (String or Object): The creature's type (e.g., `"humanoid"`,
  `"beast"`, `"dragon"`).
- **`alignment`** (Array of Strings): The alignment notation (`L` = Lawful, `C`
  = Chaotic, `N` = Neutral, `G` = Good, `E` = Evil, `U` = Unaligned, `A` = Any).
  E.g., Lawful Evil is `["L", "E"]`.
- **`ac`** (Array): The armor class. Usually an array with a single number
  `[15]`.
- **`hp`** (Object): Must contain `average` (Number) and `formula` (String) for
  hit points.
- **`speed`** (Object): Usually contains `"walk": number`. Can also contain
  `"fly"`, `"swim"`, `"climb"`, etc.
- **`str`, `dex`, `con`, `int`, `wis`, `cha`** (Numbers): The core ability
  scores (e.g., `14`, not `+2`).
- **`passive`** (Number): Passive Perception score.
- **`cr`** (String): Challenge Rating (e.g., `"1/4"`, `"2"`, `"15"`).

## Optional Sections

You can add various optional sections to flesh out the stat block:

- **`save`** (Object): Saving throw modifiers (e.g., `{"dex": 4, "wis": 2}`).
- **`skill`** (Object): Skill modifiers (e.g.,
  `{"perception": 4, "stealth": 6}`).
- **`senses`** (Array of Strings): E.g., `["Darkvision 60 ft."]`
- **`languages`** (Array of Strings): E.g., `["Common", "Goblin"]`
- **`vulnerable`, `resist`, `immune`, `conditionImmune`** (Array of Strings):
  Defenses.
- **`trait`**, **`action`**, **`bonus`**, **`reaction`**, **`legendary`** (Array
  of Objects): Each object should have a `"name"` and `"entries"` (an array of
  strings representing the paragraphs of text).
- **`spellcasting`** (Array of Objects): Defines innate or class-based
  spellcasting.

## Interactive Tags

Within any text block (like the `entries` array in an action), you can use
special `{@tag}` syntax to create interactive buttons and formatted text in the
UI:

- `{@atk mw}` -> Renders as _Melee Weapon Attack:_
- `{@hit 5}` -> Creates a clickable button to roll a `d20+5`.
- `{@damage 1d6 + 2}` or `{@dice 1d6 + 2}` -> Creates a clickable button to roll
  damage or dice.
- `{@h}` -> Renders as _Hit:_
- `{@dc 15}` -> Renders as DC 15.
- `{@actSave str}` -> Renders as _Strength Saving Throw_.
- `{@actSaveFail}` -> Renders as _Failure:_.
- `{@actSaveSuccess}` -> Renders as _Success:_.
- `{@recharge 5}` -> Creates a clickable recharge dice button (Recharge 5-6).
- `{@condition blinded}` / `{@spell fireball}` -> Bolds the text.

> [!TIP]
> You can find hundreds of real-world examples of how to format complex
> monsters, spells, and traits in the built-in
> [bestiary.json](../public/data/bestiary.json) file.

---

## Advanced: Using `_copy`

If you are creating variations of existing monsters, you do not need to rewrite
their entire stat block. You can use the `_copy` attribute to inherit all
properties from another monster and apply specific modifications.

For example, to create a "Goblin Brawler" based on the standard Goblin but with
an additional "Club" action:

```json
[
  {
    "name": "Goblin Brawler",
    "_copy": {
      "name": "Goblin",
      "_mod": {
        "action": {
          "mode": "appendArr",
          "items": {
            "name": "Club",
            "entries": [
              "{@atk mw} {@hit 4} to hit. {@h} 4 ({@damage 1d4 + 2}) damage."
            ]
          }
        }
      }
    },
    "hp": {
      "average": 12,
      "formula": "3d6 + 2"
    }
  }
]
```

In this example:

1. **Copy** all base statistics from the "Goblin".
2. **Override** the `hp` directly by defining it at the top level.
3. **Modify** the `action` array using `appendArr` to add a new "Club" attack
   without removing the original "Scimitar" or "Shortbow" actions.

_Note: The base monster referenced in `_copy.name` must exist either within the
same JSON file, in previously uploaded custom packs, or in the core bestiary._
