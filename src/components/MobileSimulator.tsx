/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wifi, 
  WifiOff, 
  Database, 
  ShieldCheck, 
  RefreshCw, 
  UserCheck, 
  CheckCircle2, 
  XCircle, 
  Activity,
  UserPlus,
  FileSpreadsheet,
  Scan,
  Sparkles,
  Info,
  Trash2,
  Lock,
  Smartphone,
  Volume2,
  VolumeX,
  Target,
  Filter,
  Cpu,
  UserX
} from 'lucide-react';
import { BiometricSubject, BiometricRecord, LightingCondition, BiometricStage } from '../types';
import { calculateSimulatedHash, INITIAL_SUBJECTS, generateRandomEmbeddingVector, calculateCosineSimilarity } from '../utils/faceSimulator';

interface MobileSimulatorProps {
  onAddLog: (message: string, level: 'info' | 'warn' | 'success' | 'error') => void;
  selectedLighting: LightingCondition; // Illumination modes
  isInt8Enabled: boolean; // Neural net quantization flag
  selectedMockSubject: 'ajitha' | 'spoof_photo' | 'spoof_video'; // Swaps scanning behaviors
  setSelectedMockSubject: (subject: 'ajitha' | 'spoof_photo' | 'spoof_video') => void;
  onRecordSynced: () => void;
}

// Global browser Audio Context wrapper for high-fidelity scanning synthesis
let customAudioCtx: AudioContext | null = null;
let currentOscNode: OscillatorNode | null = null;
let currentGainNode: GainNode | null = null;
let pulseTimer: NodeJS.Timeout | null = null;

export default function MobileSimulator({
  onAddLog,
  selectedLighting,
  isInt8Enabled,
  selectedMockSubject,
  setSelectedMockSubject,
  onRecordSynced
}: MobileSimulatorProps) {
  // Biometric states representing offline DB values
  const [subjectList, setSubjectList] = useState<BiometricSubject[]>(INITIAL_SUBJECTS);
  const [localRecords, setLocalRecords] = useState<BiometricRecord[]>([]);
  const [currentScreen, setCurrentScreen] = useState<'HOME' | 'ENROLL' | 'AUTHENTICATE' | 'LEDGER'>('HOME');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(true);

  // New Subject Registration state
  const [enrollName, setEnrollName] = useState('');
  const [enrollDept, setEnrollDept] = useState('Deep Learning Security Group');
  const [enrollEmpId, setEnrollEmpId] = useState('');
  const [enrollStatus, setEnrollStatus] = useState<'IDLE' | 'CAPTURE' | 'SUCCESS'>('IDLE');

  // Liveness Check Sequencer states
  const [verifyStatus, setVerifyStatus] = useState<'IDLE' | 'PASSIVE_CHECK' | 'CHALLENGE_SEQUENCE' | 'COMPARING' | 'SUCCESS' | 'FAILED'>('IDLE');
  const [activeChallengeIdx, setActiveChallengeIdx] = useState<number>(0);
  const [challengeSequence, setChallengeSequence] = useState<BiometricStage[]>(['ALIGN_FACE', 'BLINK_CHALLENGE', 'TEXTURE_ANALYSIS']);
  const [challengeProgress, setChallengeProgress] = useState<number>(0); // 0 to 100 per stage
  
  // Real-time calculated computer vision parameters
  const [faceMetrics, setFaceMetrics] = useState({
    faceContourError: 0.04, // Offset distance from target oval, lower is better
    livenessScore: 0.98, // Confidence of real human skin tissue vs digital grid
    matchingSimilarity: 0.99, // Landmark match rate
    processingTimeMs: '---',
    framerate: 60
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Generate label details for dropdowns
  const getSubjectSourceLabel = (src: 'ajitha' | 'spoof_photo' | 'spoof_video') => {
    if (src === 'ajitha') return 'Authorized Staff: Ajitha (Genuine Face)';
    if (src === 'spoof_photo') return 'Printed Color Photo attack (Failed Blink)';
    return 'Tablet Video Replay attack (Failed Texture)';
  };

  // Safe sound synthesizer
  const playProceduralBiometricSound = (frequency: number, isBeepOnly: boolean = false) => {
    if (isAudioMuted) return;
    try {
      if (!customAudioCtx) {
        customAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      // Clear old nodes
      stopSoundNodes();

      if (customAudioCtx.state === 'suspended') {
        customAudioCtx.resume();
      }

      currentOscNode = customAudioCtx.createOscillator();
      currentGainNode = customAudioCtx.createGain();

      currentOscNode.connect(currentGainNode);
      currentGainNode.connect(customAudioCtx.destination);

      currentOscNode.frequency.setValueAtTime(frequency, customAudioCtx.currentTime);

      if (isBeepOnly) {
        currentOscNode.type = 'sine';
        currentGainNode.gain.setValueAtTime(0.045, customAudioCtx.currentTime);
        currentGainNode.gain.exponentialRampToValueAtTime(0.001, customAudioCtx.currentTime + 0.15);
        currentOscNode.start();
        currentOscNode.stop(customAudioCtx.currentTime + 0.18);
      } else {
        // Continuous scan signal hum
        currentOscNode.type = 'sine';
        currentGainNode.gain.setValueAtTime(0.015, customAudioCtx.currentTime);
        currentOscNode.start();
      }
    } catch (e) {
      console.warn("Web Audio API blocked by browser container", e);
    }
  };

  const stopSoundNodes = () => {
    try {
      if (currentOscNode) {
        currentOscNode.stop();
        currentOscNode.disconnect();
        currentOscNode = null;
      }
      if (currentGainNode) {
        currentGainNode.disconnect();
        currentGainNode = null;
      }
    } catch (e) {}
  };

  // Ticks scan sonar rates matching the selected mockup inputs
  useEffect(() => {
    if (pulseTimer) clearInterval(pulseTimer);
    
    if (!isAudioMuted) {
      const timerRate = selectedMockSubject === 'ajitha' 
        ? 350  // Consistent biological pulse rate
        : selectedMockSubject === 'spoof_video'
          ? 1000 // Sluggish pixel scan
          : 600;  // Static noise burst

      pulseTimer = setInterval(() => {
        const toneFreq = selectedMockSubject === 'ajitha' 
          ? 750 
          : selectedMockSubject === 'spoof_video' 
            ? 320 
            : 480 + Math.random() * 150;
        playProceduralBiometricSound(toneFreq, true);
      }, timerRate);
    }

    return () => {
      if (pulseTimer) clearInterval(pulseTimer);
    };
  }, [isAudioMuted, selectedMockSubject]);

  // Handle ambient hum while actively analyzing face embeddings
  useEffect(() => {
    if (!isAudioMuted && currentScreen === 'AUTHENTICATE') {
      playProceduralBiometricSound(280, false); // Warm high-tech radar hum
    } else {
      stopSoundNodes();
    }
    return () => stopSoundNodes();
  }, [currentScreen, isAudioMuted]);

  // Sequentially steps through liveness challenges
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (verifyStatus === 'CHALLENGE_SEQUENCE') {
      const activeStage = challengeSequence[activeChallengeIdx];
      
      timer = setInterval(() => {
        setChallengeProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            onAddLog(`FaceGuard Edge JSI locked active checkpoint [${activeStage}]`, 'success');
            
            if (activeChallengeIdx < challengeSequence.length - 1) {
              setActiveChallengeIdx((prevIdx) => prevIdx + 1);
              return 0;
            } else {
              setVerifyStatus('COMPARING');
              return 100;
            }
          }

          // Adjust metrics matching biological states
          if (selectedMockSubject === 'ajitha') {
            setFaceMetrics((curr) => {
              const fraction = prev / 100;
              if (activeStage === 'ALIGN_FACE') {
                return { 
                  ...curr, 
                  faceContourError: Math.max(0.005, 0.12 - (fraction * 0.11)), 
                  livenessScore: 0.96 + Math.random() * 0.03 
                };
              } else if (activeStage === 'BLINK_CHALLENGE') {
                return { 
                  ...curr, 
                  faceContourError: 0.01, 
                  livenessScore: Math.min(0.99, 0.94 + (fraction * 0.05)) 
                };
              } else {
                return { 
                  ...curr, 
                  matchingSimilarity: 0.50 + (fraction * 0.491) 
                };
              }
            });
            return prev + (isInt8Enabled ? 8 : 4.5); // Accelerated processing using quantized TFLite nets
          } else if (selectedMockSubject === 'spoof_video') {
            // Fails edge reflect detection test
            setFaceMetrics(curr => ({
              ...curr,
              faceContourError: 0.12 + Math.sin(prev * 0.15) * 0.03,
              livenessScore: Math.max(0.08, 0.45 - (prev / 100 * 0.40)) // Sinks
            }));
            return prev + 2.5; 
          } else {
            // Fails eye blink detector test (completely static)
            setFaceMetrics(curr => ({
              ...curr,
              faceContourError: 0.35,
              livenessScore: Math.max(0.01, 0.14 - (prev / 100 * 0.12)),
              matchingSimilarity: 0.32
            }));
            return prev + 1.5;
          }
        });
      }, 50);
    }
    return () => clearInterval(timer);
  }, [verifyStatus, activeChallengeIdx, challengeSequence, selectedMockSubject, isInt8Enabled]);

  // Stops verification if mock spoof elements break liveness ranges
  useEffect(() => {
    if (verifyStatus === 'CHALLENGE_SEQUENCE' && challengeProgress < 100) {
      if (selectedMockSubject !== 'ajitha' && challengeProgress > 70) {
        const activeStage = challengeSequence[activeChallengeIdx];
        onAddLog(`Liveness verification ALERT: Anti-spoofing breach [${activeStage}]`, 'warn');
        setVerifyStatus('FAILED');
        
        if (selectedMockSubject === 'spoof_photo') {
          onAddLog(`REJECTED: Static printed photo attack detected (Zero blink-frequency).`, 'error');
        } else {
          onAddLog(`REJECTED: Screen reflection / video replay attack detected (Texture spectral anomaly).`, 'error');
        }
      }
    }
  }, [challengeProgress, verifyStatus]);

  // Evaluate embeddings similarity once liveness challenges succeed
  useEffect(() => {
    if (verifyStatus === 'COMPARING') {
      const matchingLatency = isInt8Enabled ? 178 + Math.floor(Math.random() * 20) : 820 + Math.floor(Math.random() * 100);
      onAddLog(`Extracting 128D facial embedding vectors... CPU Latency: ${matchingLatency}ms`, 'info');
      
      const comparisonTimer = setTimeout(() => {
        if (selectedMockSubject === 'ajitha') {
          setVerifyStatus('SUCCESS');
          onAddLog(`FaceGuard Edge Core matched: Ajitha Sabural (Match Rate: 99.1%, Status: Administrator)`, 'success');
          
          // Secure sqlite transaction log entry with cryptographic hashes
          const rId = 'AUTH-' + Math.floor(Math.random() * 90000 + 10000);
          const lastEntry = localRecords[localRecords.length - 1];
          const previousHash = lastEntry ? lastEntry.hash : 'ae_enclave_genesis_000000';
          
          const logPayload = `${rId}-ajitha-99.1-98.8-${new Date().toISOString()}`;
          const currentHash = calculateSimulatedHash(previousHash, logPayload);

          const newLog: BiometricRecord = {
            id: rId,
            subjectId: "EMP-49201",
            subjectName: "Ajitha Sabural",
            timestamp: new Date().toLocaleTimeString(),
            matchScore: 99.1,
            livenessScore: 98.8,
            latencyMs: matchingLatency,
            isSynced: false,
            hash: currentHash
          };
          
          setLocalRecords(prev => [...prev, newLog]);
          onAddLog(`Secure SQLite transaction logged! Crypto tag: ${currentHash.substring(0, 15)}...`, 'success');
        } else {
          setVerifyStatus('FAILED');
          onAddLog(`Authentication rejected. Extracted landmarks do not match security indexes.`, 'error');
        }
      }, isInt8Enabled ? 350 : 900);
      
      return () => clearTimeout(comparisonTimer);
    }
  }, [verifyStatus]);

  // Drawing the live scanning HUD scope overlay on canvas
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawScopeHUD = () => {
      ctx.clearRect(0, 0, 300, 300);
      const time = Date.now() * 0.0035;

      // 1. Draw glowing HUD circular scanners
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(150, 150, 48, 0, Math.PI * 2);
      ctx.arc(150, 150, 85, 0, Math.PI * 2);
      ctx.arc(150, 150, 115, 0, Math.PI * 2);
      ctx.stroke();

      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(150, 20); ctx.lineTo(150, 280);
      ctx.moveTo(20, 150); ctx.lineTo(280, 150);
      ctx.stroke();

      // Sweeping scope radial lasers
      const angleSweep = time % (Math.PI * 2);
      const targetSweepX = 150 + Math.cos(angleSweep) * 115;
      const targetSweepY = 150 + Math.sin(angleSweep) * 115;
      
      ctx.strokeStyle = selectedMockSubject === 'ajitha' 
        ? 'rgba(16, 185, 129, 0.12)' 
        : 'rgba(244, 63, 94, 0.12)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(150, 150);
      ctx.lineTo(targetSweepX, targetSweepY);
      ctx.stroke();

      // 2. Draw live vector biometric mesh face structure inside mobile camera outline
      if (selectedMockSubject === 'ajitha') {
        // Render stylized genuine organic pulse waves represent perfect liveness match
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        for (let x = 40; x < 260; x++) {
          const dy = 150 + Math.sin(x * 0.07 + time * 3.5) * 15 * Math.sin((x - 40) / 220 * Math.PI);
          if (x === 40) ctx.moveTo(x, dy);
          else ctx.lineTo(x, dy);
        }
        ctx.stroke();

        // Pulsating face lock box
        ctx.fillStyle = 'rgba(16, 185, 129, 0.1)';
        ctx.beginPath();
        ctx.arc(150, 150, 30 + Math.sin(time * 6) * 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(150, 150, 5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(150, 150, 18, 0, Math.PI * 2);
        ctx.stroke();
      } else if (selectedMockSubject === 'spoof_photo') {
        // Static photo: Draw boring solid horizontal flats - zero biological harmonics!
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = 45; x < 255; x += 3) {
          const flatY = 150 + Math.sin(x * 0.01) * 2; // Flat with no dynamics
          if (x === 45) ctx.moveTo(x, flatY);
          else ctx.lineTo(x, flatY);
        }
        ctx.stroke();

        // Printed photo scan box indication
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.4)';
        ctx.strokeRect(90, 95, 120, 110);
      } else {
        // Video Replay: Ripple artifacts, digital grid reflections
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.2;
        
        const rippleCount = 3;
        for (let r = 0; r < rippleCount; r++) {
          const radius = ((time * 28 + r * 30) % 115);
          const opacityVal = 1.0 - (radius / 115);
          ctx.strokeStyle = `rgba(239, 68, 68, ${opacityVal})`;
          ctx.beginPath();
          ctx.arc(150, 150, radius, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // HUD parameters text readouts
      ctx.font = 'bold 8px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fillText(`CONTOUR_ERR: ${faceMetrics.faceContourError.toFixed(4)}`, 15, 275);
      ctx.fillText(`LIVENESS: ${(faceMetrics.livenessScore * 100).toFixed(1)}%`, 115, 275);
      ctx.fillText(`SIMIL_RATE: ${(faceMetrics.matchingSimilarity * 100).toFixed(1)}%`, 210, 275);

      animId = requestAnimationFrame(drawScopeHUD);
    };

    drawScopeHUD();
    return () => {
      cancelAnimationFrame(animId);
    };
  }, [selectedMockSubject, faceMetrics]);

  // Transmit transaction logs back to corporate security logs
  const handleServerSync = async () => {
    if (localRecords.length === 0) {
      onAddLog("No unsynced logs cached inside SQLCipher storage.", "warn");
      return;
    }
    setIsSyncing(true);
    onAddLog("Connecting secure VPN channel to Mainframe Enclave...", "info");
    onAddLog(`Verifying chronologic security hashes for ${localRecords.length} logs.`, "info");
    
    setTimeout(() => {
      onAddLog("Handshake successful! Log payload accepted by Security Enclave.", "success");
      onAddLog("Response status: 200 OK AUDIT SYNCHRONIZED.", "success");
      onAddLog(`FaceGuard Edge Safety Standard: Flushing regional local databases on verified sync!`, "warn");
      
      setLocalRecords([]);
      setIsSyncing(false);
      onRecordSynced();
      onAddLog("Local security storage cleared. Returning to standby status.", "success");
    }, 1800);
  };

  // Enrolling a new authorized employee subject
  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollName.trim() || !enrollEmpId.trim()) {
      onAddLog("Registration error: Subject name and ID parameters cannot be blank.", "warn");
      return;
    }

    setEnrollStatus('CAPTURE');
    onAddLog(`Starting 128D facial landmark mesh registration for employee: ${enrollName}`, 'info');

    setTimeout(() => {
      const newSubject: BiometricSubject = {
        id: enrollEmpId,
        name: enrollName,
        department: enrollDept,
        enrolledAt: new Date().toISOString(),
        signature: generateRandomEmbeddingVector(),
        role: "Registered Security User",
        avatarIcon: Math.random() > 0.5 ? "👨‍💻" : "👩‍💻"
      };

      setSubjectList(prev => [...prev, newSubject]);
      setEnrollStatus('SUCCESS');
      onAddLog(`Biometric signature written successfully for ${enrollName} [${enrollEmpId}]`, 'success');
      
      setTimeout(() => {
        setEnrollName('');
        setEnrollEmpId('');
        setEnrollStatus('IDLE');
        setCurrentScreen('HOME');
      }, 1200);
    }, 1700);
  };

  // Launches on-device liveness loops
  const triggerAuthenticationScan = () => {
    setActiveChallengeIdx(0);
    setChallengeProgress(0);
    setVerifyStatus('PASSIVE_CHECK');
    setCurrentScreen('AUTHENTICATE');
    onAddLog(`Camera active. Starting passive contrast and focus validation...`, 'info');

    setTimeout(() => {
      if (selectedMockSubject === 'spoof_photo') {
        // Printed photo blocks immediately
        onAddLog(`Anti-spoof check failed: Static spatial signature detected. Aborting check.`, 'error');
        setVerifyStatus('FAILED');
      } else {
        onAddLog(`Contrast stable. Liveness check sequence active. Await user coordinates.`, 'success');
        setVerifyStatus('CHALLENGE_SEQUENCE');
        onAddLog(`Challenge pipeline initialized: [Face Alignment -> Eyes Blink Check -> Skin Texture Scan]`, 'info');
      }
    }, 1100);
  };

  return (
    <div className="flex flex-col items-center" id="simulator-container">
      {/* Biometric Controller HUD Panel */}
      <div className="w-full bg-white/5 border border-white/10 backdrop-blur-xl rounded-[32px] p-6 mb-6 shadow-2xl relative overflow-hidden" id="simulation-panel">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl pointer-events-none rounded-full" />
        <h3 className="text-xs font-display font-bold tracking-widest text-indigo-400 uppercase mb-4 flex items-center gap-2">
          <Scan className="w-4 h-4 text-fuchsia-400 animate-pulse" /> BIOMETRIC SYSTEM CONTROLLER
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-2xs text-gray-400 font-bold uppercase tracking-wider block mb-1.5">FaceGuard Edge Camera Source Input:</label>
            <select 
              className="w-full text-xs bg-black/40 border border-white/10 rounded-2xl p-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all cursor-pointer hover:bg-black/60"
              value={selectedMockSubject}
              onChange={(e) => {
                const valueSelected = e.target.value as any;
                setSelectedMockSubject(valueSelected);
                onAddLog(`FaceGuard Edge feed updated to: [${getSubjectSourceLabel(valueSelected).toUpperCase()}]`, 'info');
              }}
              id="select-mock-subject"
            >
              <option value="ajitha">Genuine Subject: Ajitha Sabural (Passes Liveness)</option>
              <option value="spoof_photo">Printed Photo Spoof Check (Fails Blink Test)</option>
              <option value="spoof_video">Tablet Replay Spoof Check (Fails Texture Verification)</option>
            </select>
          </div>

          <div>
            <label className="text-2xs text-gray-400 font-bold uppercase tracking-wider block mb-1.5">Tactile Scanning Signal Tone:</label>
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setIsAudioMuted(!isAudioMuted);
                onAddLog(`System audio logs set to ${!isAudioMuted ? 'MUTED' : 'ACTIVE'}`, 'warn');
              }}
              className={`w-full py-3 px-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all border cursor-pointer ${
                !isAudioMuted 
                  ? 'bg-gradient-to-tr from-indigo-500/25 to-fuchsia-500/15 border-indigo-400 text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.2)]' 
                  : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/15'
              }`}
              id="audio-toggle-btn"
            >
              {isAudioMuted ? (
                <>
                  <VolumeX className="w-4 h-4 text-gray-500" />
                  Muted Sound Signals
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-indigo-400 animate-bounce" />
                  Live Sonar Sweep active
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Local system status */}
        <div className="mt-4 bg-black/45 p-3 rounded-2xl border border-white/5 flex items-center justify-between text-[11px] text-gray-400 select-none leading-none">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>Bridge Link: <strong className="text-emerald-400 font-bold">Fast JSI Socket</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-fuchsia-400 animate-pulse" />
            <span>TFLite Eng: <strong className="text-emerald-405 font-bold">100% On-Device</strong></span>
          </div>
        </div>
      </div>

      {/* Handheld Device Frame */}
      <div 
        className="w-[330px] h-[670px] bg-[#0d0e12] rounded-[48px] p-3.5 border-4 border-white/15 shadow-[0_0_80px_rgba(99,102,241,0.15)] flex flex-col relative"
        id="phone-device-mockup"
        style={{
          boxShadow: verifyStatus === 'SUCCESS' 
            ? '0 0 60px rgba(16,185,129,0.35)' 
            : verifyStatus === 'FAILED' 
              ? '0 0 60px rgba(244,63,94,0.35)' 
              : '0 0 50px rgba(99,102,241,0.15)'
        }}
      >
        <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-b from-white/10 to-transparent rounded-t-[44px] pointer-events-none" />
        
        {/* Dynamic Notch */}
        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#05070a] rounded-b-2xl z-40 flex items-center justify-between px-3 border-x border-b border-white/5">
          <div className="w-2.5 h-2.5 bg-black rounded-full border border-white/10 relative">
            <div className={`absolute inset-0.5 rounded-full ${(currentScreen === 'AUTHENTICATE' || currentScreen === 'ENROLL') ? 'bg-fuchsia-500 animate-pulse' : 'bg-transparent'}`} />
          </div>
          <div className="w-12 h-1 bg-white/10 rounded-full" />
          <div className="w-3 h-1.5 bg-white/5 rounded-full flex gap-0.5 items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
        </div>

        {/* Screen */}
        <div className="w-full h-full bg-[#05070a] rounded-[38px] overflow-hidden flex flex-col relative border border-white/5">
          <div className="absolute top-8 inset-x-0 h-4 bg-gradient-to-b from-[#05070a] to-transparent pointer-events-none z-30" />
          
          {/* Internal OS Status Bar */}
          <div className="pt-7 px-6 pb-2.5 flex justify-between items-center text-[10px] font-mono text-slate-400 select-none z-30 bg-[#05070a]/90 backdrop-blur-sm relative border-b border-white/5">
            <span className="font-bold text-gray-300">FaceGuard Edge v1.0</span>
            <div className="flex items-center gap-1.5 font-bold text-gray-300">
              <span>98% SEC</span>
              <div className="w-4 h-2.5 border border-white/20 rounded-sm p-0.5 flex">
                <div className="h-full w-full bg-emerald-500 rounded-2xs" />
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-y-auto px-4 py-3 relative bg-[#05070a]/95" id="phone-screen-body">
            <AnimatePresence mode="wait">
              {currentScreen === 'HOME' && (
                <motion.div 
                  key="home-screen"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex-1 flex flex-col justify-between py-4"
                >
                  <div className="text-center pt-2">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-fuchsia-500 flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                      <Lock className="w-5.5 h-5.5 text-white animate-pulse" />
                    </div>
                    <h2 className="text-base font-bold text-white tracking-wide">FaceGuard Edge</h2>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">Dual-Spectral Liveness Protection</p>
                    
                    {/* Database ledger metrics */}
                    <div className="mt-8 bg-white/5 rounded-2xl p-4 border border-white/10 text-left">
                      <span className="text-[9px] text-indigo-400 uppercase tracking-wider font-bold block mb-1.5">SECURE ENCLAVE STORAGE</span>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-300">Security Registrations:</span>
                        <span className="text-xs font-mono font-bold text-white">{subjectList.length} Personnel</span>
                      </div>
                      <div className="flex items-center justify-between mt-1.5 pb-2.5 border-b border-white/5">
                        <span className="text-xs text-gray-300">Unsynced Audit Logs:</span>
                        <span className={`text-xs font-mono font-bold ${localRecords.length > 0 ? 'text-fuchsia-400 animate-pulse' : 'text-slate-400'}`}>
                          {localRecords.length} offline scans
                        </span>
                      </div>
                      <button 
                        onClick={() => setCurrentScreen('LEDGER')}
                        className="w-full mt-3.5 justify-center py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] text-slate-300 transition-all font-semibold flex items-center gap-1.5 cursor-pointer"
                        id="view-local-db-btn"
                      >
                        <Database className="w-3.5 h-3.5 text-indigo-400" />
                        Verify SQLCipher Cache
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pb-2">
                    <button 
                      onClick={triggerAuthenticationScan}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 shadow-[0_8px_25px_rgba(99,102,241,0.35)] hover:scale-[1.01] text-white font-bold text-sm tracking-wide active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      id="launch-verification-btn"
                    >
                      <Scan className="w-4 h-4 text-white" />
                      Verify Biometrics / Face
                    </button>

                    <button 
                      onClick={() => {
                        setCurrentScreen('ENROLL');
                        onAddLog("Initiating high-security facial registration wizard.", "info");
                      }}
                      className="w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold text-xs active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      id="launch-enrollment-btn"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-fuchsia-405" />
                      Register New Employee Face
                    </button>

                    <div className="mt-2 text-center text-[9px] text-gray-500 font-semibold tracking-wider uppercase">
                      Crypto HSM Enclave Locked
                    </div>
                  </div>
                </motion.div>
              )}

              {currentScreen === 'ENROLL' && (
                <motion.div 
                  key="enroll-screen"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-1 flex flex-col justify-between py-2"
                >
                  <form onSubmit={handleEnrollSubmit} className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-white uppercase tracking-wide">Secure Biometric Registry</span>
                        <button 
                          type="button" 
                          onClick={() => {
                            setCurrentScreen('HOME');
                            onAddLog("Registration stopped by terminal supervisor.", "warn");
                          }}
                          className="text-[10px] text-slate-400 hover:text-white"
                          id="cancel-enroll-btn"
                        >
                          Cancel
                        </button>
                      </div>

                      {/* Camera viewfinder mockup */}
                      <div className="relative w-full aspect-square max-w-[210px] mx-auto rounded-3xl overflow-hidden border border-white/10 bg-black/40 mb-4 shadow-inner flex items-center justify-center">
                        <canvas ref={canvasRef} width="300" height="300" className="absolute inset-0 w-full h-full z-10 pointer-events-none opacity-40" />
                        <div className="text-center z-20 p-2 select-none">
                          <Target className="w-10 h-10 text-indigo-400 animate-pulse mx-auto mb-2" />
                          <span className="text-[10px] font-mono font-bold text-indigo-350">AWAITING STABLE FACE SIGNAL</span>
                        </div>
                        
                        {enrollStatus === 'CAPTURE' && (
                          <div className="absolute inset-x-0 bottom-0 bg-indigo-600/95 text-white font-bold text-[10px] py-1.5 text-center animate-pulse z-30">
                            Extracting 128D Landmarks...
                          </div>
                        )}
                        
                        {enrollStatus === 'SUCCESS' && (
                          <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center z-30">
                            <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-bounce" />
                            <span className="text-[11px] font-bold text-emerald-450 mt-2">Landmarks Written securely!</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2.5 text-left">
                        <div>
                          <label className="text-[10px] text-gray-400 block mb-0.5">Subject Name</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. Ajitha Sabural" 
                            className="w-full text-xs font-medium bg-black/40 border border-white/10 rounded-xl p-2.5 text-white focus:border-indigo-500 outline-none"
                            value={enrollName}
                            onChange={(e) => setEnrollName(e.target.value)}
                            id="enroll-name-input"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-gray-400 block mb-0.5">Employee ID Coordinates</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. EMP-49201" 
                            className="w-full text-xs font-mono bg-black/40 border border-white/10 rounded-xl p-2.5 text-white focus:border-indigo-500 outline-none"
                            value={enrollEmpId}
                            onChange={(e) => setEnrollEmpId(e.target.value)}
                            id="enroll-emp-id-input"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-gray-400 block mb-0.5">Security Department</label>
                          <select 
                            className="w-full text-xs bg-black/40 border border-white/10 rounded-xl p-2.5 text-white outline-none cursor-pointer"
                            value={enrollDept}
                            onChange={(e) => setEnrollDept(e.target.value)}
                            id="enroll-dept-select"
                          >
                            <option value="Deep Learning Security Group">Deep Learning Security Group</option>
                            <option value="Biometric AI Research Division">Biometric AI Research Division</option>
                            <option value="Hardware Enclave Infrastructure">Hardware Enclave Infrastructure</option>
                            <option value="Executive Administration Core">Executive Administration Core</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={enrollStatus === 'CAPTURE'}
                      className="w-full mt-4 py-3 bg-gradient-to-r from-indigo-600 to-fuchsia-600 rounded-xl text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/10 cursor-pointer"
                      id="enroll-confirm-btn"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Commit Face landmark Signature
                    </button>
                  </form>
                </motion.div>
              )}

              {currentScreen === 'AUTHENTICATE' && (
                <motion.div 
                  key="auth-screen"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-1 flex flex-col justify-between py-2 relative"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                        Dynamic Landmarker Active
                      </span>
                      <button 
                        onClick={() => {
                          setCurrentScreen('HOME');
                          setVerifyStatus('IDLE');
                          onAddLog("Verification session stopped by supervisor.", "warn");
                        }}
                        className="text-[10px] text-slate-400 hover:text-white"
                        id="suspend-auth-btn"
                      >
                        Close
                      </button>
                    </div>

                    {/* Camera view simulation overlay */}
                    <div className="relative w-full aspect-square max-w-[240px] mx-auto rounded-3xl overflow-hidden border-2 border-dashed border-indigo-500/30 bg-black/40 shadow-2xl mb-3">
                      <canvas ref={canvasRef} width="300" height="300" className="absolute inset-0 w-full h-full z-20 pointer-events-none" />
                      
                      {/* Interactive Challenger banner */}
                      {verifyStatus === 'CHALLENGE_SEQUENCE' && (
                        <div className="absolute inset-x-0 top-0 bg-[#05070a]/90 backdrop-blur-md text-white font-medium py-2 px-3 flex flex-col items-center justify-center border-b border-white/5 z-30 select-none">
                          <span className="text-[8px] text-indigo-400 uppercase tracking-widest font-bold">LIVENESS CHALLENGE ACTIVE</span>
                          <span className="text-[11px] font-bold tracking-wide flex items-center gap-1 mt-0.5 text-amber-350">
                            {challengeSequence[activeChallengeIdx] === 'ALIGN_FACE' && "Align face inside contour... 👦"}
                            {challengeSequence[activeChallengeIdx] === 'BLINK_CHALLENGE' && "BLINK YOUR EYES NOW... 👁️"}
                            {challengeSequence[activeChallengeIdx] === 'TEXTURE_ANALYSIS' && "Analyzing depth micro-textures... 📐"}
                          </span>
                        </div>
                      )}

                      {/* Passive Check */}
                      {verifyStatus === 'PASSIVE_CHECK' && (
                        <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center z-30 px-4">
                          <div className="w-8 h-8 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin mb-2" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Layer 1: Contrast Check</span>
                          <span className="text-[8px] text-slate-400 text-center mt-1">Measuring ambient shadows and optimizing local highlights...</span>
                        </div>
                      )}

                      {/* Embed calculation */}
                      {verifyStatus === 'COMPARING' && (
                        <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center z-30">
                          <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin" />
                          <span className="text-xs font-bold text-white mt-2">Matching Facenet Signatures</span>
                          <span className="text-[9px] text-indigo-400 font-semibold tracking-wider">FaceGuard Edge C++ JSI Core</span>
                        </div>
                      )}

                      {/* Success block */}
                      {verifyStatus === 'SUCCESS' && (
                        <div className="absolute inset-0 bg-emerald-950/95 flex flex-col items-center justify-center z-30 p-4 animate-fade-in">
                          <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-2 animate-bounce">
                            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                          </div>
                          <span className="text-xs font-bold text-emerald-400">ACCESS GRANTED</span>
                          <span className="text-[9px] text-emerald-200 mt-1 text-center font-mono">Verified Admin: Ajitha Sabural. Security hash audit written offline.</span>
                        </div>
                      )}

                      {/* Failed block */}
                      {verifyStatus === 'FAILED' && (
                        <div className="absolute inset-0 bg-rose-950/95 flex flex-col items-center justify-center z-30 p-4 animate-fade-in">
                          <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center mb-2">
                            <XCircle className="w-8 h-8 text-rose-450" />
                          </div>
                          <span className="text-xs font-bold text-rose-405">VALIDATION REJECTED</span>
                          <span className="text-[9px] text-rose-200 mt-1 text-center font-mono font-bold leading-relaxed">
                            {selectedMockSubject === 'spoof_photo' 
                              ? 'Printed photo detected. Blink check failed.' 
                              : selectedMockSubject === 'spoof_video'
                                ? 'Reflective screen replay attack detected.'
                                : 'Face embedding mismatch.'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Challenges Progress */}
                    {verifyStatus === 'CHALLENGE_SEQUENCE' && (
                      <div className="mb-2.5 animate-fade-in">
                        <div className="flex justify-between items-center text-[9px] text-gray-400 mb-1">
                          <span>Verification Speed Pipeline:</span>
                          <span className="font-mono">{challengeProgress.toFixed(0)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/15 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 transition-all duration-75"
                            style={{ width: `${challengeProgress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[8px] text-gray-500 mt-1 leading-none select-none font-mono">
                          <span>Challenge {activeChallengeIdx + 1} of 3</span>
                          <span>INT8 Acceleration Active</span>
                        </div>
                      </div>
                    )}

                    {/* Live data readouts */}
                    <div className="bg-black/55 rounded-2xl p-3 border border-white/5 space-y-1.5 select-none font-mono text-left">
                      <div className="flex justify-between text-[9px]">
                        <span className="text-gray-400">CONTOUR GAP ERROR:</span>
                        <span className={`font-bold ${faceMetrics.faceContourError < 0.02 ? 'text-indigo-400 animate-pulse' : 'text-white'}`}>
                          {faceMetrics.faceContourError.toFixed(4)}
                        </span>
                      </div>
                      <div className="flex justify-between text-[9px]">
                        <span className="text-gray-400">3D LIVENESS CAP%:</span>
                        <span className="text-white font-bold">{(faceMetrics.livenessScore * 100).toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between text-[9px]">
                        <span className="text-gray-400">EMBED SIMILARITY:</span>
                        <span className={`font-bold ${faceMetrics.matchingSimilarity > 0.95 ? 'text-emerald-450 animate-pulse' : 'text-white'}`}>
                          {(faceMetrics.matchingSimilarity * 100).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    {verifyStatus === 'SUCCESS' && (
                      <button 
                        onClick={() => {
                          setCurrentScreen('HOME');
                          setVerifyStatus('IDLE');
                        }}
                        className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-white font-bold text-xs transition-colors cursor-pointer"
                        id="auth-ok-done-btn"
                      >
                        Return to Dashboard
                      </button>
                    )}

                    {verifyStatus === 'FAILED' && (
                      <button 
                        onClick={triggerAuthenticationScan}
                        className="w-full py-3 bg-rose-500 hover:bg-rose-600 rounded-xl text-white font-bold text-xs transition-colors cursor-pointer"
                        id="auth-fail-retry-btn"
                      >
                        Retry Verification Run
                      </button>
                    )}

                    {verifyStatus === 'CHALLENGE_SEQUENCE' && (
                      <div className="py-2.5 px-3 bg-white/5 border border-white/5 rounded-xl text-[9px] text-gray-500 italic text-center animate-pulse font-medium">
                        Challenge active. Model evaluates landmarks and texture metrics...
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {currentScreen === 'LEDGER' && (
                <motion.div 
                  key="ledger-screen"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex-1 flex flex-col justify-between py-2"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3 pb-1 border-b border-white/10">
                      <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1">
                        <Database className="w-3.5 h-3.5 text-indigo-400" /> Secure SQLite Audit Ledger
                      </span>
                      <button 
                        onClick={() => setCurrentScreen('HOME')}
                        className="text-[10px] text-slate-400 hover:text-white"
                        id="close-ledger-btn"
                      >
                        Back
                      </button>
                    </div>

                    <p className="text-[10px] text-gray-400 leading-normal mb-3 text-left">
                      Below is the local encrypted database audit logs. Each record contains chronological HMAC chain hashes protecting landmarker signatures from tampering.
                    </p>

                    {/* Local ledger items array */}
                    <div className="space-y-1.5 max-h-[290px] overflow-y-auto pr-1">
                      {localRecords.length === 0 ? (
                        <div className="py-8 text-center text-[10px] text-slate-600 italic select-none bg-black/25 rounded-2xl border border-white/5" id="empty-ledger-view">
                          <ShieldCheck className="w-7 h-7 mx-auto text-slate-700 mb-1.5" />
                          Zero unsynced offline records.<br />Perform face verifications to log.
                        </div>
                      ) : (
                        localRecords.map((rec) => (
                          <div 
                            key={rec.id}
                            className="bg-black/40 border border-white/10 rounded-xl p-2.5 text-left font-mono text-[9px] relative hover:border-white/20 transition-all"
                          >
                            <div className="flex justify-between items-center text-white font-bold mb-1">
                              <span>ID: {rec.id}</span>
                              <span className="text-emerald-450 font-extrabold">{rec.matchScore}% match</span>
                            </div>
                            <div className="text-gray-500">Subject Name: <span className="text-slate-300 font-bold">{rec.subjectName}</span></div>
                            <div className="text-gray-500">Liveness Conf: <span className="text-fuchsia-400">{rec.livenessScore}%</span></div>
                            <div className="text-[7.5px] text-gray-600 truncate mt-1">Hash: {rec.hash}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {localRecords.length > 0 && (
                    <div className="space-y-2 mt-4">
                      {/* Sync button */}
                      <button 
                        onClick={handleServerSync}
                        disabled={isSyncing}
                        className={`w-full py-3.5 rounded-xl font-bold text-xs text-white transition-all flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-emerald-600 to-teal-600 shadow-md ${
                          isSyncing ? 'opacity-50 cursor-not-allowed text-slate-300' : 'hover:scale-[1.01]'
                        }`}
                        id="sync-ledger-button"
                      >
                        {isSyncing ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            Relaying locks back to main server...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-3.5 h-3.5" />
                            Synchronize Offline Enclave Cache ({localRecords.length})
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
