import React, { useState, useEffect } from 'react';
import { Dropdown, Modal, Button } from 'react-bootstrap';
import './Navbar.css';

import logo from './assets/logo.svg'; // adjust path as needed

export default function Navbar({ modules, leftModules, rightModules, setLeftModules, setRightModules }) {

  return (
    <nav className="navbar navbar-expand-lg py-1 sticky-top border-bottom shadow-sm">
      <div className="container-fluid">
        <a className="navbar-brand small p-0 m-0 pe-3 pb-1" href="#">
          <img src={logo} alt="Logo" height="30" className="m-0" />
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <a className="nav-link active" href="#">
                <i className="fas fa-house me-1"></i>Home
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">
                <i className="fas fa-circle-info me-1"></i>About
              </a>
            </li>
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="fas fa-layer-group me-1"></i>Modules
              </a>
              <ul className="dropdown-menu shadow" style={{ minWidth: 220 }}>
                <li>
                  <h6 className="dropdown-header">
                    <i className="fas fa-eye-slash me-1"></i>Show/Hide Modules
                  </h6>
                </li>
                <li>
                  <ul className="list-unstyled px-2 mb-2">
                    {modules.map((mod) => {
                      const isLeft = leftModules.includes(mod.id);
                      const isRight = rightModules.includes(mod.id);
                      const current = isLeft ? 'left' : isRight ? 'right' : 'none';

                      const handleChange = (e) => {
                        const value = e.target.value;

                        // Remove from both first
                        setLeftModules(prev => prev.filter(id => id !== mod.id));
                        setRightModules(prev => prev.filter(id => id !== mod.id));

                        if (value === 'left') {
                          setLeftModules(prev => [...prev, mod.id]);
                        } else if (value === 'right') {
                          setRightModules(prev => [...prev, mod.id]);
                        }
                      };

                      return (
                        <li key={mod.id}>
                          <div className="dropdown-item d-flex align-items-center gap-2 ps-3">
                            <span className="flex-grow-1">{mod.name}</span>
                            <select
                              className="form-select form-select-sm w-auto"
                              value={current}
                              onChange={handleChange}
                            >
                              <option value="none">Hidden</option>
                              <option value="left">Left</option>
                              <option value="right">Right</option>
                            </select>

                            </div>
                        </li>

                      );
                    })}

                  </ul>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>

              </ul>
            </li>
            <li className="nav-item">
              <a className="nav-link disabled" aria-disabled="true">
                <i className="fas fa-ban me-1"></i>Disabled
              </a>
            </li>
          </ul>

          <div className="dropdown">
            <button
              className="btn btn-outline-dark btn-sm dropdown-toggle"
              type="button"
              id="loginDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i className="fas fa-user me-1"></i>Login
            </button>
            <div
              className="dropdown-menu dropdown-menu-end p-3 shadow"
              style={{ minWidth: 250 }}
            >
              <form>
                <i className="fas fa-user me-1"></i>Login
                <hr />
                <div className="mb-2">
                  <label htmlFor="loginEmail" className="form-label small mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="form-control form-control-sm"
                    id="loginEmail"
                    placeholder="you@example.com"
                  />
                </div>
                <div className="mb-2">
                  <label htmlFor="loginPassword" className="form-label small mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control form-control-sm"
                    id="loginPassword"
                    placeholder="••••••••"
                  />
                </div>
                <button type="submit" className="btn btn-sm btn-primary w-100">
                  Login
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
