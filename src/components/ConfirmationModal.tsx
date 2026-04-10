import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'default' | 'destructive';
  icon?: React.ReactNode;
}

export function ConfirmationModal({
  isOpen,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  variant = 'default',
  icon
}: ConfirmationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-space-dark border-2 border-white/10 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl"
          >
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-3 rounded-2xl",
                  variant === 'destructive' ? "bg-red-500/20 text-red-400" : "bg-cyan-neon/20 text-cyan-neon"
                )}>
                  {icon || <AlertTriangle size={24} />}
                </div>
                <h3 className="text-xl font-black text-white tracking-tight leading-tight">{title}</h3>
              </div>
              
              <p className="text-white/70 font-medium leading-relaxed">
                {description}
              </p>
              
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={onCancel}
                  className="flex-1 h-12 rounded-xl border-white/10 bg-white/5 text-white font-bold hover:bg-white/10"
                >
                  {cancelText}
                </Button>
                <Button
                  onClick={onConfirm}
                  className={cn(
                    "flex-1 h-12 rounded-xl font-black shadow-lg",
                    variant === 'destructive' 
                      ? "bg-red-600 hover:bg-red-700 text-white" 
                      : "bg-cyan-neon hover:bg-cyan-400 text-space-dark"
                  )}
                >
                  {confirmText}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
