import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function CuboTubularNeon() {
  const H = 0.9;
  const radius = 0.08;
  
  const vertices = [
    [-H, -H, -H], [H, -H, -H], [H, H, -H], [-H, H, -H],
    [-H, -H, H], [H, -H, H], [H, H, H], [-H, H, H]
  ];

  const aristas = [
    { pos: [0, -H, -H], rot: [0, 0, Math.PI / 2] },
    { pos: [0, H, -H], rot: [0, 0, Math.PI / 2] },
    { pos: [0, -H, H], rot: [0, 0, Math.PI / 2] },
    { pos: [0, H, H], rot: [0, 0, Math.PI / 2] },
    { pos: [-H, -H, 0], rot: [Math.PI / 2, 0, 0] },
    { pos: [H, -H, 0], rot: [Math.PI / 2, 0, 0] },
    { pos: [-H, H, 0], rot: [Math.PI / 2, 0, 0] },
    { pos: [H, H, 0], rot: [Math.PI / 2, 0, 0] },
    { pos: [-H, 0, -H], rot: [0, 0, 0] },
    { pos: [H, 0, -H], rot: [0, 0, 0] },
    { pos: [-H, 0, H], rot: [0, 0, 0] },
    { pos: [H, 0, H], rot: [0, 0, 0] }
  ];


  //cubo 
  return (
    <group>
      {vertices.map((pos, idx) => (
        <mesh key={`v-${idx}`} position={pos}>
          <sphereGeometry args={[radius * 1.1, 16, 16]} />
          <meshStandardMaterial 
            color={0xda70d6}      
            emissive={0xda70d6} 
            emissiveIntensity={1.8} 
            roughness={0.2}
          />
        </mesh>
      ))}
//tubos
      {aristas.map((arista, idx) => (
        <mesh key={`a-${idx}`} position={arista.pos} rotation={arista.rot}>
          <cylinderGeometry args={[radius, radius, H * 2, 16]} />
          <meshStandardMaterial 
            color={0xa855f7} 
            emissive={0xa855f7} 
            emissiveIntensity={1.8} 
            roughness={0.2}
          />
        </mesh>
      ))}

      <pointLight position={[0, 0, 0]} color="#24ca1e" intensity={2.5} distance={6} />
    </group>
  );
}

function EscenaFiguras() {
  const nudoRef = useRef();
  const cuboRef = useRef();

  const LIMITE_X = 6; 
  const LIMITE_Y = 3.5;

  useFrame(() => {
    const nudo = nudoRef.current;
    const cuboTubular = cuboRef.current;

    if (nudo && cuboTubular) {
      // MANTENER LA ROTACIÓN ACTUAL QUE YA FUNCIONA PERFECTO
      nudo.rotation.x += 0.01;
      nudo.rotation.y += 0.015;
      nudo.rotation.z += 0.005;

      cuboTubular.rotation.x += 0.01;
      cuboTubular.rotation.y += 0.015;
      cuboTubular.rotation.z += 0.005;

      // --- LOGICA DE MOVIMIENTO DIAGONAL (ESTILO DVD) ---
      [nudo, cuboTubular].forEach(fig => {
        fig.position.x += fig.userData.velX;
        fig.position.y += fig.userData.velY;

        // Rebote en bordes Izquierdo / Derecho (restando el radio para que no desaparezca)
        if (Math.abs(fig.position.x) > (LIMITE_X - fig.userData.radio)) {
          fig.userData.velX *= -1;
          fig.position.x = Math.sign(fig.position.x) * (LIMITE_X - fig.userData.radio);
        }
        // Rebote en bordes Superior / Inferior
        if (Math.abs(fig.position.y) > (LIMITE_Y - fig.userData.radio)) {
          fig.userData.velY *= -1;
          fig.position.y = Math.sign(fig.position.y) * (LIMITE_Y - fig.userData.radio);
        }
      });

      // --- FÍSICAS DE CHOQUE ELÁSTICO (EVITAR QUE SE ENCIMEN) ---
      const distancia = nudo.position.distanceTo(cuboTubular.position);
      const distanciaMinima = nudo.userData.radio + cuboTubular.userData.radio;

      if (distancia < distanciaMinima) {
        // 1. Intercambio de vectores de velocidad (Rebote de impacto)
        const tempVelX = nudo.userData.velX;
        const tempVelY = nudo.userData.velY;

        nudo.userData.velX = cuboTubular.userData.velX;
        nudo.userData.velY = cuboTubular.userData.velY;

        cuboTubular.userData.velX = tempVelX;
        cuboTubular.userData.velY = tempVelY;

        // 2. Separación inmediata para evitar que se queden pegados en bucle
        const overlap = distanciaMinima - distancia;
        const direccion = new THREE.Vector3().subVectors(cuboTubular.position, nudo.position).normalize();
        
        nudo.position.addScaledVector(direccion, -overlap * 0.5);
        cuboTubular.position.addScaledVector(direccion, overlap * 0.5);
      }
    }
  });

  return (
    <>
      {/* FIGURA 1: Nudo Toroidal Morado Metalizado (Sólido y Pulido) */}
      <mesh 
        ref={nudoRef} 
        position={[-2, 0, 0]}
        userData={{ velX: 0.025, velY: 0.018, radio: 1.6 }}
      >
        <torusKnotGeometry args={[1.0, 0.3, 100, 16]} />
        <meshStandardMaterial 
          color={0xa855f7} 
          roughness={0.12} 
          metalness={0.85} 
          envMapIntensity={1.0}
        />
      </mesh>

      {/* FIGURA 2: Cubo de Tubos Neón Lilas/Magentas */}
      <group 
        ref={cuboRef} 
        position={[2, 0, 0]}
        userData={{ velX: -0.022, velY: -0.020, radio: 1.4 }}
      >
        <CuboTubularNeon />
      </group>
    </>
  );
}

export default function FondoInteractivo3D() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: -1,
      backgroundColor: '#865699',
      overflow: 'hidden'
    }}>
      <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
        {/* Luz base para que nada se vea negro */}
        <ambientLight color={0xffffff} intensity={0.6} />
        
        {/* Luz fuerte para generar reflejos premium */}
        <directionalLight color={0xffffff} intensity={1.8} position={[5, 10, 7]} />
        
        {/* Luz puntual azul/lila para teñir los reflejos del entorno */}
        <pointLight color={0xa855f7} intensity={2.0} distance={50} position={[-5, -5, 5]} />
        
        <EscenaFiguras />
        
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
}
