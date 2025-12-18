"use client";

import { useState, useEffect } from "react";
import AccessPopup from "./access-popup";

interface NotificacoesContentProps {
  username: string;
  children: React.ReactNode;
}

export default function NotificacoesContent({
  username,
  children,
}: NotificacoesContentProps) {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Não mostrar popup se clicar no próprio popup ou no botão de fechar
      if (
        target.closest('[data-popup]') ||
        target.closest('[data-close-popup]') ||
        target.closest('button[data-close-popup]')
      ) {
        return;
      }

      // Permitir navegação apenas para links específicos (voltar, header, bottom nav)
      if (target.closest("a[href]")) {
        const link = target.closest("a[href]") as HTMLAnchorElement;
        const href = link.getAttribute("href") || "";

        // Permitir navegação para links de navegação importantes
        if (
          href.includes("/perfil/") ||
          href.includes("/dm/") ||
          href === "/" ||
          link.closest("header") ||
          link.closest("nav")
        ) {
          return;
        }
      }

      // Permitir cliques em botões dentro da bottom navigation (especialmente o botão de home)
      const nav = target.closest("nav");
      if (nav) {
        // Verificar se é um botão dentro da nav
        const button = target.closest("button");
        if (button && nav.contains(button)) {
          // Permitir que o botão de home funcione normalmente
          // O handleHomeClick do BottomNavigation já faz o router.push
          // Não interceptar o evento para permitir que o onClick do botão execute
          return;
        }
      }

      // Para todos os outros cliques, mostrar o popup
      setShowPopup(true);
      e.preventDefault();
      e.stopPropagation();
    };

    // Adicionar listener em todo o documento com capture phase
    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, []);

  return (
    <>
      {children}
      {showPopup && (
        <div data-popup>
          <AccessPopup
            username={username}
            onClose={() => setShowPopup(false)}
          />
        </div>
      )}
    </>
  );
}


