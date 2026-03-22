import React from "react";
import { handleD20RollClick, handleRollClick } from "./roll";

// Regex to find bestiary-formatted tags
const tagRegex = /\{@([A-z]+)(?: ([^}]+))?\}/g;

export function parseText(text: string): React.ReactNode[] {
  if (!text) return [];

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null = tagRegex.exec(text);

  while (match !== null) {
    if (match.index > lastIndex) {
      elements.push(text.substring(lastIndex, match.index));
    }

    const tag = match[1];
    const content = match[2] || "";
    const parts = content.split("|");
    const mainValue = parts[0];

    // For pipe delimited values (e.g. {@skill Perception}, {@chance 40|40 percent|40% summoning chance})
    // Some use parts[2] (third item) as the display text, others use parts[0].
    // If parts[2] exists and isn't purely an integer reference like in `{@quickref difficult terrain||3}`,
    // we should use it. Alternatively, just using parts[0] as a fallback.
    let displayValue = mainValue;
    if (tag === "chance") {
      displayValue = parts[2] || parts[1] || parts[0];
    } else if (tag === "quickref" || tag === "variantrule") {
      // e.g. {@quickref difficult terrain||3} -> difficult terrain
      // e.g. {@variantrule Emanation [Area of Effect]|XPHB|Emanation} -> Emanation
      displayValue = parts[2] || parts[0];
      if (/^\d+$/.test(displayValue)) {
        displayValue = parts[0];
      }
    } else {
      displayValue = parts[2] || parts[0];
    }

    switch (tag) {
      case "atk":
        if (mainValue === "mw")
          elements.push(<em key={match.index}>Melee Weapon Attack:</em>);
        else if (mainValue === "rw")
          elements.push(<em key={match.index}>Ranged Weapon Attack:</em>);
        else if (mainValue === "mw,rw" || mainValue === "rw,mw")
          elements.push(
            <em key={match.index}>Melee or Ranged Weapon Attack:</em>,
          );
        else if (mainValue === "ms")
          elements.push(<em key={match.index}>Melee Spell Attack:</em>);
        else if (mainValue === "rs")
          elements.push(<em key={match.index}>Ranged Spell Attack:</em>);
        else if (mainValue === "ms,rs" || mainValue === "rs,ms")
          elements.push(
            <em key={match.index}>Melee or Ranged Spell Attack:</em>,
          );
        else elements.push(<em key={match.index}>{mainValue} Attack:</em>);
        break;
      case "atkr":
        if (mainValue === "m")
          elements.push(<em key={match.index}>Melee Attack:</em>);
        else if (mainValue === "r")
          elements.push(<em key={match.index}>Ranged Attack:</em>);
        else if (mainValue === "m,r" || mainValue === "rw,mw")
          elements.push(<em key={match.index}>Melee or Ranged Attack:</em>);
        else elements.push(<em key={match.index}>{mainValue} Attack:</em>);
        break;
      case "hit":
        elements.push(
          <button
            type="button"
            key={match.index}
            className="rollable"
            onClick={(e) => handleD20RollClick(e, Number(mainValue))}
          >
            {mainValue.startsWith("+") || mainValue.startsWith("-")
              ? mainValue
              : `+${mainValue}`}
          </button>,
        );
        break;
      case "damage":
        elements.push(
          <button
            type="button"
            key={match.index}
            className="rollable"
            onClick={() => handleRollClick(mainValue)}
          >
            {mainValue}
          </button>,
        );
        break;
      case "dice":
        elements.push(
          <button
            type="button"
            key={match.index}
            className="rollable"
            onClick={() => handleRollClick(mainValue)}
          >
            {mainValue}
          </button>,
        );
        break;
      case "h":
        elements.push(<em key={match.index}>Hit:</em>);
        break;
      case "hom":
        elements.push(<em key={match.index}>Hit or Miss:</em>);
        break;
      case "dc":
        elements.push(`DC ${mainValue}`);
        break;
      case "recharge": {
        const rechargeVal = mainValue || "6";
        const range = rechargeVal === "6" ? "6" : `${rechargeVal}-6`;
        elements.push(
          <span key={match.index}>
            (Recharge{" "}
            <button
              type="button"
              className="rollable"
              onClick={() => handleRollClick("1d6")}
            >
              {range}
            </button>
            )
          </span>,
        );
        break;
      }
      case "actSave": {
        const saveMap: Record<string, string> = {
          str: "Strength Saving Throw",
          dex: "Dexterity Saving Throw",
          con: "Constitution Saving Throw",
          int: "Intelligence Saving Throw",
          wis: "Wisdom Saving Throw",
          cha: "Charisma Saving Throw",
        };
        const fullName =
          saveMap[mainValue.toLowerCase()] || `${mainValue} Saving Throw`;
        elements.push(<em key={match.index}>{fullName}</em>);
        break;
      }
      case "actSaveFail":
        elements.push(<em key={match.index}>Failure:</em>);
        break;
      case "actSaveFailBy":
        elements.push(
          <em key={match.index}>Failure by {mainValue} or more:</em>,
        );
        break;
      case "actSaveSuccess":
        elements.push(<em key={match.index}>Success:</em>);
        break;
      case "actSaveSuccessOrFail":
        elements.push(<em key={match.index}>Success or Failure:</em>);
        break;
      case "actTrigger":
        elements.push(<em key={match.index}>Trigger:</em>);
        break;
      case "actResponse":
        elements.push(<em key={match.index}>Response:</em>);
        break;
      case "note":
        elements.push(<em key={match.index}>{mainValue}</em>);
        break;
      case "spell":
      case "item":
      case "condition":
      case "creature":
      case "skill":
      case "action":
      case "status":
      case "sense":
      case "hazard":
      case "book":
      case "variantrule":
      case "quickref":
      case "chance":
        elements.push(<strong key={match.index}>{displayValue}</strong>);
        break;
      default:
        elements.push(mainValue);
    }

    lastIndex = tagRegex.lastIndex;
    match = tagRegex.exec(text);
  }

  if (lastIndex < text.length) {
    elements.push(text.substring(lastIndex));
  }

  return elements.map((el, i) =>
    React.isValidElement(el) ? (
      el
    ) : (
      <React.Fragment key={`text-${i}`}>{el}</React.Fragment>
    ),
  );
}
