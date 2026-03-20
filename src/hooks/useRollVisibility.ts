import { useEffect, useState } from "react";

const ROLL_VISIBILITY_KEY = "statblock_roll_visibility";

export function useRollVisibility() {
  const [rollVisibility, setRollVisibilityState] = useState<string>(() => {
    return localStorage.getItem(ROLL_VISIBILITY_KEY) || "everyone";
  });

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === ROLL_VISIBILITY_KEY) {
        setRollVisibilityState(e.newValue || "everyone");
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const setRollVisibility = (visibility: string) => {
    setRollVisibilityState(visibility);
    localStorage.setItem(ROLL_VISIBILITY_KEY, visibility);
  };

  return { rollVisibility, setRollVisibility };
}
