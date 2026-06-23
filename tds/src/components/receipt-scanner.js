// ============================================
// TDS Receipt Scanner Component
// ============================================
import { store } from '../store.js';
import { showToast } from './alerts.js';

/**
 * Render the receipt scanner interface
 */
export function renderReceiptScanner(container, driverId) {
  const deliveries = store.getDriverDeliveries(driverId)
    .filter(d => d.status === 'in-progress' || d.status === 'delayed');

  container.innerHTML = `
    <div class="scan-container">
      <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">📷 Scan Receipt</h2>
      <p style="color: var(--color-text-muted); font-size: 14px; margin-bottom: 24px;">
        Scan the customer's receipt code or enter it manually to confirm delivery
      </p>

      <div class="scan-viewport" id="scan-viewport">
        <div class="scan-corner tl"></div>
        <div class="scan-corner tr"></div>
        <div class="scan-corner bl"></div>
        <div class="scan-corner br"></div>
        <div style="text-align: center; z-index: 1; position: relative;">
          <div style="font-size: 48px; margin-bottom: 16px;">📷</div>
          <p style="color: var(--color-text-muted); font-size: 14px;">Camera preview would appear here</p>
          <p style="color: var(--color-text-muted); font-size: 12px; margin-top: 8px;">(Demo mode - use manual entry below)</p>
        </div>
      </div>

      <div class="divider"></div>

      <div style="text-align: left;">
        <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 16px;">Manual Entry</h3>
        
        ${deliveries.length > 0 ? `
          <div class="input-group" style="margin-bottom: 16px;">
            <label class="input-label">Select Delivery</label>
            <select class="select" id="scan-delivery-select">
              ${deliveries.map(d => `
                <option value="${d.id}">${d.id} — ${d.destination.name}</option>
              `).join('')}
            </select>
          </div>

          <div class="input-group" style="margin-bottom: 24px;">
            <label class="input-label">Receipt Code</label>
            <div class="input-icon-wrapper">
              <span class="input-icon">🔢</span>
              <input type="text" class="input" id="receipt-code-input" placeholder="Enter 6-digit receipt code" maxlength="6" style="font-family: var(--font-mono); font-size: 18px; letter-spacing: 0.2em; text-align: center;" />
            </div>
          </div>

          <button class="btn btn-primary btn-lg" style="width: 100%;" id="verify-receipt-btn">
            ✓ Verify Receipt
          </button>

          <div style="margin-top: 16px; padding: 12px; background: rgba(59,130,246,0.05); border: 1px dashed var(--color-border); border-radius: 8px;">
            <p style="font-size: 11px; color: var(--color-text-muted); text-align: center;">
              💡 <strong>Demo hint:</strong> Valid receipt codes for active deliveries:<br>
              ${deliveries.map(d => `${d.id}: <code style="font-family: var(--font-mono); color: var(--color-primary-light); background: var(--color-primary-glow); padding: 1px 4px; border-radius: 3px;">${d.receiptCode}</code>`).join(' | ')}
            </p>
          </div>
        ` : `
          <div class="empty-state" style="padding: 32px 0;">
            <div class="empty-state-icon">📦</div>
            <div class="empty-state-title">No Active Deliveries</div>
            <div class="empty-state-text">You don't have any active deliveries to scan receipts for.</div>
          </div>
        `}
      </div>

      <div id="scan-result-container" style="margin-top: 24px;"></div>
    </div>
  `;

  // Event listeners
  const verifyBtn = container.querySelector('#verify-receipt-btn');
  const codeInput = container.querySelector('#receipt-code-input');
  const deliverySelect = container.querySelector('#scan-delivery-select');
  const resultContainer = container.querySelector('#scan-result-container');

  verifyBtn?.addEventListener('click', () => {
    const code = codeInput.value.trim();
    const selectedDeliveryId = deliverySelect.value;

    if (!code) {
      showToast('warning', 'Missing Code', 'Please enter a receipt code.');
      return;
    }

    const delivery = store.getState().deliveries.find(d => d.id === selectedDeliveryId);
    if (!delivery) {
      showToast('danger', 'Error', 'Delivery not found.');
      return;
    }

    // Simulate scanning animation
    const viewport = container.querySelector('#scan-viewport');
    viewport?.classList.add('scanning');

    setTimeout(() => {
      viewport?.classList.remove('scanning');

      if (code === delivery.receiptCode) {
        // Valid!
        store.completeDelivery(delivery.id);

        resultContainer.innerHTML = `
          <div class="scan-result card" style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3);">
            <div class="scan-result-icon">✅</div>
            <div class="scan-result-title" style="color: var(--color-success);">Delivery Confirmed!</div>
            <div class="scan-result-text">
              ${delivery.id} has been marked as completed.<br>
              <strong>${delivery.destination.name}</strong>
            </div>
          </div>
        `;

        showToast('success', 'Delivery Completed! 🎉', `${delivery.id} verified and marked as completed.`);
      } else {
        // Invalid
        resultContainer.innerHTML = `
          <div class="scan-result card" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3);">
            <div class="scan-result-icon">❌</div>
            <div class="scan-result-title" style="color: var(--color-danger);">Invalid Code</div>
            <div class="scan-result-text">
              The receipt code doesn't match. Please check and try again.
            </div>
          </div>
        `;

        showToast('danger', 'Invalid Receipt', 'The code entered does not match the delivery receipt.');

        // Shake animation on input
        codeInput.style.animation = 'none';
        codeInput.offsetHeight; // force reflow
        codeInput.style.animation = 'shake 0.5s ease';
        codeInput.style.borderColor = 'var(--color-danger)';
        setTimeout(() => {
          codeInput.style.borderColor = '';
          codeInput.style.animation = '';
        }, 1000);
      }
    }, 1500);
  });

  // Enter key on input
  codeInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') verifyBtn?.click();
  });
}
