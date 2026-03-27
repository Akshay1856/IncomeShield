import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CloudRain, Shield, Zap, ArrowRight } from 'lucide-react';
import gigguardLogo from '@/assets/gigguard-logo.png';

export default function GetStartedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center relative overflow-hidden">
        {/* Background accents */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-lg space-y-8">
          <div className="flex items-center justify-center gap-3">
            <img src={gigguardLogo} alt="GigGuard Logo" className="h-20 w-20" />
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-foreground">
            GigGuard
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Protecting Delivery Partners from Income Loss
          </p>

          {/* Feature highlights */}
          <div className="grid grid-cols-3 gap-4 pt-6">
            <FeatureCard icon={CloudRain} title="Rain Cover" desc="Get paid when weather stops you" />
            <FeatureCard icon={Shield} title="₹199/mo" desc="Affordable micro-insurance" />
            <FeatureCard icon={Zap} title="Instant" desc="Auto-payouts in minutes" />
          </div>

          <Button
            size="lg"
            className="mt-8 h-14 px-10 text-lg font-bold gap-2 rounded-full"
            onClick={() => navigate('/login')}
          >
            Get Started <ArrowRight className="h-5 w-5" />
          </Button>

          <p className="text-xs text-muted-foreground pt-2">
            No credit card required · Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border">
      <Icon className="h-7 w-7 text-primary" />
      <span className="font-semibold text-sm text-foreground">{title}</span>
      <span className="text-xs text-muted-foreground text-center">{desc}</span>
    </div>
  );
}
