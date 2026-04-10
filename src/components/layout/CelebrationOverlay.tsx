import { motion, AnimatePresence } from 'motion/react';
import { Star, AlertTriangle, AlertCircle } from 'lucide-react';
import { useFamily } from '../../context/FamilyContext';

export function CelebrationOverlay() {
  const { showCelebration } = useFamily();

  const isPenalty = showCelebration.type === 'penalty';
  const isWarning = showCelebration.type === 'warning';
  
  const borderColor = isPenalty ? 'border-red-500' : isWarning ? 'border-yellow-500' : 'border-cyan-neon';
  const glowColor = isPenalty ? 'shadow-[0_0_15px_rgba(239,68,68,0.5)]' : isWarning ? 'shadow-[0_0_15px_rgba(234,179,8,0.5)]' : 'glow-cyan';
  const barColor = isPenalty ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-cyan-neon';
  const iconBgColor = isPenalty ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-gold-neon';
  const iconGlow = isPenalty ? 'shadow-[0_0_15px_rgba(239,68,68,0.8)]' : isWarning ? 'shadow-[0_0_15px_rgba(234,179,8,0.8)]' : 'glow-gold';
  const titleColor = isPenalty ? 'text-red-500' : isWarning ? 'text-yellow-500' : 'text-cyan-neon';
  const titleGlow = isPenalty ? 'drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]' : isWarning ? 'drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]' : 'text-glow-cyan';

  return (
    <AnimatePresence>
      {showCelebration.show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-space-dark/90 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`bg-space-dark/80 border-4 ${borderColor} p-10 rounded-[40px] text-center space-y-6 ${glowColor} relative overflow-hidden`}
          >
            <div className={`absolute top-0 left-0 w-full h-2 ${barColor} animate-pulse`} />
            <div className="flex justify-center">
              <div className={`w-24 h-24 ${iconBgColor} rounded-full flex items-center justify-center ${iconGlow}`}>
                {isPenalty ? (
                  <AlertTriangle className="text-white" size={48} />
                ) : isWarning ? (
                  <AlertCircle className="text-white" size={48} />
                ) : (
                  <Star className="text-space-dark" size={48} fill="currentColor" />
                )}
              </div>
            </div>
            <div className="space-y-2">
              <h2 className={`text-4xl font-black ${titleColor} ${titleGlow} leading-tight`}>
                {showCelebration.title}
              </h2>
              <p className="text-2xl font-bold text-white">
                {showCelebration.subtitle}
              </p>
            </div>
            {!isPenalty && !isWarning && (
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -10, 0] }}
                    transition={{ delay: i * 0.1, repeat: Infinity }}
                  >
                    <Star className="text-gold-neon" size={24} fill="currentColor" />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
