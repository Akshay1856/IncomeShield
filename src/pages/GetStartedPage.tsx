import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CloudRain, Shield, Zap, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import incomeshieldLogo from '@/assets/incomeshield-logo.png';
import RupeeLoadingAnimation from '@/components/RupeeLoadingAnimation';
import IPhoneMockup from '@/components/IPhoneMockup';
import LanguageSelector from '@/components/LanguageSelector';
import ScootyBackground from '@/components/ScootyBackground';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

export default function GetStartedPage() {
  const navigate = useNavigate();
  const [showLoader, setShowLoader] = useState(false);

  const handleGetStarted = () => {
    setShowLoader(true);
    setTimeout(() => {
      navigate('/plans');
    }, 2000);
  };

  return (
    <>
      <AnimatePresence>
        {showLoader && <RupeeLoadingAnimation />}
      </AnimatePresence>

      <div className="dark min-h-screen flex flex-col overflow-hidden relative" style={{ background: 'hsl(222, 47%, 6%)' }}>
        <ScootyBackground />
        {/* Language selector top-right */}
        <div className="absolute top-4 right-4 z-20">
          <LanguageSelector compact />
        </div>

        <div className="flex-1 flex flex-col lg:flex-row items-center justify-center px-6 py-12 gap-12 relative">
          {/* Animated background blobs */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full blur-3xl"
            style={{ background: 'hsl(230, 65%, 28% / 0.15)' }}
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl"
            style={{ background: 'hsl(168, 64%, 42% / 0.1)' }}
            animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Left: Content */}
          <motion.div
            className="relative z-10 max-w-lg space-y-8 text-center lg:text-left"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={scaleIn} className="flex items-center justify-center lg:justify-start">
              <img src={incomeshieldLogo} alt="IncomeShield Logo" className="h-20 w-20 invert" />
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-5xl font-extrabold tracking-tight" style={{ color: 'hsl(220, 20%, 93%)' }}>
              IncomeShield
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg leading-relaxed" style={{ color: 'hsl(220, 9%, 60%)' }}>
              Protecting Delivery Partners from Income Loss
            </motion.p>

            <motion.div variants={fadeUp} className="grid grid-cols-3 gap-4 pt-6">
              {[
                { icon: CloudRain, title: 'Rain Cover', desc: 'Get paid when weather stops you' },
                { icon: Shield, title: '₹99/mo', desc: 'Affordable micro-insurance' },
                { icon: Zap, title: 'Instant', desc: 'Auto-payouts in minutes' },
              ].map((f) => (
                <motion.div
                  key={f.title}
                  whileHover={{ y: -4, boxShadow: '0 8px 24px hsl(230, 65%, 28% / 0.3)' }}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl transition-colors btn-3d"
                  style={{
                    background: 'hsl(222, 47%, 11%)',
                    border: '1px solid hsl(222, 30%, 18%)',
                  }}
                >
                  <f.icon className="h-7 w-7" style={{ color: 'hsl(168, 64%, 42%)' }} />
                  <span className="font-semibold text-sm" style={{ color: 'hsl(220, 20%, 93%)' }}>{f.title}</span>
                  <span className="text-xs text-center" style={{ color: 'hsl(220, 9%, 55%)' }}>{f.desc}</span>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp}>
              <Button
                size="lg"
                className="mt-8 h-14 px-10 text-lg font-bold gap-2 rounded-full btn-3d"
                onClick={handleGetStarted}
                disabled={showLoader}
              >
                Get Started <ArrowRight className="h-5 w-5" />
              </Button>
            </motion.div>

            <motion.p variants={fadeUp} className="text-xs pt-2" style={{ color: 'hsl(220, 9%, 50%)' }}>
              15 days free trial · No credit card required
            </motion.p>
          </motion.div>

          {/* Right: iPhone Mockup */}
          <div className="hidden lg:block relative z-10">
            <IPhoneMockup />
          </div>
        </div>
      </div>
    </>
  );
}
