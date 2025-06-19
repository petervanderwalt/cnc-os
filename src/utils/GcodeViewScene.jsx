import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';

export function StaticGrid({
  xmin = -200, ymin = -200, xmax = 200, ymax = 200,
  unit = 'mm',
  margin = 20,
  opacity = 0.2,
}) {

  // console.log("StaticGrid bounds:", xmin, ymin, xmax, ymax);

  // Utility snaps
  const snapDown = (v, step) => Math.floor(v / step) * step;
  const snapUp = (v, step) => Math.ceil(v / step) * step;

  const { positions, colors } = useMemo(() => {
    const step = unit === 'mm' ? 10 : 0.25 * 25.4;
    const majorStep = unit === 'mm' ? 100 : 25.4;

    let minX = snapDown(xmin - margin, step);
    let maxX = snapUp(xmax + margin, step);
    let minY = snapDown(ymin - margin, step);
    let maxY = snapUp(ymax + margin, step);

    const xDivs = Math.round((maxX - minX) / step);
    const yDivs = Math.round((maxY - minY) / step);

    const posArray = [];
    const colorArray = [];

    const colorMinor = new THREE.Color(0x8d8c9c).convertSRGBToLinear();
    const colorMajor = new THREE.Color(0x232023).convertSRGBToLinear();

    // Vertical lines
    for (let i = 0; i <= xDivs; i++) {
      const x = minX + i * step;
      posArray.push(x, minY, 0, x, maxY, 0);
      const isMajor = Math.abs(x % majorStep) < 1e-3;
      const color = isMajor ? colorMajor : colorMinor;
      colorArray.push(...color.toArray(), ...color.toArray());
    }

    // Horizontal lines
    for (let i = 0; i <= yDivs; i++) {
      const y = minY + i * step;
      posArray.push(minX, y, 0, maxX, y, 0);
      const isMajor = Math.abs(y % majorStep) < 1e-3;
      const color = isMajor ? colorMajor : colorMinor;
      colorArray.push(...color.toArray(), ...color.toArray());
    }

    return {
      positions: new Float32Array(posArray),
      colors: new Float32Array(colorArray),
    };
  }, [xmin, ymin, xmax, ymax, unit, margin]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [positions, colors]);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial
        vertexColors
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </lineSegments>
  );
}


export function AxisIndicator({ length = 50 }) {
  const axes = useMemo(() => {
    const axesGroup = [];

    function createAxis(dir, colorHex, label) {
      const dirVec = new THREE.Vector3(...dir).normalize();
      const linePoints = [
        new THREE.Vector3(0, 0, 0),
        dirVec.clone().multiplyScalar(length),
      ];

      const color = new THREE.Color(colorHex);

      axesGroup.push(
        // Axis line
        <line key={label + '-line'}>
          <bufferGeometry attach="geometry" >
            <bufferAttribute
              attach="attributes-position"
              count={linePoints.length}
              array={new Float32Array(linePoints.flatMap(p => [p.x, p.y, p.z]))}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial attach="material" color={color} transparent opacity={0.6} />
        </line>
      );

      // Arrow cone
      const conePosition = dirVec.clone().multiplyScalar(length);
      const coneRotation = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        dirVec
      );

      axesGroup.push(
        <mesh
          key={label + '-cone'}
          position={conePosition}
          quaternion={coneRotation}
          scale={length * 0.05}
        >
          <coneGeometry args={[1, 3, 12]} />
          <meshBasicMaterial color={color} transparent opacity={0.6} />
        </mesh>
      );

      // Label using HTML overlay
      axesGroup.push(
        <Html
          key={label + '-label'}
          position={dirVec.clone().multiplyScalar(length + 5).toArray()}
          style={{
            backgroundColor: 'rgba(0,0,0,0.6)',
            color: 'white',
            padding: '4px 6px',
            borderRadius: 4,
            fontSize: '0.75em',
            whiteSpace: 'nowrap',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
          center
        >
          {label}
        </Html>
      );
    }

    createAxis([1, 0, 0], 0xdc3545, 'X+');
    createAxis([0, 1, 0], 0x198754, 'Y+');
    createAxis([0, 0, 1], 0x0d6efd, 'Z+');

    return axesGroup;
  }, [length]);

  return <group>{axes}</group>;
}
