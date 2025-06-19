export const width = 600;
export const height = 600;
export const displayName = "3D Viewer";
export const allowResize = true;

import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, OrthographicCamera, GizmoHelper } from '@react-three/drei';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import GCodeRenderer from '../utils/GCodeRenderer'; // New component you’ll make to load & render G-code

import { StaticGrid, AxisIndicator } from '../utils/GcodeViewScene';
import { GcodeDecoration } from '../utils/GcodeDecoration';


export default function GCodeView() {
  const [cameraType, setCameraType] = useState('perspective');
  const perspectiveRef = useRef();
  const orthoRef = useRef();
  const controlsRef = useRef();
  const gcodeGroupRef = useRef();
  const [gcode, setGcode] = useState(null); // for 3d renderer
  const [gcodeObject, setGcodeObject] = useState(null); // for decoration
  const [progress, setProgress] = useState(null);
  const [showProgress, setShowProgress] = useState(false);

  // Whenever progress updates:
  useEffect(() => {
    if (progress === null) {
      setShowProgress(false);
      return;
    }
    setShowProgress(true);

    if (progress >= 100) {
      const timeout = setTimeout(() => {
        setShowProgress(false);
        setProgress(null); // reset if you want
      }, 1000); // 1 second delay

      return () => clearTimeout(timeout);
    }
  }, [progress]);

  // When gcode object updates
  const [gridBounds, setGridBounds] = useState({
    xmin: -200,
    ymin: -200,
    xmax: 200,
    ymax: 200,
  });

  const onGCodeUpdate = () => {
    const group = gcodeGroupRef.current;
    if (group) {
      const box = new THREE.Box3().setFromObject(group);
      if (!box.isEmpty()) {
        setGridBounds({
          xmin: box.min.x,
          ymin: box.min.y,
          xmax: box.max.x,
          ymax: box.max.y,
        });
        setGcodeObject(group.userData?.parsedData || null); // You’ll add this next
        resetCamera()
      }
    }
  };


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => setGcode(evt.target.result);
    reader.readAsText(file);
  };

  function resetCamera() {
    // With smooth animation
    const cam = cameraType === 'perspective' ? perspectiveRef.current : orthoRef.current;
    const controls = controlsRef.current;
    const object = gcodeGroupRef.current;

    if (!cam || !controls || !object) {
      console.log("Problem with cam, control, object");
      console.log(cam, controls, object);
      return;
    }

    const box = new THREE.Box3().setFromObject(object);

    if (box.isEmpty()) {
      console.warn("Object has no geometry or bounding box is empty");
      return;
    }

    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    const offset = 1.25;

    // Calculate final target positions for camera and controls
    let finalCamPos = new THREE.Vector3();
    let finalTarget = center.clone();

    if (cam.isPerspectiveCamera) {
      const maxSize = Math.max(size.x, size.y, size.z);
      const fov = cam.fov * (Math.PI / 180);
      let cameraDistance = maxSize / (2 * Math.tan(fov / 2));
      cameraDistance *= offset;

      // Camera looks towards -Z, so position along +Z axis at distance
      const direction = new THREE.Vector3(0, 0, 1);
      finalCamPos.copy(direction.multiplyScalar(cameraDistance).add(center));
    } else if (cam.isOrthographicCamera) {
      const maxSize = Math.max(size.x, size.y);
      const aspect = (cam.right - cam.left) / (cam.top - cam.bottom);
      if (aspect >= 1) {
        cam.zoom = (cam.right / maxSize) * offset;
      } else {
        cam.zoom = (cam.top / maxSize) * offset;
      }
      finalCamPos.set(center.x, center.y, cam.position.z);
    } else {
      console.warn("Unsupported camera type");
      return;
    }

    // Store starting positions
    const startCamPos = cam.position.clone();
    const startTarget = controls.target.clone();

    const duration = 1000; // ms
    let startTime = null;

    function animate(time) {
      if (!startTime) startTime = time;
      const elapsed = time - startTime;
      const t = Math.min(elapsed / duration, 1);

      // Ease in-out cubic function for smoothness
      const easeT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      // Interpolate camera position and controls target
      cam.position.lerpVectors(startCamPos, finalCamPos, easeT);
      controls.target.lerpVectors(startTarget, finalTarget, easeT);

      cam.updateProjectionMatrix();
      controls.update();

      if (t < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }


  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* UI Controls */}
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 10 }} className="p-2 bg-light border rounded d-flex gap-2 align-items-center">
        <select
          className="form-select form-select-sm"
          value={cameraType}
          onChange={(e) => setCameraType(e.target.value)}
        >
          <option value="perspective">Perspective</option>
          <option value="orthographic">Orthographic</option>
        </select>

        <button className="btn btn-sm btn-outline-dark" onClick={resetCamera}>
          <i className="fas fa-crosshairs"></i>
        </button>

        <label className="btn btn-sm btn-outline-secondary mb-0">
          <i className="fas fa-upload me-1"></i> Load
          <input type="file" accept=".gcode" hidden onChange={handleFileChange} />
        </label>
      </div>

      {/* Bootstrap Progress Bar */}
      {showProgress && (
        <div className="position-absolute w-100" style={{ bottom: 0, zIndex: 10 }}>
          <div className="progress" style={{ height: '6px' }}>
            <div
              className="progress-bar bg-dark"
              role="progressbar"
              style={{ width: `${progress}%`, transition: 'width 0.2s linear' }}
              aria-valuenow={progress}
              aria-valuemin="0"
              aria-valuemax="100"
            />
          </div>
        </div>
      )}

      {/* ThreeJS Canvas */}
      <Canvas
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0); // black background fully transparent
        }}
        style={{ width: '100%', height: '100%' }}
      >

        {cameraType === 'perspective' ? (
          <PerspectiveCamera ref={perspectiveRef} makeDefault position={[0, 0, 300]} />
        ) : (
          <OrthographicCamera
            ref={orthoRef}
            makeDefault
            position={[0, 0, 300]}
            zoom={1}
          />
        )}

        <ambientLight intensity={0.5} />
        <directionalLight position={[100, 200, 100]} intensity={0.75} />
        <OrbitControls ref={controlsRef} />

        <StaticGrid
          xmin={gridBounds.xmin}
          ymin={gridBounds.ymin}
          xmax={gridBounds.xmax}
          ymax={gridBounds.ymax}
          unit="mm"
          margin={20}
          opacity={0.2}
        />
        <AxisIndicator length={50} />

        {/* Render G-code geometry */}
        <GCodeRenderer
          gcodeText={gcode}
          setProgress={setProgress}
          ref={gcodeGroupRef}
          onUpdate={onGCodeUpdate}
        />
      </Canvas>
    </div>
  );
}
