interface TituloResponsivoProps {
  children: React.ReactNode;
  className?: string;
}

export default function TituloResponsivo({ children, className = "" }: TituloResponsivoProps) {
  return (
    <h2 className={className}>
      {children}
    </h2>
  );
}
  