import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Onboarding } from "./components/Onboarding";
import { FamilyProvider, useFamily } from "./context/FamilyContext";
import { CookieConsent } from "./components/CookieConsent";

import { Header } from "./components/layout/Header";
import { BottomNav, Tab } from "./components/layout/BottomNav";
import { CelebrationOverlay } from "./components/layout/CelebrationOverlay";
import { ThemeBackground } from "./components/layout/ThemeBackground";

import { LoginView } from "./components/views/LoginView";
import { MisionesView } from "./components/views/MisionesView";
import { TiendaView } from "./components/views/TiendaView";
import { StatsView } from "./components/views/StatsView";
import { AdminView } from "./components/views/AdminView";

export default function AppWrapper() {
  return (
    <ErrorBoundary>
      <FamilyProvider>
        <App />
        <CookieConsent />
      </FamilyProvider>
    </ErrorBoundary>
  );
}

function App() {
  const { authReady, user, needsOnboarding, state, activeChild, handleOnboardingComplete } =
    useFamily();
  const [activeTab, setActiveTab] = useState<Tab>("misiones");

  if (!authReady) {
    return (
      <div className='min-h-screen flex items-center justify-center text-cyan-neon'>
        Cargando sistemas...
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  if (needsOnboarding) {
    return (
      <>
        <ThemeBackground />
        <Onboarding onComplete={handleOnboardingComplete} />
      </>
    );
  }

  if (!state || !activeChild) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center text-cyan-neon gap-4'>
        <ThemeBackground />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className='w-12 h-12 border-4 border-cyan-neon border-t-transparent rounded-full'
        />
        <span className='font-black tracking-widest animate-pulse'>SINCRONIZANDO DATOS...</span>
      </div>
    );
  }

  return (
    <>
      <ThemeBackground />
      <Header onOpenAdmin={() => setActiveTab("admin")} />
      <div className='min-h-screen flex flex-col max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto relative pb-20 md:pb-28'>
        <main className='flex-1 p-4 md:p-8'>
          <AnimatePresence mode='wait'>
            {activeTab === "misiones" && <MisionesView />}
            {activeTab === "puntos" && <StatsView />}
            {activeTab === "tienda" && <TiendaView />}
            {activeTab === "admin" && <AdminView onClose={() => setActiveTab("misiones")} />}
          </AnimatePresence>
        </main>

        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <CelebrationOverlay />
      </div>
    </>
  );
}
