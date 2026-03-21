import { describe, it, expect } from 'vitest';
import { resolveMonster } from '../src/utils/copy';

describe('resolveMonster wildcard resolution', () => {
  it('should apply replaceTxt to all properties when using the "*" wildcard', async () => {
    const base = {
      name: "Base Creature",
      trait: [{ name: "Base Trait", entries: ["Uses base power."] }],
      action: [{ name: "Base Action", entries: ["Strikes with base force."] }]
    };

    const derived = {
      name: "Derived Creature",
      _copy: {
        name: "Base Creature",
        _mod: {
          "*": {
            mode: "replaceTxt",
            replace: "base",
            with: "mega"
          }
        }
      }
    };

    const mockGet = async (name: string) => name === "Base Creature" ? base : undefined;
    const resolved = await resolveMonster(derived, mockGet);

    // name is overridden by derived, but trait and action entries should be modified
    expect(resolved.trait[0].entries[0]).toBe("Uses mega power.");
    expect(resolved.action[0].entries[0]).toBe("Strikes with mega force.");
  });
});
