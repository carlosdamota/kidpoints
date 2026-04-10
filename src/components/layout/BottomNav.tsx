import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { ClipboardList, Wallet, ShoppingBag } from 'lucide-react';
import { cn } from '../../lib/utils';

export type Tab = 'misiones' | 'puntos' | 'tienda' | 'admin';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 md:bottom-6 left-0 right-0 max-w-md md:max-w-xl lg:max-w-2xl mx-auto bg-space-dark/40 border-t md:border border-cyan-neon/30 px-4 py-1.5 md:py-2 flex justify-between items-center z-40 md:rounded-full md:shadow-[0_0_30px_rgba(0,255,255,0.15)] backdrop-blur-xl">
      <NavButton 
        active={activeTab === 'misiones'} 
        onClick={() => onTabChange('misiones')}
        icon={<ClipboardList size={24} />}
        label="Misiones"
      />
      <NavButton 
        active={activeTab === 'puntos'} 
        onClick={() => onTabChange('puntos')}
        icon={<Wallet size={24} />}
        label="Puntos"
      />
      <NavButton 
        active={activeTab === 'tienda'} 
        onClick={() => onTabChange('tienda')}
        icon={<ShoppingBag size={24} />}
        label="Tienda"
      />
    </nav>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: ReactNode; label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center gap-0.5 transition-colors min-h-[56px] min-w-[70px] justify-center rounded-xl",
        active ? "text-cyan-neon" : "text-gray-500 hover:text-gray-400"
      )}
    >
      {active && (
        <motion.div
          layoutId="bottom-nav-indicator"
          className="absolute inset-0 bg-cyan-neon/15 rounded-2xl shadow-[0_0_10px_rgba(0,255,255,0.2)] border border-cyan-neon/30"
          initial={false}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
      <motion.div
        className="z-10"
        animate={active ? { scale: 1.15, y: -4 } : { scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {icon}
      </motion.div>
      <span className={cn("text-[10px] font-black uppercase tracking-widest z-10 transition-opacity duration-200", active ? "opacity-100" : "opacity-0")}>
        {label}
      </span>
    </button>
  );
}
