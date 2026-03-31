import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CloudRain, Thermometer, Zap, Eye, EyeOff, CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { format, parse, differenceInYears, isValid } from 'date-fns';
import { cn } from '@/lib/utils';
import gigguardLogo from '@/assets/gigguard-logo.png';

const INDIAN_CITIES = [
  'Agartala','Agra','Ahmedabad','Ahmednagar','Aizawl','Ajmer','Akola','Aligarh','Allahabad','Ambala',
  'Amravati','Amritsar','Anand','Anantapur','Aurangabad','Bareilly','Bathinda','Belgaum','Bellary','Bengaluru',
  'Berhampore','Bhagalpur','Bharatpur','Bharuch','Bhavnagar','Bhilai','Bhilwara','Bhopal','Bhubaneswar','Bikaner',
  'Bilaspur','Bokaro','Brahmapur','Bulandshahr','Chandigarh','Chennai','Coimbatore','Cuttack','Darbhanga',
  'Davangere','Dehradun','Delhi','Dhanbad','Dharwad','Dibrugarh','Durg','Durgapur','Erode','Faridabad',
  'Firozabad','Gangtok','Gaya','Ghaziabad','Gorakhpur','Gulbarga','Guntur','Gurgaon','Guwahati','Gwalior',
  'Hapur','Hisar','Hospet','Howrah','Hubli','Hyderabad','Imphal','Indore','Itanagar','Jabalpur','Jaipur',
  'Jalandhar','Jalgaon','Jammu','Jamnagar','Jamshedpur','Jhansi','Jodhpur','Junagadh','Kakinada','Kalyan',
  'Kanpur','Karimnagar','Karnal','Kochi','Kohima','Kolhapur','Kolkata','Kollam','Kota','Kottayam',
  'Kozhikode','Kurnool','Latur','Lucknow','Ludhiana','Madurai','Malegaon','Mangalore','Mathura','Meerut',
  'Moradabad','Mumbai','Muzaffarnagar','Muzaffarpur','Mysore','Nagpur','Nanded','Nashik','Navi Mumbai',
  'Nellore','Noida','Ongole','Pali','Panaji','Panipat','Parbhani','Patiala','Patna','Pondicherry',
  'Pune','Raipur','Rajahmundry','Rajkot','Ranchi','Ratlam','Rohtak','Rourkela','Sagar','Saharanpur',
  'Salem','Sangli','Satara','Shimla','Shimoga','Siliguri','Solapur','Sonipat','Srinagar','Surat',
  'Thanjavur','Thane','Thiruvananthapuram','Thrissur','Tiruchirappalli','Tirunelveli','Tirupati','Tiruppur',
  'Tumkur','Udaipur','Ujjain','Vadodara','Varanasi','Vasai-Virar','Vijayawada','Visakhapatnam','Warangal','Yavatmal',
];

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [workType, setWorkType] = useState<'full-time' | 'part-time'>('full-time');
  const [dob, setDob] = useState<Date | undefined>(undefined);
  const [dobText, setDobText] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const passwordStrength = useMemo(() => {
    if (!password) return { level: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return { level: 1, label: 'Weak', color: 'bg-destructive' };
    if (score <= 3) return { level: 2, label: 'Medium', color: 'bg-yellow-500' };
    return { level: 3, label: 'Strong', color: 'bg-green-500' };
  }, [password]);

  const passwordsMatch = !confirmPassword || password === confirmPassword;

  const dobError = useMemo(() => {
    if (!dob) return '';
    const age = differenceInYears(new Date(), dob);
    if (age < 18) return 'You must be at least 18 years old';
    return '';
  }, [dob]);

  const handleDobTextChange = (text: string) => {
    setDobText(text);
    // Try parsing dd-mm-yyyy
    if (text.length === 10) {
      const parsed = parse(text, 'dd-MM-yyyy', new Date());
      if (isValid(parsed)) {
        setDob(parsed);
      }
    }
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    setDob(date);
    if (date) {
      setDobText(format(date, 'dd-MM-yyyy'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignup && password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    if (isSignup && !dob) {
      toast.error('Please enter your date of birth');
      return;
    }
    if (isSignup && dobError) {
      toast.error(dobError);
      return;
    }
    setLoading(true);
    if (isSignup) {
      const result = await signup({ name, email, password, city, workType });
      if (result.success) {
        toast.success('Account created! Check your email to confirm.');
        navigate('/dashboard');
      } else {
        toast.error(result.error || 'Signup failed');
      }
    } else {
      const result = await login(email, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        toast.error(result.error || 'Login failed');
      }
    }
    setLoading(false);
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
            <img src={gigguardLogo} alt="GigGuard Logo" className="h-16 w-16" />
            <h1 className="text-4xl font-bold text-primary-foreground tracking-tight">GigGuard</h1>
          </div>
          <p className="text-lg text-primary-foreground/80 max-w-md">
            Protecting Delivery Partners from Income Loss
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
          <div className="lg:hidden flex flex-col items-center gap-2 mb-4">
            <img src={gigguardLogo} alt="GigGuard Logo" className="h-12 w-12" />
            <span className="text-2xl font-bold text-foreground">GigGuard</span>
            <p className="text-xs text-muted-foreground">Protecting Delivery Partners from Income Loss</p>
          </div>

          {/* Centered headings */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">
              {isSignup ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="mt-1 text-muted-foreground">
              {isSignup ? 'Start protecting your income today' : 'Sign in to your GigGuard dashboard'}
            </p>
          </div>

          {/* Google Sign In */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-11 gap-3 text-base"
            onClick={signInWithGoogle}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign in with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignup && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Rahul Sharma" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Select value={city} onValueChange={setCity}>
                      <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
                      <SelectContent className="max-h-60">
                        {INDIAN_CITIES.map(c => (
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

                {/* Date of Birth */}
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="dd-mm-yyyy"
                      value={dobText}
                      onChange={e => handleDobTextChange(e.target.value)}
                      maxLength={10}
                      className="flex-1"
                    />
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="icon" type="button">
                          <CalendarIcon className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                          mode="single"
                          selected={dob}
                          onSelect={handleCalendarSelect}
                          disabled={(date) => date > new Date() || date < new Date('1940-01-01')}
                          initialFocus
                          className={cn('p-3 pointer-events-auto')}
                          defaultMonth={dob || new Date(2000, 0)}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  {dobError && (
                    <p className="text-xs text-destructive font-medium">{dobError}</p>
                  )}
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="e.g. rahul@gmail.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {isSignup && password && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3].map(i => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= passwordStrength.level ? passwordStrength.color : 'bg-muted'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">Password strength: <span className="font-medium">{passwordStrength.label}</span></p>
                </div>
              )}
            </div>
            {isSignup && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {!passwordsMatch && (
                  <p className="text-xs text-destructive font-medium">Passwords don't match</p>
                )}
              </div>
            )}

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
