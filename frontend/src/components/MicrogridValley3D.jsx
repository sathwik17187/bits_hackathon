import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useMicrogrid } from '../context/MicrogridContext';

// Inspection Buggy
function Buggy({ position = [0, 0.4, 0] }) {
  const meshRef = useRef();
  const [pos, setPos] = useState(new THREE.Vector3(...position));
  const keys = useRef({});

  useEffect(() => {
    const handleDown = (e) => { keys.current[e.key.toLowerCase()] = true; };
    const handleUp = (e) => { keys.current[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);
    return () => {
      window.removeEventListener('keydown', handleDown);
      window.removeEventListener('keyup', handleUp);
    };
  }, []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const speed = 7 * delta;
    if (keys.current['w'] || keys.current['arrowup']) pos.z -= speed;
    if (keys.current['s'] || keys.current['arrowdown']) pos.z += speed;
    if (keys.current['a'] || keys.current['arrowleft']) pos.x -= speed;
    if (keys.current['d'] || keys.current['arrowright']) pos.x += speed;

    pos.x = THREE.MathUtils.clamp(pos.x, -14, 14);
    pos.z = THREE.MathUtils.clamp(pos.z, -14, 14);
    meshRef.current.position.copy(pos);
  });

  return (
    <group ref={meshRef} position={position}>
      {/* Body */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[1.2, 0.5, 2.0]} />
        <meshStandardMaterial color="#38bdf8" roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 0.7, -0.1]}>
        <boxGeometry args={[0.9, 0.45, 1.1]} />
        <meshStandardMaterial color="#0f172a" roughness={0.1} metalness={0.9} />
      </mesh>
      {/* Headlights */}
      <mesh position={[-0.4, 0.35, -1.02]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="#34d399" />
      </mesh>
      <mesh position={[0.4, 0.35, -1.02]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="#34d399" />
      </mesh>
      {/* Wheels */}
      {[-0.65, 0.65].map((x, i) =>
        [-0.7, 0.7].map((z, j) => (
          <mesh key={`${i}-${j}`} position={[x, 0.18, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.22, 0.22, 0.25, 16]} />
            <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </mesh>
        ))
      )}
    </group>
  );
}

// Solar Panel Field
function SolarFarm({ position = [-6, 0, -5] }) {
  const panelRef = useRef();
  useFrame(({ clock }) => {
    if (panelRef.current) {
      // Gentle tracking rotation
      panelRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.2) * 0.15;
    }
  });

  return (
    <group position={position} ref={panelRef}>
      <Text position={[0, 3.2, 0]} fontSize={0.65} color="#fbbf24" anchorX="center" anchorY="middle">
        SOLAR ARRAY (150 kW)
      </Text>
      {[-2, 0, 2].map((x, i) =>
        [-1.5, 1.5].map((z, j) => (
          <group key={`${i}-${j}`} position={[x * 1.5, 0, z * 1.4]}>
            {/* Pole */}
            <mesh position={[0, 0.8, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 1.6]} />
              <meshStandardMaterial color="#64748b" metalness={0.8} />
            </mesh>
            {/* Panel */}
            <mesh position={[0, 1.6, 0]} rotation={[0.45, 0, 0]}>
              <boxGeometry args={[1.8, 0.08, 1.2]} />
              <meshStandardMaterial color="#0284c7" roughness={0.2} metalness={0.9} />
            </mesh>
          </group>
        ))
      )}
    </group>
  );
}

// Battery Storage Bank
function BatteryBank({ position = [6, 0, -5], soc = 85 }) {
  const glowIntensity = soc / 100;
  return (
    <group position={position}>
      <Text position={[0, 3.8, 0]} fontSize={0.65} color="#34d399" anchorX="center" anchorY="middle">
        BATTERY STORAGE ({soc.toFixed(0)}% SoC)
      </Text>
      {[-1.5, 0, 1.5].map((x, i) => (
        <group key={i} position={[x * 1.5, 0, 0]}>
          {/* Main cell container */}
          <mesh position={[0, 1.5, 0]}>
            <boxGeometry args={[1.4, 3.0, 1.6]} />
            <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.3} />
          </mesh>
          {/* Glowing SoC Indicator strips */}
          {[0.8, 1.5, 2.2].map((y, k) => (
            <mesh key={k} position={[0, y, 0.82]}>
              <boxGeometry args={[1.0, 0.25, 0.05]} />
              <meshBasicMaterial color={soc > 30 ? '#10b981' : '#ef4444'} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

// Central Substation
function CentralSubstation({ position = [0, 0, 4], isOverload = false, gridMode = 'MAIN_GRID' }) {
  const sirenRef = useRef();
  useFrame(({ clock }) => {
    if (sirenRef.current) {
      sirenRef.current.rotation.y = clock.getElapsedTime() * 4;
    }
  });

  const beaconColor = isOverload ? '#ef4444' : gridMode === 'RENEWABLE_STORAGE' ? '#f59e0b' : '#10b981';

  return (
    <group position={position}>
      <Text position={[0, 4.2, 0]} fontSize={0.65} color={beaconColor} anchorX="center" anchorY="middle">
        {gridMode === 'RENEWABLE_STORAGE' ? '⚡ RENEWABLE DISPATCH' : '🔌 MAIN GRID COUPLER'}
      </Text>

      {/* Base Building */}
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[4.0, 2.4, 3.5]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Transformer Coils */}
      {[-1.2, 1.2].map((x, i) => (
        <mesh key={i} position={[x, 2.7, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 1.2, 16]} />
          <meshStandardMaterial color="#475569" metalness={0.9} />
        </mesh>
      ))}

      {/* Siren / Status Beacon */}
      <group position={[0, 2.8, 0]} ref={sirenRef}>
        <mesh>
          <coneGeometry args={[0.3, 0.6, 16]} />
          <meshBasicMaterial color={beaconColor} />
        </mesh>
        <pointLight color={beaconColor} intensity={3.5} distance={10} />
      </group>
    </group>
  );
}

// Power Line with Pulse Particles
function PowerLines({ isRenewable = false, isOverload = false }) {
  const lineMatColor = isOverload ? '#ef4444' : isRenewable ? '#f59e0b' : '#38bdf8';

  return (
    <group>
      {/* Ground Cables */}
      <mesh position={[-3, 0.05, -0.5]} rotation={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 11, 8]} />
        <meshBasicMaterial color={lineMatColor} />
      </mesh>
      <mesh position={[3, 0.05, -0.5]} rotation={[0, -0.7, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 11, 8]} />
        <meshBasicMaterial color={lineMatColor} />
      </mesh>
    </group>
  );
}

export const MicrogridValley3D = () => {
  const { forecastData, batterySoc } = useMicrogrid();
  const firstHour = forecastData?.hourly_forecasts?.[0];
  const isOverload = firstHour?.is_critical_overload || false;
  const gridMode = firstHour?.grid_mode || 'MAIN_GRID';

  return (
    <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 140px)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
      {/* Controls Overlay */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 10,
        background: 'rgba(10, 15, 28, 0.88)',
        backdropFilter: 'var(--backdrop-blur)',
        padding: '16px 20px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        maxWidth: '340px'
      }}>
        <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
          Interactive Microgrid Valley
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '12px' }}>
          Explore the autonomous smart grid simulation. Power cables glow dynamically based on real-time QuickML dispatch rules.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Power Source:</span>
            <strong style={{ color: gridMode === 'RENEWABLE_STORAGE' ? '#f59e0b' : '#10b981' }}>{gridMode}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Battery Reserve:</span>
            <strong style={{ color: '#38bdf8' }}>{batterySoc.toFixed(1)}%</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Current Demand:</span>
            <strong style={{ color: isOverload ? '#ef4444' : '#fff' }}>
              {firstHour ? `${firstHour.predicted_demand_kw} kW` : '185.0 kW'}
            </strong>
          </div>
        </div>

        <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
          🎮 <strong>Controls</strong>: Click & Drag to orbit. Use <strong>W A S D</strong> or <strong>Arrow Keys</strong> to drive the inspection buggy!
        </div>
      </div>

      <Canvas camera={{ position: [0, 16, 20], fov: 45 }} shadows>
        <color attach="background" args={['#070a13']} />
        <ambientLight intensity={0.65} />
        <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />

        {/* Low-Poly Ground Island */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
          <planeGeometry args={[36, 36]} />
          <meshStandardMaterial color="#0c1220" roughness={0.9} metalness={0.1} />
        </mesh>

        {/* Grid helper */}
        <gridHelper args={[36, 36, '#1e293b', '#0f172a']} position={[0, 0.01, 0]} />

        {/* Elements */}
        <SolarFarm position={[-8, 0, -6]} />
        <BatteryBank position={[8, 0, -6]} soc={batterySoc} />
        <CentralSubstation position={[0, 0, 5]} isOverload={isOverload} gridMode={gridMode} />
        <PowerLines isRenewable={gridMode === 'RENEWABLE_STORAGE'} isOverload={isOverload} />
        <Buggy position={[0, 0.2, 0]} />

        <OrbitControls maxPolarAngle={Math.PI / 2.1} minDistance={8} maxDistance={32} />
      </Canvas>
    </div>
  );
};
