"use client";
import { useEffect, useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";

export const Header = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [name, setName] = useState("Thiago Battista");

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const handleResize = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setName("TB");
    } else {
      setName("Thiago Battista");
    }
  };

  // Add event listener for window resize
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);
      handleResize();
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  return (
    <>
      <header className="sticky top-0 md:fixed md:top-0 md:left-0 md:h-full md:w-44 z-50 bg-backgroundHeader">
        <div className="flex flex-row items-center md:flex-col p-4 md:h-full">
          {/* Título e Subtítulo Rotacionados */}
          <div className="flex flex-row justify-center gap-7 items-center w-full md:flex-row-reverse md:gap-10 md:items-center md:transform md:-rotate-90 md:origin-top-left md:mt-[200px] md:translate-x-12">
            <h1 className="text-3xl font-bold tracking-widest cursor-pointer text-foreground dark:text-dark-foreground whitespace-nowrap max-md:text-5xl">
              {name}
            </h1>
            <p className="uppercase text-foreground dark:text-dark-foreground whitespace-nowrap cursor-not-allowed max-md:text-sm">
              Artista digital &amp; <br /> Produtor cultural
            </p>
          </div>
          {/* Botão do Menu */}
          <button
            className="text-foreground dark:text-dark-foreground w-10 h-10 flex items-center justify-center bg-backgroundHeader focus:outline-none max-md:ml-6 md:mt-auto md:mb-11"
            onClick={toggleNav}
            aria-label="Toggle navigation menu"
          >
            {isNavOpen ? <FiX size={50} /> : <FiMenu size={50} />}
          </button>
        </div>
      </header>
      {/* Menu de Navegação */}
      {isNavOpen && (
        <nav className="fixed top-30 left-0 h-32 z-40 w-full max-md:rounded-b-3xl md:left-40 md:h-40 md:bottom-0 md:w-[calc(100vw-10rem)] p-4 flex items-center gap-10 justify-evenly bg-backgroundHeader shadow-lg">
          <a
            href="#about"
            className="text-2xl text-foreground dark:text-dark-foreground hover:underline hover:underline-offset-4"
          >
            About
          </a>
          <a
            href="#projects"
            className="text-2xl text-foreground dark:text-dark-foreground hover:underline hover:underline-offset-4"
          >
            Projects
          </a>
          <a
            href="#contact"
            className="text-2xl text-foreground dark:text-dark-foreground hover:underline hover:underline-offset-4"
          >
            Contact
          </a>
        </nav>
      )}
    </>
  );
};
