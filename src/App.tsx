/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, 
  Trash2, 
  Sparkles, 
  Cpu, 
  Lock,
  ArrowRightLeft,
  Database,
  Fingerprint,
  UserCheck,
  ShieldAlert
} from 'lucide-react';
import Header from './components/Header';
import MobileSimulator from './components/MobileSimulator';
import TechnicalInspector from './components/TechnicalInspector';
import AnimatedBackground from './components/AnimatedBackground';
import { SimulationLog, LightingCondition, APP_THEMES, AppTheme } from './types';

export default function App() {
  const [activeTheme, setActiveTheme] = useState<AppTheme>(APP_THEMES[0]);
  const [selectedLighting, setSelectedLighting] = useState<LightingCondition>('Normal');
  const [isInt8Enabled, setIsInt8Enabled] = useState<boolean>(true);
  const [selectedMockSubject, setSelectedMockSubject] = useState<'ajitha' | 'spoof_photo' | 'spoof_video'>('ajitha');
  const [logs, setLogs] = useState<SimulationLog[]>([]);

  // Seed default bootup logs in standard AI biometrics theme
  useEffect(() => {
    addLog("FaceGuard Edge JSI biometric core successfully initialized.", "info");
    addLog("Light TFLite facial classification models bound to local CPU execution threads.", "success");
    addLog("CLAHE image contrast preprocessor loaded and waiting for camera feeds.", "info");
    addLog("On-device 128D landmark vector calculation logic mapped to security matrix arrays.", "info");
    addLog("Local SQLCipher offline database connected with AES-GCM 256 enclaves.", "success");
    addLog("Anti-spoofing micro-texture checks loaded [Blinks & Edge Reflect detectors].", "info");
  }, []);

  const addLog = (message: string, level: 'info' | 'warn' | 'success' | 'error') => {
    const newLog: SimulationLog = {
      id: 'LOG-' + Math.floor(Math.random() * 100000),
      timestamp: new Date().toLocaleTimeString(),
      level,
      message
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50)); // limit logs size to 50 items
  };

  const clearLogs = () => {
    setLogs([]);
    addLog("Audit console history purged by operator.", "warn");
  };

  return (
    <div className="min-h-screen bg-[#040608] text-white flex flex-col relative overflow-x-hidden selection:bg-emerald-500/30 selection:text-emerald-200" id="app-root-container">
      {/* Dynamic Style Overrides based on selected theme */}
      <style id="theme-override-styles">{`
        :root {
          --theme-primary: ${activeTheme.primaryColor};
          --theme-secondary: ${activeTheme.secondaryColor};
          --theme-primary-rgb: ${activeTheme.primaryRgb};
          --theme-secondary-rgb: ${activeTheme.secondaryRgb};
          --theme-background: ${activeTheme.backgroundHex};
          --theme-glow: ${activeTheme.glowShadowColor};
        }
        
        /* Smooth transitions for seamless luxury visual shifts */
        body, html, #app-root-container, main {
          background-color: var(--theme-background) !important;
          transition: background-color 0.8s cubic-bezier(0.16, 1, 0.3, 1), color 0.5s ease;
        }

        /* Recolor Header laser top-bar line */
        #dashboard-header .absolute.top-0 {
          background: linear-gradient(to right, var(--theme-primary) 0%, var(--theme-secondary) 50%, var(--theme-primary) 100%) !important;
          box-shadow: 0 1px 20px var(--theme-primary) !important;
          transition: all 0.8s ease;
        }

        /* Ambient glows on headers and simulator blocks */
        #mobile-simulator-column > div, #inspector-root-panel, #live-console-logs {
          box-shadow: 0 0 50px rgba(var(--theme-primary-rgb), 0.04) !important;
          border-color: rgba(var(--theme-primary-rgb), 0.12) !important;
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Sub-grid/card borders hover */
        #metrics-teaser-grid > div:hover {
          border-color: rgba(var(--theme-primary-rgb), 0.35) !important;
          box-shadow: 0 10px 30px rgba(var(--theme-primary-rgb), 0.08) !important;
        }

        /* Theme badge / label in header */
        #dashboard-header span.text-emerald-300 {
          color: var(--theme-primary) !important;
          border-color: rgba(var(--theme-primary-rgb), 0.25) !important;
          background-color: rgba(var(--theme-primary-rgb), 0.10) !important;
        }
        #dashboard-header h1 span.text-emerald-450, #dashboard-header h1 span {
          color: white !important;
        }

        /* Normalizer tab elements, buttons active text recolors */
        .text-emerald-405, .text-emerald-300, .text-emerald-200 {
          color: var(--theme-secondary) !important;
          transition: color 0.5s ease;
        }
        
        .text-emerald-400, .text-emerald-450 {
          color: var(--theme-primary) !important;
          transition: color 0.5s ease;
        }
        
        .bg-emerald-500 {
          background-color: var(--theme-primary) !important;
          transition: background-color 0.5s ease;
        }

        .bg-emerald-950\/70, .bg-emerald-950\/80 {
          background-color: rgba(var(--theme-primary-rgb), 0.12) !important;
        }

        .border-emerald-500 {
          border-color: var(--theme-primary) !important;
        }

        .border-emerald-800\/40, .border-emerald-900\/40, .border-emerald-500\/25, .border-emerald-500\/30 {
          border-color: rgba(var(--theme-primary-rgb), 0.20) !important;
        }

        /* Gradients mapping on logo icon and metrics card banners */
        .from-emerald-400 {
          --tw-gradient-from: var(--theme-primary) !important;
          --tw-gradient-stops: var(--theme-primary), var(--theme-secondary) !important;
        }
        .to-teal-500, .to-amber-400, .to-orange-500 {
          --tw-gradient-to: var(--theme-secondary) !important;
        }

        /* Glow buttons inside components */
        #header-logo-outer, #mobile-simulator-column div.rounded-xl.bg-gradient-to-tr, #metrics-teaser-grid div.rounded-xl.bg-gradient-to-tr {
          background-image: linear-gradient(to top right, var(--theme-primary), var(--theme-secondary)) !important;
          box-shadow: 0 0 15px rgba(var(--theme-primary-rgb), 0.45) !important;
          transition: all 0.5s ease;
        }

        /* Sidebar active sliders background */
        input[type="range"]::-webkit-slider-runnable-track {
          background-color: rgba(var(--theme-primary-rgb), 0.15) !important;
        }
        input[type="range"]::-webkit-slider-thumb {
          background: var(--theme-primary) !important;
        }

        /* Selection highlights override */
        ::selection {
          background-color: rgba(var(--theme-primary-rgb), 0.25) !important;
          color: #ffffff !important;
        }

        /* Debug Level highlight indicators */
        span.bg-emerald-950\/80.text-emerald-400 {
          background-color: rgba(var(--theme-primary-rgb), 0.15) !important;
          color: var(--theme-primary) !important;
          border-color: rgba(var(--theme-primary-rgb), 0.25) !important;
        }
        span.text-emerald-400\/90 {
          color: var(--theme-primary) !important;
        }

        /* Custom scrollbar matching theme */
        .container-scroll::-webkit-scrollbar-thumb {
          background: rgba(var(--theme-primary-rgb), 0.2) !important;
        }
        .container-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(var(--theme-primary-rgb), 0.35) !important;
        }

        /* Footer status indicator */
        footer {
          border-color: rgba(var(--theme-primary-rgb), 0.15) !important;
        }
        footer .bg-emerald-400, footer .bg-white\/10 {
          background-color: var(--theme-primary) !important;
          box-shadow: 0 0 8px var(--theme-primary) !important;
        }
      `}</style>

      {/* Dynamic Animated Motion Matrix Background */}
      <AnimatedBackground theme={activeTheme} />

      {/* Main Core Brand Header */}
      <Header logsCount={logs.length} theme={activeTheme} />

      {/* Dynamic Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8 flex flex-col gap-8 z-30 animate-fade-in" id="main-workspace">
        
        {/* Dynamic Premium Theme Swapper HUD Panel */}
        <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 backdrop-blur-md relative overflow-hidden" id="theme-swapper-control-panel">
          <div 
            style={{ backgroundColor: `${activeTheme.primaryColor}22` }}
            className="absolute -top-10 -right-10 w-44 h-44 rounded-full blur-3xl pointer-events-none transition-all duration-700" 
          />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles 
                  style={{ color: activeTheme.primaryColor }}
                  className="w-5 h-5 animate-pulse" 
                />
                <h2 className="text-sm font-display font-extrabold tracking-wider uppercase text-white">
                  Luxury Terminal Landscapes
                </h2>
              </div>
              <p className="text-2xs text-gray-400 mt-1 leading-relaxed">
                Choose a luxury color coordination for FaceGuard Edge Terminal. Swapping instantly modifies background code streams, scanning lasers, dynamic glows, and facial landmark overlays.
              </p>
            </div>
            
            {/* Theme buttons slider */}
            <div className="flex flex-wrap gap-2.5" id="theme-buttons-container">
              {APP_THEMES.map((theme) => {
                const isSelected = activeTheme.id === theme.id;
                return (
                  <motion.button
                    key={theme.id}
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                       setActiveTheme(theme);
                       addLog(`Secure Theme coordination swapped to [${theme.name}]`, 'info');
                    }}
                    style={{ 
                      borderColor: isSelected ? theme.primaryColor : 'rgba(255,255,255,0.08)',
                      boxShadow: isSelected ? `0 0 16px ${theme.primaryColor}33` : 'none',
                      backgroundColor: isSelected ? `${theme.primaryColor}13` : 'rgba(255,255,255,0.03)'
                    }}
                    className={`px-4 py-2.5 rounded-2xl border text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                      isSelected ? 'text-white font-extrabold' : 'text-gray-400 hover:text-white'
                    }`}
                    id={`btn-theme-swapper-${theme.id}`}
                  >
                    <span>{theme.icon}</span>
                    <span>{theme.name}</span>
                    {isSelected && (
                      <span 
                        style={{ backgroundColor: theme.primaryColor }}
                        className="w-1.5 h-1.5 rounded-full animate-ping" 
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Teaser highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5" id="metrics-teaser-grid">
          <motion.div 
            whileHover={{ y: -8, scale: 1.025, boxShadow: "0 20px 45px rgba(52, 211, 153, 0.12)" }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="bg-white/5 border border-white/10 rounded-[28px] p-5 flex items-start gap-4 hover:bg-white/[0.08] hover:border-emerald-500/25 transition-all duration-300 backdrop-blur-md cursor-pointer select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center shadow-[0_0_15px_rgba(52,211,153,0.4)] text-white flex-shrink-0">
              <Cpu className="w-5.5 h-5.5" />
            </div>
            <div>
              <h3 className="text-xs font-display font-extrabold tracking-widest text-emerald-300 uppercase">On-Device Landmark DSP</h3>
              <p className="text-[11px] text-gray-400 mt-1.5 leading-normal">
                Zero network lag interface. High performance 128D facial vector localization is solved locally in under <strong>&lt;180ms</strong>.
              </p>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -8, scale: 1.025, boxShadow: "0 20px 45px rgba(245, 158, 11, 0.12)" }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="bg-white/5 border border-white/10 rounded-[28px] p-5 flex items-start gap-4 hover:bg-white/[0.08] hover:border-amber-500/25 transition-all duration-300 backdrop-blur-md cursor-pointer select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.4)] text-white flex-shrink-0">
              <Lock className="w-5.5 h-5.5" />
            </div>
            <div>
              <h3 className="text-xs font-display font-extrabold tracking-widest text-amber-300 uppercase">Dual-Spectral Liveness</h3>
              <p className="text-[11px] text-gray-400 mt-1.5 leading-normal">
                Blocks photo & video spoofs. Eye-blink frequency and 3D depth texture analysis guarantees validation only for live human presence.
              </p>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -8, scale: 1.025, boxShadow: "0 20px 45px rgba(20, 184, 166, 0.12)" }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="bg-white/5 border border-white/10 rounded-[28px] p-5 flex items-start gap-4 hover:bg-white/[0.08] hover:border-teal-500/25 transition-all duration-300 backdrop-blur-md cursor-pointer select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-400 to-cyan-500 flex items-center justify-center shadow-[0_0_15px_rgba(20, 184, 166, 0.4)] text-white flex-shrink-0">
              <ArrowRightLeft className="w-5.5 h-5.5" />
            </div>
            <div>
              <h3 className="text-xs font-display font-extrabold tracking-widest text-teal-300 uppercase">Enclave SQLCipher Ledger</h3>
              <p className="text-[11px] text-gray-400 mt-1.5 leading-normal">
                High security offline audits. Sync transaction payloads securely, then automatically zero out local registers to achieve military-grade secrecy.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Primary Interactive Dual Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="primary-grid">
          {/* Left Block: Curved Mobile Simulator */}
          <div className="lg:col-span-12 xl:col-span-12 xl:col-span-5 flex justify-center" id="mobile-simulator-column">
            <MobileSimulator 
              onAddLog={addLog}
              selectedLighting={selectedLighting}
              isInt8Enabled={isInt8Enabled}
              selectedMockSubject={selectedMockSubject}
              setSelectedMockSubject={setSelectedMockSubject}
              onRecordSynced={() => addLog("FaceGuard Edge local storage sanitized and logs flushed.", "success")}
            />
          </div>

          {/* Right Block: Technical Inspector / Benchmarks */}
          <div className="lg:col-span-12 xl:col-span-12 xl:col-span-7 space-y-6" id="inspector-column">
            <TechnicalInspector 
              selectedLighting={selectedLighting}
              setSelectedLighting={setSelectedLighting}
              isInt8Enabled={isInt8Enabled}
              setIsInt8Enabled={setIsInt8Enabled}
              selectedMockSubject={selectedMockSubject}
            />

            {/* Simulated Live Debug Audit Logs */}
            <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 backdrop-blur-md shadow-2xl relative overflow-hidden" id="live-console-logs">
              <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4.5 h-4.5 text-indigo-400 animate-pulse" />
                  <h4 className="text-xs font-display font-bold uppercase tracking-widest text-gray-300">FaceGuard Edge Biometric Core JSI Logs</h4>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearLogs}
                  className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/15 text-[10px] text-gray-400 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
                  id="clear-logs-btn"
                >
                  <Trash2 className="w-3.5 h-3.5 text-amber-500" />
                  Clear Logs
                </motion.button>
              </div>

              {/* Running rows */}
              <div className="h-[155px] overflow-y-auto font-mono text-[10px] space-y-2 select-text pr-1 container-scroll bg-black/40 p-4 rounded-2xl border border-white/5 text-left">
                {logs.length === 0 ? (
                  <span className="text-slate-600 block italic">Awaiting local biometric events... Trigger scans inside the smartphone device simulator frame.</span>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-2.5 border-b border-white/5 pb-1.5 last:border-0 leading-relaxed animate-fade-in">
                      <span className="text-gray-500 font-medium whitespace-nowrap">[{log.timestamp}]</span>
                      <span className={`px-1.5 py-0.5 rounded font-bold text-[8px] uppercase tracking-wider whitespace-nowrap ${
                        log.level === 'success' ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-900/40' :
                        log.level === 'warn' ? 'bg-amber-950/80 text-amber-300 border border-amber-900/40' :
                        log.level === 'error' ? 'bg-rose-950/80 text-rose-450 border border-rose-900/40' :
                        'bg-teal-950/80 text-teal-300 border border-teal-900/40'
                      }`}>
                        {log.level}
                      </span>
                      <span className={`flex-1 ${
                        log.level === 'success' ? 'text-emerald-400/90' :
                        log.level === 'warn' ? 'text-amber-300/90' :
                        log.level === 'error' ? 'text-rose-405/90' :
                        'text-gray-300'
                      }`}>
                        {log.message}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-5 border-t border-white/10 mt-auto bg-[#05070a] z-10 flex flex-col md:flex-row justify-between items-center px-8 text-[10px] tracking-widest text-gray-500 font-mono select-none">
        <div className="flex space-x-6">
          <span>TERMINAL_ID: FACEGUARD_EDGE_104</span>
          <span>Liveness Engine: Standby</span>
          <span>SESSION CORE: EXECUTING</span>
        </div>
        <div className="flex space-x-6 items-center uppercase mt-2 md:mt-0">
          <span className="flex items-center"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2 shadow-[0_0_6px_#10b981]"></div> Shield Protection: 100% Locked</span>
          <span className="text-white font-bold px-3 py-1 bg-white/10 rounded-full">ENCLAVE SECURE SHIELD</span>
        </div>
      </footer>
    </div>
  );
}
