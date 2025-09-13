"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FiArrowLeft, FiMenu, FiX } from "react-icons/fi";
import ThemeToggle from "./ThemeToggle";

export function Header() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [name, setName] = useState("TB");
  const [showBackButton, setShowBackButton] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const toggleNav = () => setIsNavOpen(!isNavOpen);

  const closeNav = () => setIsNavOpen(false);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 768) {
        setName("TB");
        setShowBackButton(false); // Remove o botão em dispositivos móveis
      } else {
        setName("Thiago Battista");
        setShowBackButton(pathname !== "/");
      }
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Fecha o menu apenas se o clique for fora do menu e do botão de voltar
      if (
        navRef.current &&
        !navRef.current.contains(event.target as Node) &&
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      ) {
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

  const getBackLink = () => {
    if (pathname.startsWith("/albuns/")) {
      return "/albuns"; // Voltar para a lista geral de álbuns
    }
    return "/"; // Voltar para a Home
  };

  return (
    <>
      <header
        ref={headerRef}
        className="sticky top-0 md:fixed md:top-0 md:left-0 md:h-full md:w-44 z-50"
        style={{ backgroundColor: 'var(--background-header)' }}
      >
        <div className="flex flex-row items-start md:flex-col p-4 md:h-full">
          {/* Nome e descrição */}
          <div className="flex flex-row gap-7 items-center w-full max-md:justify-center md:flex-row-reverse md:gap-10 md:items-center md:transform md:-rotate-90 md:origin-top-left md:mt-[200px] md:translate-x-12">
            <h1 className="font-disalina text-5xl font-bold tracking-widest cursor-pointer whitespace-nowrap max-md:text-5xl">
              <Link href="/" onClick={closeNav}>
                {name}
              </Link>
            </h1>
            <p className="uppercase whitespace-nowrap cursor-default max-md:text-sm">
              Artista digital &amp; <br /> Produtor cultural
            </p>
          </div>

          {/* Botão Menu */}
          <div className="mx-5 flex flex-row md:flex-col gap-5 items-center justify-center focus:outline-none md:ml-12 md:mt-auto md:mb-11">
            {/* Botão de voltar */}
            {showBackButton && (
              <Link
                href={getBackLink()}
                className="hidden md:block hover:opacity-80 btn-accessible"
                style={{ color: 'var(--foreground)' }}
                aria-label="Voltar"
              >
                <FiArrowLeft size={40} />
              </Link>
            )}
            {/* Botão de tema */}
            <ThemeToggle />
            {/* Botão de menu */}
            <button
              onClick={toggleNav}
              className="btn-accessible focus-visible"
              style={{ color: 'var(--foreground)' }}
              aria-label="Toggle navigation menu"
              aria-expanded={isNavOpen}
            >
              {isNavOpen ? <FiX size={40} /> : <FiMenu size={40} />}
            </button>
          </div>
        </div>
      </header>

      {isNavOpen && (
        <nav
          ref={navRef}
          className="fixed top-0 left-0 h-screen z-40 w-full md:h-40 md:left-40 md:bottom-0 md:top-auto md:w-[calc(100vw-10rem)] p-4 flex items-center dark:shadow-lg"
          style={{ backgroundColor: 'var(--background-header)' }}
          aria-label="Navegação principal"
        >
          <ul className="flex flex-col md:flex-row w-full md:justify-evenly gap-16 md:gap-10 items-center max-md:mt-32 list-accessible">
            {navItems.map(({ label, path }) => {
              const isActive = pathname === path;
              return (
                <li key={path} className="w-full text-center">
                  <Link
                    href={path}
                    onClick={closeNav}
                    className={`text-2xl md:text-2xl hover:underline hover:underline-offset-4 link-accessible focus-visible ${
                      isActive ? "underline underline-offset-4 font-bold" : ""
                    }`}
                    style={{ color: 'var(--foreground)' }}
                    aria-current={isActive ? "page" : undefined}
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
