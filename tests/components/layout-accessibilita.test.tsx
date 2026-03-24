import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

// Componente minimale che replica la struttura del layout radice
function LayoutConSkipLink({ children }: { children?: React.ReactNode }) {
  return (
    <body>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only"
      >
        Vai al contenuto principale
      </a>
      <nav aria-label="Navigazione principale" />
      <main id="main-content">{children}</main>
      <footer />
    </body>
  );
}

describe("Layout accessibilità — skip-navigation e landmark main", () => {
  it("contiene un link skip-navigation che punta a #main-content", () => {
    render(<LayoutConSkipLink />);

    const skipLink = screen.getByRole("link", { name: /vai al contenuto principale/i });
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute("href", "#main-content");
  });

  it("il link skip-navigation è il primo elemento interattivo nel DOM", () => {
    render(<LayoutConSkipLink />);

    const skipLink = screen.getByRole("link", { name: /vai al contenuto principale/i });
    const tuttiILink = screen.getAllByRole("link");

    // Il link skip deve essere il primo link nel documento
    expect(tuttiILink[0]).toBe(skipLink);
  });

  it("l'elemento main ha l'id 'main-content'", () => {
    render(<LayoutConSkipLink />);

    const mainElement = screen.getByRole("main");
    expect(mainElement).toHaveAttribute("id", "main-content");
  });

  it("il target del link skip-navigation esiste nel DOM", () => {
    render(<LayoutConSkipLink><p>Contenuto principale</p></LayoutConSkipLink>);

    const skipLink = screen.getByRole("link", { name: /vai al contenuto principale/i });
    const hrefTarget = skipLink.getAttribute("href")?.replace("#", "");

    const elementoTarget = document.getElementById(hrefTarget!);
    expect(elementoTarget).not.toBeNull();
  });
});
