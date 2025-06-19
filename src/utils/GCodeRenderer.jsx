import React, { useEffect, useState, useRef, useMemo, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import GCodeWorker from '../workers/gcview.worker.js?worker';
import { Html } from '@react-three/drei';




const GCodeLines = React.memo(({ linePoints }) => {
  const lineSegments = useMemo(() => {
    if (!linePoints || linePoints.length < 2) return null;

    const positions = [];
    const colors = [];
    const colorMap = {
      0: new THREE.Color(0x00cc00),
      1: new THREE.Color(0xcc0000),
      2: new THREE.Color(0x0000cc),
      3: new THREE.Color(0x0000cc),
    };

    for (let i = 1; i < linePoints.length; i++) {
      const p0 = linePoints[i - 1];
      const p1 = linePoints[i];

      positions.push(p0.x, p0.y, p0.z, p1.x, p1.y, p1.z);

      const c0 = colorMap[p0.g] || new THREE.Color(0x999999);
      const c1 = colorMap[p1.g] || new THREE.Color(0x999999);

      colors.push(c0.r, c0.g, c0.b, c1.r, c1.g, c1.b);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.5 });

    return new THREE.LineSegments(geometry, material);
  }, [linePoints]);

  return lineSegments ? <primitive object={lineSegments} /> : null;
});

const ActionIndicators = React.memo(({ extraObjects }) => {
  const config = {
    m3: { color: 'red', label: 'Tool On (M3)' },
    m4: { color: 'green', label: 'Tool On Reverse (M4)' },
    m5: { color: 'blue', label: 'Tool Off (M5)' },
    m7: { color: 'orange', label: 'Coolant Mist On (M7)' },
    m8: { color: 'cyan', label: 'Coolant Flood On (M8)' },
    m9: { color: 'gray', label: 'Coolant Off (M9)' },
  };

  if (!extraObjects) return null;

  return (
    <>
      {Object.entries(extraObjects).flatMap(([key, positions]) =>
        positions.map(([x, y, z], i) => (
          <mesh key={`${key}-${i}`} position={[x, y, z]}>
            <sphereGeometry args={[1.5, 12, 12]} />
            <meshBasicMaterial color={config[key]?.color || 'white'} />
            <Html position={[0, 2, 0]} center>
              <div
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  color: 'white',
                  padding: '4px 6px',
                  borderRadius: 4,
                  fontSize: 12,
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                }}
              >
                {config[key]?.label || key}
              </div>
            </Html>
          </mesh>
        ))
      )}
    </>
  );
});

const GCodeRenderer = forwardRef(({ gcodeText, setProgress, onUpdate }, ref) => {
  const hasUpdatedRef = useRef(false);
  const [parsedData, setParsedData] = useState(null);
  const workerRef = useRef(null);
  const groupRef = useRef(new THREE.Group());

  // Expose the THREE.Group ref to parent
  useImperativeHandle(ref, () => groupRef.current, []);

  useEffect(() => {
    if (!gcodeText) return;

    const worker = new GCodeWorker();
    workerRef.current = worker;

    worker.onmessage = (e) => {
      const { data } = e;

      if (typeof data === 'object' && 'progress' in data) {
        if (setProgress) setProgress(Number(data.progress));
        return;
      }

      try {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data;
        setParsedData(parsed);
      } catch (err) {
        console.warn('Failed to parse worker data:', err);
      }
    };

    worker.postMessage({ data: gcodeText });

    return () => worker.terminate();
  }, [gcodeText, setProgress]);

  useEffect(() => {
    if (!parsedData) {
      groupRef.current.clear();
      hasUpdatedRef.current = false;
      if (onUpdate) onUpdate(); // Let parent know group was cleared
      return;
    }

    const newGroup = new THREE.Group();

    // Create lines
    if (parsedData.linePoints && parsedData.linePoints.length > 1) {
      const positions = [];
      const colors = [];
      const colorMap = {
        0: new THREE.Color(0x00cc00),
        1: new THREE.Color(0xcc0000),
        2: new THREE.Color(0x0000cc),
        3: new THREE.Color(0x0000cc),
      };

      for (let i = 1; i < parsedData.linePoints.length; i++) {
        const p0 = parsedData.linePoints[i - 1];
        const p1 = parsedData.linePoints[i];
        positions.push(p0.x, p0.y, p0.z, p1.x, p1.y, p1.z);
        const c0 = colorMap[p0.g] || new THREE.Color(0x999999);
        const c1 = colorMap[p1.g] || new THREE.Color(0x999999);
        colors.push(c0.r, c0.g, c0.b, c1.r, c1.g, c1.b);
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

      const lines = new THREE.LineSegments(
        geo,
        new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.5 })
      );

      newGroup.add(lines);
    }

    // Add action indicators
    if (parsedData.extraObjects) {
      Object.entries(parsedData.extraObjects).forEach(([key, positions]) => {
        positions.forEach(([x, y, z], i) => {
          const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(1.5, 12, 12),
            new THREE.MeshBasicMaterial({ color: 'white' })
          );
          switch (key) {
            case 'm3': mesh.material.color.set('red'); break;
            case 'm4': mesh.material.color.set('green'); break;
            case 'm5': mesh.material.color.set('blue'); break;
            case 'm7': mesh.material.color.set('orange'); break;
            case 'm8': mesh.material.color.set('cyan'); break;
            case 'm9': mesh.material.color.set('gray'); break;
          }
          mesh.position.set(x, y, z);
          newGroup.add(mesh);
        });
      });
    }

    // Swap in new group
    groupRef.current.clear();
    groupRef.current.add(...newGroup.children);

    if (!hasUpdatedRef.current) {
      hasUpdatedRef.current = true;
      if (onUpdate) onUpdate();
    }

  }, [parsedData, onUpdate]);

  return <primitive object={groupRef.current} />;

});

export default GCodeRenderer;
