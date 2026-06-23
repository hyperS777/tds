// ============================================
// TDS Login Page
// ============================================
import { store } from '../store.js';
import { router } from '../router.js';
import { supervisorCredentials, driverPasswords } from '../data/dummy-data.js';
import { showToast } from '../components/alerts.js';
import { logoSVG } from '../components/logo.js';

export function renderLogin(container) {
  let selectedRole = 'supervisor';

  container.innerHTML = `
    <div class="login-page">
      <div class="login-bg-grid"></div>
      <div class="login-container animate-scale-in">
        <div class="login-header">
          <div class="login-logo">
            <div class="landing-logo-icon" style="width: 40px; height: 40px;">${logoSVG(28)}</div>
            <span class="gradient-text">TDS</span>
          </div>
          <h1 class="login-title">Welcome Back</h1>
          <p class="login-subtitle">Sign in to access your dashboard</p>
        </div>

        <div class="card card-glass login-card">
          <div class="role-toggle" id="role-toggle">
            <button class="role-toggle-btn active" data-role="supervisor" id="role-supervisor">
              👔 Supervisor
            </button>
            <button class="role-toggle-btn" data-role="driver" id="role-driver">
              🚛 Driver
            </button>
          </div>

          <form class="login-form" id="login-form">
            <div class="input-group">
              <label class="input-label" for="login-email">Email Address</label>
              <div class="input-icon-wrapper">
                <span class="input-icon">📧</span>
                <input type="email" class="input" id="login-email" placeholder="Enter your email" value="admin@tds.com" autocomplete="email" />
              </div>
            </div>

            <div class="input-group">
              <label class="input-label" for="login-password">Password</label>
              <div class="input-icon-wrapper">
                <span class="input-icon">🔒</span>
                <input type="password" class="input" id="login-password" placeholder="Enter your password" value="demo123" autocomplete="current-password" />
              </div>
            </div>

            <button type="submit" class="btn btn-primary btn-lg" style="width: 100%; margin-top: 8px;" id="login-submit">
              Sign In →
            </button>
          </form>

          <div class="login-demo-hint" id="demo-hint">
            <strong>Demo Credentials</strong><br>
            Supervisor: <code>admin@tds.com</code> / <code>demo123</code><br>
            Driver: <code>driver1@tds.com</code> to <code>driver8@tds.com</code> / <code>demo123</code>
          </div>
        </div>

        <div style="text-align: center; margin-top: 24px;">
          <a href="#/" style="font-size: 13px; color: var(--color-text-muted);">← Back to Home</a>
        </div>
      </div>
    </div>
  `;

  // Role toggle
  const roleToggle = container.querySelector('#role-toggle');
  const emailInput = container.querySelector('#login-email');
  const passwordInput = container.querySelector('#login-password');

  roleToggle?.addEventListener('click', (e) => {
    const btn = e.target.closest('.role-toggle-btn');
    if (!btn) return;

    selectedRole = btn.dataset.role;
    roleToggle.querySelectorAll('.role-toggle-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Update demo credentials
    if (selectedRole === 'supervisor') {
      emailInput.value = 'admin@tds.com';
    } else {
      emailInput.value = 'driver1@tds.com';
    }
    passwordInput.value = 'demo123';
  });

  // Login form
  container.querySelector('#login-form')?.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      showToast('warning', 'Missing Fields', 'Please enter both email and password.');
      return;
    }

    // Validate
    if (selectedRole === 'supervisor') {
      if (email === supervisorCredentials.email && password === supervisorCredentials.password) {
        store.login({
          ...supervisorCredentials,
          role: 'supervisor'
        });
        showToast('success', 'Welcome!', `Signed in as ${supervisorCredentials.name}`);
        router.navigate('/supervisor');
      } else {
        showToast('danger', 'Login Failed', 'Invalid supervisor credentials.');
        shakeForm();
      }
    } else {
      const driver = store.getDriverByEmail(email);
      if (driver && password === driverPasswords) {
        store.login({
          id: driver.id,
          name: driver.name,
          email: driver.email,
          initials: driver.initials,
          avatarColor: driver.avatarColor,
          role: 'driver'
        });
        showToast('success', 'Welcome!', `Signed in as ${driver.name}`);
        router.navigate('/driver');
      } else {
        showToast('danger', 'Login Failed', 'Invalid driver credentials.');
        shakeForm();
      }
    }
  });

  function shakeForm() {
    const card = container.querySelector('.login-card');
    card.style.animation = 'none';
    card.offsetHeight;
    card.style.animation = 'shake 0.5s ease';
    setTimeout(() => card.style.animation = '', 500);
  }
}
