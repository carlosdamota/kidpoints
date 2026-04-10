import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { X, Search } from 'lucide-react';

const COMMON_ICONS = [
  'Bed', 'Bath', 'Utensils', 'Book', 'Shirt', 'Apple', 'Brush', 'Broom', 'Trash',
  'Moon', 'Sun', 'Gamepad', 'Tv', 'IceCream', 'Bike', 'Trophy', 'Star', 'Heart',
  'Smile', 'Zap', 'Music', 'Dog', 'Cat', 'Car', 'Bus', 'Train', 'Plane', 'Rocket',
  'Palette', 'Pencil', 'Scissors', 'Hammer', 'Wrench', 'Clock', 'Calendar', 'Check',
  'AlertTriangle', 'Info', 'HelpCircle', 'Home', 'Camera', 'Video', 'Mic', 
  'Headphones', 'Speaker', 'Bell', 'Mail', 'MessageSquare', 'Cloud', 'Umbrella', 
  'Snowflake', 'Flame', 'Droplet', 'Wind', 'Compass', 'Map', 'Navigation', 'Location', 
  'Globe', 'Baby', 'Megaphone', 'Hand', 'ThumbsUp', 'ThumbsDown', 'Frown', 'Ban', 
  'ShieldAlert', 'EarOff', 'VolumeX', 'Sparkles', 'Footprints', 'HeartOff', 'Ghost', 
  'Skull', 'Flower', 'TreePine', 'Bird', 'Fish', 'Rabbit', 'Turtle', 'Bug', 
  'Cherry', 'Lollipop', 'Pizza', 'CakeSlice'
];

interface IconPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (iconName: string) => void;
  selectedIcon?: string;
}

export function IconPicker({ isOpen, onClose, onSelect, selectedIcon }: IconPickerProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredIcons = COMMON_ICONS.filter(iconName => 
    iconName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-space-dark border-2 border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
              <h3 className="text-lg font-black text-white">Seleccionar Icono</h3>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 border-b border-white/10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <input
                  type="text"
                  placeholder="Buscar icono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-neon focus:ring-1 focus:ring-cyan-neon transition-all"
                />
              </div>
            </div>

            <div className="p-4 overflow-y-auto flex-1 no-scrollbar">
              {filteredIcons.length === 0 ? (
                <div className="text-center py-8 text-white/50">
                  No se encontraron iconos.
                </div>
              ) : (
                <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                  {filteredIcons.map(iconName => {
                    const IconComponent = (LucideIcons as any)[iconName];
                    if (!IconComponent) return null;
                    
                    const isSelected = selectedIcon === iconName;
                    
                    return (
                      <button
                        key={iconName}
                        onClick={() => {
                          onSelect(iconName);
                          onClose();
                        }}
                        className={cn(
                          "aspect-square flex items-center justify-center rounded-xl transition-all duration-200",
                          isSelected 
                            ? "bg-cyan-neon text-space-dark scale-110 shadow-[0_0_15px_rgba(0,252,255,0.4)]" 
                            : "bg-white/5 text-white/70 hover:bg-white/15 hover:text-white hover:scale-105"
                        )}
                        title={iconName}
                      >
                        <IconComponent size={24} />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
