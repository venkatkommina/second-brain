import { Link } from "react-router-dom";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="border-t border-[hsl(var(--border))] py-6"
      style={{ backgroundColor: "hsl(var(--background))" }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <Link to="/" className="text-lg font-bold text-primary">
            SecondBrain
          </Link>
          <p
            className="text-sm mt-1"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            Your personal knowledge management system
          </p>
        </div>
        <div
          className="mt-6 text-center text-sm"
          style={{ color: "hsl(var(--muted-foreground))" }}
        >
          © {currentYear} SecondBrain. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
