const ResponsiveText = ({ children }: { children: React.ReactNode }) => {
  return (
    <p className="mt-4 text-lg leading-relaxed">
      {children}
    </p>
  );
};

export default ResponsiveText;
