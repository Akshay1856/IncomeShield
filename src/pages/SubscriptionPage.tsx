import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Crown, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatePresence } from 'framer-motion';
import RupeeLoadingAnimation from '@/components/RupeeLoadingAnimation';
import incomeshieldLogo from '@/assets/incomeshield-logo.png';
import LanguageSelector from '@/components/LanguageSelector';

const plans = [
  {
    name: 'Basic Shield',
    icon: Shield,
    weeklyPrice: 29,
    monthlyPrice: 99,
    features: [
      'Rain disruption coverage',
      'Up to ₹500/week payout',
      'Auto-claim processing',
      'SMS notifications',
    ],
    popular: false,
  },
  {
    name: 'Pro Shield',
    icon: Zap,
    weeklyPrice: 59,
    monthlyPrice: 199,
    features: [
      'All Basic Shield features',
      'Heatwave + AQI coverage',
      'Up to ₹1,500/week payout',
      'Priority payouts (instant UPI)',
      'AI risk alerts',
    ],
    popular: true,
  },
  {
    name: 'Max Shield',
    icon: Crown,
    weeklyPrice: 99,
    monthlyPrice: 349,
    features: [
      'All Pro Shield features',
      'Platform downtime coverage',
      'Up to ₹3,000/week payout',
      'Dedicated support',
      'Family coverage (2 members)',
      'Accident & hospitalization add-on',
    ],
    popular: false,
  },
];

export default function SubscriptionPage() {
  const navigate = useNavigate();
  const [billing, setBilling] = useState<'weekly' | 'monthly'>('monthly');
  const [showLoader, setShowLoader] = useState(false);

  const handleSelectPlan = () => {
    setShowLoader(true);
    setTimeout(() => navigate('/role-select'), 2000);
  };

  const handleContinueFree = () => {
    setShowLoader(true);
    setTimeout(() => navigate('/role-select'), 2000);
  };

  return (
    <>
      <AnimatePresence>
        {showLoader && <RupeeLoadingAnimation />}
      </AnimatePresence>

      <div className="dark min-h-screen flex flex-col" style={{ background: 'hsl(222, 47%, 6%)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <img src={incomeshieldLogo} alt="IncomeShield" className="h-8 w-8" />
            <span className="text-lg font-bold" style={{ color: 'hsl(220, 20%, 93%)' }}>IncomeShield</span>
          </div>
          <LanguageSelector compact />
        </div>

        <div className="flex-1 flex flex-col items-center px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-extrabold tracking-tight mb-2" style={{ color: 'hsl(220, 20%, 93%)' }}>
              Choose Your Shield
            </h1>
            <p className="text-sm" style={{ color: 'hsl(220, 9%, 55%)' }}>
              Affordable plans designed for delivery partners
            </p>
          </motion.div>

          {/* Billing toggle */}
          <div className="flex items-center gap-1 p-1 rounded-full mb-8" style={{ background: 'hsl(222, 47%, 11%)' }}>
            <button
              onClick={() => setBilling('weekly')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                billing === 'weekly' ? 'bg-primary text-primary-foreground' : ''
              }`}
              style={billing !== 'weekly' ? { color: 'hsl(220, 9%, 55%)' } : {}}
            >
              Weekly
            </button>
            <button
              onClick={() => setBilling('monthly')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                billing === 'monthly' ? 'bg-primary text-primary-foreground' : ''
              }`}
              style={billing !== 'monthly' ? { color: 'hsl(220, 9%, 55%)' } : {}}
            >
              Monthly <span className="text-xs opacity-70">Save 15%</span>
            </button>
          </div>

          {/* Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl w-full">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl p-6 flex flex-col btn-3d ${
                  plan.popular ? 'ring-2 ring-primary' : ''
                }`}
                style={{
                  background: 'hsl(222, 47%, 11%)',
                  border: `1px solid ${plan.popular ? 'hsl(230, 65%, 40%)' : 'hsl(222, 30%, 18%)'}`,
                }}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold bg-primary text-primary-foreground">
                    Most Popular
                  </span>
                )}
                <div className="flex items-center gap-2 mb-4">
                  <plan.icon className="h-5 w-5" style={{ color: 'hsl(168, 64%, 42%)' }} />
                  <h3 className="font-bold" style={{ color: 'hsl(220, 20%, 93%)' }}>{plan.name}</h3>
                </div>
                <div className="mb-4">
                  <span className="text-3xl font-extrabold" style={{ color: 'hsl(220, 20%, 93%)' }}>
                    ₹{billing === 'weekly' ? plan.weeklyPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-sm" style={{ color: 'hsl(220, 9%, 55%)' }}>
                    /{billing === 'weekly' ? 'week' : 'month'}
                  </span>
                </div>
                <ul className="space-y-2 flex-1 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm" style={{ color: 'hsl(220, 9%, 65%)' }}>
                      <Check className="h-4 w-4 mt-0.5 shrink-0" style={{ color: 'hsl(152, 69%, 41%)' }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={handleSelectPlan}
                  className={`w-full btn-3d ${plan.popular ? '' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
                  disabled={showLoader}
                >
                  Select Plan
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Continue Free */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            onClick={handleContinueFree}
            disabled={showLoader}
            className="mt-8 flex items-center gap-2 text-sm font-medium transition-all hover:gap-3 btn-3d px-6 py-3 rounded-full"
            style={{ color: 'hsl(220, 9%, 60%)', background: 'hsl(222, 47%, 11%)', border: '1px solid hsl(222, 30%, 18%)' }}
          >
            Continue for Free (15 days only) <ArrowRight className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </>
  );
}
