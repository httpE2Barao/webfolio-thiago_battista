import { ReactNode } from "react";

interface ResponsiveTextProps {
  children: ReactNode;
  className?: string;
  size?: "sm" | "base" | "lg";
  responsive?: boolean;
  centerOnMobile?: boolean;
  Tag?: keyof JSX.IntrinsicElements;
}

export default function ResponsiveText({
  children,
  className = "",
  size = "base",
  responsive = true,
  centerOnMobile = false,
  Tag = "p"
}: ResponsiveTextProps) {
  const Component = Tag;
  
  // Determine the responsive class based on size
  const getResponsiveClass = () => {
    if (!responsive) return "";
    
    switch (size) {
      case "sm": return "text-responsive-sm";
      case "base": return "text-responsive";
      case "lg": return "text-responsive-md";
      default: return "text-responsive";
    }
  };
  
  // Mobile centering class
  const mobileCenterClass = centerOnMobile ? "text-center sm:text-left" : "";
  
  return (
    <Component
      className={`mt-4 ${getResponsiveClass()} ${mobileCenterClass} ${className}`}
      style={{
        color: 'var(--foreground)',
        fontFamily: 'var(--font-primary)',
        lineHeight: 'var(--line-height-relaxed)',
        letterSpacing: 'var(--letter-spacing-normal)'
      }}
    >
      {children}
    </Component>
  );
}
