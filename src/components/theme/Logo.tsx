"use client";

import Image from "next/image";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

type LogoProps = {
  variant?: "horizontal" | "square";
  className?: string;
  width?: number;
  height?: number;
  useWhiteLogo?: boolean; // true: 使用白色logo (白底黑字)，false: 使用黑色logo (黑底白字)
};

export function Logo({
  variant = "horizontal",
  className,
  width = variant === "horizontal" ? 160 : 40,
  height = variant === "horizontal" ? 40 : 40,
  useWhiteLogo, // 不设默认值，根据主题自动选择
}: LogoProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // 客户端挂载
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // 确定是否为深色主题模式
  const isDarkTheme = mounted && (
    theme === "dark" || 
    (theme === "system" && 
    typeof window !== "undefined" && 
    window.matchMedia("(prefers-color-scheme: dark)").matches)
  );
  
  // 如果明确指定useWhiteLogo，则使用指定值
  // 否则根据主题自动判断：深色主题用白色logo，浅色主题用深色logo
  const shouldUseWhiteLogo = useWhiteLogo !== undefined ? useWhiteLogo : isDarkTheme;
  
  // ====================== 注意 ======================
  // 文件名解释：
  // horizontal-dark-logo.png - 深色背景上使用的logo (白字)
  // horizontal-white-logo.png - 浅色背景上使用的logo (黑字)
  // ================================================
  
  // 选择logo URL - 用户确认过的URL对应关系
  const logoUrl = shouldUseWhiteLogo 
    ? variant === "horizontal"
      ? "https://img.blockmeet.io/horizontal-dark-logo.png" // useWhiteLogo=true 使用 dark-logo (白字，适合深色背景)
      : "https://img.blockmeet.io/square-dark-logo.png"     // useWhiteLogo=true 使用 dark-logo (白字，适合深色背景)
    : variant === "horizontal"
      ? "https://img.blockmeet.io/horizontal-white-logo.png" // useWhiteLogo=false 使用 white-logo (黑字，适合浅色背景)
      : "https://img.blockmeet.io/square-white-logo.png";    // useWhiteLogo=false 使用 white-logo (黑字，适合浅色背景)

  return (
    <div className={cn("flex items-center", className)}>
      <Image
        src={logoUrl}
        alt="BlockMeet Logo"
        width={width}
        height={height}
        className="object-contain"
        priority
      />
    </div>
  );
} 