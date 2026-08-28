import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useCardInteraction } from "../hooks/useCardInteraction";

describe("Unified Card Interaction System Test Suite", () => {
  it("initializes with default options, cardRef, and interaction handlers", () => {
    const { result } = renderHook(() => useCardInteraction());

    expect(result.current.cardRef).toBeDefined();
    expect(result.current.interactionProps).toBeDefined();
    expect(typeof result.current.interactionProps.onMouseEnter).toBe("function");
    expect(typeof result.current.interactionProps.onMouseMove).toBe("function");
    expect(typeof result.current.interactionProps.onMouseLeave).toBe("function");
  });

  it("supports subtle, default, and interactive intensity presets", () => {
    const { result: subtleResult } = renderHook(() =>
      useCardInteraction({ intensity: "subtle" })
    );
    const { result: interactiveResult } = renderHook(() =>
      useCardInteraction({ intensity: "interactive" })
    );

    expect(subtleResult.current.cardRef).toBeDefined();
    expect(interactiveResult.current.cardRef).toBeDefined();
  });

  it("handles mouse enter, move, and leave on element without throwing", () => {
    const { result } = renderHook(() =>
      useCardInteraction({ intensity: "default", highlight: true })
    );
    const div = document.createElement("div");
    // Mock getBoundingClientRect
    div.getBoundingClientRect = () => ({
      left: 50,
      top: 50,
      right: 250,
      bottom: 250,
      width: 200,
      height: 200,
      x: 50,
      y: 50,
      toJSON: () => {},
    });
    result.current.cardRef.current = div;

    // Simulate mouseEnter
    result.current.interactionProps.onMouseEnter({
      clientX: 100,
      clientY: 100,
    } as any);

    expect(div.style.getPropertyValue("--card-mouse-x")).toBe("50px");
    expect(div.style.getPropertyValue("--card-mouse-y")).toBe("50px");
    expect(div.style.getPropertyValue("--card-highlight-opacity")).toBe("0.65");

    // Simulate mouseMove
    result.current.interactionProps.onMouseMove({
      clientX: 150,
      clientY: 150,
    } as any);
    expect(div.style.getPropertyValue("--card-mouse-x")).toBe("100px");
    expect(div.style.getPropertyValue("--card-mouse-y")).toBe("100px");

    // Simulate mouseLeave
    result.current.interactionProps.onMouseLeave();
    expect(div.style.transform).toContain("perspective(1200px)");
    expect(div.style.transform).toContain("rotateX(0deg)");
    expect(div.style.transform).toContain("rotateY(0deg)");
    expect(div.style.getPropertyValue("--card-highlight-opacity")).toBe("0");
  });
});
