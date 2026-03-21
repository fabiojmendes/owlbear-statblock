import { describe, it, expect } from 'vitest';
import { resolveMonster } from '../src/utils/copy';

describe('resolveMonster unit tests', () => {
  const mockGet = async (name: string) => {
    const monsters: Record<string, any> = {
      "Base": {
        name: "Base",
        hp: 10,
        str: 10,
        trait: [{ name: "T1", entries: ["E1"] }],
        action: [{ name: "A1", entries: ["E1"] }]
      },
      "Middle": {
        name: "Middle",
        _copy: {
          name: "Base",
          _mod: {
            hp: { mode: "scalarAdd", scalar: 5 },
            trait: { mode: "appendArr", items: { name: "T2", entries: ["E2"] } }
          }
        }
      }
    };
    return monsters[name];
  };

  it('should handle appendArr (single and multiple)', async () => {
    const derived = {
      name: "Derived",
      _copy: {
        name: "Base",
        _mod: {
          trait: [
            { mode: "appendArr", items: { name: "T2", entries: ["E2"] } },
            { mode: "appendArr", items: [{ name: "T3", entries: ["E3"] }, { name: "T4", entries: ["E4"] }] }
          ]
        }
      }
    };
    const resolved = await resolveMonster(derived, mockGet);
    expect(resolved.trait).toHaveLength(4);
    expect(resolved.trait[1].name).toBe("T2");
    expect(resolved.trait[3].name).toBe("T4");
  });

  it('should handle replaceArr', async () => {
    const derived = {
      name: "Derived",
      _copy: {
        name: "Base",
        _mod: {
          action: { mode: "replaceArr", items: { name: "New Action", entries: ["New Entry"] } }
        }
      }
    };
    const resolved = await resolveMonster(derived, mockGet);
    expect(resolved.action).toHaveLength(1);
    expect(resolved.action[0].name).toBe("New Action");
  });

  it('should handle removeArr (by name)', async () => {
    const derived = {
      name: "Derived",
      _copy: {
        name: "Base",
        _mod: {
          trait: { mode: "removeArr", items: "T1" }
        }
      }
    };
    const resolved = await resolveMonster(derived, mockGet);
    expect(resolved.trait).toHaveLength(0);
  });

  it('should handle scalarAdd and scalarMult', async () => {
    const derived = {
      name: "Derived",
      _copy: {
        name: "Base",
        _mod: {
          hp: { mode: "scalarAdd", scalar: 10 },
          str: { mode: "scalarMult", scalar: 2 }
        }
      }
    };
    const resolved = await resolveMonster(derived, mockGet);
    expect(resolved.hp).toBe(20);
    expect(resolved.str).toBe(20);
  });

  it('should handle recursive resolution', async () => {
    const derived = {
      name: "Final",
      _copy: {
        name: "Middle",
        _mod: {
          hp: { mode: "scalarMult", scalar: 2 }
        }
      }
    };
    // Base(10) -> Middle(10+5=15) -> Final(15*2=30)
    const resolved = await resolveMonster(derived, mockGet);
    expect(resolved.hp).toBe(30);
    expect(resolved.trait).toHaveLength(2);
    expect(resolved.trait[1].name).toBe("T2");
  });

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

    const mockLocalGet = async (name: string) => name === "Base Creature" ? base : undefined;
    const resolved = await resolveMonster(derived, mockLocalGet);

    expect(resolved.trait[0].entries[0]).toBe("Uses mega power.");
    expect(resolved.action[0].entries[0]).toBe("Strikes with mega force.");
  });
});
