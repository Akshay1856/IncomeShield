import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="py-4 mt-8 border-t border-border/50 text-center text-xs text-muted-foreground space-x-4">
      <Link to="/privacy-policy" className="hover:text-primary transition-colors underline">
        Privacy Policy
      </Link>
      <Link to="/terms-of-service" className="hover:text-primary transition-colors underline">
        Terms of Service
      </Link>
    </footer>
  );
}
