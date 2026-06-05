import React, { useEffect, useRef } from 'react';
import { AppTheme } from '../types';

interface AnimatedBackgroundProps {
  theme: AppTheme;
}

export default function AnimatedBackground({ theme }: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Symbols loaded dynamically from active luxury theme's premium palette
    const symbols = theme.symbolsPalette;

    // --- Part 1: Twin Deep-space Starfields ---
    interface CyberStar {
      x: number;
      y: number;
      size: number;
      alpha: number;
      targetAlpha: number;
      speed: number;
    }

    const stars: CyberStar[] = [];
    const initStars = () => {
      stars.length = 0;
      const starCount = 65;
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: 0.4 + Math.random() * 1.5,
          alpha: 0.1 + Math.random() * 0.4,
          targetAlpha: 0.1 + Math.random() * 0.5,
          speed: 0.005 + Math.random() * 0.012
        });
      }
    };

    // --- Part 2: Hacker Rain Setup ---
    interface RainDrop {
      x: number;
      y: number;
      speed: number;
      layer: 0 | 1 | 2; // Depth tiers
      fontSize: number;
      opacity: number;
      originalOpacity: number;
      currentSymbol: string;
      glitchTimer: number;
      driftX: number;
    }

    const raindrops: RainDrop[] = [];
    const maxDrops = 110;

    const initRain = () => {
      raindrops.length = 0;
      for (let i = 0; i < maxDrops; i++) {
        const xPos = Math.random() * width;
        const yPos = Math.random() * height - height;

        const rand = Math.random();
        let layer: 0 | 1 | 2 = 1;
        let fontSize = 11;
        let speed = 0.5;
        let baseOpacity = 0.08;

        if (rand < 0.45) {
          layer = 0; // Far background stream
          fontSize = 7 + Math.floor(Math.random() * 3);
          speed = 0.12 + Math.random() * 0.18;
          baseOpacity = 0.01 + Math.random() * 0.025;
        } else if (rand < 0.88) {
          layer = 1; // Midground standard
          fontSize = 11 + Math.floor(Math.random() * 2);
          speed = 0.35 + Math.random() * 0.35;
          baseOpacity = 0.03 + Math.random() * 0.055;
        } else {
          layer = 2; // Near bold foreground
          fontSize = 13 + Math.floor(Math.random() * 3);
          speed = 0.70 + Math.random() * 0.65;
          baseOpacity = 0.07 + Math.random() * 0.095;
        }

        raindrops.push({
          x: xPos,
          y: yPos,
          speed,
          layer,
          fontSize,
          opacity: baseOpacity,
          originalOpacity: baseOpacity,
          currentSymbol: symbols[Math.floor(Math.random() * symbols.length)],
          glitchTimer: Math.floor(Math.random() * 180),
          driftX: 0
        });
      }
    };

    // --- Part 3: Interactive Expanding Tactical Grid Click Pulses ---
    interface GridClickPulse {
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      alpha: number;
      color: string;
      labelSymbols: string[];
    }

    const clickPulses: GridClickPulse[] = [];

    // --- Part 4: 3D Geodetic Globe and Orbital Ring Coordinates ---
    let dragX = 0;
    let dragY = 0;

    const rotate3D = (x: number, y: number, z: number, rX: number, rY: number) => {
      // Rotation around X axis
      const cosX = Math.cos(rX);
      const sinX = Math.sin(rX);
      const y1 = y * cosX - z * sinX;
      const z1 = y * sinX + z * cosX;

      // Rotation around Y axis
      const cosY = Math.cos(rY);
      const sinY = Math.sin(rY);
      const x2 = x * cosY + z1 * sinY;
      const z2 = -x * sinY + z1 * cosY;

      return { x: x2, y: y1, z: z2 };
    };

    // Rotates localized coordinates along custom inclination vectors
    const rotate3DLocal = (x: number, y: number, z: number, rX: number, rY: number, rZ: number) => {
      // X
      let cos = Math.cos(rX), sin = Math.sin(rX);
      let y1 = y * cos - z * sin;
      let z1 = y * sin + z * cos;

      // Y
      cos = Math.cos(rY); sin = Math.sin(rY);
      let x2 = x * cos + z1 * sin;
      let z2 = -x * sin + z1 * cos;

      // Z
      cos = Math.cos(rZ); sin = Math.sin(rZ);
      let x3 = x2 * cos - y1 * sin;
      let y3 = x2 * sin + y1 * cos;

      return { x: x3, y: y3, z: z2 };
    };

    // Setup initial canvases
    const triggerInit = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initStars();
      initRain();
    };

    triggerInit();

    // Mouse telemetry tracking
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    };

    // Mouse Click Grid wave emitters
    const handleMouseClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Emit high-tech grid pulse waves on clicking inside page boundaries
      clickPulses.push({
        x: clickX,
        y: clickY,
        radius: 3,
        maxRadius: 150 + Math.random() * 80,
        alpha: 0.85,
        color: theme.primaryColor,
        labelSymbols: [
          theme.symbolsPalette[Math.floor(Math.random() * theme.symbolsPalette.length)],
          theme.symbolsPalette[Math.floor(Math.random() * theme.symbolsPalette.length)],
          'SYS_DECRYPTED', 'LINK_OK', 'EDGE_PING'
        ]
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('click', handleMouseClick);

    const handleResize = () => {
      triggerInit();
    };
    window.addEventListener('resize', handleResize);

    // Tracking frames & orbits
    let hudRotationAngle = 0;
    let frameTicks = 0;

    // Satellites orbiting in space along rings
    interface SpaceSatellite {
      orbitIndex: number;
      orbitAngle: number;
      speed: number;
      symbol: string;
      coreText: string;
      color: string;
    }

    const activeSatellites: SpaceSatellite[] = [
      { orbitIndex: 0, orbitAngle: 0, speed: 0.009, symbol: '🛰️', coreText: 'SECURE_NODE_ALPHA', color: theme.primaryColor },
      { orbitIndex: 0, orbitAngle: Math.PI, speed: 0.009, symbol: '⚡', coreText: 'DATA_BUS_01', color: theme.secondaryColor },
      { orbitIndex: 1, orbitAngle: Math.PI * 0.4, speed: -0.007, symbol: '🔐', coreText: 'CERT_VERIFIED_7G', color: theme.primaryColor },
      { orbitIndex: 1, orbitAngle: Math.PI * 1.4, speed: -0.007, symbol: '🗝️', coreText: 'SYS_STREAM_AES', color: theme.secondaryColor }
    ];

    // Core dynamic 3D depth-sorting render queue structure
    interface ProjectedPoint {
      x: number;
      y: number;
      z: number;
      opacityMult: number;
    }

    interface QueueElement {
      z: number; // For sorting (farthest rendered first)
      type: 'globe_line' | 'globe_dot' | 'orbit_line' | 'satellite';
      render: () => void;
    }

    // Animation loop routine
    const render = () => {
      // Clear screen with tail factor retention matching luxury theme ids
      const bgRgb = 
        theme.id === 'emerald' ? '3, 6, 4' :
        theme.id === 'gold' ? '6, 5, 3' : 
        theme.id === 'amethyst' ? '5, 4, 3' : 
        theme.id === 'glacier' ? '2, 5, 4' : '4, 6, 8';
      ctx.fillStyle = `rgba(${bgRgb}, 0.085)`;
      ctx.fillRect(0, 0, width, height);

      hudRotationAngle += 0.004;
      frameTicks++;

      // Draw faint twinkling deep starry space dust
      stars.forEach((star) => {
        star.alpha += (star.targetAlpha - star.alpha) * star.speed;
        if (Math.abs(star.alpha - star.targetAlpha) < 0.03) {
          star.targetAlpha = 0.05 + Math.random() * 0.45;
        }
        ctx.fillStyle = `rgba(${theme.primaryRgb}, ${star.alpha * 0.45})`;
        ctx.fillRect(star.x, star.y, star.size, star.size);
      });

      // Draw standard blueprint horizontal & vertical backing tech grids
      ctx.strokeStyle = `rgba(${theme.primaryRgb}, 0.004)`;
      ctx.lineWidth = 0.5;
      const stepSize = 90;
      for (let g = 0; g < width; g += stepSize) {
        ctx.beginPath();
        ctx.moveTo(g, 0);
        ctx.lineTo(g, height);
        ctx.stroke();
      }
      for (let h1 = 0; h1 < height; h1 += stepSize) {
        ctx.beginPath();
        ctx.moveTo(0, h1);
        ctx.lineTo(width, h1);
        ctx.stroke();
      }

      // --- Part A: Orbiting & 3D Calculations ---
      const globeRadius = Math.min(width, height) * (width > 1200 ? 0.24 : width > 768 ? 0.28 : 0.32);
      const globCenterX = width * 0.5;
      const globCenterY = height * 0.50;

      const autoRotX = frameTicks * 0.0005;
      const autoRotY = frameTicks * 0.0008;

      const mX = mouseRef.current.x;
      const mY = mouseRef.current.y;

      if (mouseRef.current.active && mX > 0 && mY > 0) {
        const normX = (mX - width / 2) / (width / 2);
        const normY = (mY - height / 2) / (height / 2);
        dragY += (normX * 1.5 - dragY) * 0.035;
        dragX += (normY * -1.5 - dragX) * 0.035;
      } else {
        dragY += (0 - dragY) * 0.015;
        dragX += (0 - dragX) * 0.015;
      }

      const finalRotX = autoRotX + dragX;
      const finalRotY = autoRotY + dragY;

      const fov = 420;
      const cameraDistance = globeRadius * 2.8;

      // 3D Spherical Points array
      const numLats = 9;
      const numLons = 16;
      const ringPoints: ProjectedPoint[][] = Array.from({ length: numLats + 1 }, () => []);

      // North Pole
      const rotNP = rotate3D(0, globeRadius, 0, finalRotX, finalRotY);
      const scaleNP = fov / (fov + rotNP.z + cameraDistance);
      ringPoints[0].push({
        x: globCenterX + rotNP.x * scaleNP,
        y: globCenterY + rotNP.y * scaleNP,
        z: rotNP.z,
        opacityMult: Math.max(0.04, 1 - (rotNP.z + globeRadius) / (2 * globeRadius) * 0.72)
      });

      // Lateral Ring points
      for (let lat = 1; lat < numLats; lat++) {
        const theta = (lat * Math.PI) / numLats;
        for (let lon = 0; lon < numLons; lon++) {
          const phi = (lon * 2 * Math.PI) / numLons;
          const x = Math.sin(theta) * Math.cos(phi) * globeRadius;
          const y = Math.cos(theta) * globeRadius;
          const z = Math.sin(theta) * Math.sin(phi) * globeRadius;

          const rotated = rotate3D(x, y, z, finalRotX, finalRotY);
          const scale = fov / (fov + rotated.z + cameraDistance);
          const oMult = Math.max(0.04, 1 - (rotated.z + globeRadius) / (2 * globeRadius) * 0.72);

          ringPoints[lat].push({
            x: globCenterX + rotated.x * scale,
            y: globCenterY + rotated.y * scale,
            z: rotated.z,
            opacityMult: oMult
          });
        }
      }

      // South Pole
      const rotSP = rotate3D(0, -globeRadius, 0, finalRotX, finalRotY);
      const scaleSP = fov / (fov + rotSP.z + cameraDistance);
      ringPoints[numLats].push({
        x: globCenterX + rotSP.x * scaleSP,
        y: globCenterY + rotSP.y * scaleSP,
        z: rotSP.z,
        opacityMult: Math.max(0.04, 1 - (rotSP.z + globeRadius) / (2 * globeRadius) * 0.72)
      });

      // Setup list of 3D objects to sort for occlusion
      const queue: QueueElement[] = [];

      // 1. Globe wireframe links (segments)
      const registerGlobeLine = (p1: ProjectedPoint, p2: ProjectedPoint) => {
        const avgZ = (p1.z + p2.z) / 2;
        const avgOpacity = (p1.opacityMult + p2.opacityMult) / 2;

        queue.push({
          z: avgZ,
          type: 'globe_line',
          render: () => {
            ctx.strokeStyle = `rgba(${theme.primaryRgb}, ${0.12 * avgOpacity})`;
            ctx.lineWidth = 0.5 * avgOpacity + 0.35;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
      };

      // Register longitudinal and latitudinal lines
      const poleNorth = ringPoints[0][0];
      for (let lon = 0; lon < numLons; lon++) {
        registerGlobeLine(poleNorth, ringPoints[1][lon]);
      }

      for (let lat = 1; lat < numLats; lat++) {
        for (let lon = 0; lon < numLons; lon++) {
          const current = ringPoints[lat][lon];
          const nextLon = ringPoints[lat][(lon + 1) % numLons];
          registerGlobeLine(current, nextLon);

          if (lat < numLats - 1) {
            const nextLat = ringPoints[lat + 1][lon];
            registerGlobeLine(current, nextLat);
          }
        }
      }

      const poleSouth = ringPoints[numLats][0];
      for (let lon = 0; lon < numLons; lon++) {
        registerGlobeLine(ringPoints[numLats - 1][lon], poleSouth);
      }

      // 2. Globe Vertices / Dots
      for (let lat = 0; lat <= numLats; lat++) {
        const limitLon = (lat === 0 || lat === numLats) ? 1 : numLons;
        for (let lon = 0; lon < limitLon; lon++) {
          const pt = ringPoints[lat][lon];
          const dotSize = 1.1 * pt.opacityMult + 0.4;
          const isJunction = lat % 2 === 0 && lon % 3 === 0;

          queue.push({
            z: pt.z,
            type: 'globe_dot',
            render: () => {
              if (isJunction) {
                // Large glowing node
                ctx.fillStyle = `rgba(${theme.secondaryRgb}, ${0.40 * pt.opacityMult})`;
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, dotSize * 1.6, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = `rgba(${theme.secondaryRgb}, ${0.15 * pt.opacityMult})`;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, dotSize * 3.5, 0, Math.PI * 2);
                ctx.stroke();
              } else {
                ctx.fillStyle = `rgba(${theme.primaryRgb}, ${0.25 * pt.opacityMult})`;
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, dotSize, 0, Math.PI * 2);
                ctx.fill();
              }

              // Constellation tracking link on hover
              if (mouseRef.current.active && mX > 0 && mY > 0) {
                const dx = pt.x - mX;
                const dy = pt.y - mY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 100) {
                  ctx.strokeStyle = `rgba(${theme.secondaryRgb}, ${(1 - dist / 100) * 0.17 * pt.opacityMult})`;
                  ctx.lineWidth = 0.55 * pt.opacityMult;
                  ctx.beginPath();
                  ctx.moveTo(mX, mY);
                  ctx.lineTo(pt.x, pt.y);
                  ctx.stroke();
                }
              }
            }
          });
        }
      }

      // 3. Majestic Tilting 3D Orbital Rings
      const ringSpecs = [
        { radius: globeRadius * 1.5, tiltX: 0.25, tiltY: 0.1, tiltZ: 0.35, segments: 44, color: theme.primaryRgb },
        { radius: globeRadius * 1.8, tiltX: -0.3, tiltY: 0.2, tiltZ: -0.6, segments: 44, color: theme.secondaryRgb }
      ];

      ringSpecs.forEach((spec, rIndex) => {
        const subPts: ProjectedPoint[] = [];
        
        for (let s = 0; s <= spec.segments; s++) {
          const phi = (s * 2 * Math.PI) / spec.segments;
          const x = Math.cos(phi) * spec.radius;
          const y = 0;
          const z = Math.sin(phi) * spec.radius;

          // Locally rotate the circular orbit plane
          const localRot = rotate3DLocal(x, y, z, spec.tiltX, spec.tiltY, spec.tiltZ);
          // globally rotate along with Earth's spinning layout coordinate
          const globalRot = rotate3D(localRot.x, localRot.y, localRot.z, finalRotX, finalRotY);

          const scale = fov / (fov + globalRot.z + cameraDistance);
          const oMult = Math.max(0.04, 1 - (globalRot.z + spec.radius) / (2 * spec.radius) * 0.72);

          subPts.push({
            x: globCenterX + globalRot.x * scale,
            y: globCenterY + globalRot.y * scale,
            z: globalRot.z,
            opacityMult: oMult
          });
        }

        // Segment linking & inclusion
        for (let s = 0; s < spec.segments; s++) {
          const pt1 = subPts[s];
          const pt2 = subPts[s + 1];
          const avgZ = (pt1.z + pt2.z) / 2;
          const avgOpacity = (pt1.opacityMult + pt2.opacityMult) / 2;

          queue.push({
            z: avgZ,
            type: 'orbit_line',
            render: () => {
              ctx.strokeStyle = `rgba(${spec.color}, ${0.11 * avgOpacity})`;
              ctx.lineWidth = 0.6 * avgOpacity + 0.2;
              // Add subtle dashed styles on secondary ring for engineering blueprints look
              if (rIndex === 1) {
                ctx.setLineDash([4, 6]);
              }
              ctx.beginPath();
              ctx.moveTo(pt1.x, pt1.y);
              ctx.lineTo(pt2.x, pt2.y);
              ctx.stroke();
              ctx.setLineDash([]);
            }
          });
        }
      });

      // 4. Update and Include Active Satellites along the Orbital paths
      activeSatellites.forEach((sat) => {
        const spec = ringSpecs[sat.orbitIndex];
        if (!spec) return;

        // Progress angle
        sat.orbitAngle += sat.speed;
        
        const x = Math.cos(sat.orbitAngle) * spec.radius;
        const y = 0;
        const z = Math.sin(sat.orbitAngle) * spec.radius;

        const localRot = rotate3DLocal(x, y, z, spec.tiltX, spec.tiltY, spec.tiltZ);
        const globalRot = rotate3D(localRot.x, localRot.y, localRot.z, finalRotX, finalRotY);

        const scale = fov / (fov + globalRot.z + cameraDistance);
        const oMult = Math.max(0.04, 1 - (globalRot.z + spec.radius) / (2 * spec.radius) * 0.72);

        const projX = globCenterX + globalRot.x * scale;
        const projY = globCenterY + globalRot.y * scale;

        queue.push({
          z: globalRot.z - 5, // Slightly prioritized offset to render on top of the supporting rings
          type: 'satellite',
          render: () => {
            const sizeMult = 1.0 * oMult;
            
            // Draw satellite spark
            ctx.fillStyle = sat.color;
            ctx.beginPath();
            ctx.arc(projX, projY, sizeMult * 3 + 1, 0, Math.PI * 2);
            ctx.fill();

            // Glowing aura pulsing
            ctx.strokeStyle = `rgba(${sat.color === theme.primaryColor ? theme.primaryRgb : theme.secondaryRgb}, ${0.25 * oMult})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(projX, projY, sizeMult * 8 + Math.sin(frameTicks * 0.1) * 3, 0, Math.PI * 2);
            ctx.stroke();

            // Floating biometric decryption data string next to satellite
            ctx.fillStyle = `rgba(${sat.color === theme.primaryColor ? theme.primaryRgb : theme.secondaryRgb}, ${0.45 * oMult})`;
            ctx.font = '700 7px "JetBrains Mono", monospace';
            ctx.fillText(`${sat.symbol} ${sat.coreText}`, projX + 11, projY + 3);

            // Subtle dash connector trace
            ctx.strokeStyle = `rgba(255,255,255,, ${0.1 * oMult})`;
            ctx.beginPath();
            ctx.moveTo(projX, projY);
            ctx.lineTo(projX + 9, projY);
            ctx.stroke();
          }
        });
      });

      // Sorting the Render Queue Descending (render elements far away first, closer objects overlap beautifully)
      queue.sort((a, b) => b.z - a.z);

      // Deploy the Sorted drawing queue
      queue.forEach((element) => element.render());

      // --- Part B: Draw Core Click Pulse Waves ---
      for (let pIdx = clickPulses.length - 1; pIdx >= 0; pIdx--) {
        const p = clickPulses[pIdx];
        p.radius += (p.maxRadius - p.radius) * 0.055;
        p.alpha -= 0.022;

        if (p.alpha <= 0.01) {
          clickPulses.splice(pIdx, 1);
          continue;
        }

        // Draw tactical radar lines
        ctx.strokeStyle = `rgba(${theme.primaryRgb}, ${p.alpha})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(${theme.secondaryRgb}, ${p.alpha * 0.5})`;
        ctx.setLineDash([6, 8]);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 0.7, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Interactive tag texts floating around wave circumference
        ctx.fillStyle = `rgba(${theme.secondaryRgb}, ${p.alpha})`;
        ctx.font = 'bold 8px "JetBrains Mono", monospace';
        const numTags = 3;
        for (let t = 0; t < numTags; t++) {
          const ang = frameTicks * 0.01 + (t * 2 * Math.PI) / numTags;
          const labelX = p.x + Math.cos(ang) * p.radius;
          const labelY = p.y + Math.sin(ang) * p.radius;
          
          if (p.labelSymbols[t]) {
            ctx.fillText(`[${p.labelSymbols[t]}]`, labelX - 15, labelY);
          }
        }
      }

      // --- Part C: Interactive Cursor HUD Lock Target ---
      if (mouseRef.current.active && mX > 0 && mY > 0) {
        ctx.save();
        ctx.strokeStyle = `rgba(${theme.primaryRgb}, 0.12)`;
        ctx.lineWidth = 0.8;

        ctx.beginPath();
        ctx.arc(mX, mY, 48, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(${theme.secondaryRgb}, 0.08)`;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.arc(mX, mY, 32, hudRotationAngle, hudRotationAngle + Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.strokeStyle = `rgba(${theme.primaryRgb}, 0.25)`;
        ctx.beginPath();
        ctx.arc(mX, mY, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.moveTo(mX - 10, mY); ctx.lineTo(mX - 4, mY);
        ctx.moveTo(mX + 4, mY); ctx.lineTo(mX + 10, mY);
        ctx.moveTo(mX, mY - 10); ctx.lineTo(mX, mY - 4);
        ctx.moveTo(mX, mY + 4); ctx.lineTo(mX, mY + 10);
        ctx.stroke();

        ctx.fillStyle = `rgba(${theme.primaryRgb}, 0.35)`;
        ctx.font = '700 7px "JetBrains Mono", monospace';
        ctx.fillText(`LOC: [${Math.floor(mX)},${Math.floor(mY)}]`, mX + 15, mY - 15);
        ctx.fillText("GRID_LOCK_ACTIVE", mX + 15, mY - 6);

        ctx.restore();
      }

      // --- Part D: Fast Matrix Code Streams ---
      ctx.font = '11px "JetBrains Mono", monospace';
      raindrops.forEach((drop) => {
        drop.y += drop.speed;

        if (drop.y > height + 25) {
          drop.y = -25 - Math.random() * 150;
          drop.x = Math.random() * width;
          drop.driftX = 0;
          if (drop.layer === 0) {
            drop.speed = 0.12 + Math.random() * 0.20;
            drop.opacity = 0.01 + Math.random() * 0.025;
          } else if (drop.layer === 1) {
            drop.speed = 0.35 + Math.random() * 0.35;
            drop.opacity = 0.03 + Math.random() * 0.055;
          } else {
            drop.speed = 0.70 + Math.random() * 0.65;
            drop.opacity = 0.07 + Math.random() * 0.095;
          }
          drop.originalOpacity = drop.opacity;
        }

        drop.glitchTimer--;
        if (drop.glitchTimer <= 0) {
          drop.currentSymbol = symbols[Math.floor(Math.random() * symbols.length)];
          drop.glitchTimer = 85 + Math.floor(Math.random() * 180);
        }

        let isGlitchedByMouse = false;
        let brightnessMultiplier = 1.0;
        let repulsionX = 0;

        if (mouseRef.current.active) {
          const dx = drop.x - mX;
          const dy = drop.y - mY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 110) {
            isGlitchedByMouse = true;
            if (Math.random() < 0.4) {
              drop.currentSymbol = symbols[Math.floor(Math.random() * symbols.length)];
            }
            const intensity = (110 - distance) / 110;
            brightnessMultiplier = 1.0 + intensity * 2.8; 
            repulsionX = (dx > 0 ? 1 : -1) * intensity * 15;
          }
        }

        drop.driftX += (repulsionX - drop.driftX) * 0.08;
        const renderX = drop.x + drop.driftX;

        const edgeFade = Math.sin((drop.y / height) * Math.PI);
        const baseOpacity = Math.max(0.005, drop.originalOpacity * Math.max(0.1, edgeFade));
        const finalCalculatedOpacity = Math.min(0.95, baseOpacity * brightnessMultiplier);

        if (drop.layer === 2) {
          ctx.font = `bold ${drop.fontSize}px "JetBrains Mono", monospace`;
        } else {
          ctx.font = `${drop.fontSize}px "JetBrains Mono", monospace`;
        }

        if (isGlitchedByMouse) {
          ctx.fillStyle = `rgba(255, 255, 255, ${finalCalculatedOpacity})`;
        } else {
          const randColor = Math.random();
          if (randColor < 0.05) {
            ctx.fillStyle = `rgba(255, 255, 255, ${finalCalculatedOpacity * 1.5})`;
          } else if (randColor < 0.18) {
            ctx.fillStyle = `rgba(${theme.secondaryRgb}, ${finalCalculatedOpacity})`;
          } else {
            ctx.fillStyle = `rgba(${theme.primaryRgb}, ${finalCalculatedOpacity})`;
          }
        }

        ctx.fillText(drop.currentSymbol, renderX, drop.y);

        if (drop.layer === 2 && Math.random() < 0.015) {
          ctx.fillStyle = `rgba(255, 255, 255, ${finalCalculatedOpacity * 1.5})`;
          ctx.fillText(symbols[Math.floor(Math.random() * symbols.length)], renderX, drop.y + 12);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('click', handleMouseClick);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden z-0" id="animated-matrix-canvas-wrapper">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full opacity-65"
      />
      {/* Dynamic ambient backlighting aligning with themed choices */}
      <div 
        style={{ backgroundColor: `${theme.primaryColor}22` }}
        className="absolute top-[10%] left-[8%] w-[580px] h-[580px] rounded-full blur-[160px] pointer-events-none transition-all duration-1000 ease-in-out animate-pulse duration-[15000ms]" 
      />
      <div 
        style={{ backgroundColor: `${theme.secondaryColor}15` }}
        className="absolute bottom-[20%] right-[10%] w-[620px] h-[620px] rounded-full blur-[170px] pointer-events-none transition-all duration-1000 ease-in-out animate-pulse duration-[18000ms]" 
      />
    </div>
  );
}
