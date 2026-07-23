import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { CategoryIcon } from "../CategoryIcon";

describe("CategoryIcon", () => {
  it("renders an expense category with its mapped color classes and an icon", () => {
    const { container } = render(<CategoryIcon categoryName="Makanan & Minuman" />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("bg-red-100", "text-red-600");
    expect(wrapper.querySelector("svg")).toBeInTheDocument();
  });

  it("renders an income category with the emerald color classes", () => {
    const { container } = render(<CategoryIcon categoryName="Gaji" />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("bg-emerald-100", "text-emerald-600");
    expect(wrapper.querySelector("svg")).toBeInTheDocument();
  });

  it("falls back to the neutral slate color for an unknown category", () => {
    const { container } = render(<CategoryIcon categoryName="Kategori Aneh" />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("bg-slate-100", "text-slate-500");
    expect(wrapper.querySelector("svg")).toBeInTheDocument();
  });
});
