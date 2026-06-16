import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const filterProps = (props) => {
  const filtered = { ...props };
  ['x-line-number', 'x-file-name', 'x-id', 'x-component', 'data-line-number', 'data-file-name'].forEach(key => delete filtered[key]);
  return filtered;
};

const FloatingLetter = (props) => {
  const { position, letter, onCollect } = filterProps(props);
  const meshRef = useRef();
  const textRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.2;
      meshRef.current.rotation.y += 0.02;
    }
  });

  const handleClick = () => {
    if (onCollect) {
      onCollect(letter);
    }
  };

  return (
    <group position={position} onClick={handleClick}>
      <mesh ref={meshRef}>
        <boxGeometry args={[0.8, 0.8, 0.1]} />
        <meshLambertMaterial color="#FFCC00" />
      </mesh>
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[0.6, 0.6]} />
        <meshBasicMaterial color="#111827" transparent opacity={0.8} />
      </mesh>
    </group>
  );
};

export default FloatingLetter;