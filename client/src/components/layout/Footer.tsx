import { Link } from "react-router-dom";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[hsl(var(--border))] py-6" style={{ backgroundColor: "hsl(var(--background))" }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link to="/" className="text-lg font-bold text-primary">
              SecondBrain
            </Link>
            <p className="text-sm mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
              Your personal knowledge management system
            </p>
          </div>
          <div className="flex space-x-6">
            <Link
              to="/about"
              className="text-sm hover:opacity-100"
              style={{ color: "hsl(var(--muted-foreground))", opacity: 0.8 }}
            >
              About
            </Link>
            <Link
              to="/privacy"
              className="text-sm hover:opacity-100"
              style={{ color: "hsl(var(--muted-foreground))", opacity: 0.8 }}
            >
              Privacy
            </Link>
            <Link
              to="/terms"
              className="text-sm hover:opacity-100"
              style={{ color: "hsl(var(--muted-foreground))", opacity: 0.8 }}
            >
              Terms
            </Link>
          </div>
        </div>
        <div className="mt-6 text-center text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
          © {currentYear} SecondBrain. All rights reserved.
        </div>
      </div>
    </footer>
  );
} 