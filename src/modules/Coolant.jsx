export const displayName = "Coolant";

import React from 'react';

export default function Tool() {
  return (
      <div className="btn-group-vertical btn-group-sm w-100" role="group" aria-label="Coolant control">
        <input type="radio" className="btn-check" name="coolant-radio" id="coolant-m7" autoComplete="off" />
        <label className="btn btn-outline-dark" htmlFor="coolant-m7">
          <i className="fas fa-wind me-2"></i>M7 Mist
        </label>

        <input type="radio" className="btn-check" name="coolant-radio" id="coolant-m8" autoComplete="off" />
        <label className="btn btn-outline-dark" htmlFor="coolant-m8">
          <i className="fas fa-water me-2"></i>M8 Flood
        </label>

        <input type="radio" className="btn-check" name="coolant-radio" id="coolant-m9" autoComplete="off" defaultChecked />
        <label className="btn btn-outline-dark" htmlFor="coolant-m9">
          <i className="fas fa-power-off me-2"></i>M9 Off
        </label>
      </div>
  );
}
