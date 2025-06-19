export const width = 150;
export const height = 300;
export const displayName = "Tools and Coolant";
export const allowResize = true;

import React from 'react';

export default function Tool() {
  return (
    <div>
      <div className="btn-group-vertical btn-group-sm w-100" role="group" aria-label="Tool control">
        <input type="radio" className="btn-check" name="tool-radio" id="tool-m3" autoComplete="off" />
        <label className="btn btn-outline-dark" htmlFor="tool-m3">
          <i className="fas fa-redo me-2"></i>M3 CW
        </label>

        <input type="radio" className="btn-check" name="tool-radio" id="tool-m4" autoComplete="off" />
        <label className="btn btn-outline-dark" htmlFor="tool-m4">
          <i className="fas fa-undo me-2" style={{ animationDirection: 'reverse' }}></i>M4 CCW
        </label>

        <input type="radio" className="btn-check" name="tool-radio" id="tool-m5" autoComplete="off" defaultChecked />
        <label className="btn btn-outline-dark" htmlFor="tool-m5">
          <i className="fas fa-stop me-2"></i>M5 Stop
        </label>
      </div>

      <hr />

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
    </div>
  );
}
