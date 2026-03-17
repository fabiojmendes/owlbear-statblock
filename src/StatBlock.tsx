import OBR from "@owlbear-rodeo/sdk";
import { useEffect, useState } from "react";

import { ID } from "./main";
import {
  getInitiativeBonus,
  getModifier,
  getPassiveInitiative,
  getProficiencyBonus,
} from "./utils/helpers";
import { parseText } from "./utils/parser";
import { handleRollClick } from "./utils/roll";

function formatAC(acData: any): string {
  if (!acData) return "";
  if (Array.isArray(acData)) {
    return acData
      .map((item: any) => {
        if (typeof item === "number") return item.toString();
        if (typeof item === "object") {
          let text = `${item.ac}`;
          if (item.from) {
            text += ` (${item.from
              .map((f: string) =>
                parseText(f)
                  .map((node) =>
                    typeof node === "string"
                      ? node
                      : (node as any).props?.children || "",
                  )
                  .join(""),
              )
              .join(", ")})`;
          }
          if (item.condition) {
            text += ` ${parseText(item.condition)
              .map((node) =>
                typeof node === "string"
                  ? node
                  : (node as any).props?.children || "",
              )
              .join("")}`;
          }
          return text;
        }
        return "";
      })
      .join(", ");
  }
  return String(acData);
}

function formatSpeed(speedData: any): string {
  if (!speedData) return "0 ft.";
  const speeds: string[] = [];
  if (speedData.walk) speeds.push(`${speedData.walk} ft.`);
  for (const [key, val] of Object.entries(speedData)) {
    if (key === "walk" || key === "canHover") continue;
    if (typeof val === "number") {
      speeds.push(`${key} ${val} ft.`);
    } else if (typeof val === "object" && val !== null) {
      const v = val as any;
      let text = `${key} ${v.number} ft.`;
      if (v.condition) text += ` ${v.condition}`;
      speeds.push(text);
    }
  }
  return speeds.join(", ");
}

function renderProperty(
  name: string,
  value: any,
  renderFunc?: (val: any) => React.ReactNode,
) {
  if (!value) return null;
  const renderedValue = renderFunc ? renderFunc(value) : value;
  if (
    !renderedValue ||
    (Array.isArray(renderedValue) && renderedValue.length === 0)
  )
    return null;
  return (
    <div className="prop-line">
      <span className="prop-name">{name}</span> {renderedValue}
    </div>
  );
}

function StatBlock() {
  const [monster, setMonster] = useState<any>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    OBR.player.onChange(async (player) => {
      if (player.selection && player.selection.length === 1) {
        const items = await OBR.scene.items.getItems(player.selection);
        if (items.length > 0) {
          const m = items[0].metadata[`${ID}/monster`];
          if (m) {
            setMonster(m);
          } else {
            setMonster(null);
          }
        }
      } else {
        setMonster(null);
      }
    });
  }, []);

  const toggleMinimize = async () => {
    const newMinimized = !isMinimized;
    setIsMinimized(newMinimized);
    await OBR.popover.setHeight(`${ID}/statblock`, newMinimized ? 60 : 500);
  };

  if (!monster) {
    return (
      <div className="statblock">
        <div className="statblock-header">
          <h1>Stat Block</h1>
          <button
            className="close-icon-button"
            type="button"
            onClick={() => OBR.popover.close(`${ID}/statblock`)}
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <p>Select a single token with a stat block to view it here.</p>
      </div>
    );
  }

  const renderTraits = (traits: any[]) => {
    if (!traits || !Array.isArray(traits)) return null;
    return traits.map((trait, idx) => (
      <div key={idx} className="statblock-trait">
        {trait.name && (
          <span className="statblock-trait-name">{trait.name}. </span>
        )}
        {trait.entries?.map((entry: any, i: number) => {
          if (typeof entry === "string") {
            return <span key={i}>{parseText(entry)}</span>;
          }
          if (entry.items && entry.type === "list") {
            return (
              <ul key={i}>
                {entry.items.map((item: any, j: number) => (
                  <li key={j}>
                    {typeof item === "string" ? (
                      parseText(item)
                    ) : item.name ? (
                      <>
                        <strong style={{ fontStyle: "italic" }}>
                          {item.name}
                        </strong>{" "}
                        {parseText(item.entry)}
                      </>
                    ) : (
                      ""
                    )}
                  </li>
                ))}
              </ul>
            );
          }
          return null;
        })}
      </div>
    ));
  };

  const renderSpellcasting = (spellcasting: any[]) => {
    if (!spellcasting || !Array.isArray(spellcasting)) return null;
    return spellcasting.map((sc, idx) => (
      <div key={idx} className="statblock-trait">
        {sc.name && <span className="statblock-trait-name">{sc.name}. </span>}
        {sc.headerEntries?.map((entry: string, i: number) => (
          <span key={`h-${i}`}>{parseText(entry)} </span>
        ))}
        {sc.will && (
          <div>
            At will:{" "}
            {sc.will
              .map((spell: string) => parseText(spell))
              .reduce((prev: any, curr: any) => [prev, ", ", curr])}
          </div>
        )}
        {sc.daily &&
          Object.entries(sc.daily).map(([key, spells]: [string, any]) => {
            const times = key.replace("e", "");
            return (
              <div key={key}>
                {times}/day{key.includes("e") ? " each" : ""}:{" "}
                {spells
                  .map((spell: string) => parseText(spell))
                  .reduce((prev: any, curr: any) => [prev, ", ", curr])}
              </div>
            );
          })}
      </div>
    ));
  };

  return (
    <div className="statblock">
      <div className="statblock-header">
        <h1>{monster.name}</h1>
        <div className="header-controls">
          <button
            className="minimize-icon-button"
            type="button"
            onClick={toggleMinimize}
            aria-label={isMinimized ? "Expand" : "Minimize"}
          >
            {isMinimized ? "+" : "-"}
          </button>
          <button
            className="close-icon-button"
            type="button"
            onClick={() => OBR.popover.close(`${ID}/statblock`)}
            aria-label="Close"
          >
            &times;
          </button>
        </div>
      </div>

      <div className={`statblock-content ${isMinimized ? "minimized" : ""}`}>
        <div className="subtitle">
          {monster.size?.join("") || "M"}{" "}
          {typeof monster.type === "string"
            ? monster.type
            : monster.type?.type +
              (monster.type?.tags ? ` (${monster.type.tags.join(", ")})` : "")}
          {monster.alignment
            ? `, ${monster.alignmentPrefix || ""}${monster.alignment.join(" ")}`
            : ""}
        </div>
        <hr className="rule" />

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {renderProperty("AC", formatAC(monster.ac))}
          <div className="prop-line">
            <span className="prop-name">Initiative</span>{" "}
            <button
              type="button"
              className="rollable"
              onClick={() =>
                handleRollClick(`1d20+${getInitiativeBonus(monster)}`)
              }
            >
              {getInitiativeBonus(monster) >= 0
                ? `+${getInitiativeBonus(monster)}`
                : getInitiativeBonus(monster)}
            </button>
            {` (${getPassiveInitiative(monster, getInitiativeBonus(monster))})`}
          </div>
        </div>
        {renderProperty(
          "HP",
          monster.hp
            ? `${monster.hp.average || ""} ${monster.hp.formula ? `(${monster.hp.formula})` : ""}`
            : null,
        )}
        {renderProperty("Speed", formatSpeed(monster.speed))}

        <hr className="rule" />
        <div className="statblock-grid">
          {[
            { name: "str", label: "STR" },
            { name: "dex", label: "DEX" },
            { name: "con", label: "CON" },
            { name: "int", label: "INT" },
            { name: "wis", label: "WIS" },
            { name: "cha", label: "CHA" },
          ].map((stat) => {
            const score = monster[stat.name] || 10;
            const mod = getModifier(score);
            const save = monster.save?.[stat.name] || mod;
            return (
              <div key={stat.name} className="ability-block">
                <div className="ability-header-row">
                  <div />
                  <div />
                  <div className="ability-mod-label">MOD</div>
                  <div className="ability-save-label">SAVE</div>
                </div>
                <div className="ability-name">{stat.label}</div>
                <div className="ability-score">{score}</div>
                <button
                  type="button"
                  className="rollable ability-value"
                  onClick={() => handleRollClick(`1d20${mod}`)}
                >
                  {mod}
                </button>
                <button
                  type="button"
                  className="rollable ability-value"
                  onClick={() => handleRollClick(`1d20${save}`)}
                >
                  {save}
                </button>
              </div>
            );
          })}
        </div>
        <hr className="rule" />

        {renderProperty(
          "Skills",
          monster.skill
            ? Object.entries(monster.skill)
                .map(
                  ([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)} ${v}`,
                )
                .join(", ")
            : null,
        )}
        {renderProperty(
          "Damage Vulnerabilities",
          monster.vulnerable?.join(", "),
        )}
        {renderProperty("Damage Resistances", monster.resist?.join(", "))}
        {renderProperty("Damage Immunities", monster.immune?.join(", "))}
        {renderProperty(
          "Condition Immunities",
          monster.conditionImmune?.join(", "),
        )}
        {renderProperty(
          "Senses",
          monster.senses
            ? [
                ...monster.senses,
                `Passive Perception ${monster.passive || 10}`,
              ].join(", ")
            : `Passive Perception ${monster.passive || 10}`,
        )}
        {renderProperty("Languages", monster.languages?.join(", ") || "--")}
        {renderProperty(
          "CR",
          monster.cr ? (
            <>
              {typeof monster.cr === "string" ? monster.cr : monster.cr.cr}
              {` (PB +${getProficiencyBonus(monster.cr)})`}
            </>
          ) : null,
        )}

        <hr className="rule" />

        {monster.trait && renderTraits(monster.trait)}
        {monster.spellcasting && renderSpellcasting(monster.spellcasting)}

        {monster.action && (
          <>
            <h2 className="statblock-section-title">Actions</h2>
            {renderTraits(monster.action)}
          </>
        )}

        {monster.bonus && (
          <>
            <h2 className="statblock-section-title">Bonus Actions</h2>
            {renderTraits(monster.bonus)}
          </>
        )}

        {monster.reaction && (
          <>
            <h2 className="statblock-section-title">Reactions</h2>
            {renderTraits(monster.reaction)}
          </>
        )}

        {monster.legendary && (
          <>
            <h2 className="statblock-section-title">Legendary Actions</h2>
            {renderTraits(monster.legendary)}
          </>
        )}
      </div>
    </div>
  );
}

export default StatBlock;
