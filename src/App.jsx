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
    Component: mod.default,
  };
});

const STORAGE_KEY = 'visibleModules';

function App() {

  const allModuleIds = modules.map((m) => m.id);

  // Load visible module IDs from localStorage or default to all
  const [leftModules, setLeftModules] = useState(() => {
    const stored = localStorage.getItem('leftModules');
    return stored ? JSON.parse(stored) : modules.map(m => m.id); // all on left initially
  });

  const [rightModules, setRightModules] = useState(() => {
    const stored = localStorage.getItem('rightModules');
    return stored ? JSON.parse(stored) : [];
  });

  // Save to localStorage whenever visibleModules changes
  useEffect(() => {
    localStorage.setItem('leftModules', JSON.stringify(leftModules));
    localStorage.setItem('rightModules', JSON.stringify(rightModules));
  }, [leftModules, rightModules]);

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
      <Navbar
        modules={modules}
        leftModules={leftModules}
        rightModules={rightModules}
        setLeftModules={setLeftModules}
        setRightModules={setRightModules}
      />
      <Workspace
        modules={modules}
        leftModules={leftModules}
        rightModules={rightModules}
        setLeftModules={setLeftModules}
        setRightModules={setRightModules}
      />
    </>
  );
}

export default App
