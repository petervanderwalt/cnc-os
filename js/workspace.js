  (() => {

    const STORAGE_KEY = 'workspaceModules';

    const checkboxContainer = document.getElementById('moduleCheckboxes');
    const workspace = document.getElementById('workspace');
    const allowEditCheckbox = document.getElementById('allowEditCheckbox');

    modulesData.forEach(m => {
      const id = 'chk_' + m.id;
      const item = document.createElement('li');

      item.innerHTML = `
        <label class="dropdown-item d-flex align-items-center gap-2" for="${id}">
          <input class="form-check-input m-0" type="checkbox" value="${m.id}" id="${id}" checked>
          ${m.name}
        </label>
      `;

      checkboxContainer.appendChild(item);
    });


    function snapToGrid(value) {
      return Math.round(value / 10) * 10;
    }

    // Resort modules / reset positions
    async function resortModules() {
      // Clear saved layout
      localStorage.removeItem(STORAGE_KEY);

      // Remove existing modules
      document.querySelectorAll('.module-card').forEach(el => el.remove());

      // Recreate from default positions
      await createModules();
      setCheckboxStates();
      updateInteract();
      resize();
    }
    const resetPositionsBtn = document.getElementById('resetPositionsBtn');
    resetPositionsBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset module positions and sizes to defaults? This cannot be undone.')) {
        localStorage.removeItem(STORAGE_KEY);  // Clear saved positions/sizes/visibility
        resortModules();
      }
    });


    // Load saved module states or create defaults
    function loadModuleStates() {
      let saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return null;
      try {
        const parsed = JSON.parse(saved);
        if (!Array.isArray(parsed)) return null;
        return parsed;
      } catch {
        return null;
      }
    }

    // Save module states to localStorage
    function saveModuleStates() {
      const states = [];
      workspace.querySelectorAll('.module-card').forEach(card => {
        states.push({
          id: card.getAttribute('data-id'),
          left: parseInt(card.style.left) || 0,
          top: parseInt(card.style.top) || 0,
          width: parseInt(card.style.width) || 150,
          height: parseInt(card.style.height) || 150,
          visible: card.style.display !== 'none'
        });
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(states));
    }

    async function loadModuleContent(moduleId) {
      try {
        const response = await fetch(`./modules/${moduleId}.html`);
        return await response.text();
      } catch (err) {
        console.error(`Failed to load module ${moduleId}:`, err);
        return `<div class="text-danger small">Failed to load ${moduleId}.html</div>`;
      }
    }

    // Create module cards in workspace with saved or random initial position
    async function createModules() {
      const savedStates = loadModuleStates();

      const gap = 10; // spacing between modules
      let cursorX = gap;
      let cursorY = gap;
      let rowHeight = 0;
      const workspaceWidth = workspace.clientWidth;

      for (const m of modulesData) {
        const card = document.createElement('div');
        card.classList.add('module-card');
        card.setAttribute('data-id', m.id);
        card.setAttribute('data-allow-resize', m.allowResize ? 'true' : 'false');
        if (m.allowResize) card.classList.add('resizable');

        let width = m.size[0];
        let height = m.size[1];
        let left, top, visible = true;

        if (savedStates) {
          const saved = savedStates.find(s => s.id === m.id);
          if (saved) {
            width = saved.width;
            height = saved.height;
            left = saved.left;
            top = saved.top;
            visible = saved.visible !== false;
          }
        }

        card.style.width = width + 'px';
        card.style.height = height + 'px';

        if (left === undefined || top === undefined) {
          // Check if module fits in current row
          if (cursorX + width + gap > workspaceWidth) {
            // Move to next row
            cursorX = gap;
            cursorY += rowHeight + gap;
            rowHeight = 0;
          }

          left = cursorX;
          top = cursorY;

          cursorX += width + gap;
          if (height > rowHeight) rowHeight = height;
        }

        card.style.left = left + 'px';
        card.style.top = top + 'px';
        card.setAttribute('data-x', left);
        card.setAttribute('data-y', top);
        card.style.display = visible ? 'block' : 'none';

        card.innerHTML = `
          <div class="module-header">${m.name}</div>
          <div class="module-body">Loading...</div>
          ${m.allowResize ? '<div class="resize-handle"></div>' : ''}
        `;

        workspace.appendChild(card);

        // Load HTML content dynamically
        const moduleHTML = await loadModuleContent(m.id);
        const body = card.querySelector('.module-body');
        body.innerHTML = moduleHTML;

        // Optionally load corresponding JS
        const scriptPath = `/modules/${m.id}.js`;
        fetch(scriptPath, { method: 'HEAD' }).then(async resp => {
          if (resp.ok) {
            try {
              await import(scriptPath);
            } catch (err) {
              console.error(`Failed to dynamically import ${scriptPath}:`, err);
            }
          }
        });
      }
    }

    // Toggle module visibility from checkboxes
    checkboxContainer.addEventListener('change', e => {
      if(e.target && e.target.matches('input[type=checkbox]')) {
        const moduleId = e.target.value;
        const card = workspace.querySelector(`.module-card[data-id="${moduleId}"]`);
        if(card) {
          card.style.display = e.target.checked ? 'block' : 'none';
          saveModuleStates();
        }
      }
    });

    // Set checkbox states from saved data on load
    function setCheckboxStates() {
      const savedStates = loadModuleStates();
      if(!savedStates) return;
      savedStates.forEach(s => {
        const checkbox = document.getElementById('chk_' + s.id);
        if(checkbox) {
          checkbox.checked = s.visible !== false;
        }
      });
    }

    function dragMoveListener (event) {
       const target = event.target;
       let x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
       let y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

       x = snapToGrid(x);
       y = snapToGrid(y);

       const maxX = workspace.clientWidth - target.offsetWidth;
       const maxY = workspace.clientHeight - target.offsetHeight;

       x = Math.min(Math.max(0, x), maxX);
       y = Math.min(Math.max(0, y), maxY);

       target.style.left = x + 'px';
       target.style.top = y + 'px';

       target.setAttribute('data-x', x);
       target.setAttribute('data-y', y);
     }

     function updateInteract() {

       const cards = workspace.querySelectorAll('.module-card');

       cards.forEach(card => {
         interact(card).unset();

         // Always enable dragging but only on header handle
         interact(card)
           .draggable({
             allowFrom: '.module-header', // drag only if event started on header
             inertia: false,
             modifiers: [
               interact.modifiers.snap({
                 targets: [interact.snappers.grid({ x: 10, y: 10 })],
                 range: Infinity,
                 relativePoints: [ { x: 0, y: 0 } ]
               }),
               interact.modifiers.restrictRect({
                 restriction: workspace,
                 endOnly: true
               })
             ],
             listeners: {
               start(event) {
                 event.target.classList.add('dragging');
                 workspace.classList.add('show-grid'); // Show grid on drag start
               },
               move: dragMoveListener,
               end(event) {
                 event.target.classList.remove('dragging');
                 workspace.classList.remove('show-grid'); // Hide grid on drag end
                 saveModuleStates();
               }
             }
           });



         // Only enable resizing if edit mode is on AND allowResize=true
         if(card.getAttribute('data-allow-resize') === 'true') {
           interact(card).resizable({
             edges: { right: true, bottom: true },
             modifiers: [
               interact.modifiers.snapSize({
                 targets: [interact.snappers.grid({ x: 30, y: 30 })]
               }),
               interact.modifiers.restrictSize({
                 min: { width: 150, height: 150 },
                 max: { width: workspace.clientWidth, height: workspace.clientHeight }
               })
             ],
             inertia: false,
             listeners: {
               start(event) {
                 workspace.classList.add('show-grid'); // Show grid on resize start
               },
               move(event) {
                 let width = snapToGrid(event.rect.width);
                 let height = snapToGrid(event.rect.height);

                 if(width < 150) width = 150;
                 if(height < 150) height = 150;

                 event.target.style.width = width + 'px';
                 event.target.style.height = height + 'px';
               },
               end(event) {
                 workspace.classList.remove('show-grid'); // Hide grid on resize end
                 saveModuleStates();
               }
             }
           });
         }

       });
     }

    // On page load
    (async () => {
      setCheckboxStates();
      await createModules();
      updateInteract();
    })();

  })();
