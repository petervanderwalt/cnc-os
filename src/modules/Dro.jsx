export const displayName = "Digital Read Out";

export default function Dro() {
  return (
    <div>
      <ul className="nav nav-tabs nav-tabs-sm mb-1">
        <li className="nav-item">
          <a className="nav-link active py-1 px-2" aria-current="page" href="#">Work</a>
        </li>
        <li className="nav-item">
          <a className="nav-link py-1 px-2" href="#">Machine</a>
        </li>
      </ul>

      <div className="dro-table mt-2">
        {['x', 'y', 'z', 'a'].map(axis => (
          <div
            key={axis}
            className="dro-row d-flex align-items-center justify-content-between mb-1"
            data-axis={axis}
          >
            <div className="input-group input-group-sm me-2" style={{ width: 'auto' }}>
              <span className="input-group-text fw-bold" style={{ width: '2em' }}>{axis.toUpperCase()}</span>
              <input
                type="text"
                className="form-control text-end dro-value"
                style={{ width: '6em' }}
                value="0000.000"
                readOnly
              />
              <span className="input-group-text dro-unit">{axis === 'a' ? 'deg' : 'mm'}</span>
            </div>
            <div className="ms-auto">
              <button className="btn btn-sm btn-outline-dark dro-zero me-1">Set 0</button>
              <button className="btn btn-sm btn-outline-dark dro-goto">Goto 0</button>
            </div>
          </div>
        ))}

        {/* Feed (f) row */}
        <div className="dro-row d-flex align-items-center justify-content-between mb-1" data-axis="f">
          <div className="input-group input-group-sm me-2" style={{ width: 'auto' }}>
            <span className="input-group-text fw-bold" style={{ width: '2em' }}>F</span>
            <input
              type="text"
              className="form-control text-end dro-value"
              style={{ width: '6em' }}
              value="0000.000"
              readOnly
            />
            <span className="input-group-text dro-unit">%</span>
          </div>
          <div className="ms-auto btn-group" role="group" aria-label="Feed controls">
            <button type="button" className="btn btn-sm btn-outline-dark" title="Decrease feed">−</button>
            <button type="button" className="btn btn-sm btn-outline-dark" title="Reset feed to 100%">reset</button>
            <button type="button" className="btn btn-sm btn-outline-dark" title="Increase feed">+</button>
          </div>
        </div>

        {/* Speed (s) row */}
        <div className="dro-row d-flex align-items-center justify-content-between mb-1" data-axis="s">
          <div className="input-group input-group-sm me-2" style={{ width: 'auto' }}>
            <span className="input-group-text fw-bold" style={{ width: '2em' }}>S</span>
            <input
              type="text"
              className="form-control text-end dro-value"
              style={{ width: '6em' }}
              value="0000.000"
              readOnly
            />
            <span className="input-group-text dro-unit">%</span>
          </div>
          <div className="ms-auto btn-group" role="group" aria-label="Speed controls">
            <button type="button" className="btn btn-sm btn-outline-dark" title="Decrease speed">−</button>
            <button type="button" className="btn btn-sm btn-outline-dark" title="Reset speed to 100%">reset</button>
            <button type="button" className="btn btn-sm btn-outline-dark" title="Increase speed">+</button>
          </div>
        </div>
      </div>
    </div>
  );
}
