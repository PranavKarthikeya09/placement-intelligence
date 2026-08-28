import { useRef, useCallback, useEffect } from "react";

export type CardInteractionIntensity = "subtle" | "default" | "interactive";

export interface CardInteractionOptions {
  intensity?: CardInteractionIntensity;
  maxRotateX?: number;
  maxRotateY?: number;
  translateY?: number;
  scale?: number;
  perspective?: number;
  highlight?: boolean;
  smoothing?: number; // 0.1 to 0.5 (default: 0.25)
}

const INTENSITY_PRESETS: Record<
  CardInteractionIntensity,
  {
    maxRotateX: number;
    maxRotateY: number;
    translateY: number;
    scale: number;
    highlightOpacity: number;
  }
> = {
  subtle: {
    maxRotateX: 1.5,
    maxRotateY: 2.0,
    translateY: -2,
    scale: 1.005,
    highlightOpacity: 0.45,
  },
  default: {
    maxRotateX: 2.5,
    maxRotateY: 3.0,
    translateY: -3,
    scale: 1.01,
    highlightOpacity: 0.65,
  },
  interactive: {
    maxRotateX: 3.0,
    maxRotateY: 4.0,
    translateY: -3.5,
    scale: 1.01,
    highlightOpacity: 0.85,
  },
};

/**
 * Unified, high-performance card interaction hook providing:
 * - Subtle cursor-responsive 3D tilt with physics smoothing
 * - Cursor-local radial highlight via CSS variables
 * - Zero React state updates on mousemove (60/120fps direct DOM manipulation)
 * - Safe detection for touch / reduced-motion environments
 */
export function useCardInteraction<T extends HTMLElement = HTMLDivElement>(
  options: CardInteractionOptions = {}
) {
  const {
    intensity = "default",
    perspective = 1200,
    highlight = true,
    smoothing = 0.25,
  } = options;

  const preset = INTENSITY_PRESETS[intensity] || INTENSITY_PRESETS.default;
  const maxRotateX = options.maxRotateX ?? preset.maxRotateX;
  const maxRotateY = options.maxRotateY ?? preset.maxRotateY;
  const translateY = options.translateY ?? preset.translateY;
  const scale = options.scale ?? preset.scale;
  const maxHighlightOpacity = preset.highlightOpacity;

  const cardRef = useRef<T | null>(null);
  const rafId = useRef<number | null>(null);
  const isHovered = useRef<boolean>(false);

  // Current and target values for smooth interpolation
  const currentRotX = useRef<number>(0);
  const currentRotY = useRef<number>(0);
  const targetRotX = useRef<number>(0);
  const targetRotY = useRef<number>(0);

  // Check if eligible (not touch-only, not reduced motion)
  const isEligible = useCallback(() => {
    if (typeof window === "undefined") return false;
    if (typeof window.matchMedia !== "function") return true;
    const isTouchOnly = window.matchMedia("(hover: none)").matches;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return false;
    if (isTouchOnly) return false;
    return true;
  }, []);

  const runAnimationLoop = useCallback(() => {
    if (!cardRef.current || !isHovered.current) return;

    const dx = targetRotX.current - currentRotX.current;
    const dy = targetRotY.current - currentRotY.current;

    // Smooth interpolation with slight physical inertia
    currentRotX.current += dx * smoothing;
    currentRotY.current += dy * smoothing;

    const el = cardRef.current;
    el.style.transform = `perspective(${perspective}px) translateY(${translateY}px) scale(${scale}) rotateX(${currentRotX.current.toFixed(
      2
    )}deg) rotateY(${currentRotY.current.toFixed(2)}deg)`;

    // Continue loop if still moving or still hovered
    if (Math.abs(dx) > 0.005 || Math.abs(dy) > 0.005 || isHovered.current) {
      rafId.current = requestAnimationFrame(runAnimationLoop);
    } else {
      rafId.current = null;
    }
  }, [perspective, translateY, scale, smoothing]);

  const handleMouseEnter = useCallback(
    (e?: React.MouseEvent<T>) => {
      if (!cardRef.current || !isEligible()) return;
      isHovered.current = true;
      const el = cardRef.current;

      el.style.willChange = "transform, box-shadow";
      el.style.transition = "transform 0.15s ease-out, box-shadow 0.15s ease-out, border-color 0.15s ease-out";

      if (highlight && e) {
        const rect = el.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        el.style.setProperty("--card-mouse-x", `${mouseX}px`);
        el.style.setProperty("--card-mouse-y", `${mouseY}px`);
        el.style.setProperty("--card-highlight-opacity", `${maxHighlightOpacity}`);
      } else if (highlight) {
        el.style.setProperty("--card-highlight-opacity", `${maxHighlightOpacity}`);
      }

      if (!rafId.current) {
        rafId.current = requestAnimationFrame(runAnimationLoop);
      }
    },
    [isEligible, highlight, maxHighlightOpacity, runAnimationLoop]
  );

  const handleMouseMove = useCallback(
    (e?: React.MouseEvent<T>) => {
      if (!cardRef.current || !isHovered.current || !isEligible() || !e) return;

      const el = cardRef.current;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Relative coordinates from -0.5 to 0.5
      const xPercent = mouseX / rect.width - 0.5;
      const yPercent = mouseY / rect.height - 0.5;

      // Tilt toward cursor
      targetRotX.current = -yPercent * (maxRotateX * 2);
      targetRotY.current = xPercent * (maxRotateY * 2);

      if (highlight) {
        el.style.setProperty("--card-mouse-x", `${mouseX}px`);
        el.style.setProperty("--card-mouse-y", `${mouseY}px`);
      }

      if (!rafId.current) {
        rafId.current = requestAnimationFrame(runAnimationLoop);
      }
    },
    [maxRotateX, maxRotateY, highlight, isEligible, runAnimationLoop]
  );

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return;
    isHovered.current = false;

    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }

    targetRotX.current = 0;
    targetRotY.current = 0;
    currentRotX.current = 0;
    currentRotY.current = 0;

    const el = cardRef.current;
    el.style.transition = "transform 0.25s ease-out, box-shadow 0.25s ease-out, border-color 0.15s ease-out";
    el.style.transform = `perspective(${perspective}px) translateY(0px) scale(1) rotateX(0deg) rotateY(0deg)`;

    if (highlight) {
      el.style.setProperty("--card-highlight-opacity", "0");
    }

    setTimeout(() => {
      if (!isHovered.current && el) {
        el.style.willChange = "auto";
      }
    }, 250);
  }, [perspective, highlight]);

  useEffect(() => {
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  return {
    cardRef,
    interactionProps: {
      onMouseEnter: handleMouseEnter,
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
    },
    // Backwards compatible aliases
    tiltProps: {
      onMouseEnter: handleMouseEnter,
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
    },
  };
}
