import "@testing-library/jest-dom";

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = () => {};

// Mock scrollTo
window.scrollTo = () => {};
window.HTMLElement.prototype.scrollTo = () => {};

// Mock ResizeObserver for Recharts ResponsiveContainer
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock IntersectionObserver for Framer Motion viewport triggers
global.IntersectionObserver = class IntersectionObserver {
  root = null;
  rootMargin = "";
  thresholds = [];
  observe(target: Element) {
    // Immediately trigger inView callback in tests
    if (typeof this.callback === "function") {
      this.callback([{ isIntersecting: true, target, intersectionRatio: 1 } as any], this);
    }
  }
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
  constructor(private callback: any) {}
} as any;
