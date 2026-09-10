import React, { useEffect, useRef, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useEnergyStore } from './store/energyStore';
import { useUIStore } from './store/uiStore';
import AppLayout from './components/layout/AppLayout';
import LandingPage from './pages/Landing/LandingPage';
import CommandCenter from './pages/Dashboard/CommandCenter';
import CommandPalette from './components/ui/CommandPalette';
import AICopilot from './components/ai/AICopilot';

// Lazy-load all non-critical pages for faster initial paint
const DigitalTwinPage   = lazy(() => import('./pages/DigitalTwin/DigitalTwinPage'));
const SolarPage         = lazy(() => import('./pages/Solar/SolarPage'));
const BatteryPage       = lazy(() => import('./pages/Battery/BatteryPage'));
const ConsumptionPage   = lazy(() => import('./pages/Consumption/ConsumptionPage'));
const RecommendationsPage = lazy(() => import('./pages/Recommendations/RecommendationsPage'));
const WeatherForecastPage = lazy(() => import('./pages/Weather/WeatherForecastPage'));
const EarlyWarningPage  = lazy(() => import('./pages/EarlyWarning/EarlyWarningPage'));
const IoTPage           = lazy(() => import('./pages/IoT/IoTPage'));
const CarbonPage        = lazy(() => import('./pages/Carbon/CarbonPage'));
const CostPage          = lazy(() => import('./pages/Cost/CostPage'));
const ReportsPage       = lazy(() => import('./pages/Reports/ReportsPage'));
const AIModelCenterPage = lazy(() => import('./pages/AIModels/AIModelCenterPage'));

// Minimal fallback — dark background, no flash
const PageFallback = () => (
  <div style={{ flex: 1, background: 'var(--bg-primary)' }} />
);

// Page transition — lightweight, 200ms only
const pageVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0,        transition: { duration: 0.15 } },
};

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ width: '100%', height: '100%' }}
      >
        <Routes location={location}>
          <Route path="/" element={<LandingPage />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<CommandCenter />} />
            <Route path="/digital-twin" element={<Suspense fallback={<PageFallback />}><DigitalTwinPage /></Suspense>} />
            <Route path="/solar"       element={<Suspense fallback={<PageFallback />}><SolarPage /></Suspense>} />
            <Route path="/battery"     element={<Suspense fallback={<PageFallback />}><BatteryPage /></Suspense>} />
            <Route path="/consumption" element={<Suspense fallback={<PageFallback />}><ConsumptionPage /></Suspense>} />
            <Route path="/weather"     element={<Suspense fallback={<PageFallback />}><WeatherForecastPage /></Suspense>} />
            <Route path="/recommendations" element={<Suspense fallback={<PageFallback />}><RecommendationsPage /></Suspense>} />
            <Route path="/early-warning"   element={<Suspense fallback={<PageFallback />}><EarlyWarningPage /></Suspense>} />
            <Route path="/iot"         element={<Suspense fallback={<PageFallback />}><IoTPage /></Suspense>} />
            <Route path="/carbon"      element={<Suspense fallback={<PageFallback />}><CarbonPage /></Suspense>} />
            <Route path="/cost"        element={<Suspense fallback={<PageFallback />}><CostPage /></Suspense>} />
            <Route path="/reports"     element={<Suspense fallback={<PageFallback />}><ReportsPage /></Suspense>} />
            <Route path="/ai-models"   element={<Suspense fallback={<PageFallback />}><AIModelCenterPage /></Suspense>} />
            {/* Redirects for removed/merged routes */}
            <Route path="/anomalies"   element={<Navigate to="/early-warning" replace />} />
            <Route path="/scenarios"   element={<Navigate to="/early-warning" replace />} />
            <Route path="/forecast"    element={<Navigate to="/weather" replace />} />
            <Route path="/optimization" element={<Navigate to="/dashboard" replace />} />
            <Route path="/architecture" element={<Navigate to="/dashboard" replace />} />
            <Route path="/admin"        element={<Navigate to="/dashboard" replace />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function DemoSimulator() {
  const tick = useEnergyStore(s => s.tick);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(tick, 3000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [tick]);

  return null;
}

function KeyboardShortcuts() {
  const setCommandPaletteOpen = useUIStore(s => s.setCommandPaletteOpen);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setCommandPaletteOpen(true); }
      if (e.key === 'Escape') setCommandPaletteOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setCommandPaletteOpen]);

  return null;
}

export default function App() {
  const commandPaletteOpen = useUIStore(s => s.commandPaletteOpen);
  const copilotOpen = useUIStore(s => s.copilotOpen);

  return (
    <BrowserRouter>
      <DemoSimulator />
      <KeyboardShortcuts />
      <AnimatedRoutes />
      {commandPaletteOpen && <CommandPalette />}
      {copilotOpen && <AICopilot />}
    </BrowserRouter>
  );
}
