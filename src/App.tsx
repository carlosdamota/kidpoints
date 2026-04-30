import { useState, useEffect, lazy, Suspense } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Onboarding } from "./components/Onboarding";
import { FamilyProvider, useFamily } from "./context/FamilyContext";
import { CookieConsent } from "./components/CookieConsent";

import { Header } from "./components/layout/Header";
import { BottomNav, Tab } from "./components/layout/BottomNav";
import { CelebrationOverlay } from "./components/layout/CelebrationOverlay";
import { ThemeBackground } from "./components/layout/ThemeBackground";

const LoginView = lazy(() => import("./components/views/LoginView").then(m => ({ default: m.LoginView })));
const MisionesView = lazy(() => import("./components/views/MisionesView").then(m => ({ default: m.MisionesView })));
const TiendaView = lazy(() => import("./components/views/TiendaView").then(m => ({ default: m.TiendaView })));
const StatsView = lazy(() => import("./components/views/StatsView").then(m => ({ default: m.StatsView })));
const AdminView = lazy(() => import("./components/views/AdminView").then(m => ({ default: m.AdminView })));

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
    return (
      <Suspense fallback={<div className='min-h-screen flex items-center justify-center text-cyan-neon'>Iniciando sesión...</div>}>
        <LoginView />
      </Suspense>
    );
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
          <Suspense fallback={<div className="flex items-center justify-center p-8 text-cyan-neon animate-pulse">Cargando sección...</div>}>
            <AnimatePresence mode='wait'>
              {activeTab === "misiones" && <MisionesView key="misiones" />}
              {activeTab === "puntos" && <StatsView key="puntos" />}
              {activeTab === "tienda" && <TiendaView key="tienda" />}
              {activeTab === "admin" && <AdminView key="admin" onClose={() => setActiveTab("misiones")} />}
            </AnimatePresence>
          </Suspense>
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
