import React, { useState, useEffect } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './App.css'; // your own styles

import Navbar from './Navbar';
import Workspace from './Workspace';

// Inline modules loading
const moduleFiles = import.meta.glob('./modules/*.jsx', { eager: true });

const modules = Object.entries(moduleFiles).map(([path, mod]) => {
  const id = path.match(/\.\/modules\/(.*)\.jsx$/)[1];
  console.log("Loading module: " + id);
  return {
    id,
    name: mod.displayName || id,
    width: mod.width || 0,
    height: mod.height || 0,
    allowResize: mod.allowResize || false,
    Component: mod.default,
  };
});

const STORAGE_KEY = 'visibleModules';

function App() {

  const allModuleIds = modules.map((m) => m.id);

  // Load visible module IDs from localStorage or default to all
  const [visibleModules, setVisibleModules] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : allModuleIds;
  });

  // Save to localStorage whenever visibleModules changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visibleModules));
  }, [visibleModules]);

  const toggleModule = (id) => {
    setVisibleModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    // Load Bootstrap JS only on client side (browser)
    import('bootstrap/dist/js/bootstrap.bundle.min.js');
  }, []);

  return (
    <>
      <Navbar modules={modules} visibleModules={visibleModules} onToggle={toggleModule} />
      <Workspace modules={modules} visibleModules={visibleModules} />
    </>
  );
}

export default App
