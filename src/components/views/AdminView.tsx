import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, LogOut, UserPlus, Minus, Plus, Trash2, PlusCircle, AlertTriangle, Palette, CheckCircle2, BookOpen, ShieldCheck, HelpCircle, Lightbulb, Scale, Sparkles, ShoppingBag, MessageSquare, Bug } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useFamily } from '../../context/FamilyContext';
import { logout, db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../../lib/firestore-errors';
import { cn } from '../../lib/utils';
import { droidSounds } from '../../lib/sounds';
import { THEMES } from '../../constants';
import { ChildProfile } from '../../types';
import { ThemeIcon } from '../ThemeIcon';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ConfirmationModal } from '../ConfirmationModal';

import * as LucideIcons from 'lucide-react';
import { IconPicker } from '../IconPicker';

function EditableItemRow({
  initialName,
  initialValue,
  initialIcon,
  initialAvailableDays,
  onSave,
  onDelete,
  isNegativeAllowed = false,
  showAvailability = false
}: {
  key?: React.Key;
  initialName: string;
  initialValue: number;
  initialIcon?: string;
  initialAvailableDays?: number[];
  onSave: (name: string, value: number, icon?: string, availableDays?: number[]) => void;
  onDelete: () => void;
  isNegativeAllowed?: boolean;
  showAvailability?: boolean;
}) {
  const [name, setName] = useState(initialName);
  const [value, setValue] = useState(initialValue.toString());
  const [icon, setIcon] = useState(initialIcon);
  const [availableDays, setAvailableDays] = useState<number[]>(initialAvailableDays || [0, 1, 2, 3, 4, 5, 6]);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [isDayPickerOpen, setIsDayPickerOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsDayPickerOpen(false);
      }
    };
    if (isDayPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDayPickerOpen]);

  const isEdited = name !== initialName || 
                   parseInt(value) !== initialValue || 
                   icon !== initialIcon || 
                   JSON.stringify(availableDays) !== JSON.stringify(initialAvailableDays || [0, 1, 2, 3, 4, 5, 6]);

  useEffect(() => {
    setName(initialName);
    setValue(initialValue.toString());
    setIcon(initialIcon);
    setAvailableDays(initialAvailableDays || [0, 1, 2, 3, 4, 5, 6]);
  }, [initialName, initialValue, initialIcon, initialAvailableDays]);

  const handleSave = () => {
    const parsedValue = parseInt(value);
    const finalValue = isNaN(parsedValue) ? 0 : parsedValue;
    if (isEdited) {
      onSave(name, finalValue, icon, availableDays);
    }
    setValue(finalValue.toString());
    setIsDayPickerOpen(false);
  };

  const toggleDay = (day: number) => {
    const newDays = availableDays.includes(day)
      ? availableDays.filter(d => d !== day)
      : [...availableDays, day].sort();
    setAvailableDays(newDays);
  };

  const days = [
    { label: 'L', value: 1, isWeekend: false },
    { label: 'M', value: 2, isWeekend: false },
    { label: 'X', value: 3, isWeekend: false },
    { label: 'J', value: 4, isWeekend: false },
    { label: 'V', value: 5, isWeekend: false },
    { label: 'S', value: 6, isWeekend: true },
    { label: 'D', value: 0, isWeekend: true },
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
      handleSave();
    }
  };

  const handleIconSelect = (selectedIcon: string) => {
    setIcon(selectedIcon);
    const parsedValue = parseInt(value);
    const finalValue = isNaN(parsedValue) ? 0 : parsedValue;
    onSave(name, finalValue, selectedIcon, availableDays);
  };

  const IconComponent = icon ? (LucideIcons as any)[icon] : null;

  return (
    <>
      <div ref={containerRef} className="flex gap-2 items-center bg-black/40 p-2 rounded-2xl border border-white/10 hover:border-white/20 focus-within:border-cyan-neon/60 transition-all duration-300">
        <button
          onClick={() => setIsIconPickerOpen(true)}
          className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 text-cyan-neon rounded-xl border border-white/5 transition-colors shrink-0"
          title="Cambiar icono"
        >
          {IconComponent ? <IconComponent size={20} /> : <Plus size={20} className="text-white/40" />}
        </button>
        <Input 
          className="flex-1 bg-transparent border-none text-white font-bold focus-visible:ring-0 focus-visible:bg-white/5 rounded-lg h-10 px-2 transition-all"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          placeholder="Nombre..."
        />
        <Input 
          type="text"
          inputMode={isNegativeAllowed ? "text" : "numeric"}
          className={cn(
            "w-14 bg-transparent border-none text-center font-black focus-visible:ring-0 focus-visible:bg-white/5 rounded-lg h-10 transition-all",
            parseInt(value) < 0 ? "text-red-500" : "text-gold-neon"
          )}
          value={value}
          onChange={(e) => {
            const val = e.target.value;
            if (/^-?\d*$/.test(val)) {
              if (!isNegativeAllowed && val.startsWith('-')) return;
              setValue(val);
            }
          }}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          placeholder="Pts"
        />
        {showAvailability && (
          <div className="relative">
            <button
              onClick={() => setIsDayPickerOpen(!isDayPickerOpen)}
              className={cn(
                "bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[10px] font-black uppercase rounded-lg h-10 px-2 flex items-center gap-1 transition-all",
                availableDays.length < 7 ? "text-gold-neon border-gold-neon/30 bg-gold-neon/5" : ""
              )}
            >
              <LucideIcons.Calendar size={14} />
              {availableDays.length === 7 ? 'DÍAS' : `${availableDays.length}D`}
            </button>
            
            <AnimatePresence>
              {isDayPickerOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="absolute bottom-full right-0 mb-2 bg-gray-900 border border-white/20 p-2 rounded-xl shadow-2xl z-50 flex items-center gap-2"
                >
                  <div className="flex gap-1">
                    {days.map((day) => (
                      <button
                        key={day.value}
                        onClick={() => toggleDay(day.value)}
                        className={cn(
                          "w-7 h-7 rounded-lg text-[10px] font-black transition-all",
                          availableDays.includes(day.value)
                            ? (day.isWeekend ? "bg-gold-neon text-space-dark shadow-[0_0_10px_rgba(255,215,0,0.3)]" : "bg-cyan-neon text-space-dark shadow-[0_0_10px_rgba(0,255,255,0.3)]")
                            : (day.isWeekend ? "bg-white/5 text-gold-neon/40 hover:bg-white/10" : "bg-white/5 text-white/40 hover:bg-white/10")
                        )}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                  {isEdited && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-green-400 hover:text-green-300 hover:bg-green-400/20 rounded-lg h-7 w-7 shrink-0 border border-green-400/30" 
                      onClick={handleSave} 
                      title="Guardar cambios"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
        {isEdited ? (
          !isDayPickerOpen && (
            <Button variant="ghost" size="icon" className="text-green-400 hover:text-green-300 hover:bg-green-400/20 rounded-lg h-10 w-10 shrink-0" onClick={handleSave} title="Guardar cambios">
              <CheckCircle2 className="h-5 w-5" />
            </Button>
          )
        ) : (
          <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300 hover:bg-red-400/20 rounded-lg h-10 w-10 shrink-0" onClick={onDelete} title="Eliminar">
            <Trash2 className="h-5 w-5" />
          </Button>
        )}
      </div>
      <IconPicker
        isOpen={isIconPickerOpen}
        onClose={() => setIsIconPickerOpen(false)}
        onSelect={handleIconSelect}
        selectedIcon={icon}
      />
    </>
  );
}

interface AdminViewProps {
  onClose: () => void;
}

export function AdminView({ onClose }: AdminViewProps) {
  const { 
    state, childrenList, activeChildTasks, activeChildRewards, activeChildHistory,
    activeChild, user, updateState, updateChildState, 
    addChild, deleteChild, deleteFamily, currentDate, familyId,
    addTask, updateTask, deleteTask, addReward, updateReward, deleteReward,
    deleteHistoryEntry, addPoints, resetChildData 
  } = useFamily();
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [newEmailInput, setNewEmailInput] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [sendInvite, setSendInvite] = useState(true);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskPoints, setNewTaskPoints] = useState('');
  const [newTaskIcon, setNewTaskIcon] = useState<string | undefined>();
  const [isNewTaskIconPickerOpen, setIsNewTaskIconPickerOpen] = useState(false);
  const [newRewardName, setNewRewardName] = useState('');
  const [newRewardCost, setNewRewardCost] = useState('');
  const [newRewardIcon, setNewRewardIcon] = useState<string | undefined>();
  const [newRewardAvailableDays, setNewRewardAvailableDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [isNewRewardIconPickerOpen, setIsNewRewardIconPickerOpen] = useState(false);
  const [newPinInput, setNewPinInput] = useState('');
  const [newChildName, setNewChildName] = useState('');
  const [newChildTheme, setNewChildTheme] = useState<ChildProfile['theme']>('robots');

  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState<'suggestion' | 'bug'>('suggestion');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // Confirmation Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    variant?: 'default' | 'destructive';
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  if (!state) return null;

  const openModal = (title: string, description: string, onConfirm: () => void, variant: 'default' | 'destructive' = 'default') => {
    setModalConfig({
      isOpen: true,
      title,
      description,
      onConfirm: () => {
        onConfirm();
        setModalConfig(prev => ({ ...prev, isOpen: false }));
      },
      variant
    });
  };

  const handleAdminLogin = (pinToTest?: string) => {
    const pin = pinToTest || pinInput;
    if (pin === state.pin) {
      setIsAdminAuthenticated(true);
      setPinInput('');
    } else {
      if (pin.length === 4) {
        droidSounds.playError();
        setPinInput('');
      }
    }
  };

  const handleUpdatePin = () => {
    if (newPinInput.length !== 4 || !/^\d+$/.test(newPinInput)) {
      droidSounds.playError();
      return;
    }

    openModal(
      '¿Cambiar PIN?',
      `¿Estás seguro de que quieres cambiar el PIN de acceso a ${newPinInput}?`,
      () => {
        updateState({ pin: newPinInput });
        setNewPinInput('');
        droidSounds.playTaskComplete();
      }
    );
  };

  const handleAddEmail = async () => {
    if (!newEmailInput.includes('@')) return;
    if (state.allowedEmails.includes(newEmailInput)) {
      setNewEmailInput('');
      return;
    }

    const emailToInvite = newEmailInput.trim();
    updateState({
      allowedEmails: [...state.allowedEmails, emailToInvite]
    });

    if (sendInvite) {
      setIsInviting(true);
      try {
        const response = await fetch('/api/invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: emailToInvite,
            childName: activeChild?.name || 'tu hijo/a',
            inviterName: user?.displayName || user?.email?.split('@')[0]
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          openModal(
            'Error al enviar invitación',
            errorData.error || 'No se pudo enviar el correo de invitación. Verifica la configuración de Resend.',
            () => {},
            'default'
          );
        }
      } catch (error) {
        console.error("Error sending invite:", error);
        openModal(
          'Error de conexión',
          'No se pudo contactar con el servidor para enviar la invitación.',
          () => {},
          'default'
        );
      } finally {
        setIsInviting(false);
      }
    }

    setNewEmailInput('');
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    if (emailToRemove === user?.email) {
      return;
    }
    openModal(
      '¿Eliminar acceso?',
      `¿Estás seguro de que quieres eliminar el acceso a ${emailToRemove}?`,
      () => {
        updateState({
          allowedEmails: state.allowedEmails.filter(email => email !== emailToRemove)
        });
      },
      'destructive'
    );
  };

  const handleDeleteFamily = () => {
    openModal(
      '⚠️ ¡ATENCIÓN! ⚠️',
      '¿Estás completamente seguro de que quieres ELIMINAR toda la cuenta familiar? Se perderán todos los puntos, misiones, premios y el historial. Esta acción NO se puede deshacer.',
      async () => {
        await deleteFamily();
      },
      'destructive'
    );
  };

  const handleAddTask = () => {
    if (!activeChild || !newTaskName.trim() || !newTaskPoints) return;
    const newTask = {
      id: `t_${Date.now()}`,
      name: newTaskName,
      points: parseInt(newTaskPoints) || 1,
      completedDates: [],
      icon: newTaskIcon || null
    };
    addTask(activeChild.id, newTask);
    setNewTaskName('');
    setNewTaskPoints('');
    setNewTaskIcon(undefined);
  };

  const handleAddReward = () => {
    if (!activeChild || !newRewardName.trim() || !newRewardCost) return;
    const newReward = {
      id: `r_${Date.now()}`,
      name: newRewardName,
      cost: parseInt(newRewardCost) || 1,
      icon: newRewardIcon || null,
      availableDays: newRewardAvailableDays
    };
    addReward(activeChild.id, newReward);
    setNewRewardName('');
    setNewRewardCost('');
    setNewRewardIcon(undefined);
    setNewRewardAvailableDays([0, 1, 2, 3, 4, 5, 6]);
  };

  const handleResetWeek = () => {
    if (!activeChild) return;
    openModal(
      '¿Resetear semana?',
      '¿Estás seguro de que quieres resetear toda la semana? Se borrarán los puntos actuales y el historial.',
      () => {
        resetChildData(activeChild.id);
      },
      'destructive'
    );
  };

  const handleDeleteHistoryEntry = (entry: any) => {
    if (!activeChild) return;
    openModal(
      '¿Eliminar registro?',
      `¿Estás seguro de que quieres eliminar este registro de "${entry.reason}"? Se ajustarán los puntos.`,
      () => {
        let taskRestore = undefined;
        if (entry.type === 'earn' && entry.reason.startsWith('Misión completada: ')) {
          taskRestore = {
            name: entry.reason.replace('Misión completada: ', ''),
            dateStr: entry.dateStr || currentDate
          };
        }
        deleteHistoryEntry(activeChild.id, entry.id, entry.points, taskRestore);
      },
      'destructive'
    );
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackMessage.trim() || !user) return;
    
    setIsSubmittingFeedback(true);
    try {
      const currentFamilyId = familyId || 'unknown';
      
      // 1. Save to Firestore (for the "Admin Panel" history)
      try {
        await addDoc(collection(db, 'feedback'), {
          userId: user.uid,
          userEmail: user.email,
          type: feedbackType,
          message: feedbackMessage,
          timestamp: new Date().toISOString(),
          familyId: currentFamilyId
        });
      } catch (fsError) {
        console.error("Firestore feedback error:", fsError);
        handleFirestoreError(fsError, OperationType.CREATE, 'feedback');
      }

      // 2. Send Email via Resend (for immediate notification)
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: user.email,
          type: feedbackType,
          message: feedbackMessage,
          familyId: currentFamilyId
        })
      });

      const contentType = response.headers.get("content-type");
      if (!response.ok) {
        let errorMessage = `Error del servidor: ${response.status}`;
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.details || errorData.error || errorMessage;
        } else {
          // Si no es JSON, probablemente es un error HTML de Express/Vite
          const textError = await response.text();
          console.error("Server returned non-JSON error:", textError);
          errorMessage = "El servidor encontró un error inesperado (HTML).";
        }
        throw new Error(errorMessage);
      }
      
      setFeedbackMessage('');
      droidSounds.playTaskComplete();
      openModal(
        '¡Gracias por tu feedback!',
        'Tu mensaje ha sido enviado correctamente. Lo hemos guardado en nuestro registro y el desarrollador ha recibido una notificación por correo.',
        () => {}
      );
    } catch (error) {
      console.error("Error submitting feedback:", error);
      droidSounds.playError();
      
      let errorMessage = 'No se pudo enviar el feedback. Por favor, inténtalo de nuevo más tarde.';
      if (error instanceof Error) {
        try {
          // Check if it's our JSON error format
          const parsed = JSON.parse(error.message);
          if (parsed.error) errorMessage = `Error: ${parsed.error}`;
        } catch {
          errorMessage = error.message;
        }
      }

      openModal(
        'Error al enviar',
        errorMessage,
        () => {}
      );
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  return (
    <motion.div
      key="admin"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {!isAdminAuthenticated ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 px-4">
          <div className="w-16 h-16 bg-gold-neon/20 rounded-full flex items-center justify-center border-2 border-gold-neon shadow-[0_0_15px_rgba(255,215,0,0.2)]">
            <Lock className="text-gold-neon" size={32} />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-white tracking-tight uppercase">ACCESO PADRES</h2>
            <p className="text-gray-400 font-bold text-sm">Introduce el PIN de 4 dígitos</p>
          </div>
          <div className="flex gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i}
                className={cn(
                  "w-12 h-14 border-2 rounded-xl flex items-center justify-center text-2xl font-black transition-all duration-300",
                  pinInput.length >= i 
                    ? "border-cyan-neon text-cyan-neon bg-cyan-neon/10 shadow-[0_0_15px_rgba(0,255,255,0.3)]" 
                    : "border-white/10 bg-black/90 text-gray-600 shadow-inner"
                )}
              >
                {pinInput.length >= i ? '•' : ''}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3 w-full max-w-65">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, 'OK'].map((num) => (
              <button
                key={num}
                onClick={() => {
                  if (num === 'C') {
                    setPinInput('');
                  } else if (num === 'OK') {
                    handleAdminLogin();
                  } else if (pinInput.length < 4) {
                    const newPin = pinInput + num;
                    setPinInput(newPin);
                    if (newPin.length === 4) {
                      // Auto-login on 4th digit
                      setTimeout(() => handleAdminLogin(newPin), 100);
                    }
                  }
                }}
                className={cn(
                  "h-14 rounded-xl border border-white/10 text-xl font-black transition-all active:scale-95 shadow-lg",
                  num === 'OK' 
                    ? "bg-cyan-neon text-space-dark border-cyan-neon hover:bg-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.3)]" 
                    : num === 'C'
                    ? "bg-black/90 text-red-400 hover:bg-red-950/50 hover:border-red-500/30"
                    : "bg-black/90 text-white hover:bg-white/10 hover:border-white/20"
                )}
              >
                {num}
              </button>
            ))}
          </div>
          <div className="flex justify-between w-full max-w-65 mt-2">

            <Button 
              variant="link"
              onClick={onClose}
              className="text-cyan-neon font-bold"
            >
              Volver atrás
            </Button>
            <Button 
              variant="link"
              onClick={logout}
              className="text-red-400 font-bold flex items-center gap-1"
            >
              <LogOut size={16} /> Cerrar Sesión
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6 pb-12">
          <div className="flex justify-between items-center gap-4 mb-2">
            <h2 className="text-xl font-black text-gold-neon tracking-tight drop-shadow-md uppercase">PANEL DE CONTROL</h2>
            <Button 
              variant="outline"
              onClick={() => setIsAdminAuthenticated(false)}
              className="border-red-500 bg-red-500/20 text-white hover:bg-red-600 font-black rounded-xl px-4 h-9 text-xs transition-all shadow-lg shrink-0"
            >
              CERRAR
            </Button>
          </div>

          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-6 md:grid-cols-5 gap-2 bg-gray-950/98 backdrop-blur-xl p-2 rounded-3xl border border-white/20 mb-8 h-auto! shadow-2xl">
              <TabsTrigger 
                value="general" 
                className="col-span-2 md:col-span-1 rounded-2xl py-3.5 h-auto! data-[state=active]:bg-cyan-neon data-[state=active]:text-space-dark data-[state=active]:shadow-[0_0_15px_rgba(0,255,255,0.4)] text-white/70 font-black text-sm transition-all hover:bg-white/5 hover:text-white"
              >
                General
              </TabsTrigger>
              <TabsTrigger 
                value="niños" 
                className="col-span-2 md:col-span-1 rounded-2xl py-3.5 h-auto! data-[state=active]:bg-cyan-neon data-[state=active]:text-space-dark data-[state=active]:shadow-[0_0_15px_rgba(0,255,255,0.4)] text-white/70 font-black text-sm transition-all hover:bg-white/5 hover:text-white"
              >
                Niños
              </TabsTrigger>
              <TabsTrigger 
                value="misiones" 
                className="col-span-2 md:col-span-1 rounded-2xl py-3.5 h-auto! data-[state=active]:bg-cyan-neon data-[state=active]:text-space-dark data-[state=active]:shadow-[0_0_15px_rgba(0,255,255,0.4)] text-white/70 font-black text-sm transition-all hover:bg-white/5 hover:text-white"
              >
                Misiones
              </TabsTrigger>
              <TabsTrigger 
                value="premios" 
                className="col-span-3 md:col-span-1 rounded-2xl py-3.5 h-auto! data-[state=active]:bg-cyan-neon data-[state=active]:text-space-dark data-[state=active]:shadow-[0_0_15px_rgba(0,255,255,0.4)] text-white/70 font-black text-sm transition-all hover:bg-white/5 hover:text-white"
              >
                Premios
              </TabsTrigger>
              <TabsTrigger 
                value="guia" 
                className="col-span-3 md:col-span-1 rounded-2xl py-3.5 h-auto! data-[state=active]:bg-cyan-neon data-[state=active]:text-space-dark data-[state=active]:shadow-[0_0_15px_rgba(0,255,255,0.4)] text-white/70 font-black text-sm transition-all hover:bg-white/5 hover:text-white"
              >
                Guía
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              {/* Familiares / Multi-device sync */}
            <Card className="bg-gray-950/98 border-white/20 shadow-2xl backdrop-blur-xl rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-white font-black tracking-wide flex items-center gap-2">
                    <UserPlus className="text-cyan-neon" size={24} /> COMPARTIR CON FAMILIA
                  </CardTitle>
                  <CardDescription className="text-white font-bold text-sm">
                    Añade el correo de Google de tu pareja u otro familiar para que puedan acceder a esta misma cuenta desde sus móviles.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {state?.allowedEmails.map(email => (
                      <div key={email} className="bg-black/80 p-3 rounded-xl text-sm border border-white/20 text-white flex justify-between items-center">
                        <div className="font-bold">
                          {email} {email === user?.email && <span className="text-cyan-neon text-xs ml-2 font-black">(Tú)</span>}
                        </div>
                        {email !== user?.email && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/20 rounded-lg"
                            onClick={() => handleRemoveEmail(email)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-3 mt-4">
                    <div className="flex gap-2">
                      <Input 
                        type="email"
                        placeholder="correo@gmail.com"
                        className="flex-1 bg-black/50 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-cyan-neon focus-visible:border-cyan-neon rounded-xl h-12"
                        value={newEmailInput}
                        onChange={e => setNewEmailInput(e.target.value)}
                        disabled={isInviting}
                      />
                      <Button 
                        onClick={handleAddEmail}
                        disabled={isInviting}
                        className="bg-cyan-neon text-space-dark hover:bg-cyan-400 font-black rounded-xl h-12 px-6 flex items-center gap-2"
                      >
                        {isInviting ? (
                          <div className="w-5 h-5 border-2 border-space-dark border-t-transparent rounded-full animate-spin" />
                        ) : (
                          'Añadir'
                        )}
                      </Button>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative flex items-center">
                        <input 
                          type="checkbox" 
                          className="peer sr-only"
                          checked={sendInvite}
                          onChange={e => setSendInvite(e.target.checked)}
                        />
                        <div className="w-5 h-5 border-2 border-white/20 rounded-md peer-checked:bg-cyan-neon peer-checked:border-cyan-neon transition-all" />
                        <div className="absolute inset-0 flex items-center justify-center text-space-dark opacity-0 peer-checked:opacity-100 transition-opacity">
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M0 11l2-2 5 5L18 3l2 2L7 18z"/></svg>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-white/60 group-hover:text-white/80 transition-colors">
                        Enviar invitación por correo automáticamente
                      </span>
                    </label>
                  </div>
                </CardContent>
              </Card>

              {/* Change Admin PIN */}
              <Card className="bg-gray-950/98 border-white/20 shadow-2xl backdrop-blur-xl rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-white font-black tracking-wide flex items-center gap-2">
                    <Lock className="text-cyan-neon" size={24} /> CAMBIAR PIN DE PADRES
                  </CardTitle>
                  <CardDescription className="text-white font-bold text-sm">
                    Establece un nuevo código de 4 dígitos para el acceso de administración.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input 
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={4}
                      placeholder="Nuevo PIN (4 dígitos)"
                      className="flex-1 bg-black/50 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-cyan-neon focus-visible:border-cyan-neon rounded-xl h-12 text-center font-black tracking-[0.5em]"
                      value={newPinInput}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                        setNewPinInput(val);
                      }}
                    />
                    <Button 
                      onClick={handleUpdatePin}
                      disabled={newPinInput.length !== 4}
                      className="bg-cyan-neon text-space-dark hover:bg-cyan-400 font-black rounded-xl h-12 px-6"
                    >
                      Actualizar
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Theme Selection */}
              <Card className="bg-gray-950/98 border-white/20 shadow-2xl backdrop-blur-xl rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-white font-black tracking-wide flex items-center gap-2">
                    <Palette className="text-cyan-neon" size={24} /> CAMBIAR TEMÁTICA ({activeChild?.name})
                  </CardTitle>
                  <CardDescription className="text-white font-bold text-sm">
                    Elige un nuevo estilo visual para {activeChild?.name}.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3">
                    {THEMES.map(t => (
                      <div
                        key={t.id}
                        onClick={() => {
                          if (activeChild?.theme !== t.id) {
                            openModal(
                              '¿Cambiar temática?',
                              `¿Quieres cambiar el estilo a ${t.name}?`,
                              () => {
                                if (activeChild) {
                                  updateChildState(activeChild.id, { theme: t.id as any });
                                  droidSounds.playTaskComplete();
                                }
                              }
                            );
                          }
                        }}
                        className={cn(
                          "cursor-pointer transition-all border-2 p-4 rounded-2xl flex items-center justify-between",
                          activeChild?.theme === t.id ? "border-cyan-neon bg-r2-blue/30 glow-cyan" : "border-gray-700 bg-space-dark hover:border-gray-500"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-lg", t.color)}>
                            <ThemeIcon theme={t.id as any} size={24} className="text-white" />
                          </div>
                          <span className="font-bold text-lg text-white">{t.name}</span>
                        </div>
                        {activeChild?.theme === t.id && <CheckCircle2 className="text-cyan-neon" />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Manual Point Adjustment */}
              <Card className="bg-gray-950/98 border-white/20 shadow-2xl backdrop-blur-xl rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-white font-black tracking-wide flex items-center gap-2">
                    <PlusCircle className="text-cyan-neon" size={24} /> AJUSTE MANUAL DE PUNTOS ({activeChild?.name})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center gap-8 py-4">
                    <Button 
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        if (!activeChild) return;
                        addPoints(activeChild.id, -1, 'Ajuste manual (Padres)');
                      }}
                      className="w-16 h-16 rounded-2xl border-2 border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 hover:border-red-400 transition-all"
                    >
                      <Minus size={32} />
                    </Button>
                    <div className="w-24 text-center">
                      <span className="text-5xl font-black text-white">{activeChild?.totalPoints}</span>
                    </div>
                    <Button 
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        if (!activeChild) return;
                        addPoints(activeChild.id, 1, 'Ajuste manual (Padres)');
                      }}
                      className="w-16 h-16 rounded-2xl border-2 border-green-500/50 bg-green-500/10 text-green-400 hover:bg-green-500/20 hover:text-green-300 hover:border-green-400 transition-all"
                    >
                      <Plus size={32} />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* History Log */}
              <div className="space-y-4">
                <h3 className="font-black text-white uppercase tracking-wider pl-2">Historial Reciente ({activeChild?.name})</h3>
                <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {activeChildHistory.map((entry, i) => (
                    <div key={entry.id || i} className="bg-black/80 border border-white/10 p-4 rounded-2xl flex justify-between items-center text-sm shadow-xl">
                      <div className="flex-1 pr-4">
                        <p className="font-bold text-white">{entry.reason}</p>
                        <p className="text-white/50 text-xs mt-1">{format(parseISO(entry.date), 'dd/MM HH:mm')}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={cn(
                          "font-black text-lg",
                          entry.points > 0 ? "text-green-400" : "text-red-400"
                        )}>
                          {entry.points > 0 ? '+' : ''}{entry.points}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteHistoryEntry(entry)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/20 w-8 h-8 rounded-full"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                variant="destructive"
                size="lg"
                onClick={handleResetWeek}
                className="w-full py-6 font-black rounded-2xl bg-red-600/90 text-white border border-red-500/50 hover:bg-red-700 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all shadow-lg"
              >
                RESETEAR PUNTOS Y MISIONES
              </Button>

              {/* Feedback Section */}
              <Card className="bg-gray-950/98 border-white/20 shadow-2xl backdrop-blur-xl rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-white font-black tracking-wide flex items-center gap-2">
                    <MessageSquare className="text-cyan-neon" size={24} /> SUGERENCIAS Y BUGS
                  </CardTitle>
                  <CardDescription className="text-white font-bold text-sm">
                    ¿Tienes alguna idea para mejorar la app o has encontrado un error? ¡Cuéntanoslo!
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2 bg-black/50 p-1 rounded-xl border border-white/10">
                    <button
                      onClick={() => setFeedbackType('suggestion')}
                      className={cn(
                        "flex-1 py-2 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-2",
                        feedbackType === 'suggestion' ? "bg-cyan-neon text-space-dark shadow-md" : "text-white/70 hover:text-white"
                      )}
                    >
                      <Lightbulb size={14} /> Sugerencia
                    </button>
                    <button
                      onClick={() => setFeedbackType('bug')}
                      className={cn(
                        "flex-1 py-2 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-2",
                        feedbackType === 'bug' ? "bg-red-500 text-white shadow-md" : "text-white/70 hover:text-white"
                      )}
                    >
                      <Bug size={14} /> Bug / Error
                    </button>
                  </div>
                  <textarea
                    className="w-full bg-black/50 border border-white/20 text-white placeholder:text-white/40 focus:ring-1 focus:ring-cyan-neon focus:border-cyan-neon rounded-xl p-3 text-sm min-h-25 resize-none"
                    placeholder={feedbackType === 'suggestion' ? "Escribe tu sugerencia aquí..." : "Describe el error que has encontrado..."}
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                  />
                  <Button
                    onClick={handleSubmitFeedback}
                    disabled={!feedbackMessage.trim() || isSubmittingFeedback}
                    className="w-full bg-cyan-neon text-space-dark hover:bg-cyan-400 font-black rounded-xl h-12 flex items-center gap-2"
                  >
                    {isSubmittingFeedback ? (
                      <div className="w-5 h-5 border-2 border-space-dark border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>Enviar Feedback</>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="bg-red-950/90 border-red-500/50 mt-8 rounded-3xl shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-red-400 flex items-center gap-2 font-black">
                    <AlertTriangle size={24} /> ZONA DE PELIGRO
                  </CardTitle>
                  <CardDescription className="text-red-100/80 font-bold">
                    Acciones irreversibles que eliminarán todos los datos.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="destructive"
                    onClick={handleDeleteFamily}
                    className="w-full font-black rounded-xl h-14 bg-red-600 hover:bg-red-700 text-white shadow-lg"
                  >
                    <Trash2 className="mr-2 h-5 w-5" /> Eliminar Cuenta Familiar
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="niños" className="space-y-6">
              {/* Add Child */}
              <Card className="bg-gray-950/98 border-white/20 shadow-2xl backdrop-blur-xl rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-white font-black tracking-wide">AÑADIR HIJO/A</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input 
                    placeholder="Nombre..."
                    className="w-full bg-black/50 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-cyan-neon focus-visible:border-cyan-neon rounded-xl h-12"
                    value={newChildName}
                    onChange={(e) => setNewChildName(e.target.value)}
                  />
                  <div className="grid grid-cols-3 gap-2">
                    {THEMES.map(t => (
                      <button
                        key={t.id}
                        onClick={() => setNewChildTheme(t.id as any)}
                        className={cn(
                          "p-2 rounded-xl border transition-all flex flex-col items-center gap-1",
                          newChildTheme === t.id 
                            ? "border-cyan-neon bg-cyan-neon/20 text-white shadow-[0_0_10px_rgba(0,242,255,0.2)]" 
                            : "border-white/10 bg-black/40 text-white/40 hover:border-white/20 hover:text-white/60"
                        )}
                      >
                        <ThemeIcon theme={t.id as any} size={20} className={newChildTheme === t.id ? "text-cyan-neon" : "text-white/20"} />
                        <span className="text-[10px] font-black uppercase tracking-tighter">{t.name}</span>
                      </button>
                    ))}
                  </div>
                  <Button 
                    onClick={() => {
                      if (!newChildName.trim()) return;
                      addChild({
                        name: newChildName,
                        theme: newChildTheme,
                        tasks: [],
                        rewards: []
                      });
                      setNewChildName('');
                    }} 
                    className="w-full bg-cyan-neon text-space-dark hover:bg-cyan-400 font-black rounded-xl h-12"
                  >
                    <PlusCircle className="mr-2 h-5 w-5" /> Añadir Perfil
                  </Button>
                </CardContent>
              </Card>

              {/* Manage Children */}
              <div className="space-y-4">
                <h3 className="font-black text-white uppercase tracking-wider pl-2">Gestionar Perfiles</h3>
                {childrenList.map(child => (
                    <div key={child.id} className="flex gap-2 items-center bg-white/5 p-3 rounded-2xl border border-white/10">
                    <div className="w-10 h-10 rounded-xl bg-cyan-neon/10 flex items-center justify-center border border-cyan-neon/30">
                      <ThemeIcon theme={child.theme} size={20} className="text-cyan-neon" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-black text-lg leading-none">{child.name}</p>
                      <p className="text-cyan-neon/70 text-[10px] uppercase font-black tracking-widest mt-1">{child.theme}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/20 rounded-lg h-10 w-10" 
                      onClick={() => {
                        if (childrenList.length > 1) {
                          openModal(
                            '¿Eliminar perfil?',
                            `¿Estás seguro de que quieres eliminar el perfil de ${child.name}? Se perderán todos sus datos.`,
                            () => deleteChild(child.id),
                            'destructive'
                          );
                        }
                      }}
                      disabled={childrenList.length <= 1}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="misiones" className="space-y-6">
              {/* Task Configuration */}
              <Card className="bg-gray-950/98 border-white/20 shadow-2xl backdrop-blur-xl rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-white font-black tracking-wide">CONFIGURACIÓN</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-white font-black block mb-2">Modo de Misiones</label>
                    <div className="flex bg-black/50 rounded-xl p-1 border border-white/10">
                      <button
                        onClick={() => updateState({ taskMode: 'single' })}
                        className={cn(
                          "flex-1 py-3 text-sm font-black rounded-lg transition-all",
                          state?.taskMode === 'single' ? "bg-cyan-neon text-space-dark shadow-md" : "text-white/70 hover:text-white"
                        )}
                      >
                        Una vez al día
                      </button>
                      <button
                        onClick={() => updateState({ taskMode: 'repeatable' })}
                        className={cn(
                          "flex-1 py-3 text-sm font-black rounded-lg transition-all",
                          state?.taskMode === 'repeatable' ? "bg-cyan-neon text-space-dark shadow-md" : "text-white/70 hover:text-white"
                        )}
                      >
                        Repetibles
                      </button>
                    </div>
                  </div>

                  {state?.taskMode === 'repeatable' && (
                    <div>
                      <label className="text-sm text-white font-black block mb-2">Puntos máximos diarios</label>
                      <Input 
                        type="number"
                        className="w-full bg-black/50 border-white/20 text-white font-black text-lg focus-visible:ring-cyan-neon focus-visible:border-cyan-neon rounded-xl h-12"
                        value={state.maxDailyPoints}
                        onChange={(e) => updateState({ maxDailyPoints: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Add Task */}
              <Card className="bg-gray-950/98 border-white/20 shadow-2xl backdrop-blur-xl rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-white font-black tracking-wide uppercase">AÑADIR MISIÓN ({activeChild?.name})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsNewTaskIconPickerOpen(true)}
                      className="w-12 h-12 flex items-center justify-center bg-black/50 border border-white/20 hover:bg-white/10 text-cyan-neon rounded-xl transition-colors shrink-0"
                      title="Seleccionar icono"
                    >
                      {newTaskIcon ? (
                        (() => {
                          const Icon = (LucideIcons as any)[newTaskIcon];
                          return Icon ? <Icon size={24} /> : <Plus size={24} className="text-white/40" />;
                        })()
                      ) : (
                        <Plus size={24} className="text-white/40" />
                      )}
                    </button>
                    <Input 
                      placeholder="Nombre de la misión..."
                      className="flex-1 bg-black/50 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-cyan-neon focus-visible:border-cyan-neon rounded-xl h-12"
                      value={newTaskName}
                      onChange={(e) => setNewTaskName(e.target.value)}
                    />
                    <Input 
                      type="text"
                      inputMode="text"
                      placeholder="Pts"
                      className={cn(
                        "w-20 bg-black/50 border-white/20 text-center font-black focus-visible:ring-cyan-neon focus-visible:border-cyan-neon rounded-xl h-12",
                        parseInt(newTaskPoints) < 0 ? "text-red-500" : "text-gold-neon"
                      )}
                      value={newTaskPoints}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^-?\d*$/.test(val)) {
                          setNewTaskPoints(val);
                        }
                      }}
                    />
                  </div>
                  <Button onClick={handleAddTask} className="w-full bg-cyan-neon text-space-dark hover:bg-cyan-400 font-black rounded-xl h-12">
                    <PlusCircle className="mr-2 h-5 w-5" /> Añadir Misión
                  </Button>
                </CardContent>
              </Card>

              <IconPicker
                isOpen={isNewTaskIconPickerOpen}
                onClose={() => setIsNewTaskIconPickerOpen(false)}
                onSelect={setNewTaskIcon}
                selectedIcon={newTaskIcon}
              />

              {/* Task Management */}
              <Card className="bg-gray-950/98 border-white/20 shadow-2xl backdrop-blur-xl rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-white font-black tracking-wide uppercase">EDITAR MISIONES ({activeChild?.name})</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {activeChildTasks.map(task => (
                    <EditableItemRow
                      key={task.id}
                      initialName={task.name}
                      initialValue={task.points}
                      initialIcon={task.icon}
                      isNegativeAllowed={true}
                      onSave={(newName, newPoints, newIcon) => {
                        if (activeChild) {
                          updateTask(activeChild.id, task.id, { 
                            name: newName, 
                            points: newPoints, 
                            icon: newIcon || null 
                          });
                        }
                      }}
                      onDelete={() => {
                        if (activeChild) {
                          openModal(
                            '¿Eliminar misión?',
                            `¿Estás seguro de que quieres eliminar la misión "${task.name}"?`,
                            () => deleteTask(activeChild.id, task.id),
                            'destructive'
                          );
                        }
                      }}
                    />
                  ))}
                  {activeChildTasks.length === 0 && (
                    <p className="text-center text-white/40 py-4 font-bold md:col-span-2 lg:col-span-3">No hay misiones creadas.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="premios" className="space-y-6">
              {/* Add Reward */}
              <Card className="bg-gray-950/98 border-white/20 shadow-2xl backdrop-blur-xl rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-white font-black tracking-wide uppercase">AÑADIR PREMIO ({activeChild?.name})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsNewRewardIconPickerOpen(true)}
                      className="w-12 h-12 flex items-center justify-center bg-black/50 border border-white/20 hover:bg-white/10 text-cyan-neon rounded-xl transition-colors shrink-0"
                      title="Seleccionar icono"
                    >
                      {newRewardIcon ? (
                        (() => {
                          const Icon = (LucideIcons as any)[newRewardIcon];
                          return Icon ? <Icon size={24} /> : <Plus size={24} className="text-white/40" />;
                        })()
                      ) : (
                        <Plus size={24} className="text-white/40" />
                      )}
                    </button>
                    <Input 
                      placeholder="Nombre del premio..."
                      className="flex-1 bg-black/50 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-cyan-neon focus-visible:border-cyan-neon rounded-xl h-12"
                      value={newRewardName}
                      onChange={(e) => setNewRewardName(e.target.value)}
                    />
                    <Input 
                      type="text"
                      inputMode="numeric"
                      placeholder="Pts"
                      className="w-20 bg-black/50 border-white/20 text-center font-black text-gold-neon focus-visible:ring-cyan-neon focus-visible:border-cyan-neon rounded-xl h-12"
                      value={newRewardCost}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^\d*$/.test(val)) {
                          setNewRewardCost(val);
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1">Días disponibles</label>
                    <div className="flex bg-black/50 rounded-xl p-1 border border-white/10 gap-1">
                      {[
                        { label: 'L', value: 1, isWeekend: false },
                        { label: 'M', value: 2, isWeekend: false },
                        { label: 'X', value: 3, isWeekend: false },
                        { label: 'J', value: 4, isWeekend: false },
                        { label: 'V', value: 5, isWeekend: false },
                        { label: 'S', value: 6, isWeekend: true },
                        { label: 'D', value: 0, isWeekend: true },
                      ].map((day) => (
                        <button
                          key={day.value}
                          onClick={() => {
                            const newDays = newRewardAvailableDays.includes(day.value)
                              ? newRewardAvailableDays.filter(d => d !== day.value)
                              : [...newRewardAvailableDays, day.value].sort();
                            setNewRewardAvailableDays(newDays);
                          }}
                          className={cn(
                            "flex-1 py-2 text-[10px] font-black rounded-lg transition-all uppercase tracking-wider",
                            newRewardAvailableDays.includes(day.value) 
                              ? (day.isWeekend ? "bg-gold-neon text-space-dark shadow-md" : "bg-cyan-neon text-space-dark shadow-md") 
                              : (day.isWeekend ? "text-gold-neon/50 hover:text-gold-neon" : "text-white/70 hover:text-white")
                          )}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button onClick={handleAddReward} className="w-full bg-cyan-neon text-space-dark hover:bg-cyan-400 font-black rounded-xl h-12">
                    <PlusCircle className="mr-2 h-5 w-5" /> Añadir Premio
                  </Button>
                </CardContent>
              </Card>

              <IconPicker
                isOpen={isNewRewardIconPickerOpen}
                onClose={() => setIsNewRewardIconPickerOpen(false)}
                onSelect={setNewRewardIcon}
                selectedIcon={newRewardIcon}
              />

              {/* Reward Management */}
              <Card className="bg-gray-950/98 border-white/20 shadow-2xl backdrop-blur-xl rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-white font-black tracking-wide uppercase">EDITAR PREMIOS ({activeChild?.name})</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {activeChildRewards.map(reward => (
                    <EditableItemRow
                      key={reward.id}
                      initialName={reward.name}
                      initialValue={reward.cost}
                      initialIcon={reward.icon}
                      initialAvailableDays={reward.availableDays}
                      isNegativeAllowed={false}
                      showAvailability={true}
                      onSave={(newName, newCost, newIcon, newDays) => {
                        if (activeChild) {
                          updateReward(activeChild.id, reward.id, { 
                            name: newName, 
                            cost: newCost, 
                            icon: newIcon || null, 
                            availableDays: newDays 
                          });
                        }
                      }}
                      onDelete={() => {
                        if (activeChild) {
                          openModal(
                            '¿Eliminar premio?',
                            `¿Estás seguro de que quieres eliminar el premio "${reward.name}"?`,
                            () => deleteReward(activeChild.id, reward.id),
                            'destructive'
                          );
                        }
                      }}
                    />
                  ))}
                  {activeChildRewards.length === 0 && (
                    <p className="text-center text-white/40 py-4 font-bold md:col-span-2 lg:col-span-3">No hay premios creados.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="guia" className="space-y-6">
              {/* Educational Guide */}
              <Card className="bg-gray-950/98 border-white/20 shadow-2xl backdrop-blur-xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-cyan-neon/10 border-b border-white/10">
                  <CardTitle className="text-white font-black tracking-wide flex items-center gap-2">
                    <BookOpen className="text-cyan-neon" size={24} /> MANUAL DE GESTIÓN FAMILIAR
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-8">
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-gold-neon">
                      <Sparkles size={20} />
                      <h3 className="font-black uppercase tracking-wider">1. Cómo Gestionar Misiones</h3>
                    </div>
                    <div className="space-y-3 text-sm text-white/80 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/10">
                      <p><strong className="text-cyan-neon">Añadir:</strong> Pulsa el botón <span className="inline-flex items-center px-2 py-0.5 rounded bg-cyan-neon/20 text-cyan-neon text-xs border border-cyan-neon/30">Añadir Misión</span>. Define un nombre claro y asigna puntos (1-3 recomendados).</p>
                      <p><strong className="text-cyan-neon">Editar:</strong> Puedes cambiar el nombre o los puntos de cualquier misión existente en la lista.</p>
                      <p><strong className="text-cyan-neon">Eliminar:</strong> Usa el icono de la papelera <Trash2 size={14} className="inline" /> para quitar misiones que ya no sean necesarias o que el niño ya haya interiorizado como hábito.</p>
                      <p className="text-xs text-white/40 italic mt-2">Tip: No satures la lista. 5-8 misiones activas es el número ideal para mantener el enfoque.</p>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-gold-neon">
                      <ShoppingBag size={20} />
                      <h3 className="font-black uppercase tracking-wider">2. Gestión de Premios (La Tienda)</h3>
                    </div>
                    <div className="space-y-3 text-sm text-white/80 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/10">
                      <p><strong className="text-cyan-neon">Equilibrio:</strong> Crea premios de "bajo coste" (5-10 pts) para gratificación diaria y premios "VIP" (30-50 pts) para metas semanales.</p>
                      <p><strong className="text-cyan-neon">Límite Diario:</strong> La app limita automáticamente a 2 canjes por día. Esto ayuda a evitar la saciedad y entrena la paciencia.</p>
                      <p><strong className="text-cyan-neon">Variedad:</strong> Rota los premios cada 2 semanas para mantener la novedad y la motivación alta.</p>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-gold-neon">
                      <ShieldCheck size={20} />
                      <h3 className="font-black uppercase tracking-wider">3. El Rol del Administrador</h3>
                    </div>
                    <div className="space-y-3 text-sm text-white/80 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/10">
                      <p><strong className="text-cyan-neon">Validación:</strong> Tú eres quien marca las misiones como completadas. Hazlo siempre con el niño delante para reforzar el logro.</p>
                      <p><strong className="text-cyan-neon">Ajuste Manual:</strong> Usa los botones <Plus size={14} className="inline" /> / <Minus size={14} className="inline" /> para dar puntos extra por buen comportamiento no listado o corregir errores.</p>
                      <p><strong className="text-cyan-neon">Historial:</strong> Si te equivocas, puedes borrar cualquier registro del historial y los puntos se ajustarán automáticamente.</p>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-gold-neon">
                      <Lightbulb size={20} />
                      <h3 className="font-black uppercase tracking-wider">Consejos Neuropsicológicos</h3>
                    </div>
                    <div className="space-y-3 text-sm text-white/80 leading-relaxed">
                      <p><strong className="text-cyan-neon">Refuerzo Positivo:</strong> Celebra cada vez que gane puntos. El sonido y el confeti de la app son herramientas de refuerzo, pero tu elogio verbal es lo más potente.</p>
                      <p><strong className="text-cyan-neon">Consistencia:</strong> Intenta revisar las misiones a la misma hora cada día (ej. antes de cenar) para crear una rutina predecible.</p>
                    </div>
                  </section>
                </CardContent>
              </Card>

              {/* Legal Information & Privacy Policy */}
              <Card className="bg-gray-950/98 border-white/20 shadow-2xl backdrop-blur-xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-white/5 border-b border-white/10">
                  <CardTitle className="text-white font-black tracking-wide flex items-center gap-2">
                    <Scale className="text-white/60" size={24} /> POLÍTICA DE PRIVACIDAD Y TÉRMINOS
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-white/60">
                      <ShieldCheck size={18} />
                      <h4 className="font-black text-xs uppercase tracking-widest">1. Responsable y Finalidad</h4>
                    </div>
                    <div className="text-[11px] text-white/50 leading-relaxed space-y-2">
                      <p>El responsable del tratamiento de los datos es el usuario administrador de la cuenta familiar. La finalidad de esta aplicación es exclusivamente la gestión educativa y organizativa de las rutinas familiares mediante un sistema de refuerzo positivo.</p>
                      <p>Los datos tratados incluyen: nombres de los menores, historial de puntos, misiones realizadas y correos electrónicos de los administradores autorizados.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-white/60">
                      <Lock size={18} />
                      <h4 className="font-black text-xs uppercase tracking-widest">2. Protección de Datos (RGPD)</h4>
                    </div>
                    <div className="text-[11px] text-white/50 leading-relaxed space-y-2">
                      <p>Cumplimos con el Reglamento General de Protección de Datos (UE) 2016/679. Los datos se almacenan de forma segura en la infraestructura de Google Cloud (Firebase) ubicada en territorio de la Unión Europea.</p>
                      <p>Usted tiene derecho a <strong>Acceder, Rectificar, Suprimir (Derecho al Olvido)</strong> y <strong>Oponerse</strong> al tratamiento de sus datos. Puede ejercer estos derechos eliminando su cuenta familiar desde la sección "General" de este panel.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-white/60">
                      <HelpCircle size={18} />
                      <h4 className="font-black text-xs uppercase tracking-widest">3. Política de Cookies y Analítica</h4>
                    </div>
                    <div className="text-[11px] text-white/50 leading-relaxed space-y-2">
                      <p>Utilizamos "cookies técnicas" o almacenamiento local esencial para mantener su sesión iniciada de forma segura y recordar sus preferencias (como el PIN). Estas son esenciales y no requieren consentimiento previo.</p>
                      <p>Adicionalmente, utilizamos <strong>Google Analytics</strong> para recopilar datos estadísticos anónimos sobre el uso de la aplicación (pantallas más visitadas, errores, etc.) con el fin de mejorar la experiencia. Puede aceptar o rechazar estas cookies de análisis en el banner inicial.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-white/60">
                      <AlertTriangle size={18} />
                      <h4 className="font-black text-xs uppercase tracking-widest">4. Uso Responsable</h4>
                    </div>
                    <div className="text-[11px] text-white/50 leading-relaxed space-y-2">
                      <p>Esta herramienta debe usarse siempre bajo la supervisión de un adulto. La gamificación nunca debe sustituir el afecto o la comunicación familiar, ni utilizarse como método de presión psicológica.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        description={modalConfig.description}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        variant={modalConfig.variant}
      />
    </motion.div>
  );
}
