import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Users, ArrowRight } from 'lucide-react';
import incomeshieldLogo from '@/assets/incomeshield-logo.png';
import LanguageSelector from '@/components/LanguageSelector';
import ScootyBackground from '@/components/ScootyBackground';
import { useTranslation } from '@/hooks/useTranslation';

export default function RoleSelectPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative" style={{ background: 'hsl(222, 47%, 6%)' }}>
      <ScootyBackground />
      <div className="absolute top-4 right-4 z-20">
        <LanguageSelector compact />
      </div>

      <motion.div
        className="text-center space-y-8 max-w-lg w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-center gap-3">
          <img src={incomeshieldLogo} alt="IncomeShield Logo" className="h-14 w-14 invert" />
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'hsl(220, 20%, 93%)' }}>
              {t('appName')}
            </h1>
            <p className="text-xs" style={{ color: 'hsl(220, 9%, 55%)' }}>{t('tagline')}</p>
          </div>
        </div>

        <h2 className="text-xl font-semibold" style={{ color: 'hsl(220, 20%, 85%)' }}>
          {t('chooseLoginType')}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.button
            whileHover={{ y: -4, boxShadow: '0 8px 24px hsl(230, 65%, 28% / 0.4)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/login?role=admin')}
            className="p-6 rounded-2xl text-left space-y-3 btn-3d transition-colors"
            style={{
              background: 'hsl(222, 47%, 11%)',
              border: '1px solid hsl(222, 30%, 18%)',
            }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'hsl(230, 65%, 28% / 0.2)' }}>
              <Shield className="h-6 w-6" style={{ color: 'hsl(230, 65%, 55%)' }} />
            </div>
            <h3 className="text-lg font-bold" style={{ color: 'hsl(220, 20%, 93%)' }}>{t('adminLogin')}</h3>
            <p className="text-sm" style={{ color: 'hsl(220, 9%, 55%)' }}>{t('adminDesc')}</p>
            <ArrowRight className="h-4 w-4" style={{ color: 'hsl(168, 64%, 42%)' }} />
          </motion.button>

          <motion.button
            whileHover={{ y: -4, boxShadow: '0 8px 24px hsl(168, 64%, 42% / 0.2)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/login?role=user')}
            className="p-6 rounded-2xl text-left space-y-3 btn-3d transition-colors"
            style={{
              background: 'hsl(222, 47%, 11%)',
              border: '1px solid hsl(222, 30%, 18%)',
            }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'hsl(168, 64%, 42% / 0.15)' }}>
              <Users className="h-6 w-6" style={{ color: 'hsl(168, 64%, 42%)' }} />
            </div>
            <h3 className="text-lg font-bold" style={{ color: 'hsl(220, 20%, 93%)' }}>{t('userLogin')}</h3>
            <p className="text-sm" style={{ color: 'hsl(220, 9%, 55%)' }}>{t('userDesc')}</p>
            <ArrowRight className="h-4 w-4" style={{ color: 'hsl(168, 64%, 42%)' }} />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
