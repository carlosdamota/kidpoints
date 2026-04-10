import React from 'react';
import { Bot, Rocket, PawPrint, Crown, Car, Star, Sparkles, Sun } from 'lucide-react';
import { useFamily } from '../../context/FamilyContext';

const themeImages: Record<string, string> = {
  robots: '/themes/robots.webp',
  space: '/themes/space.webp',
  dinosaurs: '/themes/dinosaurs.webp',
  princesses: '/themes/princesses.webp',
  cars: '/themes/cars.webp',
};

export function ThemeBackground() {
  const { state, activeChild } = useFamily();
  const theme = activeChild?.theme || state?.theme || 'robots';

  React.useEffect(() => {
    console.log('ThemeBackground: Theme changed to', theme);
  }, [theme]);

  const renderElements = () => {
    switch (theme) {
      case 'robots':
        return (
          <>
            <div className="absolute top-20 -left-10 text-cyan-neon/5">
              <Bot size={200} />
            </div>
            <div className="absolute bottom-40 -right-20 text-gold-neon/5">
              <Bot size={300} />
            </div>
          </>
        );
      case 'space':
        return (
          <>
            <div className="absolute top-10 right-10 text-cyan-neon/5">
              <Rocket size={250} />
            </div>
            <div className="absolute bottom-20 left-10 text-gold-neon/5">
              <Star size={150} />
            </div>
          </>
        );
      case 'dinosaurs':
        return (
          <>
            <div className="absolute -bottom-10 -left-10 text-cyan-neon/5">
              <PawPrint size={350} />
            </div>
            <div className="absolute top-20 right-0 text-gold-neon/5">
              <Sun size={200} />
            </div>
          </>
        );
      case 'princesses':
        return (
          <>
            <div className="absolute top-10 left-10 text-cyan-neon/5">
              <Crown size={250} />
            </div>
            <div className="absolute bottom-20 right-10 text-gold-neon/5">
              <Sparkles size={200} />
            </div>
          </>
        );
      case 'cars':
        return (
          <>
            <div className="absolute top-1/4 -left-40 text-cyan-neon/5">
              <Car size={300} />
            </div>
            <div className="absolute bottom-1/4 -right-40 text-gold-neon/5">
              <Car size={250} />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  const imageUrl = `${themeImages[theme] || themeImages['robots']}?v=${Date.now()}`;

  return (
    <div 
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ 
        backgroundColor: 'var(--theme-bg)',
        zIndex: -1 
      }}
    >
      {/* Background Image using div for better compatibility */}
      <div 
        key={theme}
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
        style={{ 
          backgroundImage: `url("${imageUrl}")`,
          opacity: 1
        }}
      />

      {renderElements()}
      
      {/* Global subtle overlay to tie it together and ensure readability */}
      <div className="absolute inset-0 bg-black/20" />
    </div>
  );
}

