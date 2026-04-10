import { motion } from 'motion/react';
import { History as HistoryIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { isSameDay, parseISO } from 'date-fns';
import { useFamily } from '../../context/FamilyContext';
import { ThemeIcon } from '../ThemeIcon';

export function StatsView() {
  const { state, activeChild, nextReward, weeklyData, currentDate, pointsToday } = useFamily();

  if (!state || !activeChild || !nextReward) return null;

  const progressToNext = Math.min(100, (activeChild.totalPoints / nextReward.cost) * 100);

  return (
    <motion.div
      key="puntos"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.2 }}
      className="space-y-8 py-8"
    >
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-cyan-neon uppercase tracking-widest">BANCO DE PUNTOS ({activeChild.name})</h2>
            <div className="relative inline-block">
              <div className="w-48 h-48 rounded-full border-8 border-gold-neon flex flex-col items-center justify-center bg-gold-neon/10 glow-gold">
                <div className="flex items-center gap-2 text-gold-neon text-glow-gold">
                  <ThemeIcon theme={activeChild.theme} size={40} />
                  <span className="text-6xl font-black">
                    {activeChild.totalPoints}
                  </span>
                </div>
                <span className="text-sm font-bold text-gold-neon/80 mt-2 uppercase tracking-tighter">PUNTOS TOTALES</span>
              </div>
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-4 border-2 border-dashed border-cyan-neon/30 rounded-full"
              />
            </div>
          </div>

          <div className="bg-gray-950/40 backdrop-blur-md border-2 border-cyan-neon/30 p-6 rounded-3xl space-y-4 shadow-2xl">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <p className="text-cyan-neon text-sm font-black uppercase">PRÓXIMO PREMIO:</p>
                <p className="text-xl font-black text-white">{nextReward.name}</p>
              </div>
              <p className="text-gold-neon font-black">{activeChild.totalPoints} / {nextReward.cost}</p>
            </div>
            <div className="h-8 bg-black rounded-full overflow-hidden border border-cyan-neon/20 p-1">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressToNext}%` }}
                className="h-full bg-gradient-to-r from-cyan-neon to-blue-500 rounded-full glow-cyan"
              />
            </div>
            <p className="text-center text-cyan-neon font-bold text-sm">
              ¡Solo necesitas {nextReward.cost - activeChild.totalPoints} puntos más!
            </p>
          </div>
        </div>

        <div className="h-64 md:h-full min-h-[300px] bg-gray-950/40 backdrop-blur-md rounded-3xl p-4 border border-cyan-neon/20 shadow-2xl">
          <h3 className="text-sm font-black text-cyan-neon mb-4 flex items-center gap-2 uppercase">
            <HistoryIcon size={16} /> REGISTRO SEMANAL
          </h3>
          <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyData}>
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#00f2ff', fontSize: 12, fontWeight: 'bold' }} 
            />
            <Tooltip 
              cursor={{ fill: 'rgba(0, 242, 255, 0.05)' }}
              contentStyle={{ 
                backgroundColor: 'rgba(5, 7, 10, 0.8)', 
                border: '2px solid #00f2ff', 
                borderRadius: '16px',
                backdropBlur: '8px',
                boxShadow: '0 0 15px rgba(0, 242, 255, 0.2)',
                padding: '8px 12px'
              }}
              itemStyle={{
                color: '#00f2ff',
                fontWeight: '900',
                textTransform: 'uppercase',
                fontSize: '12px'
              }}
              labelStyle={{
                color: '#ffcc00',
                fontWeight: '900',
                marginBottom: '4px',
                fontSize: '10px'
              }}
            />
            <Bar dataKey="points" name="Puntos" radius={[4, 4, 0, 0]}>
              {weeklyData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={isSameDay(parseISO(entry.fullDate), parseISO(currentDate)) ? '#ffcc00' : '#00f2ff'} 
                  className={isSameDay(parseISO(entry.fullDate), parseISO(currentDate)) ? 'glow-gold' : 'glow-cyan'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
