import { ReactNode } from "react";

interface TituloResponsivoProps {
  children: ReactNode;
  className?: string;
  Tag?: keyof JSX.IntrinsicElements;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  responsive?: boolean;
  centerOnMobile?: boolean;
}

export default function TituloResponsivo({
  children,
  className = "",
  Tag = "h1",
  size = "lg",
  responsive = true,
  centerOnMobile = false
}: TituloResponsivoProps) {
  const Component = Tag;
  
  // Determine the responsive class based on size
  const getResponsiveClass = () => {
    if (!responsive) return "";
    
    switch (size) {
      case "sm": return "text-responsive-sm";
      case "md": return "text-responsive-md";
      case "lg": return "text-responsive-lg";
      case "xl": return "text-responsive-xl";
      case "2xl": return "text-responsive-2xl";
      default: return "text-responsive-lg";
    }
  };
  
  // Mobile centering class
  const mobileCenterClass = centerOnMobile ? "text-center sm:text-left" : "";
  
  return (
    <Component
      className={`${getResponsiveClass()} ${mobileCenterClass} ${className}`}
      style={{
        color: 'var(--foreground)',
        fontFamily: 'var(--font-primary)',
        fontWeight: 700,
        lineHeight: 'var(--line-height-tight)',
        letterSpacing: 'var(--letter-spacing-tight)'
      }}
    >
      {children}
    </Component>
  );
}
