import { motion } from 'framer-motion';
import { Shield, CheckCircle, CloudRain, MapPin } from 'lucide-react';

export default function IPhoneMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateY: -8 }}
      animate={{ opacity: 1, y: 0, rotateY: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="relative mx-auto"
      style={{ width: 260, perspective: '1000px' }}
    >
      {/* Phone frame */}
      <div
        className="rounded-[2.5rem] p-2 relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, hsl(222, 30%, 22%), hsl(222, 30%, 12%))',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5), inset 0 1px 0 hsl(222, 30%, 30%)',
        }}
      >
        {/* Notch */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-5 rounded-full z-10" style={{ background: 'hsl(222, 47%, 8%)' }} />

        {/* Screen */}
        <div className="rounded-[2rem] overflow-hidden" style={{ background: 'hsl(222, 47%, 8%)' }}>
          <div className="pt-8 pb-4 px-4 space-y-3" style={{ minHeight: 420 }}>
            {/* Status bar mock */}
            <div className="flex items-center justify-between text-[9px] px-1" style={{ color: 'hsl(220, 9%, 55%)' }}>
              <span>9:41</span>
              <div className="flex gap-1">
                <span>●●●●</span>
                <span>WiFi</span>
                <span>100%</span>
              </div>
            </div>

            {/* Header */}
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" style={{ color: 'hsl(168, 64%, 42%)' }} />
              <span className="text-xs font-bold" style={{ color: 'hsl(220, 20%, 93%)' }}>IncomeShield</span>
            </div>

            {/* Greeting */}
            <div>
              <p className="text-sm font-bold" style={{ color: 'hsl(220, 20%, 93%)' }}>Hi, Rahul 👋</p>
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin className="h-2.5 w-2.5" style={{ color: 'hsl(230, 65%, 55%)' }} />
                <span className="text-[10px]" style={{ color: 'hsl(220, 9%, 55%)' }}>Koramangala, Bengaluru</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg p-2" style={{ background: 'hsl(222, 47%, 11%)', border: '1px solid hsl(222, 30%, 18%)' }}>
                <p className="text-[8px]" style={{ color: 'hsl(220, 9%, 55%)' }}>Saved</p>
                <p className="text-sm font-bold" style={{ color: 'hsl(152, 69%, 41%)' }}>₹2,450</p>
              </div>
              <div className="rounded-lg p-2" style={{ background: 'hsl(222, 47%, 11%)', border: '1px solid hsl(222, 30%, 18%)' }}>
                <p className="text-[8px]" style={{ color: 'hsl(220, 9%, 55%)' }}>Coverage</p>
                <p className="text-sm font-bold" style={{ color: 'hsl(220, 20%, 93%)' }}>₹3,000</p>
              </div>
            </div>

            {/* Weather alert */}
            <div className="rounded-lg p-2 flex items-center gap-2" style={{ background: 'hsl(0, 72%, 51% / 0.1)', border: '1px solid hsl(0, 72%, 51% / 0.2)' }}>
              <CloudRain className="h-3.5 w-3.5 shrink-0" style={{ color: 'hsl(0, 72%, 51%)' }} />
              <div>
                <p className="text-[9px] font-bold" style={{ color: 'hsl(0, 72%, 51%)' }}>Heavy Rain Alert</p>
                <p className="text-[8px]" style={{ color: 'hsl(0, 72%, 51% / 0.7)' }}>65mm/hr — Auto-claim initiated</p>
              </div>
            </div>

            {/* Payment Success */}
            <div className="rounded-lg p-3 text-center" style={{ background: 'hsl(152, 69%, 41% / 0.08)', border: '1px solid hsl(152, 69%, 41% / 0.2)' }}>
              <CheckCircle className="h-6 w-6 mx-auto mb-1" style={{ color: 'hsl(152, 69%, 41%)' }} />
              <p className="text-[10px] font-bold" style={{ color: 'hsl(152, 69%, 41%)' }}>Payment Successful</p>
              <p className="text-lg font-extrabold" style={{ color: 'hsl(220, 20%, 93%)' }}>₹500</p>
              <p className="text-[8px]" style={{ color: 'hsl(220, 9%, 55%)' }}>TXN_RPY_8A47K • Credited to UPI</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
