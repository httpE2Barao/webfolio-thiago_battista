"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";

export function Header() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [name, setName] = useState("TB");
  const navRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const toggleNav = () => setIsNavOpen(!isNavOpen);

  const closeNav = () => setIsNavOpen(false);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 768) {
        setName("TB");
      } else {
        setName("Thiago Battista");
      }
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        closeNav();
      }
    }

    if (isNavOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isNavOpen]);

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Sobre", path: "/sobre" },
    { label: "Álbuns", path: "/albuns" },
    { label: "Contatos", path: "/contatos" },
  ];

  return (
    <>
      <header className="sticky top-0 md:fixed md:top-0 md:left-0 md:h-full md:w-44 z-50 bg-backgroundHeader">
        <div className="flex flex-row items-start md:flex-col p-4 md:h-full">
          <div className="flex flex-row gap-7 items-center w-full max-md:justify-center md:flex-row-reverse md:gap-10 md:items-center md:transform md:-rotate-90 md:origin-top-left md:mt-[200px] md:translate-x-12">
            <h1 className="font-disalina text-3xl font-bold tracking-widest cursor-pointer text-foreground dark:text-dark-foreground whitespace-nowrap max-md:text-5xl">
              <Link href="/" onClick={closeNav}>
                {name}
              </Link>
            </h1>
            <p className="uppercase text-foreground dark:text-dark-foreground whitespace-nowrap cursor-not-allowed max-md:text-sm">
              Artista digital &amp; <br /> Produtor cultural
            </p>
          </div>

          {/* Botão Menu */}
          <button
            className="mx-5 text-foreground dark:text-dark-foreground flex items-center justify-center bg-backgroundHeader focus:outline-none md:ml-10 md:mt-auto md:mb-11"
            onClick={toggleNav}
            aria-label="Toggle navigation menu"
          >
            {isNavOpen ? <FiX size={50} /> : <FiMenu size={50} />}
          </button>
        </div>
      </header>

      {isNavOpen && (
        <nav
          ref={navRef}
          className="fixed top-30 left-0 h-32 z-40 w-full max-md:rounded-b-3xl md:left-40 md:h-40 md:bottom-0 md:w-[calc(100vw-10rem)] p-4 flex items-center bg-backgroundHeader shadow-lg"
        >
          <ul className="flex flex-col md:flex-row w-full md:justify-evenly md:w-full gap-10 items-center">
            {navItems.map(({ label, path }) => {
              const isActive = pathname === path;
              return (
                <li key={path} className="w-full text-center">
                  <Link
                    href={path}
                    onClick={closeNav}
                    className={`text-lg md:text-2xl text-foreground dark:text-dark-foreground hover:underline hover:underline-offset-4 ${
                      isActive ? "underline underline-offset-4 font-bold" : ""
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </>
  );
}
