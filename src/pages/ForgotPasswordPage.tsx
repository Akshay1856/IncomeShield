import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import incomeshieldLogo from '@/assets/incomeshield-logo.png';
import LanguageSelector from '@/components/LanguageSelector';
import { useTranslation } from '@/hooks/useTranslation';
import ScootyBackground from '@/components/ScootyBackground';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
      toast.success(t('passwordResetSent'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12" style={{ background: 'hsl(222, 47%, 6%)' }}>
      <div className="absolute top-4 right-4 z-20">
        <LanguageSelector compact />
      </div>

      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-2">
          <img src={incomeshieldLogo} alt="IncomeShield Logo" className="h-12 w-12 invert" />
          <span className="text-2xl font-bold text-foreground">{t('appName')}</span>
          <p className="text-xs text-muted-foreground">{t('tagline')}</p>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">{t('forgotPassword')}</h2>
          <p className="mt-1 text-muted-foreground text-sm">
            {sent ? t('passwordResetSent') : 'Enter your email and we\'ll send you a reset link'}
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="e.g. rahul@gmail.com"
                required
              />
            </div>
            <Button type="submit" className="w-full h-11 text-base font-semibold btn-3d" disabled={loading}>
              {loading ? t('pleaseWait') : 'Send Reset Link'}
            </Button>
          </form>
        ) : (
          <div className="text-center p-6 rounded-xl bg-safe/10 border border-safe/20">
            <p className="text-foreground">✅ {t('passwordResetSent')}</p>
            <p className="text-sm text-muted-foreground mt-2">Check your inbox and follow the link.</p>
          </div>
        )}

        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-sm text-primary hover:underline mx-auto btn-3d"
        >
          <ArrowLeft className="h-4 w-4" /> Back to {t('signIn')}
        </button>
      </div>
    </div>
  );
}
