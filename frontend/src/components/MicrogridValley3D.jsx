import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { 
  Zap, 
  Sun, 
  BatteryCharging, 
  Building2, 
  Car, 
  Wind, 
  Camera, 
  Compass, 
  Gauge, 
  Maximize2,
  Info,
  ChevronRight,
  Eye
} from 'lucide-react';
import { useMicrogrid } from '../context/MicrogridContext';

// ==========================================
// 1. DRIVABLE BUGGY WITH CHASE CAM SUPPORT
// ==========================================
function InspectionBuggy({ position = [0, 0.25, 0], chaseCam = false, setBuggyTelemetry }) {
  const meshRef = useRef();
  const [pos, setPos] = useState(new THREE.Vector3(...position));
  const [heading, setHeading] = useState(0);
  const keys = useRef({});
  const speedRef = useRef(0);

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

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    let turn = 0;
    let forward = 0;

    if (keys.current['w'] || keys.current['arrowup']) forward += 1;
    if (keys.current['s'] || keys.current['arrowdown']) forward -= 0.6;
    if (keys.current['a'] || keys.current['arrowleft']) turn += 1;
    if (keys.current['d'] || keys.current['arrowright']) turn -= 1;

    // Smooth speed interpolation
    const maxSpeed = 10;
    const accel = 18;
    const targetSpeed = forward * maxSpeed;
    speedRef.current = THREE.MathUtils.lerp(speedRef.current, targetSpeed, accel * delta);

    // Turn rate scales with movement
    if (Math.abs(speedRef.current) > 0.1) {
      const turnDir = speedRef.current >= 0 ? 1 : -1;
      setHeading((prev) => prev + turn * 2.8 * delta * turnDir);
    }

    // Update position
    pos.x -= Math.sin(heading) * speedRef.current * delta;
    pos.z -= Math.cos(heading) * speedRef.current * delta;

    pos.x = THREE.MathUtils.clamp(pos.x, -16, 16);
    pos.z = THREE.MathUtils.clamp(pos.z, -16, 16);

    meshRef.current.position.copy(pos);
    meshRef.current.rotation.y = heading;

    if (setBuggyTelemetry && Math.abs(speedRef.current) > 0.05) {
      setBuggyTelemetry({
        speed: (Math.abs(speedRef.current) * 3.6).toFixed(1),
        x: pos.x.toFixed(1),
        z: pos.z.toFixed(1)
      });
    }

    // Chase Cam handling
    if (chaseCam) {
      const offset = new THREE.Vector3(
        Math.sin(heading) * 6,
        3.2,
        Math.cos(heading) * 6
      );
      state.camera.position.lerp(pos.clone().add(offset), 0.1);
      state.camera.lookAt(pos.x, pos.y + 0.8, pos.z);
    }
  });

  return (
    <group ref={meshRef} position={position}>
      {/* Chassis Body */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[1.3, 0.45, 2.2]} />
        <meshStandardMaterial color="#ff5f14" roughness={0.25} metalness={0.8} />
      </mesh>

      {/* Cockpit Canopy */}
      <mesh position={[0, 0.72, -0.1]}>
        <boxGeometry args={[0.95, 0.45, 1.2]} />
        <meshStandardMaterial color="#0c1017" roughness={0.1} metalness={0.9} transparent opacity={0.85} />
      </mesh>

      {/* Front Bullbar */}
      <mesh position={[0, 0.28, -1.15]}>
        <boxGeometry args={[1.1, 0.15, 0.15]} />
        <meshStandardMaterial color="#334155" metalness={0.9} />
      </mesh>

      {/* LED Headlights */}
      {[-0.45, 0.45].map((x, i) => (
        <group key={i} position={[x, 0.4, -1.12]}>
          <mesh>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
          <spotLight
            color="#e0f2fe"
            intensity={3.5}
            distance={16}
            angle={0.45}
            penumbra={0.3}
            target-position={[x, 0, -10]}
          />
        </group>
      ))}

      {/* Rear Brake LEDs */}
      {[-0.45, 0.45].map((x, i) => (
        <mesh key={i} position={[x, 0.42, 1.12]}>
          <boxGeometry args={[0.18, 0.08, 0.05]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
      ))}

      {/* Heavy-Duty Rugged Wheels */}
      {[-0.72, 0.72].map((x, i) =>
        [-0.75, 0.75].map((z, j) => (
          <mesh key={`${i}-${j}`} position={[x, 0.22, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.26, 0.26, 0.3, 20]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} metalness={0.2} />
          </mesh>
        ))
      )}

      {/* Antenna */}
      <mesh position={[0.4, 1.2, 0.6]}>
        <cylinderGeometry args={[0.015, 0.015, 0.7]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} />
      </mesh>
    </group>
  );
}

// ==========================================
// 2. ROTATING WIND TURBINES
// ==========================================
function WindTurbine({ position = [0, 0, 0], scale = 1 }) {
  const rotorRef = useRef();

  useFrame((_, delta) => {
    if (rotorRef.current) {
      rotorRef.current.rotation.z += 1.8 * delta;
    }
  });

  return (
    <group position={position} scale={scale}>
      {/* Tower Mast */}
      <mesh position={[0, 4.5, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.38, 9, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Nacelle */}
      <mesh position={[0, 9.1, 0.3]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.7, 0.7, 1.6]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} />
      </mesh>

      {/* Rotor Hub */}
      <group position={[0, 9.1, 1.15]} ref={rotorRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.3, 16]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
        {/* 3 Aerodynamic Blades */}
        {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((angle, idx) => (
          <group key={idx} rotation={[0, 0, angle]}>
            <mesh position={[0, 2.4, 0]}>
              <boxGeometry args={[0.16, 4.8, 0.05]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.2} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

// ==========================================
// 3. DUAL-AXIS SOLAR PHOTOVOLTAIC FARM
// ==========================================
function SolarFarm({ position = [-8, 0, -6], solarWm2 = 600, onSelect }) {
  const farmRef = useRef();

  useFrame(({ clock }) => {
    if (farmRef.current) {
      farmRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.15) * 0.12;
    }
  });

  return (
    <group position={position} ref={farmRef} onClick={(e) => { e.stopPropagation(); onSelect && onSelect('solar'); }}>
      <Text position={[0, 3.8, 0]} fontSize={0.6} color="#fbbf24" anchorX="center" anchorY="middle">
        150 kW SOLAR ARRAY ({solarWm2} W/m²)
      </Text>

      {[-2, 0, 2].map((x, i) =>
        [-1.6, 1.6].map((z, j) => (
          <group key={`${i}-${j}`} position={[x * 1.6, 0, z * 1.5]}>
            {/* Mounting Steel Post */}
            <mesh position={[0, 0.9, 0]}>
              <cylinderGeometry args={[0.07, 0.07, 1.8]} />
              <meshStandardMaterial color="#64748b" metalness={0.85} />
            </mesh>
            {/* Photovoltaic Tilt Frame */}
            <mesh position={[0, 1.8, 0]} rotation={[0.42, 0, 0]} castShadow>
              <boxGeometry args={[1.9, 0.06, 1.3]} />
              <meshStandardMaterial color="#0369a1" roughness={0.15} metalness={0.88} />
            </mesh>
            {/* Inverter Box on pole */}
            <mesh position={[0, 0.7, 0.1]}>
              <boxGeometry args={[0.22, 0.35, 0.15]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.7} />
            </mesh>
          </group>
        ))
      )}
    </group>
  );
}

// ==========================================
// 4. LFP BATTERY ENERGY STORAGE (BESS)
// ==========================================
function BatteryStorageBay({ position = [8, 0, -6], soc = 85, isDischarging = false, onSelect }) {
  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onSelect && onSelect('battery'); }}>
      <Text position={[0, 4.4, 0]} fontSize={0.6} color="#34d399" anchorX="center" anchorY="middle">
        500 kWh BESS ({soc.toFixed(1)}% SoC)
      </Text>

      {[-1.6, 0, 1.6].map((x, i) => (
        <group key={i} position={[x * 1.6, 0, 0]}>
          {/* Main Enclosure (ISO Container Form Factor) */}
          <mesh position={[0, 1.6, 0]} castShadow>
            <boxGeometry args={[1.6, 3.2, 2.2]} />
            <meshStandardMaterial color="#1e293b" metalness={0.65} roughness={0.3} />
          </mesh>

          {/* Roof AC Chiller Unit */}
          <mesh position={[0, 3.35, 0]}>
            <boxGeometry args={[1.2, 0.3, 1.6]} />
            <meshStandardMaterial color="#475569" metalness={0.8} />
          </mesh>

          {/* Glowing SoC LED Fuel Gauge Bar */}
          {[0.8, 1.4, 2.0, 2.6].map((y, idx) => {
            const isLit = soc >= (idx + 1) * 22;
            const barColor = isDischarging ? '#ff5f14' : isLit ? '#10b981' : '#334155';
            return (
              <mesh key={idx} position={[0, y, 1.12]}>
                <boxGeometry args={[1.1, 0.18, 0.04]} />
                <meshBasicMaterial color={barColor} />
              </mesh>
            );
          })}
        </group>
      ))}
    </group>
  );
}

// ==========================================
// 5. CENTRAL 33kV SUBSTATION & AUTOMATION HUB
// ==========================================
function SubstationSwitchgear({ position = [0, 0, 4], isOverload = false, gridMode = 'MAIN_GRID', onSelect }) {
  const beaconRef = useRef();

  useFrame(({ clock }) => {
    if (beaconRef.current) {
      beaconRef.current.rotation.y = clock.getElapsedTime() * 4.5;
    }
  });

  const beaconColor = isOverload ? '#ef4444' : gridMode === 'RENEWABLE_STORAGE' ? '#ff5f14' : '#10b981';

  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onSelect && onSelect('substation'); }}>
      <Text position={[0, 4.6, 0]} fontSize={0.6} color={beaconColor} anchorX="center" anchorY="middle">
        {isOverload ? '⚠️ SUBSTATION OVERLOAD SPIKE' : gridMode === 'RENEWABLE_STORAGE' ? '⚡ 100% CLEAN BATTERY ISOLATION' : '🔌 33kV MAIN UTILITY GRID ACTIVE'}
      </Text>

      {/* Control Bunker */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <boxGeometry args={[4.4, 2.8, 3.6]} />
        <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.25} />
      </mesh>

      {/* Twin High-Voltage Transformers */}
      {[-1.4, 1.4].map((x, i) => (
        <group key={i} position={[x, 1.5, 2.4]}>
          <mesh>
            <cylinderGeometry args={[0.55, 0.55, 1.5, 16]} />
            <meshStandardMaterial color="#334155" metalness={0.9} />
          </mesh>
          {/* Ceramic Insulator Bushings */}
          {[-0.2, 0.2].map((bx, j) => (
            <mesh key={j} position={[bx, 1.1, 0]}>
              <cylinderGeometry args={[0.1, 0.12, 0.7, 8]} />
              <meshStandardMaterial color="#78350f" roughness={0.3} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Emergency Beacon */}
      <group position={[0, 3.2, 0]} ref={beaconRef}>
        <mesh>
          <coneGeometry args={[0.3, 0.6, 16]} />
          <meshBasicMaterial color={beaconColor} />
        </mesh>
        <pointLight color={beaconColor} intensity={isOverload ? 6 : 3} distance={14} />
      </group>
    </group>
  );
}

// ==========================================
// 6. EV SMART CHARGING STATION PLAZA
// ==========================================
function EVChargingPlaza({ position = [-8, 0, 4], onSelect }) {
  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onSelect && onSelect('ev'); }}>
      <Text position={[0, 3.4, 0]} fontSize={0.55} color="#38bdf8" anchorX="center" anchorY="middle">
        EV SMART CHARGER HUB (150 kW)
      </Text>

      {/* Solar Canopy Roof */}
      <mesh position={[0, 2.5, 0]} rotation={[0.08, 0, 0]}>
        <boxGeometry args={[4.2, 0.12, 3.0]} />
        <meshStandardMaterial color="#0284c7" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Canopy Support Columns */}
      {[-1.8, 1.8].map((x, i) => (
        <mesh key={i} position={[x, 1.2, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 2.4]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.8} />
        </mesh>
      ))}

      {/* Fast Charging Dispensers */}
      {[-1.0, 1.0].map((x, i) => (
        <group key={i} position={[x, 0.8, -0.8]}>
          <mesh>
            <boxGeometry args={[0.4, 1.6, 0.35]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          {/* Glowing Status Screen */}
          <mesh position={[0, 0.3, 0.18]}>
            <boxGeometry args={[0.26, 0.35, 0.02]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        </group>
      ))}

      {/* Parked EV Model */}
      <group position={[0, 0.3, 0.6]}>
        <mesh castShadow>
          <boxGeometry args={[1.3, 0.5, 2.2]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.2} metalness={0.7} />
        </mesh>
        <mesh position={[0, 0.45, -0.1]}>
          <boxGeometry args={[1.0, 0.4, 1.1]} />
          <meshStandardMaterial color="#0f172a" roughness={0.1} />
        </mesh>
      </group>
    </group>
  );
}

// ==========================================
// 7. SMART CITY MICROGRID CONSUMER BUILDINGS
// ==========================================
function SmartCityLoads({ position = [8, 0, 4], demandKw = 180, onSelect }) {
  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onSelect && onSelect('community'); }}>
      <Text position={[0, 4.6, 0]} fontSize={0.55} color="var(--color-cyan)" anchorX="center" anchorY="middle">
        COMMUNITY LOADS ({demandKw.toFixed(0)} kW)
      </Text>

      {/* Building 1: Commercial Tech Block */}
      <mesh position={[-1.2, 1.8, 0]} castShadow>
        <boxGeometry args={[2.0, 3.6, 2.2]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Building 2: Residential Complex */}
      <mesh position={[1.2, 1.4, 0.2]} castShadow>
        <boxGeometry args={[1.8, 2.8, 2.0]} />
        <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Glowing Window Strips */}
      {[-1.2, 1.2].map((x, i) =>
        [0.8, 1.6, 2.4].map((y, j) => (
          <mesh key={`${i}-${j}`} position={[x, y, 1.12]}>
            <boxGeometry args={[1.2, 0.25, 0.02]} />
            <meshBasicMaterial color="#fef08a" />
          </mesh>
        ))
      )}
    </group>
  );
}

// ==========================================
// 8. ANIMATED POWER CONDUITS WITH TRAVELING PARTICLES
// ==========================================
function AnimatedPowerConduits({ gridMode = 'MAIN_GRID', isOverload = false }) {
  const isRenewable = gridMode === 'RENEWABLE_STORAGE';
  const cableColor = isOverload ? '#ef4444' : isRenewable ? '#ff5f14' : '#38bdf8';

  const particleRef1 = useRef();
  const particleRef2 = useRef();

  useFrame(({ clock }) => {
    const t = (clock.getElapsedTime() * 0.8) % 1;
    if (particleRef1.current) {
      particleRef1.current.position.set(
        THREE.MathUtils.lerp(-8, 0, t),
        0.18,
        THREE.MathUtils.lerp(-6, 4, t)
      );
    }
    if (particleRef2.current) {
      particleRef2.current.position.set(
        THREE.MathUtils.lerp(8, 0, t),
        0.18,
        THREE.MathUtils.lerp(-6, 4, t)
      );
    }
  });

  return (
    <group>
      {/* Cable 1: Solar to Substation */}
      <mesh position={[-4, 0.08, -1]} rotation={[0, 0.89, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 13, 8]} />
        <meshBasicMaterial color={cableColor} />
      </mesh>

      {/* Cable 2: Battery to Substation */}
      <mesh position={[4, 0.08, -1]} rotation={[0, -0.89, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 13, 8]} />
        <meshBasicMaterial color={cableColor} />
      </mesh>

      {/* Cable 3: Substation to EV Hub */}
      <mesh position={[-4, 0.08, 4]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 8, 8]} />
        <meshBasicMaterial color={cableColor} />
      </mesh>

      {/* Cable 4: Substation to Community Loads */}
      <mesh position={[4, 0.08, 4]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 8, 8]} />
        <meshBasicMaterial color={cableColor} />
      </mesh>

      {/* Flowing Pulse Particles */}
      <mesh ref={particleRef1}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshBasicMaterial color="#ff5f14" />
      </mesh>
      <mesh ref={particleRef2}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>
    </group>
  );
}

// ==========================================
// MAIN 3D VALLEY CONTAINER COMPONENT
// ==========================================
export const MicrogridValley3D = () => {
  const { forecastData, batterySoc, currentHourData, overrideMode } = useMicrogrid();
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [cameraMode, setCameraMode] = useState('overview'); // 'overview' | 'solar' | 'battery' | 'substation' | 'buggy'
  const [buggyTelemetry, setBuggyTelemetry] = useState({ speed: '0.0', x: '0.0', z: '0.0' });

  const activeHour = currentHourData || forecastData?.hourly_forecasts?.[0] || {};
  const isOverload = Boolean(activeHour?.is_critical_overload);
  const rawMode = activeHour?.grid_mode || 'MAIN_GRID';
  const effectiveMode = overrideMode === 'AUTO' 
    ? rawMode 
    : overrideMode === 'FORCE_RENEWABLE' ? 'RENEWABLE_STORAGE' : 'MAIN_GRID';

  const demandKw = Number(activeHour?.predicted_demand_kw || 185);
  const solarWm2 = Number(activeHour?.solar_irradiance_wm2 || 620);

  // Camera presets
  const cameraPositions = {
    overview: [0, 18, 22],
    solar: [-10, 8, 0],
    battery: [10, 8, 0],
    substation: [0, 8, 12],
    buggy: [0, 5, 8]
  };

  const assetDetails = {
    solar: {
      title: 'Solar Photovoltaic Array (150 kWp)',
      specs: [
        { label: 'Irradiance', val: `${solarWm2} W/m²` },
        { label: 'Generation', val: `${((solarWm2 / 1000) * 150).toFixed(1)} kW` },
        { label: 'Tracking', val: 'Dual-Axis Azimuth' },
        { label: 'Inverter Eff.', val: '98.6%' }
      ],
      desc: 'High-efficiency monocrystalline solar field directly replenishing battery banks and powering daytime campus demand.'
    },
    battery: {
      title: 'Lithium-Iron Phosphate BESS (500 kWh)',
      specs: [
        { label: 'State of Charge', val: `${batterySoc.toFixed(1)}%` },
        { label: 'Reserve Floor', val: '15.0% Emergency Limit' },
        { label: 'Thermal Loop', val: 'Liquid Cooled (23.8°C)' },
        { label: 'Dispatch', val: effectiveMode === 'RENEWABLE_STORAGE' ? 'Active Discharging' : 'Standby Absorption' }
      ],
      desc: 'Utility-scale energy storage buffer eliminating peak substation charges during the 18:00–22:00 window.'
    },
    substation: {
      title: 'Central 33kV Automated Coupler & Feeder',
      specs: [
        { label: 'Busbar Voltage', val: '33.2 kV' },
        { label: 'Grid Mode', val: effectiveMode },
        { label: 'Transfer Speed', val: '< 10 ms Sub-Cycle' },
        { label: 'Overload Status', val: isOverload ? 'CRITICAL RISK (>200kW)' : 'Normal Envelope' }
      ],
      desc: 'Automated circuit interlocks executing deterministic rule switching based on real-time QuickML forecasts.'
    },
    ev: {
      title: 'EV Smart Fast-Charging Plaza',
      specs: [
        { label: 'Charger Capacity', val: '150 kW DC Fast' },
        { label: 'Vehicle Load', val: `${(demandKw * 0.22).toFixed(1)} kW` },
        { label: 'Tariff State', val: effectiveMode === 'RENEWABLE_STORAGE' ? 'Buffered Clean Power' : 'Standard Utility' },
        { label: 'Optimization', val: 'AI Smart Scheduled' }
      ],
      desc: 'Demand-response charging hub dynamically scheduled to absorb surplus solar generation and avoid evening spikes.'
    },
    community: {
      title: 'Smart Community & Microgrid Feeder',
      specs: [
        { label: 'Active Demand', val: `${demandKw.toFixed(1)} kW` },
        { label: 'Peak Threshold', val: '160.0 kW' },
        { label: 'Critical Boundary', val: '200.0 kW' },
        { label: 'Clean Share', val: `${effectiveMode === 'RENEWABLE_STORAGE' ? '100%' : 'Solar Augmented'}` }
      ],
      desc: 'Real-time aggregated residential and commercial loads protected from grid outages through automated microgrid isolation.'
    }
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: 'calc(100vh - 120px)',
      background: '#070a12',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
      border: '1px solid var(--border-grid)'
    }}>
      {/* Top Left: CROX Precision HUD & Telemetry */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 10,
        background: 'rgba(12, 14, 18, 0.92)',
        backdropFilter: 'var(--backdrop-blur)',
        border: '1px solid var(--border-grid)',
        borderRadius: 'var(--radius-sm)',
        padding: '16px 20px',
        maxWidth: '360px',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="pulse-dot" style={{ color: effectiveMode === 'RENEWABLE_STORAGE' ? '#ff5f14' : '#10b981' }}></span>
            <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#fff', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              CROX 3D TWIN // VALLEY
            </span>
          </div>
          <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>LIVE PHYSICS</span>
        </div>

        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: '0 0 12px' }}>
          Interactive physics simulation of microgrid generation, storage, and automated switching rules.
        </p>

        {/* Live Telemetry Data Readout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', background: '#090b0e', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>GRID DISPATCH:</span>
            <div style={{ fontWeight: 700, color: effectiveMode === 'RENEWABLE_STORAGE' ? '#ff5f14' : '#10b981' }}>
              {effectiveMode}
            </div>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>BESS SOC:</span>
            <div style={{ fontWeight: 700, color: '#38bdf8' }}>
              {batterySoc.toFixed(1)}%
            </div>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>COMMUNITY LOAD:</span>
            <div style={{ fontWeight: 700, color: isOverload ? '#ef4444' : '#fff' }}>
              {demandKw.toFixed(1)} kW
            </div>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>SOLAR IRRADIANCE:</span>
            <div style={{ fontWeight: 700, color: '#fbbf24' }}>
              {solarWm2.toFixed(0)} W/m²
            </div>
          </div>
        </div>

        {/* Buggy HUD */}
        <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
          <span>BUGGY SPEED: <strong style={{ color: 'var(--color-precision-orange)' }}>{buggyTelemetry.speed} KM/H</strong></span>
          <span>POS: <strong style={{ color: '#fff' }}>[{buggyTelemetry.x}, {buggyTelemetry.z}]</strong></span>
        </div>

        <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          🎮 Drive: <kbd style={{ background: '#1e293b', padding: '1px 5px', borderRadius: '3px' }}>W</kbd> <kbd style={{ background: '#1e293b', padding: '1px 5px', borderRadius: '3px' }}>A</kbd> <kbd style={{ background: '#1e293b', padding: '1px 5px', borderRadius: '3px' }}>S</kbd> <kbd style={{ background: '#1e293b', padding: '1px 5px', borderRadius: '3px' }}>D</kbd> or Arrows. Click objects to inspect.
        </div>
      </div>

      {/* Top Right: Camera Presets Toolbar */}
      <div style={{
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 10,
        display: 'flex',
        gap: '6px',
        background: 'rgba(12, 14, 18, 0.9)',
        padding: '6px',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-grid)'
      }}>
        {[
          { id: 'overview', label: 'Overview', icon: Eye },
          { id: 'solar', label: 'Solar Farm', icon: Sun },
          { id: 'battery', label: 'BESS Bay', icon: BatteryCharging },
          { id: 'substation', label: 'Substation', icon: Zap },
          { id: 'buggy', label: 'Chase Cam', icon: Car },
        ].map((btn) => {
          const Icon = btn.icon;
          const isActive = cameraMode === btn.id;
          return (
            <button
              key={btn.id}
              onClick={() => {
                setCameraMode(btn.id);
                if (btn.id !== 'overview') setSelectedAsset(btn.id);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: isActive ? 'var(--color-precision-orange)' : 'transparent',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '0.74rem',
                fontWeight: 600,
                fontFamily: 'var(--font-mono)',
                transition: 'var(--transition)'
              }}
            >
              <Icon size={13} />
              <span>{btn.label}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom Floating Telemetry Inspection Drawer (when an asset is selected) */}
      {selectedAsset && assetDetails[selectedAsset] && (
        <div style={{
          position: 'absolute',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          background: 'rgba(12, 14, 18, 0.95)',
          border: '1px solid var(--border-grid)',
          borderRadius: 'var(--radius-sm)',
          padding: '16px 24px',
          width: '90%',
          maxWidth: '780px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.7)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--color-precision-orange)', fontWeight: 800 }}>[ SPEC // ACTIVE ]</span>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: 0, textTransform: 'uppercase' }}>
                {assetDetails[selectedAsset].title}
              </h4>
            </div>
            <button
              onClick={() => setSelectedAsset(null)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              ✕ Close
            </button>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 12px', lineHeight: 1.4 }}>
            {assetDetails[selectedAsset].desc}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            {assetDetails[selectedAsset].specs.map((s, idx) => (
              <div key={idx} style={{ background: '#080a0e', padding: '8px 12px', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                  {s.label}
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                  {s.val}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: cameraPositions[cameraMode] || [0, 18, 22], fov: 45 }}
        shadows
        onClick={() => setSelectedAsset(null)}
      >
        <color attach="background" args={['#080b12']} />
        
        {/* Dynamic Sun Lighting */}
        <ambientLight intensity={solarWm2 > 100 ? 0.75 : 0.25} />
        <directionalLight
          position={[12, 22, 10]}
          intensity={solarWm2 > 100 ? 1.8 : 0.4}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        {/* Low-Poly Ground Plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
          <planeGeometry args={[44, 44]} />
          <meshStandardMaterial color="#0c1017" roughness={0.9} metalness={0.15} />
        </mesh>

        {/* Industrial CAD Grid Lines */}
        <gridHelper args={[44, 44, 'rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.04)']} position={[0, 0.01, 0]} />

        {/* 3D Components */}
        <SolarFarm position={[-8, 0, -6]} solarWm2={solarWm2} onSelect={setSelectedAsset} />
        <BatteryStorageBay position={[8, 0, -6]} soc={batterySoc} isDischarging={effectiveMode === 'RENEWABLE_STORAGE'} onSelect={setSelectedAsset} />
        <SubstationSwitchgear position={[0, 0, 4]} isOverload={isOverload} gridMode={effectiveMode} onSelect={setSelectedAsset} />
        <EVChargingPlaza position={[-8, 0, 4]} onSelect={setSelectedAsset} />
        <SmartCityLoads position={[8, 0, 4]} demandKw={demandKw} onSelect={setSelectedAsset} />
        <AnimatedPowerConduits gridMode={effectiveMode} isOverload={isOverload} />

        {/* Twin Ridge Wind Turbines */}
        <WindTurbine position={[-14, 0, 12]} scale={0.8} />
        <WindTurbine position={[14, 0, 12]} scale={0.8} />

        {/* Driveable Inspection Vehicle */}
        <InspectionBuggy
          position={[0, 0.25, 0]}
          chaseCam={cameraMode === 'buggy'}
          setBuggyTelemetry={setBuggyTelemetry}
        />

        {/* Orbit Controls (disabled if chase cam active) */}
        {!['buggy'].includes(cameraMode) && (
          <OrbitControls
            maxPolarAngle={Math.PI / 2.15}
            minDistance={6}
            maxDistance={36}
          />
        )}
      </Canvas>
    </div>
  );
};
