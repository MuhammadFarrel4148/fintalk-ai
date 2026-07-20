import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Sidebar from "../Sidebar";

const mockUsePathname = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

const ALL_MENU_ITEMS: Array<[string, string]> = [
  ["Dashboard", "/dashboard"],
  ["Transactions", "/transactions"],
  ["Analytics", "/analytics"],
  ["AI Advisor", "/advisor"],
  ["Settings", "/settings"],
  ["Logout", "/logout"],
];

describe("Sidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the FinTalk.ai brand", () => {
    mockUsePathname.mockReturnValue("/dashboard");
    render(<Sidebar />);

    expect(screen.getByText("FinTalk.ai")).toBeInTheDocument();
  });

  it("renders all top and bottom menu items with correct links", () => {
    mockUsePathname.mockReturnValue("/dashboard");
    render(<Sidebar />);

    ALL_MENU_ITEMS.forEach(([name, href]) => {
      expect(screen.getByRole("link", { name })).toHaveAttribute("href", href);
    });
  });

  it("highlights the menu item matching the current pathname as active", () => {
    mockUsePathname.mockReturnValue("/transactions");
    render(<Sidebar />);

    expect(screen.getByRole("link", { name: "Transactions" })).toHaveClass(
      "border-blue-600",
      "bg-blue-50",
      "text-blue-600",
      "font-semibold"
    );
    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveClass(
      "border-transparent",
      "text-slate-600"
    );
    expect(screen.getByRole("link", { name: "Dashboard" })).not.toHaveClass("bg-blue-50");
  });

  it("does not mark any item active when the pathname doesn't match any menu href", () => {
    mockUsePathname.mockReturnValue("/some/unknown/path");
    render(<Sidebar />);

    ALL_MENU_ITEMS.forEach(([name]) => {
      const link = screen.getByRole("link", { name });
      expect(link).toHaveClass("border-transparent");
      expect(link).not.toHaveClass("bg-blue-50");
    });
  });
});
