import React from "react";
import { Bot, Rocket, PawPrint, Crown, Car, Star, Sparkles, Sun } from "lucide-react";
import { useFamily } from "../../context/FamilyContext";

const themeImages: Record<string, { mobile: string; desktop: string }> = {
  robots: {
    mobile: "/themes/robots.webp",
    desktop: "/themes/robots_desktop.webp",
  },
  space: {
    mobile: "/themes/space.webp",
    desktop: "/themes/space_desktop.webp",
  },
  dinosaurs: {
    mobile: "/themes/dino.webp",
    desktop: "/themes/dino_desktop.webp",
  },
  princesses: {
    mobile: "/themes/princess.webp",
    desktop: "/themes/princess_desktop.webp",
  },
  cars: {
    mobile: "/themes/cars.webp",
    desktop: "/themes/cars_desktop.webp",
  },
};

export function ThemeBackground() {
  const { state, activeChild } = useFamily();
  const theme = activeChild?.theme || state?.theme || "robots";
  const [isLandscape, setIsLandscape] = React.useState(false);

  React.useEffect(() => {
    console.log("ThemeBackground: Theme changed to", theme);
  }, [theme]);

  React.useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };

    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);

    return () => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", checkOrientation);
    };
  }, []);

  const renderElements = () => {
    switch (theme) {
      case "robots":
        return (
          <>
            <div className='absolute top-20 -left-10 text-cyan-neon/20'>
              <Bot size={200} />
            </div>
            <div className='absolute bottom-40 -right-20 text-gold-neon/20'>
              <Bot size={300} />
            </div>
          </>
        );
      case "space":
        return (
          <>
            <div className='absolute top-10 right-10 text-cyan-neon/20'>
              <Rocket size={250} />
            </div>
            <div className='absolute bottom-20 left-10 text-gold-neon/20'>
              <Star size={150} />
            </div>
          </>
        );
      case "dinosaurs":
        return (
          <>
            <div className='absolute -bottom-10 -left-10 text-cyan-neon/20'>
              <PawPrint size={350} />
            </div>
            <div className='absolute top-20 right-0 text-gold-neon/20'>
              <Sun size={200} />
            </div>
          </>
        );
      case "princesses":
        return (
          <>
            <div className='absolute top-10 left-10 text-cyan-neon/20'>
              <Crown size={250} />
            </div>
            <div className='absolute bottom-20 right-10 text-gold-neon/20'>
              <Sparkles size={200} />
            </div>
          </>
        );
      case "cars":
        return (
          <>
            <div className='absolute top-1/4 -left-40 text-cyan-neon/20'>
              <Car size={300} />
            </div>
            <div className='absolute bottom-1/4 -right-40 text-gold-neon/20'>
              <Car size={250} />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  const themeConfig = themeImages[theme] || themeImages["robots"];
  const imageUrl = isLandscape ? themeConfig.desktop : themeConfig.mobile;

  return (
    <div
      className='fixed inset-0 pointer-events-none overflow-hidden'
      style={{
        backgroundColor: "var(--theme-bg)",
        zIndex: -1,
      }}
    >
      {/* Background Image using div for better compatibility */}
      <div
        key={`${theme}-${isLandscape}`}
        className='absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-opacity duration-1000'
        style={{
          backgroundImage: `url("${imageUrl}")`,
          opacity: 1,
        }}
      />

      {renderElements()}

      {/* Global subtle overlay to tie it together and ensure readability */}
      <div className='absolute inset-0 bg-black/20' />
    </div>
  );
}
