import { Settings } from 'lucide-react';
import { useFamily } from '../../context/FamilyContext';
import { cn } from '../../lib/utils';

interface HeaderProps {
  onOpenAdmin: () => void;
}

export function Header({ onOpenAdmin }: HeaderProps) {
  const { state, activeChild, setActiveChildId } = useFamily();

  if (!state || !activeChild) return null;

  return (
    <header className="py-3 px-4 md:px-8 flex justify-between items-center border-b border-cyan-neon/20 bg-gray-950/40 sticky top-0 z-40 backdrop-blur-xl">
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar flex-1 py-6 -my-6 px-4 -mx-4 mr-4">
        {state.children.map(child => (
          <button
            key={child.id}
            onClick={() => setActiveChildId(child.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all border-2 shrink-0",
              activeChild.id === child.id 
                ? "border-cyan-neon bg-cyan-neon/10 glow-cyan text-white" 
                : "border-transparent text-white/40 hover:text-white/60"
            )}
          >
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center border",
              activeChild.id === child.id 
                ? "border-cyan-neon bg-cyan-neon/20 text-white" 
                : "border-white/20 text-white/40"
            )}>
              <span className="text-[10px] font-black uppercase">{child.name[0]}</span>
            </div>
            <span className={cn(
              "text-xs font-black uppercase tracking-tighter whitespace-nowrap",
              activeChild.id === child.id ? "text-white" : "text-white/40"
            )}>
              {child.name}
            </span>
          </button>
        ))}
      </div>
      <button 
        onClick={onOpenAdmin}
        className="p-2 text-gold-neon/50 hover:text-gold-neon transition-colors shrink-0"
      >
        <Settings size={24} />
      </button>
    </header>
  );
}
