import React, { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function GalaxyLines() {
  const groupRef = useRef<THREE.Group>(null);

  // Animate the rotation of the galaxy
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002; // Rotate galaxy
      groupRef.current.rotation.x += 0.001; // Slight tilt
    }
  });

  // Generate random points and lines
  const lines = Array.from({ length: 100 }, () => {
    const points = [];
    for (let i = 0; i < 10; i++) {
      points.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10
        )
      );
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return geometry;
  });

  return (
    <group ref={groupRef}>
      {lines.map((geometry, index) => (
        <line key={index} color={`hsl(${Math.random() * 360}, 80%, 70%)`}>
          <bufferGeometry attach="geometry" {...geometry} />
          <lineBasicMaterial attach="material" />
        </line>
      ))}
    </group>
  );
}

export default function GalaxyEffect() {
  return (
    <Canvas
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: -1,
        width: "100%",
        height: "100%",
      }}
      camera={{ position: [0, 0, 20], fov: 75 }}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} />
      <GalaxyLines />
    </Canvas>
  );
}