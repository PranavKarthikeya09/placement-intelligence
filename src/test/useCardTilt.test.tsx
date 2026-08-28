import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useCardTilt } from "../hooks/useCardTilt";

describe("useCardTilt 3D Interaction Hook Test Suite", () => {
  it("provides cardRef and mouse event handlers", () => {
    const { result } = renderHook(() => useCardTilt());

    expect(result.current.cardRef).toBeDefined();
    expect(result.current.tiltProps).toBeDefined();
    expect(typeof result.current.tiltProps.onMouseEnter).toBe("function");
    expect(typeof result.current.tiltProps.onMouseMove).toBe("function");
    expect(typeof result.current.tiltProps.onMouseLeave).toBe("function");
  });

  it("handles mouse enter and mouse leave gracefully on element ref", () => {
    const { result } = renderHook(() => useCardTilt({ perspective: 1000 }));
    const div = document.createElement("div");
    result.current.cardRef.current = div;

    // Simulate mouseEnter
    result.current.tiltProps.onMouseEnter();

    // Simulate mouseLeave
    result.current.tiltProps.onMouseLeave();
    expect(div.style.transform).toContain("perspective(1000px)");
    expect(div.style.transform).toContain("rotateX(0deg)");
    expect(div.style.transform).toContain("rotateY(0deg)");
  });
});
