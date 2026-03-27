import { motion } from 'framer-motion';

export default function RupeeLoadingAnimation() {
  const circles = [
    { radius: 60, dashArray: '30 20', duration: 3, direction: 1 },
    { radius: 85, dashArray: '40 15 10 15', duration: 4, direction: -1 },
    { radius: 110, dashArray: '20 25 35 20', duration: 5, direction: 1 },
    { radius: 135, dashArray: '50 10 20 10', duration: 3.5, direction: -1 },
    { radius: 160, dashArray: '15 30 25 20', duration: 4.5, direction: 1 },
  ];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'hsl(222, 47%, 6%)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative flex items-center justify-center" style={{ width: 360, height: 360 }}>
        <svg
          viewBox="0 0 360 360"
          className="absolute inset-0 w-full h-full"
        >
          {circles.map((c, i) => (
            <motion.circle
              key={i}
              cx="180"
              cy="180"
              r={c.radius}
              fill="none"
              stroke={`hsl(230, 65%, ${40 + i * 8}%)`}
              strokeWidth={2.5}
              strokeDasharray={c.dashArray}
              strokeLinecap="round"
              initial={{ rotate: 0 }}
              animate={{ rotate: c.direction * 360 }}
              transition={{
                duration: c.duration,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{ transformOrigin: '180px 180px' }}
            />
          ))}
        </svg>

        {/* ₹ Symbol */}
        <motion.div
          className="relative z-10 flex items-center justify-center w-20 h-20 rounded-full"
          style={{
            background: 'linear-gradient(135deg, hsl(230, 65%, 28%), hsl(260, 60%, 40%))',
            boxShadow: '0 0 40px hsl(230, 65%, 28% / 0.5)',
          }}
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.1, 1] }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <span className="text-4xl font-bold text-white">₹</span>
        </motion.div>

        {/* Pulsing glow */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 100,
            height: 100,
            background: 'hsl(230, 65%, 28% / 0.2)',
          }}
          animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <motion.p
        className="absolute bottom-24 text-sm font-medium tracking-wider"
        style={{ color: 'hsl(220, 20%, 60%)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.5, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Loading GigGuard...
      </motion.p>
    </motion.div>
  );
}
