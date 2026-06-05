/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sliders, 
  Cpu, 
  Layers, 
  FileCode2, 
  Sun, 
  Moon, 
  ChevronRight, 
  Zap, 
  Info,
  CheckCircle,
  Database,
  Terminal,
  BookOpen,
  Eye,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { LightingCondition } from '../types';
import { MODEL_BENCHMARKS } from '../utils/faceSimulator';

interface TechnicalInspectorProps {
  selectedLighting: LightingCondition;
  setSelectedLighting: (lighting: LightingCondition) => void;
  isInt8Enabled: boolean;
  setIsInt8Enabled: (enabled: boolean) => void;
  selectedMockSubject: 'ajitha' | 'spoof_photo' | 'spoof_video';
}

export default function TechnicalInspector({
  selectedLighting,
  setSelectedLighting,
  isInt8Enabled,
  setIsInt8Enabled,
  selectedMockSubject
}: TechnicalInspectorProps) {
  const [activeSegment, setActiveSegment] = useState<'CLAHE' | 'MODEL_BENCHMARK' | 'CODE_GUIDE'>('CLAHE');
  const [activeCodeTab, setActiveCodeTab] = useState<'RN_BRIDGE' | 'SYNC_LOGIC' | 'BENCHMARK_REPORT'>('RN_BRIDGE');
  
  // Canvas refs for On-device Image Contrast Optimization (CLAHE) Preprocess Simulation
  const sourceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const resultCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Re-draws the face biometric landmark sweeps when simulation options or subjects swap
  useEffect(() => {
    drawFaceLandmarkComparison();
  }, [selectedLighting, selectedMockSubject]);

  const drawFaceLandmarkComparison = () => {
    const srcCanvas = sourceCanvasRef.current;
    const resCanvas = resultCanvasRef.current;
    if (!srcCanvas || !resCanvas) return;

    const ctxSrc = srcCanvas.getContext('2d');
    const ctxRes = resCanvas.getContext('2d');
    if (!ctxSrc || !ctxRes) return;

    // Clear both square viewports
    ctxSrc.clearRect(0, 0, 180, 180);
    ctxRes.clearRect(0, 0, 180, 180);

    const time = Date.now() * 0.003;

    // Set of 13 face biometric points centered around (90, 85)
    const landmarks = [
      { id: 'chin_tip', x: 90, y: 135 },
      { id: 'left_jaw', x: 60, y: 110 },
      { id: 'right_jaw', x: 120, y: 110 },
      { id: 'forehead_left', x: 62, y: 48 },
      { id: 'forehead_right', x: 118, y: 48 },
      { id: 'left_eyebrow', x: 72, y: 62 },
      { id: 'right_eyebrow', x: 108, y: 62 },
      { id: 'left_eye', x: 74, y: 72 },
      { id: 'right_eye', x: 106, y: 72 },
      { id: 'nose_bridge', x: 90, y: 80 },
      { id: 'nose_tip', x: 90, y: 94 },
      { id: 'mouth_left', x: 76, y: 112 },
      { id: 'mouth_right', x: 104, y: 112 }
    ];

    // Connect pairs of face mesh lines
    const meshLinks = [
      ['forehead_left', 'left_eyebrow'],
      ['forehead_right', 'right_eyebrow'],
      ['left_eyebrow', 'left_eye'],
      ['right_eyebrow', 'right_eye'],
      ['left_jaw', 'chin_tip'],
      ['right_jaw', 'chin_tip'],
      ['left_jaw', 'left_eye'],
      ['right_jaw', 'right_eye'],
      ['left_eye', 'nose_bridge'],
      ['right_eye', 'nose_bridge'],
      ['nose_bridge', 'nose_tip'],
      ['nose_tip', 'mouth_left'],
      ['nose_tip', 'mouth_right'],
      ['mouth_left', 'chin_tip'],
      ['mouth_right', 'chin_tip'],
      ['mouth_left', 'mouth_right'],
      ['forehead_left', 'forehead_right']
    ];

    const drawBiometricFace = (ctx: CanvasRenderingContext2D, isResult: boolean) => {
      // 1. Draw image sensor backing wash representation
      const backgroundGrad = ctx.createLinearGradient(0, 0, 180, 180);
      if (selectedLighting === 'Harsh_Sunlight') {
        // High solar oversaturation
        backgroundGrad.addColorStop(0, '#fef08a');
        backgroundGrad.addColorStop(1, '#854d0e');
      } else if (selectedLighting === 'Low_Light') {
        // Deep purple-black dark environment
        backgroundGrad.addColorStop(0, '#02010c');
        backgroundGrad.addColorStop(1, '#1e1b4b');
      } else if (selectedLighting === 'Shadow') {
        // Left side covered in shadows, right side lit
        backgroundGrad.addColorStop(0, '#080c15');
        backgroundGrad.addColorStop(0.5, '#05070c');
        backgroundGrad.addColorStop(1, '#334155');
      } else {
        // Normal state: Balanced deep slate
        backgroundGrad.addColorStop(0, '#05070c');
        backgroundGrad.addColorStop(1, '#1e293b');
      }

      ctx.fillStyle = backgroundGrad;
      ctx.fillRect(0, 0, 180, 180);

      // Save canvas context to apply variable camera filter layers
      ctx.save();
      
      if (!isResult) {
        // Raw image feeds contain noise and lighting distortions
        if (selectedLighting === 'Harsh_Sunlight') {
          ctx.filter = 'blur(1.2px) brightness(1.75) contrast(1.5)';
        } else if (selectedLighting === 'Low_Light') {
          ctx.filter = 'brightness(0.2) contrast(0.4) opacity(0.5)';
        } else if (selectedLighting === 'Shadow') {
          // Emulate dramatic shadow on face feed
          ctx.filter = 'contrast(0.7) opacity(0.85)';
        }
      } else {
        // Preprocessed viewport is optimized via CLAHE (Local Histogram Equalization)
        ctx.filter = 'brightness(1.0) contrast(1.1)';
      }

      // Draw Head Contour Backing Oval
      ctx.strokeStyle = isResult ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.08)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(90, 85, 42, 60, 0, 0, Math.PI * 2);
      ctx.stroke();

      // 2. Draw mesh links connecting facial coordinates
      ctx.strokeStyle = isResult 
        ? 'rgba(16, 185, 129, 0.4)' 
        : selectedLighting === 'Low_Light' ? 'rgba(148, 163, 184, 0.09)' : 'rgba(148, 163, 184, 0.25)';
      ctx.lineWidth = 0.8;
      
      meshLinks.forEach(([idA, idB]) => {
        const ptA = landmarks.find(p => p.id === idA);
        const ptB = landmarks.find(p => p.id === idB);
        if (ptA && ptB) {
          ctx.beginPath();
          ctx.moveTo(ptA.x, ptA.y);
          ctx.lineTo(ptB.x, ptB.y);
          ctx.stroke();
        }
      });

      // 3. Draw biometric landmark vertices
      landmarks.forEach((pt) => {
        const isEye = pt.id === 'left_eye' || pt.id === 'right_eye';
        
        if (isResult) {
          // Perfect computer vision landmark detections
          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, isEye ? 2.5 : 1.8, 0, Math.PI * 2);
          ctx.fill();

          // Eyeball locked green circles
          if (isEye) {
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 0.55;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 4.5, 0, Math.PI * 2);
            ctx.stroke();
          }
        } else {
          // Raw points might look faded, jittered, or lost in shadows
          ctx.fillStyle = selectedLighting === 'Low_Light' ? '#64748b' : '#94a3b8';
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, isEye ? 2 : 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Restore camera filter layers
      ctx.restore();

      // 4. Overlays text descriptors inside viewports
      ctx.font = '700 8px monospace';
      if (isResult) {
        ctx.fillStyle = '#10b981';
        ctx.fillText("CLAHE: BALANCED", 8, 16);
        ctx.fillText("LOCK: 13 NODES", 8, 25);
        
        // Active laser sweep grid overlay
        const sweepY = 15 + ((Date.now() / 15) % 150);
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(10, sweepY);
        ctx.lineTo(170, sweepY);
        ctx.stroke();
        
        // Target focus corners
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1;
        // Top Left
        ctx.beginPath(); ctx.moveTo(12, 22); ctx.lineTo(12, 12); ctx.lineTo(22, 12); ctx.stroke();
        // Top Right
        ctx.beginPath(); ctx.moveTo(168, 22); ctx.lineTo(168, 12); ctx.lineTo(158, 12); ctx.stroke();
        // Bottom Left
        ctx.beginPath(); ctx.moveTo(12, 158); ctx.lineTo(12, 168); ctx.lineTo(22, 168); ctx.stroke();
        // Bottom Right
        ctx.beginPath(); ctx.moveTo(168, 158); ctx.lineTo(168, 168); ctx.lineTo(158, 168); ctx.stroke();
      } else {
        ctx.fillStyle = '#fbbf24';
        if (selectedLighting === 'Harsh_Sunlight') {
          ctx.fillText("RAW: UNSUPRESSED GLARE", 8, 16);
          ctx.fillText("CONTRAST DRIFT: HIGH", 8, 25);
        } else if (selectedLighting === 'Low_Light') {
          ctx.fillText("RAW: CRITICAL UNDEREXPOSURE", 8, 16);
          ctx.fillText("GAIN OFFSET: OUT OF BOUNDS", 8, 25);
        } else if (selectedLighting === 'Shadow') {
          ctx.fillText("RAW: LATERAL DEPTH SHADOWS", 8, 16);
          ctx.fillText("SYMMETRY SCAN: BLOCKED", 8, 25);
        } else {
          ctx.fillText("RAW: STABLE LUMENS", 8, 16);
          ctx.fillText("SCANNER COLD", 8, 25);
        }
      }
    };

    drawBiometricFace(ctxSrc, false);
    drawFaceBiometricBalanced(ctxRes);
  };

  const drawFaceBiometricBalanced = (ctx: CanvasRenderingContext2D) => {
    // Perfect contrast normalized face model
    ctx.fillStyle = '#020504';
    ctx.fillRect(0, 0, 180, 180);

    const landmarks = [
      { id: 'chin_tip', x: 90, y: 135 },
      { id: 'left_jaw', x: 60, y: 110 },
      { id: 'right_jaw', x: 120, y: 110 },
      { id: 'forehead_left', x: 62, y: 48 },
      { id: 'forehead_right', x: 118, y: 48 },
      { id: 'left_eyebrow', x: 72, y: 62 },
      { id: 'right_eyebrow', x: 108, y: 62 },
      { id: 'left_eye', x: 74, y: 72 },
      { id: 'right_eye', x: 106, y: 72 },
      { id: 'nose_bridge', x: 90, y: 80 },
      { id: 'nose_tip', x: 90, y: 94 },
      { id: 'mouth_left', x: 76, y: 112 },
      { id: 'mouth_right', x: 104, y: 112 }
    ];

    const meshLinks = [
      ['forehead_left', 'left_eyebrow'],
      ['forehead_right', 'right_eyebrow'],
      ['left_eyebrow', 'left_eye'],
      ['right_eyebrow', 'right_eye'],
      ['left_jaw', 'chin_tip'],
      ['right_jaw', 'chin_tip'],
      ['left_jaw', 'left_eye'],
      ['right_jaw', 'right_eye'],
      ['left_eye', 'nose_bridge'],
      ['right_eye', 'nose_bridge'],
      ['nose_bridge', 'nose_tip'],
      ['nose_tip', 'mouth_left'],
      ['nose_tip', 'mouth_right'],
      ['mouth_left', 'chin_tip'],
      ['mouth_right', 'chin_tip'],
      ['mouth_left', 'mouth_right'],
      ['forehead_left', 'forehead_right']
    ];

    // Oval outline
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.2)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(90, 85, 42, 60, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Core mesh lines in green
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)';
    ctx.lineWidth = 0.9;
    meshLinks.forEach(([idA, idB]) => {
      const ptA = landmarks.find(p => p.id === idA);
      const ptB = landmarks.find(p => p.id === idB);
      if (ptA && ptB) {
        ctx.beginPath();
        ctx.moveTo(ptA.x, ptA.y);
        ctx.lineTo(ptB.x, ptB.y);
        ctx.stroke();
      }
    });

    // Outer glow highlight dots
    landmarks.forEach((p) => {
      const isEye = p.id === 'left_eye' || p.id === 'right_eye';
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(p.x, p.y, isEye ? 2.5 : 1.8, 0, Math.PI * 2);
      ctx.fill();

      if (isEye) {
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    // Technical readout scanlines and text
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
    ctx.lineWidth = 0.5;
    for (let i = 20; i < 180; i += 20) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 180); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(180, i); ctx.stroke();
    }

    ctx.font = '700 8px monospace';
    ctx.fillStyle = '#10b981';
    ctx.fillText("CLAHE PREPRECESSED", 8, 16);
    ctx.fillText("BIOMETRIC_LOCK: 100%", 8, 168);
  };

  // On-device facial verification codes representation
  const codeSnippets = {
    RN_BRIDGE: `// modules/FaceGuardEdgeSecureBiometrics.ts
// Native High-Speed JSI (JavaScript Interface) custom C++ bindings for neural nets
import { NativeModules } from 'react-native';

const { FaceGuardEdgeBiometricBridge } = NativeModules;

export interface BiometricVerificationResult {
  similarityScore: number; // 0.0 to 1.0 (cosine distance coefficient)
  livenessPassed: boolean; // eye-blink and skin texture validated
  processingTimeMs: number;
}

/**
 * Initializes light on-device biometric neural classification engines.
 * Prefetches FaceNet landmarks and liveness checks safely inside memory blocks.
 */
export async function initializeBiometricEngine(): Promise<boolean> {
  return await FaceGuardEdgeBiometricBridge.initialize({
    models: {
      liveness_net: 'ultra_liveness_v2.tflite',
      face_embedding: 'facenet_128d_int8.tflite',
      contrast_preprocessor: 'clahe_core_int8.tflite',
      executive_classifier: 'deep_id3_facelock.tflite'
    },
    threadsCount: 2,
    accelerator: 'JSI_NEURAL_CORE'
  });
}`,
    SYNC_LOGIC: `// services/FaceGuardEdgeSecurityLedger.ts
// Securely commits offline biometric records into cryptographic hash chains
import EncryptedStorage from 'react-native-encrypted-storage';
import { publishToSecurityEnclave } from './securityGateway';

export async function processSecurityLogSyncFlow(): Promise<void> {
  const cachedData = await EncryptedStorage.getItem('local_biometric_log_audit');
  if (!cachedData) return;

  const records = JSON.parse(cachedData);
  const enclaveSignatureKey = await EncryptedStorage.getItem('hardware_hsm_key');

  const syncPayload = {
    enclaveSignatureKey,
    logEntriesCount: records.length,
    sessionTimestamp: new Date().toISOString(),
    auditLogs: records // Transmits cryptographic hash tags and basic subject mappings ONLY
  };

  const response = await publishToSecurityEnclave(syncPayload);
  
  if (response.status === 200 && response.data.enclaveConfirmed) {
    // PLATFORM COMPLIANCE AUDIT standard (Chapter 4):
    // Zero-out local SQLite tables immediately after verification to protect bio embeddings
    await EncryptedStorage.removeItem('local_biometric_log_audit');
    console.log('[FaceGuard Edge Core] Local biometric logs purged and zeroed from hardware registers.');
  }
}`,
    BENCHMARK_REPORT: `# AES BIOMETRIC LANDMARK COMPACTION AND ACCELERATION REPORT
# Simulated Ground Environment Platform: 3GB Node Container, v4.50
--------------------------------------------------------------------------

1. Model Compaction: INT8 Post-Training Quantization (PTQ)
   - ResNet face embedding net raw state:  12.50 MB
   - INT8 quantized face embedding model:     3.30 MB (✓ Fast local memory cold-boot)
   - Model footprint reduction rate:          73.6% Compaction Ratio

2. Calculation Latencies (CLAHE Preprocess + Eye Blink Verification + Extraction)
   - Float32 Standard JSI loops:             ~820 ms
   - INT8 Quantized JSI Core:                 ~178 ms (✓ Ultra-fast local unlock check)
   - Precision score deviation:              0.85% (Maintains 99.1% overall lock rate)

3. Tamper-Proof Audit Table Database footprint (10,000 Records stored):
   - SQLite DB overhead per entry:           128 floats * 4 bytes/float = 512 bytes
   - Total SQLCipher encryption size:        ~5.12 MB (Average query query time: <8ms)`
  };

  return (
    <div className="flex flex-col bg-white/5 border border-white/10 rounded-3xl p-6 shadow-[0_0_50px_rgba(99,102,241,0.05)] backdrop-blur-md relative" id="inspector-root-panel">
      {/* Decorative gradient corner backdrop */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10 blur-3xl pointer-events-none rounded-bl-full" />
      
      {/* Tabs / Segments */}
      <div className="flex border-b border-white/10 mb-6 font-display" id="inspector-tabs-header">
        <button 
          onClick={() => setActiveSegment('CLAHE')}
          className={`flex-1 pb-3 text-xs font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2 ${
            activeSegment === 'CLAHE' 
              ? 'text-indigo-400 border-b-2 border-indigo-400 font-extrabold' 
              : 'text-gray-400 hover:text-white'
          }`}
          id="tab-btn-clahe"
        >
          <Sliders className="w-4 h-4 text-indigo-400" />
          CLAHE Image Optimizer
        </button>
 
        <button 
          onClick={() => setActiveSegment('MODEL_BENCHMARK')}
          className={`flex-1 pb-3 text-xs font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2 ${
            activeSegment === 'MODEL_BENCHMARK' 
              ? 'text-indigo-400 border-b-2 border-indigo-400 font-extrabold' 
              : 'text-gray-400 hover:text-white'
          }`}
          id="tab-btn-models"
        >
          <Cpu className="w-4 h-4 text-fuchsia-400" />
          INT8 Model Benchmarks
        </button>

        <button 
          onClick={() => setActiveSegment('CODE_GUIDE')}
          className={`flex-1 pb-3 text-xs font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2 ${
            activeSegment === 'CODE_GUIDE' 
              ? 'text-indigo-400 border-b-2 border-indigo-400 font-extrabold' 
              : 'text-gray-400 hover:text-white'
          }`}
          id="tab-btn-codes"
        >
          <FileCode2 className="w-4 h-4 text-teal-400" />
          Native JSI Engine
        </button>
      </div>

      {/* Main Tab Screens content with smooth animations */}
      <div className="flex-1 min-h-[460px] flex flex-col" id="inspector-viewport">
        <AnimatePresence mode="wait">
          {activeSegment === 'CLAHE' && (
            <motion.div 
              key="clahe-panel"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="flex-1 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-base font-extrabold tracking-tight text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-400" /> CLAHE Illumination Preprocessor
                  </h4>
                  <span className="text-2xs bg-indigo-950/70 text-indigo-300 font-bold px-3 py-1 rounded-full border border-indigo-800/40">
                    Confidence Lock Rate: 99.1%
                  </span>
                </div>
                
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Variable illumination like harsh overhead shadows, direct sunlight backlighting, and dark low-light levels cause generic neural models to fail. FaceGuard Edge applies **Contrast Limited Adaptive Histogram Equalization (CLAHE)** to normalize illumination over local pixel grids in real-time, delivering crisp facial vectors in any environment.
                </p>

                {/* Simulated Local-Compensative Tiles Controller */}
                <div className="bg-black/40 p-4 border border-white/10 rounded-2xl mb-4">
                  <span className="text-[10px] text-indigo-400 uppercase tracking-widest font-mono block mb-2">Simulate Ambient Lighting Distortions:</span>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                    {(['Normal', 'Harsh_Sunlight', 'Low_Light', 'Shadow'] as LightingCondition[]).map((cond) => (
                      <button
                        key={cond}
                        onClick={() => {
                          setSelectedLighting(cond);
                        }}
                        className={`text-2xs font-semibold py-2 px-2 rounded-xl text-center border capitalize transition-all cursor-pointer ${
                          selectedLighting === cond 
                            ? 'bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/10 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-500/5 font-extrabold' 
                            : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/15'
                        }`}
                        id={`lighting-select-${cond}`}
                      >
                        {cond === 'Harsh_Sunlight' && '☀️ Direct Solar'}
                        {cond === 'Low_Light' && '🌙 Low Light (15lx)'}
                        {cond === 'Shadow' && '👥 Side Shadows'}
                        {cond === 'Normal' && '🏢 Balanced Office'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comparative Double Frame Block */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-mono text-fuchsia-400 mb-1.5 uppercase tracking-wider">Unfiltered Video Frame Input</span>
                    <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-square w-full max-w-[170px] bg-black/40">
                      <canvas ref={sourceCanvasRef} width="180" height="180" className="w-full h-full animate-pulse" />
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-mono text-emerald-400 mb-1.5 uppercase tracking-wider">CLAHE Preprocessed Output</span>
                    <div className="relative rounded-2xl overflow-hidden border border-emerald-500/30 aspect-square w-full max-w-[170px] bg-[#020504] shadow-lg shadow-emerald-500/5">
                      <canvas ref={resultCanvasRef} width="180" height="180" className="w-full h-full" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-start gap-2.5 text-xs text-gray-400 leading-relaxed mt-4">
                <Info className="w-4.5 h-4.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Cv preprocessor optimization:</strong> In shadow-heavy mock cases, CLAHE restores facial landmarks from an unmatchable <strong>57%</strong> similarity baseline up to a perfect <strong>99.1%</strong> match score in under <strong>&lt;12ms</strong> of processing latency.
                </span>
              </div>
            </motion.div>
          )}

          {activeSegment === 'MODEL_BENCHMARK' && (
            <motion.div 
              key="benchmarks-panel"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="flex-1 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-base font-extrabold tracking-tight text-white flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-indigo-400" /> On-Device Neural Model Benchmarks
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-2xs text-gray-400 font-bold uppercase">INT8 Post-Quantization:</span>
                    <button 
                      onClick={() => setIsInt8Enabled(!isInt8Enabled)}
                      className={`relative w-10 h-5.5 rounded-full transition-all duration-350 outline-none ${
                        isInt8Enabled ? 'bg-indigo-500' : 'bg-white/10'
                      }`}
                      id="opt-int8-toggle"
                    >
                      <span className={`absolute top-0.75 left-0.75 w-4 h-4 bg-white rounded-full transition-all duration-350 ${
                        isInt8Enabled ? 'translate-x-4.5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  For mobile and edge environments, deep networks must run locally with extremely light resources. Quantizing weights to 8-bit integers (INT8) slashes model sizes by 73% while securing sub-200ms authentication checks.
                </p>

                {/* Compression Table */}
                <div className="bg-black/40 rounded-2xl border border-white/10 overflow-hidden mb-4">
                  <div className="grid grid-cols-12 bg-white/5 border-b border-white/10 px-3 py-2 text-[9px] font-mono text-gray-400 uppercase tracking-widest font-bold">
                    <span className="col-span-5">Local Biometric Model Cascade</span>
                    <span className="col-span-3 text-center">FP32 Uncompressed</span>
                    <span className="col-span-4 text-center">Quantized INT8 Core</span>
                  </div>
                  
                  <div className="divide-y divide-white/5">
                    {MODEL_BENCHMARKS.map((model) => (
                      <div 
                        key={model.name}
                        className="grid grid-cols-12 px-3 py-2.5 text-xs font-mono items-center hover:bg-white/5 transition-colors"
                      >
                        <div className="col-span-5 flex flex-col">
                          <span className="text-white font-bold">{model.name}</span>
                          <span className="text-[10px] text-gray-500 leading-tight">{model.description}</span>
                        </div>
                        <div className="col-span-3 text-center text-slate-400">
                          {model.modelSize.toFixed(1)} MB
                          <div className="text-[10px] text-gray-500">({model.latMs * 4}ms loop)</div>
                        </div>
                        <div className="col-span-4 text-center">
                          <span className={`font-bold ${isInt8Enabled ? 'text-indigo-400 text-xs' : 'text-slate-400'}`}>
                            {model.modelSize.toFixed(1)} MB
                          </span>
                          <div className="text-[10px] text-fuchsia-400">({model.latMs}ms loop)</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Grid Readouts */}
              <div className="bg-black/55 border border-white/10 p-4 rounded-2xl">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 select-none">
                  <div className="text-center md:border-r border-white/10">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-semibold">Total Flash Size</span>
                    <span className="text-sm font-extrabold block text-white mt-0.5">
                      {isInt8Enabled ? '3.3 MB ✓' : '15.2 MB'}
                    </span>
                    <span className="text-[9px] text-indigo-400">Ideal limit &lt;5MB</span>
                  </div>

                  <div className="text-center md:border-r border-white/10">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-semibold">Verify Latency</span>
                    <span className="text-sm font-extrabold block text-fuchsia-400 mt-0.5">
                      {isInt8Enabled ? '178 ms' : '820 ms'}
                    </span>
                    <span className="text-[9px] text-fuchsia-400">Sync limit &lt;500ms</span>
                  </div>

                  <div className="text-center md:border-r border-white/10">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-semibold">Unlock Precision</span>
                    <span className="text-sm font-extrabold block text-emerald-400 mt-0.5">
                      {isInt8Enabled ? '99.1%' : '99.6%'}
                    </span>
                    <span className="text-[9px] text-emerald-400">FP32 Baseline: 99.6%</span>
                  </div>

                  <div className="text-center">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-semibold">Thermal Integrity</span>
                    <span className={`text-2xs font-extrabold block mt-1 py-0.5 px-2 bg-white/10 rounded border inline-block ${
                      isInt8Enabled ? 'text-emerald-450 border-emerald-500/30' : 'text-amber-400 border-amber-500/30'
                    }`}>
                      {isInt8Enabled ? '🟢 Cool (Zero Jitter)' : '⚠️ Warm (Throttling)'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeSegment === 'CODE_GUIDE' && (
            <motion.div 
              key="code-panel"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="flex-1 flex flex-col"
            >
              <div className="flex border-b border-white/10 mb-4" id="code-snippet-subtabs">
                <button 
                  onClick={() => setActiveCodeTab('RN_BRIDGE')}
                  className={`pb-2 text-2xs font-mono font-extrabold tracking-wider uppercase transition-all mr-4 cursor-pointer ${
                    activeCodeTab === 'RN_BRIDGE' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-500 hover:text-slate-350'
                  }`}
                  id="subtab-btn-rnbridge"
                >
                  Native Biometric Bridge
                </button>

                <button 
                  onClick={() => setActiveCodeTab('SYNC_LOGIC')}
                  className={`pb-2 text-2xs font-mono font-extrabold tracking-wider uppercase transition-all mr-4 cursor-pointer ${
                    activeCodeTab === 'SYNC_LOGIC' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-500 hover:text-slate-350'
                  }`}
                  id="subtab-btn-synclogic"
                >
                  Tamper-proof Ledger
                </button>

                <button 
                  onClick={() => setActiveCodeTab('BENCHMARK_REPORT')}
                  className={`pb-2 text-2xs font-mono font-extrabold tracking-wider uppercase transition-all cursor-pointer ${
                    activeCodeTab === 'BENCHMARK_REPORT' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-500 hover:text-slate-350'
                  }`}
                  id="subtab-btn-benchreport"
                >
                  Verification Metrics
                </button>
              </div>

              {/* Code display frame */}
              <div className="bg-black/60 rounded-2xl border border-white/10 overflow-hidden flex-1 relative flex flex-col">
                <div className="absolute top-2.5 right-2.5 flex items-center justify-center gap-1.5 bg-white/5 border border-white/10 px-2 py-1 rounded text-[8px] text-gray-500 select-none">
                  <Terminal className="w-2.5 h-2.5 text-indigo-400 animate-pulse" />
                  READ-ONLY SECURITY SYSTEM FILE
                </div>
                
                <pre className="flex-1 p-4 overflow-x-auto text-[10px] font-mono text-gray-300 leading-relaxed max-h-[350px]">
                  <code>{codeSnippets[activeCodeTab]}</code>
                </pre>
              </div>

              {/* Sub descriptor guide */}
              <div className="mt-3 text-2xs text-slate-500 bg-white/5 p-3 border border-white/10 rounded-xl flex items-center gap-2 leading-tight">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span>
                  The FaceGuard Edge biometric preprocessor compiles directly over platform-optimized enclave registers, enabling sub-millisecond computations so local operations maintain strict framing consistency.
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
