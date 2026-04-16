import React, { useState } from 'react';
import { motion } from 'motion/react';
import { PREDEFINED_TASKS, PREDEFINED_REWARDS, THEMES } from '../constants';
import { AppState, ChildProfile } from '../types';
import { CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '../lib/utils';
import { ThemeIcon } from './ThemeIcon';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';

interface OnboardingProps {
  onComplete: (data: Pick<ChildProfile, 'name' | 'theme' | 'tasks' | 'rewards'>) => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [theme, setTheme] = useState<ChildProfile['theme']>('robots');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [selectedRewards, setSelectedRewards] = useState<string[]>([]);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Apply theme to body during onboarding
  React.useEffect(() => {
    document.body.className = `theme-${theme}`;
  }, [theme]);

  const handleNext = async () => {
    if (step === 1 && !name.trim()) return;
    if (step === 3 && selectedTasks.length === 0) return;
    if (step === 4 && selectedRewards.length === 0) return;
    if (step === 5 && !acceptedTerms) return;

    if (step < 6) {
      setStep(step + 1);
    } else {
      setIsSubmitting(true);
      setError(null);
      
      // Safety timeout to prevent being stuck forever
      const timeoutId = setTimeout(() => {
        if (isSubmitting) {
          setIsSubmitting(false);
          setError("La conexión está tardando demasiado. Por favor, inténtalo de nuevo.");
        }
      }, 15000);

      try {
        const tasks = PREDEFINED_TASKS.filter(t => selectedTasks.includes(t.id)).map(t => ({ ...t, completedDates: [] }));
        const rewards = PREDEFINED_REWARDS.filter(r => selectedRewards.includes(r.id));
        await onComplete({ name, theme, tasks, rewards });
        clearTimeout(timeoutId);
      } catch (err) {
        console.error("Error completing onboarding:", err);
        setIsSubmitting(false);
        setError("Hubo un error al guardar tus datos. Por favor, revisa tu conexión.");
        clearTimeout(timeoutId);
      }
    }
  };

  const toggleTask = (id: string) => {
    setSelectedTasks(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  const toggleReward = (id: string) => {
    setSelectedRewards(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-center p-4">
      <motion.div 
        key={step}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-gray-950 border-2 border-cyan-neon p-5 sm:p-6 rounded-3xl shadow-2xl glow-cyan"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-1.5">
            {[0, 1, 2, 3, 4, 5, 6].map(s => (
              <div key={s} className={cn("h-1.5 w-4 rounded-full transition-all duration-500", s <= step ? "bg-cyan-neon glow-cyan" : "bg-gray-700")} />
            ))}
          </div>
          <span className="text-cyan-neon font-bold text-[10px] uppercase tracking-widest">Paso {step} de 6</span>
        </div>

        {step === 0 && (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-cyan-neon/20 rounded-3xl flex items-center justify-center mx-auto border-2 border-cyan-neon shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              <ThemeIcon theme="robots" size={40} className="text-cyan-neon" />
            </div>
            <h2 className="text-3xl font-black text-white text-center leading-tight">BIENVENIDO A <span className="text-cyan-neon">FAMILY QUEST</span></h2>
            <div className="space-y-4 text-center text-gray-200 text-base leading-relaxed">
              <p>Estás a punto de transformar las rutinas diarias en una aventura épica.</p>
              <div className="bg-gray-900 p-4 rounded-2xl border border-white/10 space-y-3 text-left">
                <p className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-cyan-neon" /> Completa misiones para ganar puntos.</p>
                <p className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-gold-neon" /> Canjea puntos por premios reales.</p>
                <p className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-purple-500" /> Sigue el progreso y celebra los logros.</p>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-gold-neon text-center uppercase tracking-tight">EL PROTAGONISTA</h2>
            <p className="text-center text-gray-200 text-base">¿Cómo se llama el héroe o heroína de esta aventura?</p>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre..."
              className="w-full bg-space-dark border-2 border-cyan-neon p-6 rounded-xl text-2xl font-black text-center focus-visible:ring-gold-neon transition-colors placeholder:text-gray-600"
              autoFocus
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <h2 className="text-2xl font-black text-gold-neon text-center uppercase tracking-tight">ESTILO VISUAL</h2>
            <p className="text-center text-gray-200 text-sm">Personaliza la interfaz con la temática favorita de {name}.</p>
            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-1.5 custom-scrollbar">
              {THEMES.map(t => (
                <Card
                  key={t.id}
                  onClick={() => setTheme(t.id as any)}
                  className={cn(
                    "cursor-pointer transition-all border-2",
                    theme === t.id ? "border-cyan-neon bg-cyan-neon/40 glow-cyan" : "border-gray-700 bg-gray-900 hover:border-gray-500"
                  )}
                >
                  <CardContent className="p-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shadow-lg", t.color)}>
                        <ThemeIcon theme={t.id as any} size={20} className="text-white" />
                      </div>
                      <span className="font-black text-base text-white">{t.name}</span>
                    </div>
                    {theme === t.id && <CheckCircle2 className="text-cyan-neon" size={20} />}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <h2 className="text-2xl font-black text-gold-neon text-center uppercase tracking-tight">MISIONES</h2>
            <div className="space-y-1">
              <p className="text-center text-gray-200 text-sm">Selecciona las tareas diarias. Al completarlas, {name} ganará puntos.</p>
              <p className="text-[10px] text-center text-cyan-neon/80 uppercase font-black tracking-widest italic">Recomendamos empezar con 3-5 misiones</p>
            </div>
            <div className="grid gap-2 max-h-65 overflow-y-auto pr-1.5 custom-scrollbar">
              {PREDEFINED_TASKS.map(task => {
                const isSelected = selectedTasks.includes(task.id);
                return (
                  <Card
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className={cn(
                      "cursor-pointer transition-all border-2",
                      isSelected 
                        ? task.points < 0 ? "border-red-500 bg-red-950" : "border-cyan-neon bg-cyan-neon/40" 
                        : "border-gray-700 bg-gray-900 hover:border-gray-500"
                    )}
                  >
                    <CardContent className="p-2.5 flex items-center justify-between">
                      <span className="font-black text-white text-sm">{task.name}</span>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-sm font-black",
                          task.points < 0 ? "text-red-500" : "text-gold-neon"
                        )}>
                          {task.points > 0 ? `+${task.points}` : task.points}
                        </span>
                        {isSelected && <CheckCircle2 className={task.points < 0 ? "text-red-500" : "text-cyan-neon"} size={18} />}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3">
            <h2 className="text-2xl font-black text-gold-neon text-center uppercase tracking-tight">RECOMPENSAS</h2>
            <div className="space-y-1">
              <p className="text-center text-gray-200 text-sm">¿Por qué podrá canjear sus puntos? Elige premios motivadores.</p>
              <p className="text-[10px] text-center text-cyan-neon/80 uppercase font-black tracking-widest italic">Puedes editarlos o añadir nuevos luego</p>
            </div>
            <div className="grid gap-2 max-h-65 overflow-y-auto pr-1.5 custom-scrollbar">
              {PREDEFINED_REWARDS.map(reward => {
                const isSelected = selectedRewards.includes(reward.id);
                return (
                  <Card
                    key={reward.id}
                    onClick={() => toggleReward(reward.id)}
                    className={cn(
                      "cursor-pointer transition-all border-2",
                      isSelected ? "border-cyan-neon bg-cyan-neon/40" : "border-gray-700 bg-gray-900 hover:border-gray-500"
                    )}
                  >
                    <CardContent className="p-2.5 flex items-center justify-between">
                      <span className="font-black text-white text-sm">{reward.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gold-neon text-sm font-black">-{reward.cost}</span>
                        {isSelected && <CheckCircle2 className="text-cyan-neon" size={18} />}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-gold-neon text-center uppercase tracking-tight">PRIVACIDAD</h2>
            <div className="bg-gray-900 p-4 rounded-xl border border-white/10 text-xs text-gray-200 space-y-3 max-h-56 overflow-y-auto leading-relaxed shadow-inner custom-scrollbar">
              <p>Para continuar, necesitamos que aceptes nuestra política de privacidad adaptada al RGPD.</p>
              <p><strong>Uso de datos:</strong> Los nombres y progresos de tus hijos se guardan de forma privada en servidores seguros de la UE. Solo tú y las personas que autorices pueden verlos.</p>
              <p><strong>Cookies:</strong> Solo usamos cookies técnicas esenciales para que la app funcione. No hay rastreo publicitario.</p>
              <p><strong>Derechos:</strong> Puedes borrar todos tus datos en cualquier momento desde el panel de administración.</p>
            </div>
            
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center mt-0.5">
                <input 
                  type="checkbox" 
                  className="peer sr-only"
                  checked={acceptedTerms}
                  onChange={e => setAcceptedTerms(e.target.checked)}
                />
                <div className="w-6 h-6 border-2 border-cyan-neon/50 rounded-md peer-checked:bg-cyan-neon peer-checked:border-cyan-neon transition-all" />
                <div className="absolute inset-0 flex items-center justify-center text-space-dark opacity-0 peer-checked:opacity-100 transition-opacity">
                  <CheckCircle2 size={16} />
                </div>
              </div>
              <span className="text-sm font-black text-white/90 group-hover:text-white transition-colors">
                He leído y acepto la política de privacidad y los términos de uso.
              </span>
            </label>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-cyan-neon text-center uppercase tracking-tight">¡TODO LISTO!</h2>
            <div className="space-y-3">
              <p className="text-center text-gray-200 text-sm">Resumen de las secciones de la app:</p>
              <div className="grid gap-2">
                <div className="bg-gray-900 p-3 rounded-xl border border-white/10">
                  <h4 className="text-cyan-neon font-black text-xs uppercase tracking-widest mb-1">📋 Misiones</h4>
                  <p className="text-xs text-white/80 font-medium">Donde {name} verá sus tareas diarias y tú las marcarás como completadas.</p>
                </div>
                <div className="bg-gray-900 p-3 rounded-xl border border-white/10">
                  <h4 className="text-gold-neon font-black text-xs uppercase tracking-widest mb-1">💰 Tienda</h4>
                  <p className="text-xs text-white/80 font-medium">Aquí se canjean los puntos por los premios que has elegido.</p>
                </div>
                <div className="bg-gray-900 p-3 rounded-xl border border-white/10">
                  <h4 className="text-purple-400 font-black text-xs uppercase tracking-widest mb-1">📊 Estadísticas</h4>
                  <p className="text-xs text-white/80 font-medium">Gráficos para ver el progreso semanal y el historial de puntos.</p>
                </div>
                <div className="bg-gray-900 p-3 rounded-xl border border-white/10">
                  <h4 className="text-white font-black text-xs uppercase tracking-widest mb-1">⚙️ Admin</h4>
                  <p className="text-xs text-white/80 font-medium">Panel protegido por PIN para gestionar misiones, premios y compartir con la familia.</p>
                  <div className="mt-2 flex items-center gap-2 bg-black/60 p-2 rounded-lg border border-gold-neon/40">
                    <span className="text-[10px] font-black text-gold-neon uppercase tracking-tighter">PIN DE ACCESO:</span>
                    <span className="text-sm font-black text-white tracking-widest">1234</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm font-bold text-center"
          >
            {error}
          </motion.div>
        )}

        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <Button
              variant="outline"
              size="lg"
              onClick={() => setStep(step - 1)}
              className="flex-1 py-4 rounded-xl font-bold border-2 border-gray-600 text-gray-300 bg-transparent hover:bg-gray-800 hover:text-white flex items-center justify-center gap-2"
            >
              <ChevronLeft size={20} /> Atrás
            </Button>
          )}
          <Button
            size="lg"
            onClick={handleNext}
            disabled={
              isSubmitting ||
              (step === 1 && !name.trim()) ||
              (step === 3 && selectedTasks.length === 0) ||
              (step === 4 && selectedRewards.length === 0) ||
              (step === 5 && !acceptedTerms)
            }
            className="flex-2 w-full py-4 bg-cyan-neon text-space-dark hover:bg-cyan-400 font-black rounded-xl text-base flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-space-dark border-t-transparent rounded-full"
                />
                Procesando...
              </span>
            ) : (
              <>
                {step === 6 ? '¡Comenzar!' : 'Siguiente'} <ChevronRight />
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
