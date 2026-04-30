import { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useFamily } from '../../context/FamilyContext';
import { cn } from '../../lib/utils';
import { ThemeIcon } from '../ThemeIcon';
import { ConfirmationModal } from '../ConfirmationModal';

export function MisionesView() {
  const { state, activeChild, pointsToday, handleCompleteTask, currentDate } = useFamily();
  const [confirmTask, setConfirmTask] = useState<{ id: string, name: string, points: number } | null>(null);

  if (!state || !activeChild) return null;

  return (
    <motion.div
      key="misiones"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <h2 className="text-3xl font-black text-center text-gold-neon mb-8">MISIONES DIARIAS</h2>
      
      {state.taskMode === 'repeatable' && (
        <div className="bg-gray-950/40 backdrop-blur-md border-2 border-cyan-neon/30 p-4 rounded-2xl mb-6 text-center shadow-2xl">
          <p className="text-cyan-neon text-sm font-black mb-2 uppercase">PUNTOS DE HOY</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl font-black text-white">{pointsToday}</span>
            <span className="text-xl font-bold text-white/40">/ {state.maxDailyPoints}</span>
          </div>
          <div className="h-2 bg-black rounded-full mt-3 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (pointsToday / state.maxDailyPoints) * 100)}%` }}
              className="h-full bg-cyan-neon"
            />
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(activeChild.tasks ?? []).map((task) => {
          const completedDates = task.completedDates || [];
          const isCompletedSingle = state.taskMode === 'single' && completedDates.includes(currentDate);
          const wouldExceedMax = state.taskMode === 'repeatable' && (pointsToday + task.points > state.maxDailyPoints);
          const isDisabled = isCompletedSingle || wouldExceedMax;
          const timesCompletedToday = completedDates.filter(d => d === currentDate).length;
          
          const TaskIcon = task.icon ? (LucideIcons as any)[task.icon] : null;

          return (
            <motion.button
              key={task.id}
              whileTap={!isDisabled ? { scale: 0.98 } : {}}
              disabled={isDisabled}
              onClick={() => setConfirmTask({ id: task.id, name: task.name, points: task.points })}
              className={cn(
                "relative w-full min-h-[90px] p-4 rounded-[24px] border-2 flex items-center justify-between transition-all overflow-visible group",
                isDisabled 
                  ? "bg-green-950/40 backdrop-blur-md border-green-500/30 opacity-90 grayscale-[0.5]" 
                  : task.points < 0
                    ? "bg-red-950/60 backdrop-blur-md border-red-500/50 hover:border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                    : "bg-gray-950/40 backdrop-blur-md border-cyan-neon hover:border-white/50 transition-all duration-200"
              )}
              style={!isDisabled ? { 
                boxShadow: task.points < 0 
                  ? '0 5px 15px rgba(239, 68, 68, 0.15)' 
                  : '0 5px 15px rgba(var(--theme-primary-rgb), 0.15)',
              } : {}}
            >
              {/* Decorative Theme Icon (Top Border) - Positioned centered on the top edge */}
              <div className="absolute -top-[22px] right-6 z-20 group-hover:scale-110 transition-transform duration-200 pointer-events-none">
                <ThemeIcon 
                  theme={activeChild.theme} 
                  size={42} 
                  fill={task.points < 0 ? "#ef4444" : "var(--theme-primary)"}
                  className={task.points < 0 ? "text-red-500" : "text-cyan-neon"}
                />
              </div>

              <div className="flex items-center gap-3 z-10 relative flex-1 pr-2">
                {TaskIcon && (
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border-2 bg-black/50",
                    task.points < 0 ? "border-red-500/50 text-red-500" : "border-cyan-neon/50 text-cyan-neon"
                  )}>
                    <TaskIcon size={24} />
                  </div>
                )}
                <div className="flex flex-col items-start text-left">
                  <span className={cn(
                    "text-lg font-black leading-tight tracking-tight drop-shadow-md line-clamp-2",
                    isCompletedSingle ? "text-green-400/70 line-through decoration-2" : "text-white"
                  )}>
                    {task.name}
                  </span>
                  {!isCompletedSingle && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full animate-pulse",
                        task.points < 0 ? "bg-red-500" : "bg-gold-neon"
                      )} />
                      <span className={cn(
                        "font-black text-sm tracking-tighter",
                        task.points < 0 
                          ? "text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" 
                          : "text-gold-neon drop-shadow-[0_0_8px_rgba(255,204,0,0.5)]"
                      )}>
                        {task.points > 0 ? `+${task.points}` : task.points} PUNTOS
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 z-10 relative shrink-0">
                {state.taskMode === 'repeatable' && timesCompletedToday > 0 && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-cyan-neon text-space-dark font-black px-2 py-1 rounded-xl text-xs shadow-[0_0_10px_rgba(0,252,255,0.4)] border border-white/30"
                  >
                    x{timesCompletedToday}
                  </motion.div>
                )}
                
                {isCompletedSingle ? (
                  <motion.div 
                    initial={{ scale: 0, rotate: -90 }} 
                    animate={{ scale: 1, rotate: 0 }} 
                    className="bg-green-500 rounded-xl p-1.5 shadow-[0_0_15px_rgba(34,197,94,0.5)] border border-white/20"
                  >
                    <CheckCircle2 className="text-space-dark" size={18} />
                  </motion.div>
                ) : (
                  <div className="bg-white/10  rounded-xl p-1.5 border border-white/20 group-hover:bg-cyan-neon group-hover:text-space-dark transition-colors">
                    <ChevronRight size={18} />
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      <ConfirmationModal
        isOpen={!!confirmTask}
        title={confirmTask?.points && confirmTask.points < 0 ? "Aplicar penalización" : "Completar misión"}
        description={confirmTask?.points && confirmTask.points < 0 
          ? `¿Estás seguro de que quieres aplicar la penalización "${confirmTask?.name}"? Se restarán ${Math.abs(confirmTask.points)} puntos.`
          : `¿Estás seguro de que has completado la misión "${confirmTask?.name}"? Ganarás ${confirmTask?.points} puntos.`}
        confirmText="Sí, confirmar"
        cancelText="Cancelar"
        variant={confirmTask?.points && confirmTask.points < 0 ? "destructive" : "default"}
        icon={confirmTask?.points && confirmTask.points < 0 ? undefined : <CheckCircle2 size={24} />}
        onConfirm={() => {
          if (confirmTask) {
            handleCompleteTask(confirmTask.id);
            setConfirmTask(null);
          }
        }}
        onCancel={() => setConfirmTask(null)}
      />
    </motion.div>
  );
}
