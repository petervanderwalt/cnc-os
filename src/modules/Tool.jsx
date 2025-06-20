export const displayName = "Tools";

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
    </div>
  );
}
