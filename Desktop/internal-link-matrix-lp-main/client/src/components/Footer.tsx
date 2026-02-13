export default function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="container py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & copyright */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="6" height="6" rx="1" fill="white" opacity="0.9" />
                <rect x="11" y="1" width="6" height="6" rx="1" fill="white" opacity="0.6" />
                <rect x="1" y="11" width="6" height="6" rx="1" fill="white" opacity="0.6" />
                <rect x="11" y="11" width="6" height="6" rx="1" fill="white" opacity="0.9" />
                <line x1="7" y1="4" x2="11" y2="4" stroke="white" strokeWidth="1.5" opacity="0.7" />
                <line x1="4" y1="7" x2="4" y2="11" stroke="white" strokeWidth="1.5" opacity="0.7" />
                <line x1="14" y1="7" x2="14" y2="11" stroke="white" strokeWidth="1.5" opacity="0.7" />
                <line x1="7" y1="14" x2="11" y2="14" stroke="white" strokeWidth="1.5" opacity="0.7" />
              </svg>
            </div>
            <span className="text-sm font-medium text-foreground">
              内部リンクマトリクス
            </span>
          </div>

          {/* Nav links */}
          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">
              機能
            </a>
            <a href="#pricing" className="hover:text-foreground transition-colors">
              料金
            </a>
            <a href="#faq" className="hover:text-foreground transition-colors">
              FAQ
            </a>
            <a href="/tokushoho" className="hover:text-foreground transition-colors">
              特定商取引法に基づく表記
            </a>
            <a
              href="https://internal-link-checker-kdsm.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              ログイン
            </a>
          </nav>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} 内部リンクマトリクス. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
