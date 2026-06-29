// ============================================
// TDS Modal System — Forms, Confirmations, CRUD
// ============================================

const AVATAR_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
  '#f97316', '#14b8a6', '#6366f1', '#e11d48'
];

/**
 * Show a generic modal
 * @param {{ title: string, content: string, footer?: string, onMount?: (modal, closeFn) => void, wide?: boolean }} opts
 * @returns {{ close: () => void, element: HTMLElement }}
 */
export function showModal({ title, content, footer = '', onMount = null, wide = false }) {
  const overlay = document.getElementById('modal-overlay');
  overlay.innerHTML = `
    <div class="modal-backdrop"></div>
    <div class="modal ${wide ? 'modal-wide' : ''}" role="dialog" aria-modal="true" aria-label="${title}">
      <div class="modal-header">
        <h3 class="modal-title">${title}</h3>
        <button class="modal-close" id="modal-close-btn" aria-label="Close">&times;</button>
      </div>
      <div class="modal-body">
        ${content}
      </div>
      ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
    </div>
  `;
  overlay.classList.add('active');

  const modal = overlay.querySelector('.modal');

  const close = () => {
    modal.classList.add('modal-exit');
    setTimeout(() => {
      overlay.classList.remove('active');
      overlay.innerHTML = '';
    }, 200);
  };

  // Close handlers
  overlay.querySelector('#modal-close-btn').addEventListener('click', close);
  overlay.querySelector('.modal-backdrop').addEventListener('click', close);
  const onKeyDown = (e) => {
    if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onKeyDown); }
  };
  document.addEventListener('keydown', onKeyDown);

  // Pass close function as second argument to onMount so it's available immediately
  if (onMount) onMount(modal, close);

  // Focus first input if any
  setTimeout(() => {
    const firstInput = modal.querySelector('input, select, textarea');
    if (firstInput) firstInput.focus();
  }, 50);

  return { close, element: modal };
}

/**
 * Show a confirmation dialog
 * @param {{ title: string, message: string, confirmLabel?: string, onConfirm: () => void, danger?: boolean }} opts
 */
export function showConfirmDialog({ title, message, confirmLabel = 'Confirm', onConfirm, danger = false }) {
  showModal({
    title,
    content: `
      <div class="confirm-dialog-body">
        ${danger ? '<div class="confirm-dialog-icon danger">⚠️</div>' : '<div class="confirm-dialog-icon">❓</div>'}
        <p class="confirm-dialog-message">${message}</p>
      </div>
    `,
    footer: `
      <button class="btn btn-outline" id="confirm-cancel">Cancel</button>
      <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" id="confirm-ok">${confirmLabel}</button>
    `,
    onMount: (modal, closeFn) => {
      modal.querySelector('#confirm-cancel').addEventListener('click', closeFn);
      modal.querySelector('#confirm-ok').addEventListener('click', () => {
        onConfirm();
        closeFn();
      });
    }
  });
}

/**
 * Show a form modal with auto-generated fields
 * @param {{
 *   title: string,
 *   fields: Array<{
 *     key: string,
 *     label: string,
 *     type: 'text'|'email'|'tel'|'number'|'select'|'color'|'textarea',
 *     required?: boolean,
 *     placeholder?: string,
 *     options?: Array<{value: string, label: string}>,
 *     min?: number, max?: number, step?: number,
 *     value?: any,
 *     half?: boolean,
 *     colors?: string[],
 *     disabled?: boolean,
 *     info?: string
 *   }>,
 *   onSubmit: (data: object) => void | boolean,
 *   initialData?: object,
 *   submitLabel?: string
 * }} opts
 */
export function showFormModal({ title, fields, onSubmit, initialData = {}, submitLabel = 'Save' }) {
  const fieldHTML = fields.map(field => {
    const value = initialData[field.key] ?? field.value ?? '';
    const required = field.required ? 'required' : '';
    const halfClass = field.half ? 'form-group-half' : '';
    const disabledAttr = field.disabled ? 'disabled' : '';
    const infoHtml = field.info ? `<span class="form-field-info">${field.info}</span>` : '';

    let inputHTML = '';

    switch (field.type) {
      case 'select':
        inputHTML = `
          <select class="select form-input" id="field-${field.key}" name="${field.key}" ${required} ${disabledAttr}>
            <option value="">— Select —</option>
            ${(field.options || []).map(opt =>
              `<option value="${opt.value}" ${opt.value === String(value) ? 'selected' : ''}>${opt.label}</option>`
            ).join('')}
          </select>
        `;
        break;

      case 'color':
        const colors = field.colors || AVATAR_COLORS;
        inputHTML = `
          <div class="color-picker" id="field-${field.key}" data-value="${value || colors[0]}">
            ${colors.map(c =>
              `<button type="button" class="color-picker-swatch ${c === (value || colors[0]) ? 'active' : ''}" data-color="${c}" style="background: ${c};" aria-label="Color ${c}"></button>`
            ).join('')}
          </div>
        `;
        break;

      case 'textarea':
        inputHTML = `<textarea class="input form-input" id="field-${field.key}" name="${field.key}" rows="3" placeholder="${field.placeholder || ''}" ${required} ${disabledAttr}>${value}</textarea>`;
        break;

      case 'number':
        inputHTML = `<input type="number" class="input form-input" id="field-${field.key}" name="${field.key}" value="${value}" placeholder="${field.placeholder || ''}" ${field.min != null ? `min="${field.min}"` : ''} ${field.max != null ? `max="${field.max}"` : ''} ${field.step != null ? `step="${field.step}"` : ''} ${required} ${disabledAttr} />`;
        break;

      default:
        inputHTML = `<input type="${field.type}" class="input form-input" id="field-${field.key}" name="${field.key}" value="${value}" placeholder="${field.placeholder || ''}" ${required} ${disabledAttr} />`;
    }

    return `
      <div class="form-group ${halfClass}">
        <label class="form-label" for="field-${field.key}">${field.label}${field.required ? ' <span class="form-required">*</span>' : ''}</label>
        ${inputHTML}
        ${infoHtml}
      </div>
    `;
  }).join('');

  showModal({
    title,
    content: `
      <form class="modal-form" id="crud-form" novalidate>
        <div class="form-grid">
          ${fieldHTML}
        </div>
        <div id="form-error" class="form-error" style="display: none;"></div>
      </form>
    `,
    footer: `
      <button class="btn btn-outline" id="form-cancel" type="button">Cancel</button>
      <button class="btn btn-primary" id="form-submit" type="button">${submitLabel}</button>
    `,
    wide: true,
    onMount: (modal, closeFn) => {
      // Color picker behavior
      modal.querySelectorAll('.color-picker').forEach(picker => {
        picker.querySelectorAll('.color-picker-swatch').forEach(swatch => {
          swatch.addEventListener('click', () => {
            picker.querySelectorAll('.color-picker-swatch').forEach(s => s.classList.remove('active'));
            swatch.classList.add('active');
            picker.dataset.value = swatch.dataset.color;
          });
        });
      });

      // Cancel
      modal.querySelector('#form-cancel').addEventListener('click', closeFn);

      // Submit
      modal.querySelector('#form-submit').addEventListener('click', () => {
        const form = modal.querySelector('#crud-form');
        const data = {};
        let hasError = false;

        fields.forEach(field => {
          if (field.type === 'color') {
            const picker = form.querySelector(`#field-${field.key}`);
            data[field.key] = picker?.dataset.value || '';
          } else {
            const input = form.querySelector(`#field-${field.key}`);
            if (!input) return;

            let val = input.value.trim();

            // Type coercion
            if (field.type === 'number' && val !== '') {
              val = Number(val);
            }

            // Validation
            if (field.required && (val === '' || val === undefined || val === null)) {
              input.classList.add('input-error');
              hasError = true;
            } else {
              input.classList.remove('input-error');
            }

            if (field.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
              input.classList.add('input-error');
              hasError = true;
            }

            data[field.key] = val;
          }
        });

        if (hasError) {
          const errorEl = form.querySelector('#form-error');
          errorEl.textContent = 'Please fill in all required fields correctly.';
          errorEl.style.display = 'block';
          return;
        }

        const result = onSubmit(data);
        if (result !== false) {
          closeFn();
        }
      });

      // Allow Enter key to submit
      modal.querySelector('#crud-form').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          modal.querySelector('#form-submit').click();
        }
      });
    }
  });
}
