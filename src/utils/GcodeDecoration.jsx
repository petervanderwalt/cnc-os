import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

export function GcodeDecoration({ object, gcodeObject }) {
  const bbox = useMemo(() => new THREE.Box3().setFromObject(object), [object]);

  if (!object) return null;

  const unit = !gcodeObject?.inch ? ' mm' : ' in';

  const offsetY = -4;
  const lenLine = 5;
  const offsetX = -4;

  return (
    <group>
      {/* X axis line */}
      <line>
        <bufferGeometry
          attach="geometry"
          {...{
            attributes: {
              position: new THREE.Float32BufferAttribute(
                [
                  bbox.min.x, bbox.min.y + offsetY, 0,
                  bbox.min.x, bbox.min.y + offsetY - lenLine, 0,
                  bbox.min.x, bbox.min.y + offsetY - lenLine, 0,
                  bbox.max.x, bbox.min.y + offsetY - lenLine, 0,
                  bbox.max.x, bbox.min.y + offsetY - lenLine, 0,
                  bbox.max.x, bbox.min.y + offsetY, 0,
                ],
                3
              ),
            },
          }}
        />
        <lineBasicMaterial color="#555555" />
      </line>

      {/* X label */}
      <Text
        position={[bbox.min.x + 1, bbox.min.y + offsetY - lenLine - 6, 0]}
        fontSize={1.5}
        color="white"
        anchorX="left"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="black"
      >
        {'X ' + (bbox.max.x - bbox.min.x).toFixed(2) + unit}
      </Text>

      {/* Y axis line */}
      <line>
        <bufferGeometry
          attach="geometry"
          {...{
            attributes: {
              position: new THREE.Float32BufferAttribute(
                [
                  bbox.min.x + offsetX, bbox.min.y, 0,
                  bbox.min.x + offsetX - lenLine, bbox.min.y, 0,
                  bbox.min.x + offsetX - lenLine, bbox.min.y, 0,
                  bbox.min.x + offsetX - lenLine, bbox.max.y, 0,
                  bbox.min.x + offsetX - lenLine, bbox.max.y, 0,
                  bbox.min.x + offsetX, bbox.max.y, 0,
                ],
                3
              ),
            },
          }}
        />
        <lineBasicMaterial color="#555555" />
      </line>

      {/* Y label */}
      <Text
        position={[bbox.min.x + offsetX - lenLine - 3, bbox.min.y, 0]}
        fontSize={1.5}
        color="white"
        anchorX="center"
        anchorY="middle"
        rotation={[0, 0, Math.PI / 2]}
        outlineWidth={0.03}
        outlineColor="black"
      >
        {'Y ' + (bbox.max.y - bbox.min.y).toFixed(2) + unit}
      </Text>

      {/* Z axis line */}
      <line>
        <bufferGeometry
          attach="geometry"
          {...{
            attributes: {
              position: new THREE.Float32BufferAttribute(
                [
                  bbox.max.x, bbox.min.y, bbox.min.z,
                  bbox.max.x + lenLine, bbox.min.y, bbox.min.z,
                  bbox.max.x + lenLine, bbox.min.y, bbox.min.z,
                  bbox.max.x + lenLine, bbox.min.y, bbox.max.z,
                  bbox.max.x + lenLine, bbox.min.y, bbox.max.z,
                  bbox.max.x, bbox.min.y, bbox.max.z,
                ],
                3
              ),
            },
          }}
        />
        <lineBasicMaterial color="#555555" />
      </line>

      {/* Z label */}
      <Text
        position={[bbox.max.x + offsetX + lenLine + 5, bbox.min.y, 0]}
        fontSize={1.5}
        color="white"
        anchorX="left"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="black"
      >
        {'Z ' + (bbox.max.z - bbox.min.z).toFixed(2) + unit}
      </Text>
    </group>
  );
}
