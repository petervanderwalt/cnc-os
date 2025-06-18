// 3dview.js

import * as THREE from 'three';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/controls/OrbitControls.js';

import { TransformControls } from 'https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/controls/TransformControls.js';
import { STLLoader } from 'https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/loaders/STLLoader.js';
// Tooltips
import { CSS2DRenderer, CSS2DObject } from 'https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/renderers/CSS2DRenderer.js';
// Font in 3D
import { FontLoader } from 'https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/geometries/TextGeometry.js';
import { ViewportGizmo } from 'https://cdn.jsdelivr.net/npm/three-viewport-gizmo@2.2.0/+esm'

const container = document.getElementById('three-container');
container.style.position = 'relative';
console.log(container.clientWidth, container.clientHeight)

let gcodeObject = new THREE.Group();

// CSS2DRenderer setup
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(container.clientWidth, container.clientHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0';
labelRenderer.domElement.style.left = '0';
labelRenderer.domElement.style.pointerEvents = 'none'; // allow clicks to pass through

// Append it to the container
container.appendChild(labelRenderer.domElement);


const scene = new THREE.Scene();

// Camera setup
const aspect = window.innerWidth / window.innerHeight;

// Perspective camera
const perspectiveCamera = new THREE.PerspectiveCamera(75, aspect, 0.1, 10000);
perspectiveCamera.position.set(0, 0, 295);
perspectiveCamera.lookAt(0, 0, 0);

// Orthographic camera
const frustumSize = 400;
const orthoCamera = new THREE.OrthographicCamera(
(frustumSize * aspect) / -2,
(frustumSize * aspect) / 2,
frustumSize / 2,
frustumSize / -2,
0.1,
10000
);
orthoCamera.position.set(0, 0, 295);
orthoCamera.lookAt(0, 0, 0);

// Start with perspective camera
let camera = perspectiveCamera;

const renderer = new THREE.WebGLRenderer({
antialias: true,
alpha: true,
});
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.update();


const darkBackground = {
  color: 0x444444,
  hover: { color: 0x444444 },
};

const darkColors = {
  color: 0x888888,
  labelColor: 0xffffff,
  hover: {
    color: 0xffffff,
    labelColor: 0xffffff,
  },
}

const gizmoConfig = {
  type: "cube",
  background: darkBackground,
  corners: darkColors,
  edges: darkColors,
  left: {
    label: "  X-  ",
    color: 0x880000,
    labelColor: 0xffffff,
    hover: {
      color: 0xff0000,
      labelColor: 0xffffff,
    },
  },
  right: {
    label: "  X+  ",
    color: 0x880000,
    labelColor: 0xffffff,
    hover: {
      color: 0xff0000,
      labelColor: 0xffffff,
    },
  },
  bottom: {
    label: "  Y-  ",
    color: 0x008800,
    labelColor: 0xffffff,
    hover: {
      color: 0x00ff00,
      labelColor: 0xffffff,
    },
  },
  top: {
    label: "  Y+  ",
    color: 0x338833,
    labelColor: 0xffffff,
    hover: {
      color: 0x00cc00,
      labelColor: 0xffffff,
    },
  },
  front: {
    label: "  Z+  ",
    color: 0x000088,
    labelColor: 0xffffff,
    hover: {
      color: 0x0000ff,
      labelColor: 0xffffff,
    },
  },
  back: {
    label: "  Z-  ",
    color: 0x000088,
    labelColor: 0xffffff,
    hover: {
      color: 0x0000ff,
      labelColor: 0xffffff,
    },
  },

}
let gizmo = new ViewportGizmo(camera, renderer, gizmoConfig);
console.log(gizmo)
gizmo.attachControls(controls);
// container.appendChild(gizmo);  // Key: append to same div, not document.body

scene.add(new THREE.AmbientLight(0xffffff, 0.5));

const dirLight = new THREE.DirectionalLight(0xffffff, 0.75);
dirLight.position.set(100, 200, 100);
scene.add(dirLight);


// Handle dropdown change
cameraSelect.addEventListener('change', () => {
  // Save current camera position and controls target
  const currentPos = camera.position.clone();
  const currentTarget = controls.target.clone();

  if (cameraSelect.value === 'perspective') {
    camera = perspectiveCamera;
  } else {
    camera = orthoCamera;
  }

  // Apply saved position and target to new camera and controls
  camera.position.copy(currentPos);
  controls.object = camera;
  controls.target.copy(currentTarget);
  if (camera.isOrthographicCamera) {
    camera.zoom = 1; // Reset zoom (optional)
    camera.updateProjectionMatrix();
  }

  controls.update();
  gizmo = new ViewportGizmo(camera, renderer, gizmoConfig);
  gizmo.attachControls(controls);

});


  const resize = () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    const aspect = width / height;

    // Update Perspective camera
    perspectiveCamera.aspect = aspect;
    perspectiveCamera.updateProjectionMatrix();

    // Update Orthographic camera
    orthoCamera.left = (-frustumSize * aspect) / 2;
    orthoCamera.right = (frustumSize * aspect) / 2;
    orthoCamera.top = frustumSize / 2;
    orthoCamera.bottom = -frustumSize / 2;
    orthoCamera.updateProjectionMatrix();

    renderer.setSize(width, height);
    labelRenderer.setSize(width, height);

    gizmo.update();
  };

  // Resize handler
  window.addEventListener('resize', resize);

  // and use ResizeObserver for more accurate layout-based resizing
  const observer = new ResizeObserver(resize);
  observer.observe(container);




  function convertParsedDataToObject(message) {
    const parsed = JSON.parse(message);

    const geometry = new THREE.BufferGeometry();
    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.6
    });

    const positions = [];
    const colors = [];

    for (let point of parsed.linePoints) {
      positions.push(point.x, point.y, point.z);

      let color;
      switch (point.g) {
        case 0: color = new THREE.Color(0x33aa33); break; // G0 - soft red
        case 1: color = new THREE.Color(0x3366cc); break; // G1 - blue
        case 2: color = new THREE.Color(0x3366cc); break; // G2 - green
        case 3: color = new THREE.Color(0x3366cc); break; // G3 - green
        default: color = new THREE.Color(0x999999);       // fallback - grey
      }

      colors.push(color.r, color.g, color.b);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    return new THREE.Line(geometry, material);
  }


  function generateActionIndicators(extraObjects) {
    const result = [];

    const config = {
      m3: { color: 0xff0000, label: "Tool On (M3)" },
      m4: { color: 0x00ff00, label: "Tool On Reverse (M4)" },
      m5: { color: 0x0000ff, label: "Tool Off (M5)" },
      m7: { color: 0xffa500, label: "Coolant Mist On (M7)" },
      m8: { color: 0x00ffff, label: "Coolant Flood On (M8)" },
      m9: { color: 0x808080, label: "Coolant Off (M9)" },
    };

    for (const key in extraObjects) {
      const positions = extraObjects[key] || [];
      const { color, label } = config[key] || { color: 0xffffff, label: key };

      positions.forEach(([x, y, z]) => {
        const sphere = new THREE.Mesh(
          new THREE.SphereGeometry(1.5, 12, 12),
          new THREE.MeshBasicMaterial({ color })
        );
        sphere.position.set(x, y, z);

        // Create tooltip label
        const div = document.createElement('div');
        div.className = 'label';
        div.textContent = label;
        div.style.marginTop = '-1em';
        div.style.padding = '4px 6px';
        div.style.background = 'rgba(0,0,0,0.6)';
        div.style.color = 'white';
        div.style.fontSize = '0.75em';
        div.style.borderRadius = '4px';
        div.style.whiteSpace = 'nowrap';
        div.style.fontFamily = 'Arial, sans-serif';

        const labelObject = new CSS2DObject(div);
        labelObject.position.set(0, 2, 0); // hover offset above sphere
        sphere.add(labelObject);

        result.push(sphere);
      });
    }

    return result;
  }
  function loadGCode(content) {
    const worker = new Worker('/gcview.js');


    worker.onmessage = (e) => {
      const data = e.data;

      // Log progress messages
      if (typeof data === 'object' && 'progress' in data) {
        console.log(`Worker progress: ${data.progress}%`);
      } else {
        const obj = convertParsedDataToObject(data);
        if (obj) {
          if (gcodeObject) scene.remove(gcodeObject);

          gcodeObject = new THREE.Group();
          gcodeObject.add(obj); // main G-code object

          const indicators = generateActionIndicators(data.extraObjects); // ⬅️ New function
          indicators.forEach(mesh => gcodeObject.add(mesh));
          scene.add(gcodeObject);
          scene.add(decorateExtents(gcodeObject));
          frameObject(camera, controls, gcodeObject);
        }
      }
    };

    worker.postMessage({ data: content });
  }

  document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(evt) {
        //console.log(evt.target.result)
        loadGCode(evt.target.result);
      };
      reader.readAsText(file);
    }
  });



  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera); // <-- add this line
    controls.update();
    gizmo.render();

  }

  animate();


  //   New Grid
  function snapDown(value, step) {
    return Math.floor(value / step) * step;
  }

  function snapUp(value, step) {
    return Math.ceil(value / step) * step;
  }
  function createStaticGrid(xmin = -200, ymin = -200, xmax = 200, ymax = 200, unit = 'mm', margin = 20) {
    const step = unit === 'mm' ? 10 : 0.25 * 25.4;    // 10mm or 0.25in in mm
    const majorStep = unit === 'mm' ? 100 : 25.4;     // 100mm or 1in in mm

    // Add margin first
    let minX = xmin - margin;
    let maxX = xmax + margin;
    let minY = ymin - margin;
    let maxY = ymax + margin;

    // Snap to step multiples
    minX = snapDown(minX, step);
    maxX = snapUp(maxX, step);
    minY = snapDown(minY, step);
    maxY = snapUp(maxY, step);

    // Recalculate sizes
    const xSize = maxX - minX;
    const ySize = maxY - minY;

    const xDivs = Math.round(xSize / step);
    const yDivs = Math.round(ySize / step);

    const positions = [];
    const colors = [];

    const colorMinor = new THREE.Color(0x8d8c9c).convertSRGBToLinear();
    const colorMajor = new THREE.Color(0x232023).convertSRGBToLinear();

    // Vertical lines
    for (let i = 0; i <= xDivs; i++) {
      const x = minX + i * step;
      positions.push(x, minY, 0, x, maxY, 0);
      const isMajor = Math.abs(x % majorStep) < 1e-3;
      const color = isMajor ? colorMajor : colorMinor;
      colors.push(...color.toArray(), ...color.toArray());
    }

    // Horizontal lines
    for (let i = 0; i <= yDivs; i++) {
      const y = minY + i * step;
      positions.push(minX, y, 0, maxX, y, 0);
      const isMajor = Math.abs(y % majorStep) < 1e-3;
      const color = isMajor ? colorMajor : colorMinor;
      colors.push(...color.toArray(), ...color.toArray());
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.2,
      depthWrite: false
    });

    return new THREE.LineSegments(geometry, material);
  }

  var grid = createStaticGrid()
  scene.add(grid); // empty grid to start off

  let loadedFont = null;

  // Load font once on page/app start
  const loader = new FontLoader();
  loader.load('/lib/threejs/droid_sans_mono_regular.typeface.json', (font) => {
    loadedFont = font;
    console.log('Font loaded and ready!');
    // Now you can safely create text meshes using makeText
  });

function createAxisIndicator(length = 50) {
  const axesGroup = new THREE.Group();

  function createAxisLineWithLabel(dir, color, labelText, labelOffset) {
    // Create the axis line
    const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.6 });
    const points = [new THREE.Vector3(0, 0, 0), dir.clone().multiplyScalar(length)];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);

    // Create the arrow cone
    const coneGeom = new THREE.ConeGeometry(length * 0.05, length * 0.15, 12);
    const coneMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6 });
    const cone = new THREE.Mesh(coneGeom, coneMat);
    cone.position.copy(dir.clone().multiplyScalar(length));
    cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());

    // Create the label div
    const div = document.createElement('div');
    div.className = 'label';
    div.textContent = labelText;
    div.style.marginTop = '-1em';
    div.style.padding = '4px 6px';
    div.style.background = 'rgba(0,0,0,0.6)';
    div.style.color = 'white';
    div.style.fontSize = '0.75em';
    div.style.borderRadius = '4px';
    div.style.whiteSpace = 'nowrap';
    div.style.fontFamily = 'Arial, sans-serif';

    const labelObject = new CSS2DObject(div);
    labelObject.position.copy(dir.clone().multiplyScalar(length + labelOffset));

    // Add line, cone and label to group
    axesGroup.add(line);
    axesGroup.add(cone);
    axesGroup.add(labelObject);
  }

  // Bootstrap-like shades (approximate)
// Red: #dc3545 (Bootstrap danger)
// Green: #198754 (Bootstrap success)
// Blue: #0d6efd (Bootstrap primary)

createAxisLineWithLabel(new THREE.Vector3(1, 0, 0), 0xdc3545, 'X+', 5);
createAxisLineWithLabel(new THREE.Vector3(0, 1, 0), 0x198754, 'Y+', 5);
createAxisLineWithLabel(new THREE.Vector3(0, 0, 1), 0x0d6efd, 'Z+', 5);

  return axesGroup;
}

var axisIndicator = createAxisIndicator()
scene.add(axisIndicator); // empty grid to start off



function makeText(vals) {
  if (!loadedFont) {
    console.error('Font not loaded yet!');
    return null; // or a placeholder mesh
  }

  const geometry = new TextGeometry(vals.text, {
    font: loadedFont,
    size: vals.size || 10,
    height: 1,
    curveSegments: 12,
    bevelEnabled: false
  });

  const material = new THREE.MeshBasicMaterial({
    color: vals.color,
    transparent: true,
    opacity: vals.opacity !== undefined ? vals.opacity : 1,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(vals.x, vals.y, vals.z);
  return mesh;
}

var decorate = null; // stores the decoration 3d objects

function decorateExtents(object) {

    // remove grid if drawn previously
    if (decorate != null) {
        console.log("there was a previous extent decoration. remove it. grid:", decorate);

        // Traverse children and remove CSS2DObject elements from DOM
        decorate.traverse(child => {
            if (child instanceof CSS2DObject && child.element) {
                if (child.element.parentNode) {
                    child.element.parentNode.removeChild(child.element);
                }
            }
        });

        scene.remove(decorate);
        decorate.clear();  // remove children references to help GC
        decorate = null;
    } else {
        console.log("no previous decorate extents.");
    }

    // get its bounding box
    // console.log("about to do THREE.BoundingBoxHelper on object:", object);
    // var helper = new THREE.BoxHelper(object, 0xff0000);
    var helper = new THREE.Box3().setFromObject(object);
    // scene.add(helper);
    console.log("helper bbox:", helper);

    scene.remove(grid)
    var unit = (!gcodeObject.inch) ? " mm" : " in";

    grid = createStaticGrid(
      helper.min.x, // min x
      helper.min.y, // min y
      helper.max.x, // max x
      helper.max.y, // max y
      unit, // unit
      20 // margin
    );
    scene.add(grid)

    // var color = '#0d0d0d';
    var color = '#ff0000';

    var material = new THREE.LineDashedMaterial({
        vertexColors: false, color: color,
        dashSize: 1, gapSize: 1, linewidth: 1,
        transparent: true,
        opacity: 0.3,
    });

    // Create X axis extents sprite
    var z = 0;
    var offsetFromY = -4; // this means we'll be below the object by this padding
    var lenOfLine = 5;
    console.log(helper)
    var minx = helper.min.x;
    var miny = helper.min.y;
    var maxx = helper.max.x;
    var maxy = helper.max.y;
    var minz = helper.min.z;
    var maxz = helper.max.z;

    const positions = [
      minx, miny + offsetFromY, z,
      minx, miny + offsetFromY - lenOfLine, z,
      minx, miny + offsetFromY - lenOfLine, z,
      maxx, miny + offsetFromY - lenOfLine, z,
      maxx, miny + offsetFromY - lenOfLine, z,
      maxx, miny + offsetFromY, z
    ];

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    // Optional: if you want colors, here's a default gray for all segments
    const colors = [];
    for (let i = 0; i < positions.length / 3; i++) {
      const color = new THREE.Color(0x555555);
      colors.push(color.r, color.g, color.b);
    }
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    var material = new THREE.LineBasicMaterial({ vertexColors: true });
    var line = new THREE.Line(geometry, material);

    var txt = "X " + (maxx - minx).toFixed(2);
    txt += (!gcodeObject.inch) ? " mm" : " in";

    // Create tooltip label div
    const div = document.createElement('div');
    div.className = 'label';
    div.textContent = txt;
    div.style.marginTop = '-1em';
    div.style.padding = '4px 6px';
    div.style.background = 'rgba(0,0,0,0.6)';
    div.style.color = 'white';
    div.style.fontSize = '0.75em';
    div.style.borderRadius = '4px';
    div.style.whiteSpace = 'nowrap';
    div.style.fontFamily = 'Arial, sans-serif';

    // Create CSS2DObject
    const txtX = new CSS2DObject(div);
    txtX.position.set(minx + 1, miny + offsetFromY - lenOfLine - 6, z);

    // Create Y axis extents sprite
    var offsetFromX = -4; // this means we'll be below the object by this padding

    const positions2 = [
      minx + offsetFromX, miny, z,
      minx + offsetFromX - lenOfLine, miny, z,
      minx + offsetFromX - lenOfLine, miny, z,
      minx + offsetFromX - lenOfLine, maxy, z,
      minx + offsetFromX - lenOfLine, maxy, z,
      minx + offsetFromX, maxy, z
    ];

    const geometry2 = new THREE.BufferGeometry();
    geometry2.setAttribute('position', new THREE.Float32BufferAttribute(positions2, 3));

    // Optional uniform color or per-vertex color:
    const colors2 = [];
    for (let i = 0; i < positions2.length / 3; i++) {
      const color = new THREE.Color(0x555555); // or customize as needed
      colors2.push(color.r, color.g, color.b);
    }
    geometry2.setAttribute('color', new THREE.Float32BufferAttribute(colors2, 3));

    const line2 = new THREE.Line(geometry2, material);

    var txt = "Y " + (maxy - miny).toFixed(2);
    txt += (!gcodeObject.inch) ? " mm" : " in";

    // Create tooltip label div
    const divY = document.createElement('div');
    divY.className = 'label';
    divY.textContent = txt;
    divY.style.marginTop = '-1em';
    divY.style.padding = '4px 6px';
    divY.style.background = 'rgba(0,0,0,0.6)';
    divY.style.color = 'white';
    divY.style.fontSize = '0.75em';
    divY.style.borderRadius = '4px';
    divY.style.whiteSpace = 'nowrap';
    divY.style.fontFamily = 'Arial, sans-serif';
    divY.style.transform = 'rotate(90deg)';  // Rotate text for vertical Y label
    divY.style.transformOrigin = 'left top';

    // Create CSS2DObject
    const txtY = new CSS2DObject(divY);
    txtY.position.set(minx + offsetFromX - lenOfLine - 3, miny, z);


    const lenEndCap = 2;

    const zPositions = [
      maxx, miny, minz,
      maxx + lenOfLine, miny, minz,
      maxx + lenOfLine, miny, minz,
      maxx + lenOfLine, miny, maxz,
      maxx + lenOfLine, miny, maxz,
      maxx, miny, maxz
    ];

    const zGeometry = new THREE.BufferGeometry();
    zGeometry.setAttribute('position', new THREE.Float32BufferAttribute(zPositions, 3));

    // Optional: uniform or per-vertex coloring
    const zColors = [];
    for (let i = 0; i < zPositions.length / 3; i++) {
      const color = new THREE.Color(0x555555); // customize if needed
      zColors.push(color.r, color.g, color.b);
    }
    zGeometry.setAttribute('color', new THREE.Float32BufferAttribute(zColors, 3));

    const zline = new THREE.Line(zGeometry, material);

    var txt = "Z " + (maxz - minz).toFixed(2);
    txt += (!gcodeObject.inch) ? " mm" : " in";

    // Create tooltip label div
    const divZ = document.createElement('div');
    divZ.className = 'label';
    divZ.textContent = txt;
    divZ.style.marginTop = '-1em';
    divZ.style.padding = '4px 6px';
    divZ.style.background = 'rgba(0,0,0,0.6)';
    divZ.style.color = 'white';
    divZ.style.fontSize = '0.75em';
    divZ.style.borderRadius = '4px';
    divZ.style.whiteSpace = 'nowrap';
    divZ.style.fontFamily = 'Arial, sans-serif';

    // Simulated rotateX via CSS is tricky for 3D alignment;
    // for this label, we just shift position to match your original logic.

    const txtZ = new CSS2DObject(divZ);
    txtZ.position.set(
      maxx + offsetFromX + lenOfLine + 5,  // x + 5
      miny - 3 + 3,                        // y + 3
      z
    );

    // draw lines on X axis to represent width
    // create group to put everything into
    decorate = new THREE.Object3D();
    decorate.add(line);
    decorate.add(txtX);
    decorate.add(line2);
    decorate.add(txtY);
    decorate.add(zline);
    decorate.add(txtZ);

    // // Add estimated time and distance
    // var ud = object.userData.lines;
    // var udLastLine = ud[ud.length-1].p2;
    // //console.log("lastLine:", udLastLine, "userData:", ud, "object:", object);
    // // use last array value of userData cuz it keeps a running total of time
    // // and distance
    //
    // // get pretty print of time
    // var ret = this.convertMinsToPrettyDuration(udLastLine.timeMinsSum);
    //
    //
    // var txt = "Estimated Time: " + ret + ","
    // + " Total Distance: " + (udLastLine.distSum).toFixed(2);
    // txt = (this.isUnitsMm) ? txt + " mm" : txt + " in";
    // //console.log("txt:", txt);
    // //console.log("blah", blah);
    // var txtTimeDist = this.makeText({
    //     x: minx + this.getUnitVal(1),
    //     y: miny + offsetFromY - lenOfLine - this.getUnitVal(6),
    //     z: z,
    //     text: txt,
    //     color: color,
    //     opacity: 0.3,
    //     size: this.getUnitVal(2)
    // });
    // decorate.add(txtTimeDist);
    // console.log("just added decoration:", decorate);
    return decorate
}

frameButton.addEventListener('click', () => {
  console.log("frame button")
  if (!gcodeObject) {
    frameObject(camera, controls, grid);
  } else {
    frameObject(camera, controls, gcodeObject);
  }
});

function frameObject(camera, controls, object, offset = 1.25) {
  // Compute bounding box of the object (including children)
  const box = new THREE.Box3().setFromObject(object);

  if (box.isEmpty()) {
    console.warn("Object has no geometry or bounding box is empty");
    return;
  }

  const size = new THREE.Vector3();
  box.getSize(size);
  const center = new THREE.Vector3();
  box.getCenter(center);

  // For PerspectiveCamera
  if (camera.isPerspectiveCamera) {
    // Figure out the distance the camera needs to be from the center
    // to fit the bounding box in view
    const maxSize = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraDistance = maxSize / (2 * Math.tan(fov / 2));

    cameraDistance *= offset; // add some offset to have margin

    // Direction from camera to center

    const direction = new THREE.Vector3(0, 0, 1); // looking along +Z axis toward the center

    // New camera position
    camera.position.copy(direction.multiplyScalar(cameraDistance).add(center));

    // Update controls target to the center of the object
    controls.target.copy(center);

    // Update camera and controls
    camera.near = cameraDistance / 100;
    camera.far = cameraDistance * 100;
    camera.updateProjectionMatrix();
    controls.update();
  }
  // For OrthographicCamera
  else if (camera.isOrthographicCamera) {
    // Calculate new zoom to fit the bounding box inside the camera frustum
    const maxSize = Math.max(size.x, size.y, size.z);
    const aspect = camera.right / camera.top;

    if (aspect >= 1) {
      camera.zoom = (camera.right / maxSize) * offset;
    } else {
      camera.zoom = (camera.top / maxSize) * offset;
    }

    // Set the camera to look at the center
    camera.position.set(center.x, center.y, camera.position.z);
    controls.target.copy(center);

    camera.updateProjectionMatrix();
    controls.update();
  } else {
    console.warn("Unsupported camera type");
  }
}

// Optionally export things if you want
export { scene, camera, controls, resize };

// For DevTools debugging
if (typeof window !== 'undefined') {
  window.__3dview = { scene, camera, controls };
}
