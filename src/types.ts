/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface BiometricSubject {
  id: string; // Employee/Subject ID
  name: string; // Employee Name
  department: string; // Department (e.g. Security, R&D)
  enrolledAt: string;
  signature: number[]; // 128-d biometric facial landmark embedding array
  role: string; // e.g. "Primary Administrator", "Level-5 Engineer"
  avatarIcon: string; // Emoji avatar representation
}

export interface BiometricRecord {
  id: string; // Log ID
  subjectId: string;
  subjectName: string;
  timestamp: string;
  matchScore: number; // Percent confidence similarity score
  livenessScore: number; // Eye blink / texture liveness probability
  latencyMs: number; // Algorithm delay
  isSynced: boolean; // Transmitted back to corporate security logs
  hash: string; // HMAC SHA-256 simulation chain hash for tamper-proof ledger
}

export type IlluminationMode = 'Normal' | 'Harsh_Sunlight' | 'Low_Light' | 'Shadow';

export type LightingCondition = 'Normal' | 'Harsh_Sunlight' | 'Low_Light' | 'Shadow';

export type BiometricStage = 'ALIGN_FACE' | 'BLINK_CHALLENGE' | 'TEXTURE_ANALYSIS' | 'LOCKED' | 'TIMEOUT_ERROR';

export interface AppTheme {
  id: 'emerald' | 'gold' | 'amethyst' | 'glacier';
  name: string;
  icon: string;
  primaryColor: string;
  secondaryColor: string;
  primaryRgb: string;
  secondaryRgb: string;
  backgroundHex: string;
  glowShadowColor: string;
  symbolsPalette: string[];
}

export const APP_THEMES: AppTheme[] = [
  {
    id: 'emerald',
    name: 'Imperial Emerald & Gold',
    icon: '🟢',
    primaryColor: '#10b981',
    secondaryColor: '#fbbf24',
    primaryRgb: '16, 185, 129',
    secondaryRgb: '251, 191, 36',
    backgroundHex: '#030604',
    glowShadowColor: 'rgba(16, 185, 129, 0.45)',
    symbolsPalette: ['0', '1', '🟢', '🔑', '👤', 'e', 'm', 'e', 'r', 'a', 'l', 'd', 'f', 'a', 'c', 'e', '#', '$', '%', '&', '*', 'Ø', 'Æ', 'Ξ', 'Ψ', 'Ω', '0x', 'FF', 'A4']
  },
  {
    id: 'gold',
    name: 'Champagne Beige & Gold',
    icon: '⚜️',
    primaryColor: '#fbbf24',
    secondaryColor: '#f5e6d3',
    primaryRgb: '251, 191, 36',
    secondaryRgb: '245, 230, 211',
    backgroundHex: '#060503',
    glowShadowColor: 'rgba(251, 191, 36, 0.45)',
    symbolsPalette: ['8', '9', '7', '8', '👤', '⚜', 'B', 'I', 'O', 'M', 'E', 'T', 'R', 'I', 'C', '₿', '$', 'X', 'Y', 'Z', '9', '8', '0x', '🔑', '🔓', '⚡', '🔒', '🔐']
  },
  {
    id: 'amethyst',
    name: 'Sandalwood Beige & Amber Gold',
    icon: '🌾',
    primaryColor: '#decbb7',
    secondaryColor: '#d4af37',
    primaryRgb: '222, 203, 183',
    secondaryRgb: '212, 175, 55',
    backgroundHex: '#050403',
    glowShadowColor: 'rgba(222, 203, 183, 0.45)',
    symbolsPalette: ['S', 'E', 'C', 'U', 'R', 'E', 'B', 'I', 'O', 'S', 'H', 'I', 'E', 'L', 'D', '0', '1', 'Σ', 'λ', 'μ', '0x', 'AF', 'C9', '⚡', '👤', '🛡️', '🔒', '🗝️', '✨']
  },
  {
    id: 'glacier',
    name: 'Jade Guardian & Satin Cashmere',
    icon: '🐉',
    primaryColor: '#047857',
    secondaryColor: '#fcf1e3',
    primaryRgb: '4, 120, 87',
    secondaryRgb: '252, 241, 227',
    backgroundHex: '#020504',
    glowShadowColor: 'rgba(4, 120, 87, 0.45)',
    symbolsPalette: ['J', 'A', 'D', 'E', 'S', 'E', 'C', 'U', 'R', '0', '1', 'X', 'Y', 'Z', '👤', '🟢', '✨', '🔒', 'Ø', 'Æ', 'ƒ', 'λ', 'μ', 'π', 'θ', '0x', 'EE', 'B5', 'D3', '::']
  }
];

export interface BiometricBenchmark {
  name: string;
  modelSize: number; // in MB
  latMs: number;    // in ms
  accuracyScore: number; // percentage
  description: string;
}

export interface SimulationLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'success' | 'error';
  message: string;
}
