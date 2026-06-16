import React from 'react';

const FloatingIsland = () => {
  return (
    <group>
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <cylinderGeometry args={[12, 10, 1, 32]} />
        <meshLambertMaterial color="#4CD964" />
      </mesh>
      
      <mesh position={[0, -1.2, 0]}>
        <cylinderGeometry args={[9, 7, 1.5, 32]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>
      
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 3, 8]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>
      
      <mesh position={[0, 2.5, 0]} castShadow>
        <sphereGeometry args={[0.8, 8, 8]} />
        <meshLambertMaterial color="#4CD964" />
      </mesh>
      <mesh position={[0, 3.2, 0]} castShadow>
        <sphereGeometry args={[0.7, 8, 8]} />
        <meshLambertMaterial color="#4CD964" />
      </mesh>
      <mesh position={[0, 3.8, 0]} castShadow>
        <sphereGeometry args={[0.6, 8, 8]} />
        <meshLambertMaterial color="#4CD964" />
      </mesh>
      
      <mesh position={[-5, 1, -3]} castShadow>
        <cylinderGeometry args={[1.5, 1.5, 0.5, 16]} />
        <meshLambertMaterial color="#007AFF" />
      </mesh>
      
      <mesh position={[5, 1, -2]} castShadow>
        <cylinderGeometry args={[1.5, 1.5, 0.5, 16]} />
        <meshLambertMaterial color="#FF3B30" />
      </mesh>
      
      <mesh position={[0, 1, 5]} castShadow>
        <cylinderGeometry args={[1.5, 1.5, 0.5, 16]} />
        <meshLambertMaterial color="#FFCC00" />
      </mesh>
    </group>
  );
};

export default FloatingIsland;