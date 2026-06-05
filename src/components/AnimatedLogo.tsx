/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { AppTheme } from '../types';

interface AnimatedLogoProps {
  theme: AppTheme;
  size?: number;
}

export default function AnimatedLogo({ theme, size = 44 }: AnimatedLogoProps) {
  // We can render a multi-layered canvas-glowing concentric circular system
  return (
    <div 
      className="relative flex items-center justify-center cursor-pointer select-none"
      style={{ width: size, height: size }}
      id="astrodec-animated-logo"
    >
      {/* Dynamic background glow aligned with the theme colors */}
      <div 
        style={{ 
          background: `radial-gradient(circle, ${theme.primaryColor}22 0%, transparent 70%)` 
        }} 
        className="absolute inset-[-10px] rounded-full blur-sm pointer-events-none" 
      />

      {/* Outermost rotating cosmic coordinate field ring */}
      <motion.svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 100 100" 
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ rotate: { repeat: Infinity, duration: 10, ease: "linear" } }}
      >
        {/* Outer boundary orbit line */}
        <circle 
          cx="50" 
          cy="50" 
          r="45" 
          fill="none" 
          stroke={theme.primaryColor} 
          strokeWidth="1.5" 
          strokeDasharray="4 6" 
          strokeOpacity="0.45"
        />
        {/* Inner boundary helper ring */}
        <circle 
          cx="50" 
          cy="50" 
          r="38" 
          fill="none" 
          stroke={theme.secondaryColor} 
          strokeWidth="1" 
          strokeDasharray="2 3" 
          strokeOpacity="0.30"
        />
        {/* Stellar satellites/nodes on orbit path */}
        <circle cx="50" cy="5" r="3.5" fill={theme.secondaryColor} className="shadow-lg" />
        <circle cx="12" cy="74" r="2.5" fill={theme.primaryColor} />
        <circle cx="88" cy="74" r="2" fill={theme.primaryColor} />
      </motion.svg>

      {/* Concentric Radiating Signal Waves */}
      <motion.div 
        className="absolute w-[60%] h-[60%] rounded-full border border-dashed flex items-center justify-center"
        style={{ borderColor: `${theme.primaryColor}55` }}
        animate={{ 
          scale: [1, 1.4, 0.95, 1],
          opacity: [0.6, 0.25, 0.8, 0.6]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 3, 
          ease: "easeInOut" 
        }}
      />

      <motion.div 
        className="absolute w-[80%] h-[80%] rounded-full border flex items-center justify-center"
        style={{ borderColor: `${theme.secondaryColor}25` }}
        animate={{ 
          scale: [1, 0.8, 1.25, 1],
          opacity: [0.3, 0.7, 0.2, 0.3]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 4.5, 
          ease: "easeInOut",
          delay: 0.5
        }}
      />

      {/* Central Pulsating Neutron Star Spark Core */}
      <motion.div 
        whileHover={{ scale: 1.25, rotate: 45 }}
        whileTap={{ scale: 0.88 }}
        style={{ 
          backgroundColor: theme.primaryColor,
          boxShadow: `0 0 16px ${theme.primaryColor}, 0 0 32px ${theme.secondaryColor}`
        }}
        className="w-4 h-4 rounded-full flex items-center justify-center z-10"
        animate={{ 
          scale: [1, 1.35, 0.9, 1.1, 1],
          boxShadow: [
            `0 0 12px ${theme.primaryColor}`, 
            `0 0 24px ${theme.secondaryColor}`, 
            `0 0 12px ${theme.primaryColor}`
          ]
        }}
        transition={{ 
          scale: { repeat: Infinity, duration: 1.8, ease: "easeInOut" },
          boxShadow: { repeat: Infinity, duration: 1.8, ease: "easeInOut" }
        }}
      >
        {/* Inner gold core nucleus */}
        <div style={{ backgroundColor: theme.secondaryColor }} className="w-1.5 h-1.5 rounded-full" />
      </motion.div>

      {/* Horizontal & Vertical Crosshair Grid lines inside Core */}
      <div 
        className="absolute w-[70%] h-[1px] opacity-40 pointer-events-none"
        style={{ backgroundColor: theme.primaryColor }}
      />
      <div 
        className="absolute w-[1px] h-[70%] opacity-40 pointer-events-none"
        style={{ backgroundColor: theme.primaryColor }}
      />
    </div>
  );
}
