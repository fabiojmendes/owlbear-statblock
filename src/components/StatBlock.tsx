import OBR from "@owlbear-rodeo/sdk";
import { useEffect, useState } from "react";
import { ID } from "../constants.ts";
import {
  formatAlignment,
  formatSize,
  getInitiativeBonus,
  getModifier,
  getPassiveInitiative,
  getProficiencyBonus,
} from "../utils/helpers";
import { parseText } from "../utils/parser";
import { handleD20RollClick } from "../utils/roll";
import { type Monster, MonsterSchema } from "../utils/schema";
import "./StatBlock.css";

function formatAC(acData: any): React.ReactNode {
  if (!acData || !Array.isArray(acData)) return "";
  return acData.map((item: any, index: number) => (
    <span key={index}>
      {item.value}
      {item.details && <span> {parseText(item.details)}</span>}
      {index < acData.length - 1 ? ", " : ""}
    </span>
  ));
}

function formatSpeed(speedData: any): React.ReactNode {
  if (!speedData || !Array.isArray(speedData)) return "0 ft.";
  return speedData.map((item: any, index: number) => (
    <span key={index}>
      {item.type} {item.value} ft.
      {item.condition && <span> {parseText(item.condition)}</span>}
      {index < speedData.length - 1 ? ", " : ""}
    </span>
  ));
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
  const [monster, setMonster] = useState<Monster | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const itemId = params.get("id");
    if (typeof itemId === "string" && itemId.length > 0) {
      const getItem = async () => {
        const items = await OBR.scene.items.getItems([itemId]);
        if (items.length > 0) {
          const m = items[0].metadata[`${ID}/monster`];
          if (m) {
            try {
              setMonster(MonsterSchema.parse(m));
            } catch (e) {
              console.error("Zod parsing failed:", e);
              setMonster(m as Monster);
            }
          }
        }
      };
      getItem();
    }
  }, []);

  useEffect(() => {
    OBR.player.onChange(async (player) => {
      if (!player.selection) {
        return;
      }

      if (player.selection.length > 1) {
        setMonster(null);
        return;
      }

      const items = await OBR.scene.items.getItems(player.selection);
      if (items.length > 0) {
        const m = items[0].metadata[`${ID}/monster`];
        if (m) {
          try {
            setMonster(MonsterSchema.parse(m));
          } catch (e) {
            console.error("Zod parsing failed:", e);
            setMonster(m as Monster);
          }
        } else {
          setMonster(null);
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

  const renderTraits = (traits: any[]) => {
    if (!traits || !Array.isArray(traits)) return null;
    return traits.map((trait, idx) => (
      <div key={idx} className="statblock-trait">
        {trait.name && (
          <span className="statblock-trait-name">
            {parseText(trait.name)}.{" "}
          </span>
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
                          {parseText(item.name)}
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
    <div className="statblock-wrapper">
      <div className="statblock">
        <div className="statblock-header">
          <h1>
            {monster ? (
              monster.externalLink ? (
                <a
                  href={monster.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {monster.name}
                </a>
              ) : (
                monster.name
              )
            ) : (
              "Stat Block"
            )}
          </h1>
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
          {!monster ? (
            <p>Select a single token with a stat block to view it here.</p>
          ) : (
            <>
              <div className="subtitle">
                {formatSize(monster.size || ["M"])} {monster.type?.type}
                {monster.type?.tags && monster.type.tags.length > 0
                  ? ` (${monster.type.tags.join(", ")})`
                  : ""}
                {monster.alignment
                  ? `, ${monster.alignmentPrefix || ""}${formatAlignment(monster.alignment)}`
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
                    onClick={(e) =>
                      handleD20RollClick(e, getInitiativeBonus(monster))
                    }
                  >
                    {" "}
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
                  const score = Number((monster as any)[stat.name]) || 10;
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
                        onClick={(e) => handleD20RollClick(e, mod)}
                      >
                        {mod}
                      </button>
                      <button
                        type="button"
                        className="rollable ability-value"
                        onClick={(e) => handleD20RollClick(e, save)}
                      >
                        {" "}
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
                        ([k, v]) =>
                          `${k.charAt(0).toUpperCase() + k.slice(1)} ${v}`,
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
              {renderProperty(
                "Languages",
                monster.languages?.join(", ") || "--",
              )}
              {renderProperty(
                "CR",
                monster.cr ? (
                  <>
                    {monster.cr}
                    {` (PB +${getProficiencyBonus(monster.cr)})`}
                  </>
                ) : null,
              )}

              <hr className="rule" />

              {monster.trait && (
                <>
                  <h2 className="statblock-section-title">Traits</h2>
                  {renderTraits(monster.trait)}
                </>
              )}

              {monster.action && (
                <>
                  <h2 className="statblock-section-title">Actions</h2>
                  {renderTraits(monster.action)}
                  {monster.spellcasting &&
                    renderSpellcasting(monster.spellcasting)}
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
                  <div className="subtitle">
                    <em>
                      Legendary Action Uses: {monster.legendaryActions || 3}{" "}
                      {monster.legendaryActionsLair
                        ? `(${monster.legendaryActionsLair} in Lair)`
                        : ""}
                      . Immediately after another creature’s turn,{" "}
                      {monster.name} can expend a use to take one of the
                      following actions. {monster.name} regains all expended
                      uses at the start of each of its turns.
                    </em>
                  </div>
                  {renderTraits(monster.legendary)}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default StatBlock;
