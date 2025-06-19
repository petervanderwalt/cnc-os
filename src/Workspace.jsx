// src/Workspace.jsx
import React, { useEffect, useRef } from 'react';
import interact from 'interactjs';
import './Workspace.css';

const GAP = 20;
const CONTAINER_PADDING = 20;

export default function Workspace({ modules, visibleModules }) {
  const workspaceRef = useRef(null);

  useEffect(() => {
    // Draggable for all module cards
    interact('.module-card')
      .draggable({
        allowFrom: '.module-header',
        inertia: false,
        modifiers: [
          interact.modifiers.snap({
            targets: [interact.snappers.grid({ x: 10, y: 10 })],
            range: Infinity,
            relativePoints: [{ x: 0, y: 0 }],
          }),
          interact.modifiers.restrictRect({
            restriction: 'parent',
            endOnly: true,
          }),
        ],
        listeners: {
          move(event) {
            const target = event.target;
            const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
            const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
            target.style.transform = `translate(${x}px, ${y}px)`;
            target.setAttribute('data-x', x);
            target.setAttribute('data-y', y);
          },
        },
      });

    // Enable resizable only on module-cards with data-resizable="true"
    interact('.module-card[data-resizable="true"]')
      .resizable({
        edges: { left: true, right: true, bottom: true, top: true },
        modifiers: [
          interact.modifiers.snapSize({
            targets: [interact.snappers.grid({ x: 10, y: 10 })],
          }),
          interact.modifiers.restrictSize({
            min: { width: 100, height: 100 },
            max: { width: Infinity, height: Infinity },
          }),
        ],
        inertia: false,
      })
      .on('resizemove', event => {
        const target = event.target;
        let width = event.rect.width;
        let height = event.rect.height;

        // Update element size
        target.style.width = width + 'px';
        target.style.height = height + 'px';

        // Update data attributes for possible future use
        target.setAttribute('data-width', width);
        target.setAttribute('data-height', height);

        // Maintain translate position during resize
        const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.deltaRect.left;
        const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.deltaRect.top;

        target.style.transform = `translate(${x}px, ${y}px)`;
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
      });
  }, []);

  // Calculate initial grid positions
  const positionedModules = visibleModules.map((id, index) => {
    const mod = modules.find(m => m.id === id);
    if (!mod) return null;

    const width = mod.width || 300;
    const height = mod.height || 300;

    const cols = Math.floor((window.innerWidth - CONTAINER_PADDING * 2) / (width + GAP));
    const x = CONTAINER_PADDING + (index % cols) * (width + GAP);
    const y = CONTAINER_PADDING + Math.floor(index / cols) * (height + GAP);

    return {
      ...mod,
      x,
      y,
      width,
      height,
      displayName: mod.displayName || mod.name || mod.id,
      resizable: mod.resize || false,
    };
  }).filter(Boolean);

  return (
    <div id="workspace" ref={workspaceRef}>
      {positionedModules.map((mod) => (
        <div
          key={mod.id}
          id={`module_${mod.id}`}
          className="module-card shadow"
          style={{
            transform: `translate(${mod.x}px, ${mod.y}px)`,
            width: mod.width,
            height: mod.height,
          }}
          data-x={mod.x}
          data-y={mod.y}
          data-resizable={mod.allowResize ? "true" : "false"}
        >
          <div className="module-header">{mod.displayName}</div>
          <div className="module-body">
            <mod.Component />
          </div>
        </div>
      ))}
    </div>
  );
}
