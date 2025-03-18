"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // 確保組件在客戶端渲染時才顯示，避免服務器端渲染與客戶端不匹配
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full opacity-0" />;
  }

  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light');
    } else if (theme === 'light') {
      setTheme('dark');
    } else {
      // 如果當前是系統主題，則根據系統偏好設置切換
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "light"  // 如果系統是深色，則切換到淺色
        : "dark";  // 如果系統是淺色，則切換到深色
      setTheme(systemTheme);
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme}
      className="h-9 w-9 rounded-full"
      title={`當前主題: ${theme === 'system' ? '系統' : theme === 'dark' ? '深色' : '淺色'}`}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">切換主題</span>
    </Button>
  );
} 