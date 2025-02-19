import { ReactNode } from "react";

interface TituloResponsivoProps {
  children: ReactNode;
  className?: string;
  Tag?: keyof JSX.IntrinsicElements;
}

export default function TituloResponsivo({ 
  children, 
  className = "", 
  Tag = "h1" 
}: TituloResponsivoProps) {
  const Component = Tag;
  return (
    <Component className={`text-responsive ${className}`}>
      {children}
    </Component>
  );
}
