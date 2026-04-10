import { motion } from 'motion/react';
import { Star, Sparkles, ShieldCheck } from 'lucide-react';
import { loginWithGoogle } from '../../firebase';
import { Button } from '../ui/button';
import { ThemeBackground } from '../layout/ThemeBackground';

export function LoginView() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background matches the rest of the app */}
      <ThemeBackground />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-sm mx-auto flex flex-col items-center"
      >
        {/* Main Icon/Logo */}
        <motion.div 
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.2 
          }}
          className="relative mb-8"
        >
          {/* Glow behind logo */}
          <div className="absolute inset-0 bg-cyan-neon/30 blur-3xl rounded-full" />
          
          <div className="w-32 h-32 bg-gray-950/80 backdrop-blur-xl rounded-full flex items-center justify-center border-2 border-cyan-neon/50 shadow-[0_0_30px_rgba(34,211,238,0.3)] relative z-10">
            <Star className="w-16 h-16 text-gold-neon drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]" fill="currentColor" />
            
            {/* Rotating dashed border */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-[3px] border-dashed border-cyan-neon/30 rounded-full"
            />
          </div>
          
          {/* Floating sparkles */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-2 -right-2 bg-cyan-neon text-space-dark p-2 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.6)]"
          >
            <Sparkles className="w-5 h-5" />
          </motion.div>
        </motion.div>

        {/* Text Content */}
        <div className="text-center space-y-4 mb-10 w-full">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h1 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-100 to-cyan-400 drop-shadow-sm mb-3">
              KID<span className="text-cyan-neon">POINTS</span>
            </h1>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gold-neon text-xs font-bold uppercase tracking-widest shadow-lg backdrop-blur-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
              Sistema Familiar
            </div>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-white/60 text-sm max-w-[260px] mx-auto leading-relaxed"
          >
            Inicia sesión para sincronizar misiones, recompensas y logros con toda la familia.
          </motion.p>
        </div>

        {/* Login Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="w-full"
        >
          <Button 
            onClick={loginWithGoogle}
            size="lg"
            className="w-full h-14 bg-white hover:bg-gray-100 text-gray-900 font-bold rounded-2xl flex items-center justify-center gap-3 text-base shadow-[0_0_40px_rgba(255,255,255,0.1)] transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continuar con Google
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
