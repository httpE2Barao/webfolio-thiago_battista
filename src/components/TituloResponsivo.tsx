const ResponsiveTitle = ({ children }: { children: React.ReactNode }) => {
    return (
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold">
        {children}
      </h1>
    );
  };
  
  export default ResponsiveTitle;
  