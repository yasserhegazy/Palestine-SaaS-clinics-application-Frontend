"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface ThemeContextProps {
  isDark: boolean;
  toggleDark: () => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  isDark: false,
  toggleDark: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  const updateTextColors = (isDarkTheme: boolean) => {
    const elements = document.querySelectorAll("body *");

    elements.forEach((el) => {
      const style = window.getComputedStyle(el);
      const color = style.color;

      const match = color.match(/\d+/g);
      if (!match) return;

      const [r, g, b] = match.map(Number);

      const isAlmostBlack = r < 40 && g < 40 && b < 40;

      if (isDarkTheme) {
        if (isAlmostBlack) {
          el.classList.add("black-to-white");
        }
      } else {
        el.classList.remove("black-to-white");
      }
    });
  };

  const toggleDark = () => {
    const newTheme = !isDark;

    setIsDark(newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");

    document.body.classList.toggle("night-mode", newTheme);
    setTimeout(() => updateTextColors(newTheme), 30);
  };

  useEffect(() => {
    const saved = localStorage.getItem("theme");

    if (saved === "dark") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- initialize persisted theme after hydration
      setIsDark(true);
      document.body.classList.add("night-mode");
      setTimeout(() => updateTextColors(true), 30);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ isDark, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
