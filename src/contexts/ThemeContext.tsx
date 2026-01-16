import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type ThemeMode = "dark" | "light" | "colorblind" | "custom";

export interface CustomThemeColors {
  primary: string;
  accent: string;
  tertiary: string;
  isDark: boolean;
}

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  customColors: CustomThemeColors;
  setCustomColors: (colors: CustomThemeColors) => void;
}

const defaultCustomColors: CustomThemeColors = {
  primary: "#9333ea", // Purple
  accent: "#ec4899", // Pink
  tertiary: "#06b6d4", // Cyan
  isDark: true,
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Helper to convert hex to HSL
const hexToHSL = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "270 70% 60%";
  
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem("pawsquare-theme");
    return (stored as ThemeMode) || "dark";
  });

  const [customColors, setCustomColorsState] = useState<CustomThemeColors>(() => {
    const stored = localStorage.getItem("pawsquare-custom-colors");
    return stored ? JSON.parse(stored) : defaultCustomColors;
  });

  useEffect(() => {
    localStorage.setItem("pawsquare-theme", theme);
    localStorage.setItem("pawsquare-custom-colors", JSON.stringify(customColors));
    
    // Remove all theme classes
    document.documentElement.classList.remove("light", "dark", "colorblind", "custom");
    
    if (theme === "custom") {
      // Apply custom theme
      document.documentElement.classList.add("custom");
      
      const primaryHSL = hexToHSL(customColors.primary);
      const accentHSL = hexToHSL(customColors.accent);
      const tertiaryHSL = hexToHSL(customColors.tertiary);
      
      // Set CSS variables for custom theme
      const root = document.documentElement;
      
      if (customColors.isDark) {
        root.style.setProperty("--background", "270 30% 6%");
        root.style.setProperty("--foreground", "270 20% 95%");
        root.style.setProperty("--card", "270 25% 10%");
        root.style.setProperty("--card-foreground", "270 20% 95%");
        root.style.setProperty("--popover", "270 25% 10%");
        root.style.setProperty("--popover-foreground", "270 20% 95%");
        root.style.setProperty("--secondary", "280 40% 18%");
        root.style.setProperty("--secondary-foreground", "280 40% 85%");
        root.style.setProperty("--muted", "270 20% 15%");
        root.style.setProperty("--muted-foreground", "270 15% 55%");
        root.style.setProperty("--border", "270 20% 18%");
        root.style.setProperty("--input", "270 20% 18%");
      } else {
        root.style.setProperty("--background", "35 40% 97%");
        root.style.setProperty("--foreground", "30 30% 15%");
        root.style.setProperty("--card", "35 35% 99%");
        root.style.setProperty("--card-foreground", "30 30% 15%");
        root.style.setProperty("--popover", "35 35% 99%");
        root.style.setProperty("--popover-foreground", "30 30% 15%");
        root.style.setProperty("--secondary", "35 40% 90%");
        root.style.setProperty("--secondary-foreground", "30 40% 30%");
        root.style.setProperty("--muted", "35 25% 92%");
        root.style.setProperty("--muted-foreground", "30 15% 45%");
        root.style.setProperty("--border", "35 30% 85%");
        root.style.setProperty("--input", "35 30% 85%");
      }
      
      root.style.setProperty("--primary", primaryHSL);
      root.style.setProperty("--primary-foreground", "0 0% 100%");
      root.style.setProperty("--accent", accentHSL);
      root.style.setProperty("--accent-foreground", "0 0% 100%");
      root.style.setProperty("--tertiary", tertiaryHSL);
      root.style.setProperty("--tertiary-foreground", "0 0% 100%");
      root.style.setProperty("--ring", primaryHSL);
      
      // Update gradients
      root.style.setProperty("--gradient-hero", `linear-gradient(135deg, hsl(${primaryHSL}), hsl(${accentHSL}))`);
      root.style.setProperty("--gradient-secondary", `linear-gradient(135deg, hsl(${tertiaryHSL}), hsl(${primaryHSL}))`);
      root.style.setProperty("--shadow-glow", `0 0 40px -10px hsl(${primaryHSL} / 0.5)`);
      root.style.setProperty("--shadow-glow-accent", `0 0 40px -10px hsl(${accentHSL} / 0.5)`);
      root.style.setProperty("--shadow-glow-tertiary", `0 0 40px -10px hsl(${tertiaryHSL} / 0.5)`);
    } else {
      // Add the current theme class and remove custom styles
      document.documentElement.classList.add(theme);
      
      // Remove custom CSS variables
      const root = document.documentElement;
      const customProps = [
        "--background", "--foreground", "--card", "--card-foreground",
        "--popover", "--popover-foreground", "--primary", "--primary-foreground",
        "--secondary", "--secondary-foreground", "--muted", "--muted-foreground",
        "--accent", "--accent-foreground", "--tertiary", "--tertiary-foreground",
        "--border", "--input", "--ring", "--gradient-hero", "--gradient-secondary",
        "--shadow-glow", "--shadow-glow-accent", "--shadow-glow-tertiary"
      ];
      customProps.forEach(prop => root.style.removeProperty(prop));
    }
  }, [theme, customColors]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  const setCustomColors = (colors: CustomThemeColors) => {
    setCustomColorsState(colors);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, customColors, setCustomColors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};