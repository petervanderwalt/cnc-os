// src/Workspace.jsx
import React, { useEffect, useRef } from 'react';
import Muuri from 'muuri';
import './Workspace.css';

import GcodeView from './GcodeView';

const GAP = 20;
const CONTAINER_PADDING = 20;

export default function Workspace({ modules, leftModules, rightModules, setLeftModules, setRightModules }) {
  const leftGridRef = useRef(null);
  const rightGridRef = useRef(null);
  const moduleMap = Object.fromEntries(modules.map(m => [m.id, m]));

  const renderModule = (mod) => (
    <div
      key={mod.id}
      className="module-card shadow"
      data-id={mod.id}
    >
      <div className="module-body">
        <mod.Component />
      </div>
    </div>
  );

  return (
    <div id="viewer-container">
      {leftModules.length > 0 && (
        <div className="sidebar" id="left-sidebar" ref={leftGridRef}>
          {leftModules.map(id => renderModule(moduleMap[id]))}
        </div>
      )}

      <div className="main-area">
        <GcodeView />
      </div>

      {rightModules.length > 0 && (
        <div className="sidebar" id="right-sidebar" ref={rightGridRef}>
          {rightModules.map(id => renderModule(moduleMap[id]))}
        </div>
      )}
    </div>
  );

}
