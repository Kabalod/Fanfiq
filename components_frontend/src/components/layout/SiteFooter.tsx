/**
 * Site footer with links and copyright
 */
export function SiteFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">© 2024 Fanfiq. All rights reserved.</p>

          <nav className="flex items-center space-x-4 text-sm">
            <a
              href="#"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="About page"
            >
              About
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Privacy policy"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Terms of service"
            >
              Terms
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Contact us"
            >
              Contact
            </a>
          </nav>
        </div>
      </div>
    </footer>
  )
}
