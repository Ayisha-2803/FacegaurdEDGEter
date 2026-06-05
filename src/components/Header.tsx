/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Activity } from 'lucide-react';
import { AppTheme } from '../types';
import AnimatedLogo from './AnimatedLogo';

interface HeaderProps {
  logsCount: number;
  theme: AppTheme;
}

export default function Header({ logsCount, theme }: HeaderProps) {
  return (
    <header className="w-full bg-[#05070a]/90 backdrop-blur-md border-b border-white/10 py-5 px-6 md:px-12 flex flex-col md:flex-row md:items-center justify-between gap-4 z-40 relative overflow-hidden" id="dashboard-header">
      {/* Decorative colored visual laser light line at the top with premium active theme gradients */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-amber-405 to-teal-500 shadow-[0_1px_15px_rgba(52,211,153,0.5)]" />
      
      {/* Visual background ambient orb */}
      <div className="absolute top-0 right-1/4 w-96 h-24 bg-teal-500/15 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute top-0 left-0 w-64 h-24 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />
 
      {/* Dynamic Interactive Title and Animated Logo block */}
      <div className="flex items-center gap-3.5">
        <AnimatedLogo theme={theme} size={46} />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-display font-extrabold tracking-tight text-white leading-none">
              FaceGuard <span className="text-emerald-400">Edge</span>
            </h1>
            <span className="text-[9px] font-mono tracking-widest bg-white/10 text-emerald-300 border border-white/15 py-0.5 px-2 rounded-full font-bold uppercase transition-colors hover:bg-white/15">
              Offline Biometric Terminal
            </span>
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-semibold mt-1">
            3D Liveness Detection & landmark validation • FaceGuard Edge v1.0
          </p>
        </div>
      </div>

      {/* Security level coordinates */}
      <div className="flex items-center space-x-6 z-10" id="header-metadata-box">
        <div className="flex flex-col items-end">
          <div className="flex items-center space-x-2 text-emerald-400">
            <div className="w-2 h-2 rounded-full bg-emerald-450 animate-pulse"></div>
            <span className="text-xs font-bold uppercase tracking-widest font-display">Liveness Engine Active</span>
          </div>
          <span className="text-[10px] text-gray-500 font-mono">Local JSI C++ Verification Nodes</span>
        </div>
        <div className="h-10 w-[1px] bg-white/10"></div>
        <div className="flex flex-col items-end">
          <span className="text-xs font-bold text-gray-200 font-display">SECURITY INDEX: SECURE</span>
          <span className="text-[10px] text-gray-500 font-mono">Terminal Integrity: Verified</span>
        </div>
      </div>
    </header>
  );
}
