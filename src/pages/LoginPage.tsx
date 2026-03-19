import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Zap, CloudRain, Thermometer } from 'lucide-react';

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('rahul@example.com');
  const [password, setPassword] = useState('demo123');
  const [name, setName] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [workType, setWorkType] = useState<'full-time' | 'part-time'>('full-time');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let success: boolean;
    if (isSignup) {
      success = await signup({ name, email, city, workType });
    } else {
      success = await login(email, password);
    }
    setLoading(false);
    if (success) navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-center items-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-accent blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-primary-foreground blur-3xl" />
        </div>
        <div className="relative z-10 text-center space-y-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="h-12 w-12 text-accent" />
            <h1 className="text-4xl font-bold text-primary-foreground tracking-tight">RideShield</h1>
          </div>
          <p className="text-xl text-primary-foreground/80 max-w-md">
            AI-powered income protection for India's delivery partners
          </p>
          <div className="grid grid-cols-3 gap-6 mt-12">
            <FeatureIcon icon={CloudRain} label="Rain Protection" />
            <FeatureIcon icon={Thermometer} label="Heatwave Cover" />
            <FeatureIcon icon={Zap} label="Instant Payouts" />
          </div>
          <div className="mt-12 p-6 rounded-xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20">
            <p className="text-primary-foreground/90 text-lg font-medium">
              "Saved ₹2,500 last monsoon season when I couldn't ride due to flooding"
            </p>
            <p className="text-primary-foreground/60 mt-2 text-sm">— Amit K., Zomato rider, Mumbai</p>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center gap-2 justify-center mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">RideShield</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {isSignup ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="mt-1 text-muted-foreground">
              {isSignup ? 'Start protecting your income today' : 'Sign in to your RideShield dashboard'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignup && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Select value={city} onValueChange={setCity}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune'].map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Work Type</Label>
                    <Select value={workType} onValueChange={(v) => setWorkType(v as 'full-time' | 'part-time')}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>

            <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={loading}>
              {loading ? 'Please wait...' : isSignup ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button onClick={() => setIsSignup(!isSignup)} className="text-primary font-medium hover:underline">
              {isSignup ? 'Sign in' : 'Sign up'}
            </button>
          </p>

          {!isSignup && (
            <p className="text-center text-xs text-muted-foreground/60">
              Demo: Use any email/password to login
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function FeatureIcon({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-14 h-14 rounded-xl bg-primary-foreground/10 flex items-center justify-center">
        <Icon className="h-7 w-7 text-accent" />
      </div>
      <span className="text-xs text-primary-foreground/70">{label}</span>
    </div>
  );
}
