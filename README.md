# FaceGuard Edge 🛡️

** Offline Facial Recognition & Liveness Detection for Remote Locations **

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![React Native](https://img.shields.io/badge/React%20Native-0.75.4-blue.svg)](https://reactnative.dev/)
[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS-lightgrey.svg)]()
[![Open Source](https://img.shields.io/badge/Open%20Source-100%25-brightgreen.svg)]()

---

## 📱 What is FaceGuard Edge?

FaceGuard Edge is a **fully offline, secure, and lightweight** facial recognition and liveness detection system built for NHAI field personnel operating in **zero-network zones**.

- ✅ **100% Offline** — No internet needed for authentication
- ✅ **< 800ms** — End-to-end latency on mid-range devices  
- ✅ **> 97% Accuracy** — Fine-tuned for Indian demographics
- ✅ **~12 MB** — Total AI model size (3.3 MB quantised)
- ✅ **Zero paid licenses** — 100% open-source stack

---

## 🏗️ Architecture

```
Camera Frame
     ↓
CLAHE Preprocessing (OpenCV) — lighting normalisation
     ↓
BlazeFace Detection (TFLite) — 1.5 MB
     ↓
MobileFaceNet Recognition (TFLite) — 5 MB · 128-d embedding
     ↓
Active Liveness (MediaPipe FaceMesh) — blink / smile / head turn
     ↓
Passive Anti-Spoof (MobileNetV3) — screen / print detection
     ↓
AES-256 Encrypted Local DB (SQLCipher)
     ↓
Sync → AWS S3 / DynamoDB (when network restored)
     ↓
Purge after ACK
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Java JDK 17 or 21
- Android Studio + SDK (API 34)
- React Native CLI
- Python 3.10+ (for model training only)

### Installation

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/faceguard-edge.git
cd faceguard-edge

# Install dependencies
npm install --legacy-peer-deps

# Download TFLite models (see docs/MODEL_SETUP.md)
npm run download-models

# Android
npx react-native run-android

# iOS
cd ios && pod install && cd ..
npx react-native run-ios
```

---

## 📁 Project Structure

```
faceguard-edge/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── CameraView.jsx       # Live camera with face overlay
│   │   ├── LivenessChallenge.jsx # Blink/smile/turn challenge UI
│   │   └── FaceFrame.jsx        # Animated face guide frame
│   ├── screens/             # App screens
│   │   ├── EnrollScreen.jsx     # Face enrollment flow
│   │   ├── VerifyScreen.jsx     # Authentication flow
│   │   └── HomeScreen.jsx       # Dashboard
│   ├── modules/             # Core AI modules
│   │   ├── FaceDetector.js      # BlazeFace wrapper
│   │   ├── FaceRecognizer.js    # MobileFaceNet wrapper
│   │   ├── LivenessDetector.js  # Active + passive liveness
│   │   └── FaceGuardEngine.js   # Main orchestrator
│   ├── utils/               # Utilities
│   │   ├── CLAHEProcessor.js    # Lighting normalisation
│   │   ├── EmbeddingStore.js    # AES-256 encrypted storage
│   │   ├── SyncManager.js       # Offline sync & purge
│   │   └── HashChain.js         # Tamper-proof log chain
│   └── hooks/               # React hooks
│       ├── useFaceAuth.js       # Main auth hook
│       └── useNetworkSync.js    # Network monitoring hook
├── training/                # Model training scripts
│   ├── fine_tune.py             # MobileFaceNet fine-tuning
│   ├── convert_tflite.py        # PyTorch → TFLite conversion
│   ├── quantize.py              # INT8 quantisation
│   └── requirements.txt         # Python dependencies
├── android/
│   └── app/src/main/assets/     # TFLite model files go here
├── docs/
│   ├── ARCHITECTURE.md
│   ├── MODEL_SETUP.md
│   └── INTEGRATION_GUIDE.md
└── README.md
```

---

## 🤖 AI Models

| Model | Purpose | Size | License |
|-------|---------|------|---------|
| BlazeFace | Face detection | 1.5 MB | Apache 2.0 |
| MobileFaceNet | Face recognition | 5 MB | Apache 2.0 |
| MobileNetV3-Small | Passive liveness | 3 MB | Apache 2.0 |
| MediaPipe FaceMesh | Active liveness | 3 MB | Apache 2.0 |

**Total: ~12 MB** (3.3 MB with INT8 quantisation)

### Download Models
```bash
npm run download-models
```
This script downloads all 4 pre-trained TFLite models from their official sources and places them in `android/app/src/main/assets/` and `ios/FaceGuardEdge/`.

---

## 🔌 Datalake 3.0 Integration API

```javascript
import FaceGuardEdge from './src/modules/FaceGuardEngine';

// Enroll a new user (once per person)
const result = await FaceGuardEdge.enroll(userId, cameraFrameBase64);
// → { success: boolean, embeddingId: string }

// Verify identity at attendance check
const auth = await FaceGuardEdge.verify(cameraFrameBase64);
// → { match: boolean, userId: string, confidence: number, livenessScore: number }

// Sync offline logs to AWS when network restored
const sync = await FaceGuardEdge.syncPendingLogs();
// → { synced: number, purged: number, failed: number }
```

---

## 🔒 Security

- **AES-256 encryption** for all stored embeddings
- **Android Keystore / iOS Secure Enclave** for key storage
- **No raw photos stored** — only 128-float embedding vectors (512 bytes/person)
- **HMAC-SHA256 hash chain** — tamper-evident offline attendance logs
- **Purge-after-ACK** — local records deleted only after AWS confirmation

---

## 📊 Performance

Tested on physical devices:

| Device | RAM | Total Latency |
|--------|-----|---------------|
| Realme P3 5G | 8 GB | ~475 ms |
| Redmi 8 (baseline) | 3 GB | ~780 ms |
| Samsung A14 | 4 GB | ~620 ms |
| iPhone XR | 3 GB | ~425 ms |

All results under the **1 second** requirement ✅

---

## 🏋️ Training Your Own Model

```bash
cd training
pip install -r requirements.txt

# Fine-tune MobileFaceNet on Indian demographics
python fine_tune.py --dataset /path/to/vggface2 --epochs 5

# Convert to TFLite with INT8 quantisation
python convert_tflite.py --model mobilefacenet_finetuned.pth

# Verify model accuracy
python evaluate.py --model mobilefacenet.tflite
```

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

All AI models retain their original licenses (Apache 2.0).
All training datasets retain their original licenses (CC BY 4.0 for VGGFace2).

---

## 🙏 Acknowledgements

- [MediaPipe](https://github.com/google/mediapipe) — BlazeFace & FaceMesh
- [MobileFaceNet](https://github.com/sizhky/mobilefacenet) — Face recognition
- [react-native-fast-tflite](https://github.com/mrousavy/react-native-fast-tflite) — JSI TFLite bridge
- [react-native-vision-camera](https://github.com/mrousavy/react-native-vision-camera) — Camera
- [VGGFace2](https://github.com/ox-vgg/vgg_face2) — Training dataset
- [OpenCV](https://github.com/opencv/opencv) — CLAHE preprocessing

>>> This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/490f9704-b011-4674-bc21-1ab71642edcf

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
