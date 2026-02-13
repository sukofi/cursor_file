
// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Header from './Header';

// Mock UI components to avoid rendering complexity
vi.mock("@/components/ui/button", () => ({
  Button: ({ onClick, children }: any) => (
    <button onClick={onClick} data-testid="mock-button">
      {children}
    </button>
  ),
}));

vi.mock("lucide-react", () => ({
  Menu: () => <span>MenuIcon</span>,
  X: () => <span>XIcon</span>,
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('contains "Login" link pointing to the app', () => {
    render(<Header />);

    // There are two login links (desktop and mobile)
    // We can filter by the one that is likely visible or check both
    const loginLinks = screen.getAllByText('ログイン');

    // Check checking if ANY of them has the correct href
    const desktopLogin = loginLinks.find(link => link.closest('a')?.getAttribute('href') === "https://internal-link-checker-kdsm.vercel.app/");
    expect(desktopLogin).toBeDefined();
    expect(desktopLogin?.closest('a')?.getAttribute('href')).toBe("https://internal-link-checker-kdsm.vercel.app/");
    expect(desktopLogin?.closest('a')?.getAttribute('target')).toBe("_blank");
  });

  it('contains "Start for free" button wrapped in link pointing to the app', () => {
    render(<Header />);

    const buttons = screen.getAllByText('無料で始める');

    // Find the button that is wrapped in the correct link
    const ctaButton = buttons.find(btn => btn.closest('a')?.getAttribute('href') === "https://internal-link-checker-kdsm.vercel.app/");

    expect(ctaButton).toBeDefined();
    expect(ctaButton?.closest('a')?.getAttribute('href')).toBe("https://internal-link-checker-kdsm.vercel.app/");
    expect(ctaButton?.closest('a')?.getAttribute('target')).toBe("_blank");
  });
});
