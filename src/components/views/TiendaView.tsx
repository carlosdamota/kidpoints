import { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Gift } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useFamily } from '../../context/FamilyContext';
import { cn } from '../../lib/utils';
import { ThemeIcon } from '../ThemeIcon';
import { ConfirmationModal } from '../ConfirmationModal';

export function TiendaView() {
  const { state, activeChild, handleRedeemReward, redemptionsToday } = useFamily();
  const [confirmReward, setConfirmReward] = useState<{ id: string, name: string, cost: number } | null>(null);

  if (!state || !activeChild) return null;

  const isLimitReached = redemptionsToday >= 2;

  const isAvailableToday = (availableDays?: number[]) => {
    if (!availableDays || availableDays.length === 0 || availableDays.length === 7) return true;
    const day = new Date().getDay(); // 0 is Sunday, 6 is Saturday
    return availableDays.includes(day);
  };

  const getAvailabilityText = (availableDays?: number[]) => {
    if (!availableDays || availableDays.length === 0 || availableDays.length === 7) return null;
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    if (availableDays.length === 2 && availableDays.includes(0) && availableDays.includes(6)) return 'Solo Fines de Semana';
    if (availableDays.length === 5 && !availableDays.includes(0) && !availableDays.includes(6)) return 'Solo Días de Diario';
    return `Disponible: ${availableDays.map(d => dayNames[d]).join(', ')}`;
  };

  return (
    <motion.div
      key="tienda"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-cyan-neon mb-2">TIENDA DE PREMIOS</h2>
        <div className="flex flex-col items-center gap-2">
          <div className={cn(
            "inline-flex items-center gap-2 px-4 py-1.5 rounded-full border-2 text-xs font-black uppercase tracking-widest transition-all duration-300",
            isLimitReached 
              ? "bg-red-500/20 border-red-500/50 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]" 
              : "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
          )}>
            {isLimitReached ? 'Límite diario alcanzado' : `Canjes hoy: ${redemptionsToday} / 2`}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(activeChild.rewards ?? []).map((reward) => {
          const canAfford = activeChild.totalPoints >= reward.cost;
          const available = isAvailableToday(reward.availableDays);
          const isDisabled = !canAfford || isLimitReached || !available;
          const RewardIcon = reward.icon ? (LucideIcons as any)[reward.icon] : null;
          const availabilityText = getAvailabilityText(reward.availableDays);

          return (
            <motion.button
              key={reward.id}
              whileTap={!isDisabled ? { scale: 0.98 } : {}}
              onClick={() => !isDisabled && setConfirmReward({ id: reward.id, name: reward.name, cost: reward.cost })}
              className={cn(
                "relative w-full min-h-[90px] p-4 rounded-[24px] border-2 flex items-center justify-between transition-all overflow-hidden group",
                !isDisabled 
                  ? "bg-gray-950/40 backdrop-blur-md border-gold-neon hover:border-white/50 transition-all duration-200" 
                  : "bg-gray-900/40 backdrop-blur-md border-gray-700 opacity-60 grayscale"
              )}
              style={!isDisabled ? { 
                boxShadow: '0 5px 15px rgba(var(--theme-secondary-rgb), 0.15)',
              } : {}}
            >
              {/* Availability Badge */}
              {availabilityText && (
                <div className={cn(
                  "absolute top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter z-20 border whitespace-nowrap",
                  available 
                    ? "bg-green-500/20 border-green-500/50 text-green-400" 
                    : "bg-red-500/20 border-red-500/50 text-red-400"
                )}>
                  {availabilityText}
                </div>
              )}
              {/* Decorative Theme Icon Background (Bottom Left) */}
              <div className="absolute -left-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity rotate-12 pointer-events-none">
                <ThemeIcon theme={activeChild.theme} size={80} />
              </div>

              {/* Decorative Theme Icon (Top Right) - Further increased visibility */}
              <div className="absolute top-[6px] right-1 opacity-60 group-hover:opacity-100 transition-all duration-300 -rotate-12 group-hover:rotate-0 group-hover:scale-110 pointer-events-none z-0 text-white/20">
                <ThemeIcon theme={activeChild.theme} size={48} />
              </div>
              
              <div className="flex items-center gap-3 z-10 relative flex-1 pr-2">
                {RewardIcon && (
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border-2 border-gold-neon/50 bg-black/50 text-gold-neon">
                    <RewardIcon size={24} />
                  </div>
                )}
                <div className="flex flex-col items-start text-left">
                  <span className="text-lg font-black text-white tracking-tight drop-shadow-md line-clamp-2">{reward.name}</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", !isDisabled ? "bg-cyan-neon" : "bg-gray-500")} />
                    <span className={cn(
                      "font-black text-sm tracking-tighter drop-shadow-sm",
                      !isDisabled ? "text-cyan-neon" : "text-gray-500"
                    )}>
                      {reward.cost} PUNTOS
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 z-10 relative shrink-0">
                {!canAfford && (
                  <div className="flex flex-col items-end mr-1">
                    <span className="text-[9px] font-black text-red-400 uppercase tracking-widest">Faltan</span>
                    <span className="text-sm font-black text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]">{reward.cost - activeChild.totalPoints} pts</span>
                  </div>
                )}
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center border-2 shadow-xl transition-all duration-200",
                  !isDisabled 
                    ? "bg-gold-neon border-white/40 text-space-dark group-hover:rotate-6 group-hover:scale-110 shadow-gold-neon/20" 
                    : "bg-gray-800 border-gray-700 text-gray-500"
                )}>
                  {!isDisabled ? <ThemeIcon theme={activeChild.theme} size={20} /> : <Lock size={18} />}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <ConfirmationModal
        isOpen={!!confirmReward}
        title="Canjear premio"
        description={`¿Quieres canjear "${confirmReward?.name}" por ${confirmReward?.cost} puntos?`}
        confirmText="Sí, canjear"
        cancelText="Cancelar"
        icon={<Gift size={24} />}
        onConfirm={() => {
          if (confirmReward) {
            handleRedeemReward(confirmReward.id);
            setConfirmReward(null);
          }
        }}
        onCancel={() => setConfirmReward(null)}
      />
    </motion.div>
  );
}
