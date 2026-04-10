import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Info } from 'lucide-react';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
    // Aquí se inicializaría Google Analytics si estuviera configurado en el código
  };

  const handleReject = () => {
    localStorage.setItem('cookie-consent', 'rejected');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-[100] p-4 sm:p-6 pb-24 sm:pb-6"
        >
          <div className="max-w-md mx-auto bg-gray-950/98 border border-white/20 shadow-2xl  rounded-2xl p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-cyan-neon/20 p-2 rounded-full shrink-0">
                <Info className="text-cyan-neon w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-white font-bold text-sm">Privacidad y Cookies</h3>
                <p className="text-white/60 text-xs leading-relaxed">
                  Usamos cookies técnicas necesarias para el inicio de sesión. Además, utilizamos Google Analytics de forma anónima para entender el uso de la app y mejorarla. Puedes aceptar o rechazar las cookies de análisis.
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleReject}
                className="text-white/70 border-white/20 hover:bg-white/10 text-xs h-8"
              >
                Solo necesarias
              </Button>
              <Button 
                size="sm" 
                onClick={handleAccept}
                className="bg-cyan-neon text-space-dark hover:bg-cyan-400 font-bold text-xs h-8"
              >
                Aceptar todas
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
