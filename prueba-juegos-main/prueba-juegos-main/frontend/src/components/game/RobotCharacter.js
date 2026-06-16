import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const filterProps = (props) => {
  const filtered = { ...props };
  ['x-line-number', 'x-file-name', 'x-id', 'x-component', 'data-line-number', 'data-file-name'].forEach(key => delete filtered[key]);
  return filtered;
};

const RobotCharacter = (props) => {
  const { position, rotation, isMoving, isJumping } = filterProps(props);
  const groupRef = useRef();
  const bodyRef = useRef();
  const headRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.set(position[0], position[1], position[2]);
      groupRef.current.rotation.y = rotation;
    }

    if (isMoving && !isJumping) {
      const walkCycle = Math.sin(state.clock.elapsedTime * 10) * 0.3;
      if (leftArmRef.current) leftArmRef.current.rotation.x = walkCycle;
      if (rightArmRef.current) rightArmRef.current.rotation.x = -walkCycle;
      if (bodyRef.current) {
        bodyRef.current.position.y = 0.6 + Math.abs(Math.sin(state.clock.elapsedTime * 10)) * 0.05;
      }
    } else {
      if (leftArmRef.current) leftArmRef.current.rotation.x = 0;
      if (rightArmRef.current) rightArmRef.current.rotation.x = 0;
      if (bodyRef.current && !isJumping) bodyRef.current.position.y = 0.6;
    }

    if (headRef.current && !isMoving) {
      headRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={bodyRef} position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[0.6, 0.8, 0.4]} />
        <meshLambertMaterial color="#007AFF" />
      </mesh>
      
      <mesh ref={headRef} position={[0, 1.3, 0]} castShadow>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshLambertMaterial color="#FFFFFF" />
      </mesh>
      
      <mesh position={[-0.15, 1.35, 0.3]}>
        <circleGeometry args={[0.1, 16]} />
        <meshBasicMaterial color="#FFCC00" />
      </mesh>
      <mesh position={[0.15, 1.35, 0.3]}>
        <circleGeometry args={[0.1, 16]} />
        <meshBasicMaterial color="#FFCC00" />
      </mesh>
      
      <mesh ref={leftArmRef} position={[-0.45, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.6, 8]} />
        <meshLambertMaterial color="#007AFF" />
      </mesh>
      <mesh ref={rightArmRef} position={[0.45, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.6, 8]} />
        <meshLambertMaterial color="#007AFF" />
      </mesh>
      
      <mesh position={[-0.2, 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.4, 8]} />
        <meshLambertMaterial color="#007AFF" />
      </mesh>
      <mesh position={[0.2, 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.4, 8]} />
        <meshLambertMaterial color="#007AFF" />
      </mesh>
    </group>
  );
};

export default RobotCharacter;