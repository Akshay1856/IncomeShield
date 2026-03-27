import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CloudRain, Shield, Zap, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import gigguardLogo from '@/assets/gigguard-logo.png';

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

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center relative">
        {/* Animated background blobs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-primary/10 blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent/10 blur-3xl"
          animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
          className="relative z-10 max-w-lg space-y-8"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={scaleIn} className="flex items-center justify-center">
            <img src={gigguardLogo} alt="GigGuard Logo" className="h-20 w-20" />
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-5xl font-extrabold tracking-tight text-foreground">
            GigGuard
          </motion.h1>

          <motion.p variants={fadeUp} className="text-lg text-muted-foreground leading-relaxed">
            Protecting Delivery Partners from Income Loss
          </motion.p>

          <motion.div variants={fadeUp} className="grid grid-cols-3 gap-4 pt-6">
            {[
              { icon: CloudRain, title: 'Rain Cover', desc: 'Get paid when weather stops you' },
              { icon: Shield, title: '₹199/mo', desc: 'Affordable micro-insurance' },
              { icon: Zap, title: 'Instant', desc: 'Auto-payouts in minutes' },
            ].map((f) => (
              <motion.div
                key={f.title}
                whileHover={{ y: -4, boxShadow: '0 8px 24px hsl(var(--primary) / 0.15)' }}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border transition-colors"
              >
                <f.icon className="h-7 w-7 text-primary" />
                <span className="font-semibold text-sm text-foreground">{f.title}</span>
                <span className="text-xs text-muted-foreground text-center">{f.desc}</span>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={fadeUp}>
            <Button
              size="lg"
              className="mt-8 h-14 px-10 text-lg font-bold gap-2 rounded-full"
              onClick={() => navigate('/login')}
            >
              Get Started <ArrowRight className="h-5 w-5" />
            </Button>
          </motion.div>

          <motion.p variants={fadeUp} className="text-xs text-muted-foreground pt-2">
            No credit card required · Cancel anytime
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
