/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BiometricSubject, BiometricBenchmark } from '../types';

// Simple hash generator mimicking blockchain verification for secure biometric logs
export function calculateSimulatedHash(prevHash: string, data: string): string {
  let hash = 0;
  const combined = prevHash + data;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return 'sha256_' + Math.abs(hash).toString(16).padStart(8, '0');
}

// Pre-seeded security registry of authorized employee subjects
export const INITIAL_SUBJECTS: BiometricSubject[] = [
  {
    id: "EMP-49201",
    name: "Ajitha Sabural",
    department: "Deep Learning Security Group",
    enrolledAt: "2026-01-10T08:30:00Z",
    signature: Array.from({ length: 128 }, (_, i) => Math.sin(i * 0.15)),
    role: "Lead Platform Cryptographer",
    avatarIcon: "👩‍💻"
  },
  {
    id: "EMP-27481",
    name: "Michael Chen",
    department: "Biometric AI Research Division",
    enrolledAt: "2025-11-15T09:12:00Z",
    signature: Array.from({ length: 128 }, (_, i) => Math.cos(i * 0.22)),
    role: "Senior AI Ethics Director",
    avatarIcon: "👨‍💻"
  },
  {
    id: "EMP-91823",
    name: "Dr. Sarah Jenkins",
    department: "Hardware Enclave Infrastructure",
    enrolledAt: "2026-03-22T14:45:00Z",
    signature: Array.from({ length: 128 }, (_, i) => Math.sin(i * 0.09) + Math.cos(i * 0.11)),
    role: "Platform Operations Lead",
    avatarIcon: "👩‍🔬"
  }
];

// Calculate facial embedding cosine similarity
export function calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let mA = 0;
  let mB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    mA += vecA[i] * vecA[i];
    mB += vecB[i] * vecB[i];
  }
  if (mA === 0 || mB === 0) return 0;
  return dotProduct / (Math.sqrt(mA) * Math.sqrt(mB));
}

// Generate randomized vector spectrum of 128 elements
export function generateRandomEmbeddingVector(): number[] {
  return Array.from({ length: 128 }, () => (Math.random() * 2 - 1) * 0.5);
}

// Local NN model benchmarks
export const MODEL_BENCHMARKS: BiometricBenchmark[] = [
  {
    name: "UltraFace-Liveness v2",
    modelSize: 1.5,
    latMs: 8,
    accuracyScore: 98.4,
    description: "Evaluates eye blinks and skin texture features. Running natively in custom React Native JSI C++ buffers."
  },
  {
    name: "FaceNet embedding generator",
    modelSize: 5.0,
    latMs: 32,
    accuracyScore: 99.1,
    description: "Extracts an coordinate-independent 128D float embedding of facial features via deeply integrated convolutional blocks."
  },
  {
    name: "CLAHE Preprocessor Core",
    modelSize: 2.2,
    latMs: 12,
    accuracyScore: 97.8,
    description: "Normalizes local contrast on-device, handling extreme shadowed, back-lit, or high direct-sunlight environments."
  },
  {
    name: "DeepID-3 Multi-spectral Net",
    modelSize: 12.0,
    latMs: 128,
    accuracyScore: 99.6,
    description: "Validates multi-scale holistic descriptors. Switched on for high-priority executive clearance verification checks."
  }
];
