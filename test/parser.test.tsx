/**
 * @vitest-environment jsdom
 */
import React from "react";
import { describe, expect, it } from "vitest";
import { parseText } from "../src/utils/parser";

function getElement(node: React.ReactNode): React.ReactElement<any> {
  return node as React.ReactElement<any>;
}

describe("parseText", () => {
  it("should return an empty array for an empty string", () => {
    expect(parseText("")).toEqual([]);
  });

  it("should handle plain text", () => {
    const result = parseText("Just a normal string");
    expect(result).toHaveLength(1);
    const el = getElement(result[0]);
    expect(el.type).toBe(React.Fragment);
    expect(el.props.children).toBe("Just a normal string");
  });

  it("should parse attack tags correctly", () => {
    const result = parseText("{@atk mw}");
    expect(result).toHaveLength(1);
    const el = getElement(result[0]);
    expect(el.type).toBe("em");
    expect(el.props.children).toBe("Melee Weapon Attack:");
  });

  it("should parse hit tags correctly", () => {
    const result = parseText("{@hit 5}");
    expect(result).toHaveLength(1);
    const el = getElement(result[0]);
    expect(el.type).toBe("button");
    expect(el.props.className).toBe("rollable");
    expect(el.props.children).toBe("+5");

    const resultNegative = parseText("{@hit -2}");
    const elNeg = getElement(resultNegative[0]);
    expect(elNeg.props.children).toBe("-2");
  });

  it("should parse damage and dice tags correctly", () => {
    const damageResult = parseText("{@damage 1d6 + 2}");
    expect(damageResult).toHaveLength(1);
    const dmgEl = getElement(damageResult[0]);
    expect(dmgEl.type).toBe("button");
    expect(dmgEl.props.className).toBe("rollable");
    expect(dmgEl.props.children).toBe("1d6 + 2");

    const diceResult = parseText("{@dice 2d4}");
    const diceEl = getElement(diceResult[0]);
    expect(diceEl.props.children).toBe("2d4");
  });

  it("should parse hit indicator correctly", () => {
    const result = parseText("{@h}");
    expect(result).toHaveLength(1);
    const el = getElement(result[0]);
    expect(el.type).toBe("em");
    expect(el.props.children).toBe("Hit:");
  });

  it("should parse DC tags correctly", () => {
    const result = parseText("{@dc 15}");
    expect(result).toHaveLength(1);
    const el = getElement(result[0]);
    expect(el.type).toBe(React.Fragment);
    expect(el.props.children).toBe("DC 15");
  });

  it("should parse recharge tags correctly", () => {
    const result = parseText("{@recharge 5}");
    expect(result).toHaveLength(1);
    const el = getElement(result[0]);
    expect(el.type).toBe("span");
    const children = el.props.children;
    expect(children[0]).toBe("(Recharge");
    expect(children[1]).toBe(" ");
    expect(children[2].type).toBe("button");
    expect(children[2].props.children).toBe("5-6");
    expect(children[3]).toBe(")");
  });

  it("should parse save tags correctly", () => {
    const result = parseText("{@actSave str}");
    expect(result).toHaveLength(1);
    const el = getElement(result[0]);
    expect(el.type).toBe("em");
    expect(el.props.children).toBe("Strength Saving Throw");
  });

  it("should parse save fail/success tags correctly", () => {
    const failResult = parseText("{@actSaveFail}");
    const failEl = getElement(failResult[0]);
    expect(failEl.type).toBe("em");
    expect(failEl.props.children).toBe("Failure:");

    const successResult = parseText("{@actSaveSuccess}");
    const succEl = getElement(successResult[0]);
    expect(succEl.type).toBe("em");
    expect(succEl.props.children).toBe("Success:");
  });

  it("should parse bolding tags like spell or condition correctly (including pipe delimiters)", () => {
    const spellResult = parseText("{@spell fireball}");
    const spellEl = getElement(spellResult[0]);
    expect(spellEl.type).toBe("strong");
    expect(spellEl.props.children).toBe("fireball");

    const conditionResult = parseText("{@condition blinded}");
    const condEl = getElement(conditionResult[0]);
    expect(condEl.type).toBe("strong");
    expect(condEl.props.children).toBe("blinded");

    const conditionPipeResult = parseText("{@condition Grappled|XPHB}");
    const condPipeEl = getElement(conditionPipeResult[0]);
    expect(condPipeEl.props.children).toBe("Grappled");
  });

  it("should parse various other bold text tags correctly", () => {
    const tags = [
      { text: "{@skill Perception}", expected: "Perception" },
      { text: "{@action Dash}", expected: "Dash" },
      {
        text: "{@status concentration||concentrating}",
        expected: "concentrating",
      },
      { text: "{@sense blindsight}", expected: "blindsight" },
      { text: "{@hazard quicksand}", expected: "quickstand" },
      { text: "{@book Player's Handbook}", expected: "Player's Handbook" },
      {
        text: "{@variantrule Emanation [Area of Effect]|XPHB|Emanation}",
        expected: "Emanation",
      },
      {
        text: "{@quickref difficult terrain||3}",
        expected: "difficult terrain",
      },
      {
        text: "{@chance 40|40 percent|40% summoning chance}",
        expected: "40% summoning chance",
      },
    ];

    tags.forEach(({ text, expected }) => {
      const result = parseText(text);
      expect(result).toHaveLength(1);
      const el = getElement(result[0]);
      expect(el.type).toBe("strong");
      expect(el.props.children).toBe(
        expected === "quickstand" ? "quicksand" : expected,
      );
    });
  });

  it("should parse action, trigger, and save indicators correctly", () => {
    const triggerResult = parseText("{@actTrigger}");
    const triggerEl = getElement(triggerResult[0]);
    expect(triggerEl.type).toBe("em");
    expect(triggerEl.props.children).toBe("Trigger:");

    const responseResult = parseText("{@actResponse}");
    const responseEl = getElement(responseResult[0]);
    expect(responseEl.type).toBe("em");
    expect(responseEl.props.children).toBe("Response:");

    const homResult = parseText("{@hom}");
    const homEl = getElement(homResult[0]);
    expect(homEl.type).toBe("em");
    expect(homEl.props.children).toBe("Hit or Miss:");

    const failByResult = parseText("{@actSaveFailBy 5}");
    const failByEl = getElement(failByResult[0]);
    expect(failByEl.type).toBe("em");
    expect(failByEl.props.children).toEqual(["Failure by ", "5", " or more:"]);

    const successOrFailResult = parseText("{@actSaveSuccessOrFail}");
    const successOrFailEl = getElement(successOrFailResult[0]);
    expect(successOrFailEl.type).toBe("em");
    expect(successOrFailEl.props.children).toBe("Success or Failure:");
  });

  it("should parse note tags correctly", () => {
    const noteResult = parseText("{@note See the variant rules}");
    const noteEl = getElement(noteResult[0]);
    expect(noteEl.type).toBe("em");
    expect(noteEl.props.children).toBe("See the variant rules");
  });

  it("should handle mixed text and tags correctly", () => {
    const result = parseText(
      "{@atk mw} {@hit 5} to hit. {@h} 5 ({@damage 1d6 + 2}) damage.",
    );

    // Elements should be:
    // 0: <em key={0}>Melee Weapon Attack:</em>
    // 1: <Fragment> " " </Fragment>
    // 2: <button>+5</button>
    // 3: <Fragment> " to hit. " </Fragment>
    // 4: <em>Hit:</em>
    // 5: <Fragment> " 5 (" </Fragment>
    // 6: <button>1d6 + 2</button>
    // 7: <Fragment> ") damage." </Fragment>

    expect(result).toHaveLength(8);

    const el0 = getElement(result[0]);
    expect(el0.type).toBe("em");
    expect(el0.props.children).toBe("Melee Weapon Attack:");

    const el1 = getElement(result[1]);
    expect(el1.type).toBe(React.Fragment);
    expect(el1.props.children).toBe(" ");

    const el2 = getElement(result[2]);
    expect(el2.type).toBe("button");
    expect(el2.props.children).toBe("+5");

    const el3 = getElement(result[3]);
    expect(el3.type).toBe(React.Fragment);
    expect(el3.props.children).toBe(" to hit. ");

    const el4 = getElement(result[4]);
    expect(el4.type).toBe("em");
    expect(el4.props.children).toBe("Hit:");

    const el5 = getElement(result[5]);
    expect(el5.type).toBe(React.Fragment);
    expect(el5.props.children).toBe(" 5 (");

    const el6 = getElement(result[6]);
    expect(el6.type).toBe("button");
    expect(el6.props.children).toBe("1d6 + 2");

    const el7 = getElement(result[7]);
    expect(el7.type).toBe(React.Fragment);
    expect(el7.props.children).toBe(") damage.");
  });
});
