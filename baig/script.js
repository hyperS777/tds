(() => {
    // ===== CUSTOM CURSOR =====
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    const glow = document.getElementById('cursorGlow');
    if (!dot || !ring || !glow) return;

    let mx = -100, my = -100, rx = -100, ry = -100, gx = -100, gy = -100;

    document.addEventListener('mousemove', e => {
        mx = e.clientX; my = e.clientY;
    }, { passive: true });

    function animCursor() {
        dot.style.left = mx + 'px';
        dot.style.top = my + 'px';

        rx += (mx - rx) * 0.12;
        ry += (my - ry) * 0.12;
        ring.style.left = rx + 'px';
        ring.style.top = ry + 'px';

        gx += (mx - gx) * 0.05;
        gy += (my - gy) * 0.05;
        glow.style.left = gx + 'px';
        glow.style.top = gy + 'px';

        requestAnimationFrame(animCursor);
    }
    animCursor();

    // Hover detection
    const interactives = 'a, button, .btn, .nav-link, .tech-pill, .service-card, .product-card, .contact-item, .stat-mini, .stat-card, .social-links a, .c-btn, .c-dot';
    document.querySelectorAll(interactives).forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });

    // ===== LOADER =====
    window.addEventListener('load', () => {
        setTimeout(() => {
            const loader = document.getElementById('loader');
            if (loader) loader.classList.add('done');
        }, 400);
    });

    // ===== NAVBAR =====
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        }, { passive: true });
    }

    // ===== MOBILE MENU =====
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('navMenu');
    if (toggle && menu) {
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('active');
            menu.classList.toggle('active');
        });
        document.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', () => {
            toggle.classList.remove('active');
            menu.classList.remove('active');
        }));
    }

    // ===== TYPED TEXT =====
    const typedEl = document.getElementById('typedText');
    if (typedEl) {
        const phrases = [
            'No fluff. Just AI that saves you time and money.',
            'From chatbots to full process automation — we handle it.',
            'Real solutions for real businesses, shipped fast.',
            'Your team focuses on what matters. We automate the rest.'
        ];
        let pi = 0, ci = 0, deleting = false;

        function doType() {
            const s = phrases[pi];
            if (!deleting) {
                typedEl.textContent = s.substring(0, ci + 1);
                ci++;
                if (ci >= s.length) { deleting = true; setTimeout(doType, 2500); return; }
                setTimeout(doType, 40 + Math.random() * 40);
            } else {
                typedEl.textContent = s.substring(0, ci - 1);
                ci--;
                if (ci <= 0) { deleting = false; pi = (pi + 1) % phrases.length; setTimeout(doType, 600); return; }
                setTimeout(doType, 20 + Math.random() * 12);
            }
        }
        setTimeout(doType, 700);
    }

    // ===== SCROLL REVEALS =====
    const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    if (revealEls.length) {
        const rObs = new IntersectionObserver(entries => {
            entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis'); });
        }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
        revealEls.forEach(el => rObs.observe(el));
    }

    // ===== STAT COUNTERS =====
    const counters = document.querySelectorAll('.num[data-count]');
    if (counters.length) {
        const cObs = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (!e.isIntersecting) return;
                const el = e.target, target = +el.dataset.count;
                const suffix = el.textContent.replace(/[0-9]/g, '');
                let cur = 0;
                const step = Math.max(1, Math.ceil(target / 40));
                const t = setInterval(() => {
                    cur += step;
                    if (cur >= target) { cur = target; clearInterval(t); }
                    el.textContent = cur + suffix;
                }, 40);
                cObs.unobserve(el);
            });
        }, { threshold: 0.5 });
        counters.forEach(el => cObs.observe(el));
    }

    // ===== TESTIMONIAL CAROUSEL =====
    const track = document.getElementById('testiTrack');
    const dots = document.querySelectorAll('.c-dot');
    const prevBtn = document.getElementById('cPrev');
    const nextBtn = document.getElementById('cNext');

    if (track && dots.length && prevBtn && nextBtn) {
        let cur = 0, total = dots.length;
        function goSlide(i) {
            cur = ((i % total) + total) % total;
            track.style.transform = `translateX(-${cur * 100}%)`;
            dots.forEach((d, j) => d.classList.toggle('on', j === cur));
        }
        prevBtn.addEventListener('click', () => goSlide(cur - 1));
        nextBtn.addEventListener('click', () => goSlide(cur + 1));
        dots.forEach(d => d.addEventListener('click', () => goSlide(+d.dataset.i)));
        let autoSlide = setInterval(() => goSlide(cur + 1), 6000);
        const carousel = document.getElementById('testiCarousel');
        if (carousel) {
            carousel.addEventListener('mouseenter', () => clearInterval(autoSlide));
            carousel.addEventListener('mouseleave', () => { autoSlide = setInterval(() => goSlide(cur + 1), 6000); });
        }
    }

    // ===== HERO CANVAS — interactive particle web =====
    const canvas = document.getElementById('heroCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [], animId;
        let mouseX = -999, mouseY = -999;

        function resize() { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; }

        class Dot {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.ox = this.x; this.oy = this.y;
                this.r = Math.random() * 1.8 + 0.4;
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;
                this.alpha = Math.random() * 0.3 + 0.06;
            }
            update() {
                // Gentle mouse attraction
                const dx = mouseX - this.x;
                const dy = mouseY - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 200 && dist > 0) {
                    const force = (200 - dist) / 200 * 0.008;
                    this.vx += dx / dist * force;
                    this.vy += dy / dist * force;
                }
                // Damping
                this.vx *= 0.985;
                this.vy *= 0.985;
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
                ctx.fill();
            }
        }

        function init() {
            particles = [];
            const count = Math.min(75, Math.floor(canvas.width * canvas.height / 13000));
            for (let i = 0; i < count; i++) particles.push(new Dot());
        }

        function drawConnections() {
            // Particle-to-particle lines
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const d = Math.sqrt(dx * dx + dy * dy);
                    if (d < 140) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - d / 140) * 0.08})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
                // Particle-to-mouse lines
                const mx = mouseX - particles[i].x;
                const my = mouseY - particles[i].y;
                const md = Math.sqrt(mx * mx + my * my);
                if (md < 180) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(mouseX, mouseY);
                    ctx.strokeStyle = `rgba(0, 159, 227, ${(1 - md / 180) * 0.15})`;
                    ctx.lineWidth = 0.6;
                    ctx.stroke();
                }
            }
        }

        function loop() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => { p.update(); p.draw(); });
            drawConnections();
            animId = requestAnimationFrame(loop);
        }

        // Track mouse over hero
        const heroEl = document.querySelector('.hero');
        if (heroEl) {
            heroEl.addEventListener('mousemove', e => {
                const r = heroEl.getBoundingClientRect();
                mouseX = e.clientX - r.left;
                mouseY = e.clientY - r.top;
            }, { passive: true });
            heroEl.addEventListener('mouseleave', () => {
                mouseX = -999; mouseY = -999;
            });
        }

        resize(); init(); loop();
        window.addEventListener('resize', () => { resize(); init(); });

        // Pause when not visible
        if (heroEl) {
            const hObs = new IntersectionObserver(([e]) => {
                if (e.isIntersecting) { if (!animId) loop(); }
                else { cancelAnimationFrame(animId); animId = null; }
            }, { threshold: 0 });
            hObs.observe(heroEl);
        }
    }

    // ===== SKELETON LOADING =====
    window.addEventListener('load', () => {
        // Remove skeleton shimmer from all elements after loader completes
        setTimeout(() => {
            document.querySelectorAll('.skel').forEach(el => {
                el.classList.remove('skel');
            });
        }, 600); // slightly after the loader bar fades
    });

    // ===== SMOOTH SCROLL =====
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', function(e) {
            const h = this.getAttribute('href');
            if (h === '#') return;
            e.preventDefault();
            const t = document.querySelector(h);
            if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
})();