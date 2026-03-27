import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { MenuUtente } from "@/components/menu-utente";

describe("MenuUtente", () => {
  beforeEach(() => {
    cleanup();
  });

  it("mostra l'avatar con l'iniziale dell'utente", () => {
    render(<MenuUtente email="giulia@example.com" />);
    expect(screen.getByRole("button", { name: "G" })).toBeInTheDocument();
  });

  it("il dropdown non è visibile inizialmente", () => {
    render(<MenuUtente email="giulia@example.com" />);
    expect(screen.queryByText("Il mio profilo")).not.toBeInTheDocument();
  });

  it("apre il dropdown al click sull'avatar", async () => {
    const utente = userEvent.setup();
    render(<MenuUtente email="giulia@example.com" />);

    await utente.click(screen.getByRole("button"));

    expect(screen.getByText("Il mio profilo")).toBeInTheDocument();
    expect(screen.getByText("La mia collezione")).toBeInTheDocument();
    expect(screen.getByText("Esci")).toBeInTheDocument();
  });

  it("i link puntano alle rotte corrette", async () => {
    const utente = userEvent.setup();
    render(<MenuUtente email="giulia@example.com" />);

    await utente.click(screen.getByRole("button"));

    expect(screen.getByText("Il mio profilo").closest("a")).toHaveAttribute("href", "/profilo");
    expect(screen.getByText("La mia collezione").closest("a")).toHaveAttribute("href", "/collezione");
  });

  it("mostra l'email nel dropdown", async () => {
    const utente = userEvent.setup();
    render(<MenuUtente email="giulia@example.com" />);

    await utente.click(screen.getByRole("button"));

    expect(screen.getByText("giulia@example.com")).toBeInTheDocument();
  });

  it("chiude il dropdown con il tasto Escape", async () => {
    const utente = userEvent.setup();
    render(<MenuUtente email="giulia@example.com" />);

    await utente.click(screen.getByRole("button"));
    expect(screen.getByText("Il mio profilo")).toBeInTheDocument();

    await utente.keyboard("{Escape}");
    expect(screen.queryByText("Il mio profilo")).not.toBeInTheDocument();
  });

  it("chiude il dropdown cliccando fuori", async () => {
    const utente = userEvent.setup();
    const { container } = render(
      <div>
        <span data-testid="esterno">fuori</span>
        <MenuUtente email="giulia@example.com" />
      </div>
    );

    await utente.click(screen.getByRole("button"));
    expect(screen.getByText("Il mio profilo")).toBeInTheDocument();

    await utente.click(screen.getByTestId("esterno"));
    expect(screen.queryByText("Il mio profilo")).not.toBeInTheDocument();
  });

  it("chiude il dropdown cliccando su una voce", async () => {
    const utente = userEvent.setup();
    render(<MenuUtente email="giulia@example.com" />);

    await utente.click(screen.getByRole("button"));
    expect(screen.getByText("Il mio profilo")).toBeInTheDocument();

    await utente.click(screen.getByText("La mia collezione"));
    expect(screen.queryByText("Il mio profilo")).not.toBeInTheDocument();
  });

  it("ha aria-expanded corretto", async () => {
    const utente = userEvent.setup();
    render(<MenuUtente email="giulia@example.com" />);

    const pulsante = screen.getByRole("button");
    expect(pulsante).toHaveAttribute("aria-expanded", "false");

    await utente.click(pulsante);
    expect(pulsante).toHaveAttribute("aria-expanded", "true");
  });
});
