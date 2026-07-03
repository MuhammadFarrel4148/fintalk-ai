import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "../page";

describe("Home page", () => {
  it("renders the getting-started heading", () => {
    render(<Home />);

    expect(screen.getByText("To get started, edit the page.tsx file.")).toBeInTheDocument();
  });
});
