// ============================================
// TDS Landing Page
// ============================================
import { router } from '../router.js';

export function renderLanding(container) {
  container.innerHTML = `
    <div class="landing-page">
      <!-- Navigation -->
      <header class="landing-nav" id="landing-nav">
        <div class="landing-logo">
          <div class="landing-logo-icon">🚛</div>
          <span>TDS</span>
        </div>
        <nav class="landing-nav-links">
          <a href="#features" class="landing-nav-link">Features</a>
          <a href="#stats" class="landing-nav-link">Performance</a>
          <a href="#cta" class="landing-nav-link">Get Started</a>
          <a href="#/login" class="btn btn-primary btn-sm">Sign In →</a>
        </nav>
      </header>

      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-bg-grid"></div>
        <div class="hero-truck-track">
          <span class="hero-truck">🚛</span>
        </div>
        <div class="hero-content animate-fade-in-up">
          <div class="hero-badge">
            ⚡ Next-Generation Fleet Intelligence
          </div>
          <h1 class="hero-title">
            Deliver <span class="gradient-text">Smarter</span>,<br>
            Track <span class="gradient-text-success">Everything</span>
          </h1>
          <p class="hero-subtitle">
            Real-time GPS tracking, intelligent route optimization, driver wellness monitoring,
            and predictive analytics — all in one powerful dashboard.
          </p>
          <div class="hero-actions">
            <a href="#/login" class="btn btn-primary btn-lg" id="hero-cta-btn">
              Start Free Trial →
            </a>
            <a href="#features" class="btn btn-outline btn-lg">
              Explore Features
            </a>
          </div>
          <div class="hero-stats stagger-children" id="stats">
            <div>
              <div class="hero-stat-value gradient-text" data-count="2847">0</div>
              <div class="hero-stat-label">Deliveries This Month</div>
            </div>
            <div>
              <div class="hero-stat-value gradient-text" data-count="98">0</div>
              <div class="hero-stat-label">% On-Time Rate</div>
            </div>
            <div>
              <div class="hero-stat-value gradient-text" data-count="156">0</div>
              <div class="hero-stat-label">Active Fleet Vehicles</div>
            </div>
            <div>
              <div class="hero-stat-value gradient-text" data-count="24">0</div>
              <div class="hero-stat-label">/7 Live Monitoring</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="features-section" id="features">
        <div class="section-header">
          <div class="section-label">Platform Features</div>
          <h2 class="section-title">Everything You Need to<br><span class="gradient-text">Manage Your Fleet</span></h2>
          <p class="section-subtitle">
            From real-time tracking to predictive maintenance — our platform covers every aspect of modern fleet management.
          </p>
        </div>
        <div class="features-grid stagger-children">
          <div class="card card-hover feature-card">
            <div class="feature-icon" style="background: var(--color-primary-glow);">📍</div>
            <h3 class="feature-title">Real-Time GPS Tracking</h3>
            <p class="feature-desc">Track every vehicle in your fleet with live location updates, geofencing alerts, and route visualization on an interactive map.</p>
          </div>
          <div class="card card-hover feature-card">
            <div class="feature-icon" style="background: var(--color-success-glow);">⏱️</div>
            <h3 class="feature-title">Smart ETA Predictions</h3>
            <p class="feature-desc">AI-powered estimated arrival times that factor in traffic, weather, load weight, and driver behavior patterns.</p>
          </div>
          <div class="card card-hover feature-card">
            <div class="feature-icon" style="background: var(--color-warning-glow);">⛽</div>
            <h3 class="feature-title">Fuel Analytics</h3>
            <p class="feature-desc">Monitor fuel consumption in real-time. Get alerts for low fuel and optimize routes to reduce fuel costs by up to 23%.</p>
          </div>
          <div class="card card-hover feature-card">
            <div class="feature-icon" style="background: rgba(139, 92, 246, 0.2);">😴</div>
            <h3 class="feature-title">Driver Wellness & Rest</h3>
            <p class="feature-desc">Automated rest compliance tracking ensures drivers take proper breaks. Reduce fatigue-related incidents by 89%.</p>
          </div>
          <div class="card card-hover feature-card">
            <div class="feature-icon" style="background: var(--color-danger-glow);">🚨</div>
            <h3 class="feature-title">Instant Alert System</h3>
            <p class="feature-desc">Receive immediate notifications for delays, route deviations, fuel warnings, and rest violations. One-tap driver calling.</p>
          </div>
          <div class="card card-hover feature-card">
            <div class="feature-icon" style="background: rgba(236, 72, 153, 0.2);">📊</div>
            <h3 class="feature-title">Performance Analytics</h3>
            <p class="feature-desc">Comprehensive dashboards with driver scores, delivery performance metrics, and fleet-wide operational insights.</p>
          </div>
          <div class="card card-hover feature-card">
            <div class="feature-icon" style="background: rgba(6, 182, 212, 0.2);">📷</div>
            <h3 class="feature-title">Receipt Verification</h3>
            <p class="feature-desc">Drivers scan customer receipts to instantly confirm deliveries. Digital proof-of-delivery with timestamps and location.</p>
          </div>
          <div class="card card-hover feature-card">
            <div class="feature-icon" style="background: rgba(132, 204, 22, 0.2);">🔧</div>
            <h3 class="feature-title">Vehicle Health Monitor</h3>
            <p class="feature-desc">Track tire pressure, oil levels, brake condition, and engine health. Predictive maintenance alerts before breakdowns.</p>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="cta-section" id="cta">
        <div style="position: relative; z-index: 2;">
          <div class="section-header">
            <div class="section-label">Ready to Transform?</div>
            <h2 class="section-title">Start Managing Your Fleet<br><span class="gradient-text">Like Never Before</span></h2>
            <p class="section-subtitle">
              Join thousands of logistics companies already using TDS to deliver faster, safer, and smarter.
            </p>
          </div>
          <div style="display: flex; justify-content: center; gap: 16px; flex-wrap: wrap;">
            <a href="#/login" class="btn btn-primary btn-lg">
              Try Demo Dashboard →
            </a>
            <a href="#features" class="btn btn-outline btn-lg">
              Learn More
            </a>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="landing-footer">
        <p>© 2026 TDS — Truck Delivery System. Built for modern logistics.</p>
      </footer>
    </div>
  `;

  // Animate counters when in view
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counters = entry.target.querySelectorAll('[data-count]');
        counters.forEach(counter => {
          const target = parseInt(counter.dataset.count);
          animateCount(counter, target);
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  const statsSection = container.querySelector('.hero-stats');
  if (statsSection) observer.observe(statsSection);

  // Navbar scroll effect
  const nav = container.querySelector('#landing-nav');
  const handleScroll = () => {
    if (window.scrollY > 50) {
      nav?.classList.add('scrolled');
    } else {
      nav?.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll);

  // Smooth scroll for anchor links
  container.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href.startsWith('#/')) return; // router links
      if (href.startsWith('#')) {
        const target = container.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  return () => {
    window.removeEventListener('scroll', handleScroll);
    observer.disconnect();
  };
}

function animateCount(el, target) {
  const duration = 1500;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(target * eased);
    el.textContent = current.toLocaleString();
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}
