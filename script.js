document.addEventListener('DOMContentLoaded', () => {
    // ==========================================================================
    // THEME SELECTION & TOGGLE (LIGHT / DARK)
    // ==========================================================================
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    const themeIcon = themeToggleBtn.querySelector('i');

    const savedTheme = localStorage.getItem('carolino-theme') || 'dark';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('carolino-theme', newTheme);
        updateThemeIcon(newTheme);
        
        // Notify canvas to adjust particle colors
        if (window.resizeCanvas) {
            window.resizeCanvas();
        }
    });

    function updateThemeIcon(theme) {
        if (theme === 'light') {
            themeIcon.className = 'fa-solid fa-sun';
        } else {
            themeIcon.className = 'fa-solid fa-moon';
        }
    }

    // ==========================================================================
    // MOBILE DRAWER NAVIGATION
    // ==========================================================================
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Sticky Header Styling on Scroll
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 30) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // ==========================================================================
    // HERO 3D TILT EFFECT
    // ==========================================================================
    const tiltCard = document.getElementById('hero-tilt-card');
    const heroSection = document.querySelector('.hero-section');

    if (tiltCard && heroSection) {
        heroSection.addEventListener('mousemove', (e) => {
            const rect = heroSection.getBoundingClientRect();
            const x = e.clientX - rect.left; // x position within element
            const y = e.clientY - rect.top;  // y position within element

            // Calculate normalized positions (-0.5 to 0.5)
            const xc = ((x / rect.width) - 0.5);
            const yc = ((y / rect.height) - 0.5);

            // Calculate rotation degrees (max 20 degrees)
            const rotateX = yc * -20;
            const rotateY = xc * 20;

            // Apply 3D transform
            tiltCard.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
            
            // Move glow spot on the card
            const glowPoint = tiltCard.querySelector('.card-glow-point');
            if (glowPoint) {
                const cardRect = tiltCard.getBoundingClientRect();
                const cardX = e.clientX - cardRect.left;
                const cardY = e.clientY - cardRect.top;
                glowPoint.style.left = `${cardX}px`;
                glowPoint.style.top = `${cardY}px`;
                glowPoint.style.opacity = '1';
            }
        });

        heroSection.addEventListener('mouseleave', () => {
            tiltCard.style.transform = 'rotateX(0deg) rotateY(0deg) translateY(0px)';
            const glowPoint = tiltCard.querySelector('.card-glow-point');
            if (glowPoint) {
                glowPoint.style.opacity = '0';
            }
        });
    }

    // ==========================================================================
    // INTERACTIVE CONSTELLATION NETWORK CANVAS (IoT Theme)
    // ==========================================================================
    const canvas = document.getElementById('flow-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;
        let mouse = { x: null, y: null, active: false };

        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
            mouse.active = true;
        });

        window.addEventListener('mouseleave', () => {
            mouse.active = false;
        });

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            initConstellation();
        });

        window.resizeCanvas = function() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        class NetworkNode {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() * 0.6 - 0.3);
                this.vy = (Math.random() * 0.6 - 0.3);
                this.radius = Math.random() * 2 + 1.5;
                this.alpha = Math.random() * 0.5 + 0.25;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Wrap around edges
                if (this.x < 0) this.x = width;
                if (this.x > width) this.x = 0;
                if (this.y < 0) this.y = height;
                if (this.y > height) this.y = 0;

                // Mouse interaction
                if (mouse.active && mouse.x !== null && mouse.y !== null) {
                    const dx = this.x - mouse.x;
                    const dy = this.y - mouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) {
                        const force = (120 - dist) / 120;
                        const angle = Math.atan2(dy, dx);
                        this.x += Math.cos(angle) * force * 1.5;
                        this.y += Math.sin(angle) * force * 1.5;
                    }
                }
            }

            draw() {
                const isDark = htmlElement.getAttribute('data-theme') === 'dark';
                // Amethyst purple / fuchsia pink colors based on theme
                ctx.fillStyle = isDark 
                    ? `rgba(168, 85, 247, ${this.alpha})`
                    : `rgba(124, 58, 237, ${this.alpha * 0.6})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function initConstellation() {
            particles = [];
            // Amount based on screen size
            const nodeCount = Math.min(65, Math.floor((width * height) / 20000));
            for (let i = 0; i < nodeCount; i++) {
                particles.push(new NetworkNode());
            }
        }

        function drawLines() {
            const isDark = htmlElement.getAttribute('data-theme') === 'dark';
            const maxDistance = 140;
            
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const pi = particles[i];
                    const pj = particles[j];
                    
                    const dx = pi.x - pj.x;
                    const dy = pi.y - pj.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < maxDistance) {
                        const alpha = (maxDistance - dist) / maxDistance * 0.22;
                        ctx.strokeStyle = isDark
                            ? `rgba(236, 72, 153, ${alpha})` // Pink connections in dark mode
                            : `rgba(219, 39, 119, ${alpha * 0.5})`; // Subtler pink connections in light mode
                        ctx.lineWidth = 0.85;
                        ctx.beginPath();
                        ctx.moveTo(pi.x, pi.y);
                        ctx.lineTo(pj.x, pj.y);
                        ctx.stroke();
                    }
                }

                // Connect to mouse
                if (mouse.active && mouse.x !== null && mouse.y !== null) {
                    const pi = particles[i];
                    const dx = pi.x - mouse.x;
                    const dy = pi.y - mouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < 150) {
                        const alpha = (150 - dist) / 150 * 0.28;
                        ctx.strokeStyle = isDark
                            ? `rgba(168, 85, 247, ${alpha})` // Purple node to mouse
                            : `rgba(124, 58, 237, ${alpha * 0.6})`;
                        ctx.lineWidth = 1.1;
                        ctx.beginPath();
                        ctx.moveTo(pi.x, pi.y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.stroke();
                    }
                }
            }
        }

        function animateConstellation() {
            ctx.clearRect(0, 0, width, height);
            
            // Subtly update and draw nodes
            particles.forEach(p => {
                p.update();
                p.draw();
            });

            // Draw link lines between close nodes
            drawLines();

            requestAnimationFrame(animateConstellation);
        }

        initConstellation();
        animateConstellation();
    }

    // ==========================================================================
    // SCROLL REVEAL (INTERSECTION OBSERVER)
    // ==========================================================================
    const revealElements = document.querySelectorAll('.reveal-left, .reveal-right, .reveal-up, .journey-item');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                
                // Trigger progress animations if this is the about section content
                if (entry.target.classList.contains('about-content')) {
                    animateProgressFills();
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    function animateProgressFills() {
        const fills = document.querySelectorAll('.progress-fill');
        fills.forEach(fill => {
            const targetWidth = fill.style.width;
            fill.style.width = '0';
            setTimeout(() => {
                fill.style.width = targetWidth;
            }, 150);
        });
    }

    // ==========================================================================
    // PROJECTS CATEGORY FILTERING
    // ==========================================================================
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Manage button active class
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const category = btn.getAttribute('data-filter');

            projectCards.forEach(card => {
                const cardCat = card.getAttribute('data-category');
                
                if (category === 'all' || cardCat === category) {
                    card.style.display = 'flex';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 40);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.85)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    // ==========================================================================
    // SCROLL-ACTIVE HEADER LINK SYNC
    // ==========================================================================
    const sections = document.querySelectorAll('section[id]');
    
    window.addEventListener('scroll', () => {
        let scrollY = window.pageYOffset;
        
        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 150;
            const sectionId = current.getAttribute('id');
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                const targetLink = document.querySelector(`.nav-list a[href="#${sectionId}"]`);
                if (targetLink) {
                    navLinks.forEach(link => link.classList.remove('active'));
                    targetLink.classList.add('active');
                }
            }
        });
    });

    // ==========================================================================
    // CONTACT FORM INTERACTION
    // ==========================================================================
    const contactForm = document.getElementById('portfolio-contact-form');
    const successOverlay = document.getElementById('form-success-overlay');
    const closeOverlayBtn = document.getElementById('overlay-close');

    if (contactForm && successOverlay && closeOverlayBtn) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('.btn-submit');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.innerHTML = 'Sending message... <i class="fa-solid fa-circle-notch fa-spin"></i>';
            submitBtn.disabled = true;

            // Simulate dispatch timeout
            setTimeout(() => {
                successOverlay.classList.add('active');
                
                // Reset form state
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                contactForm.reset();
            }, 1600);
        });

        closeOverlayBtn.addEventListener('click', () => {
            successOverlay.classList.remove('active');
        });
    }

    // ==========================================================================
    // CERTIFICATES LIGHTBOX DIALOG
    // ==========================================================================
    const certCards = document.querySelectorAll('.cert-card');
    const certLightbox = document.getElementById('cert-lightbox');
    const certLightboxImg = document.getElementById('cert-lightbox-img');
    const certLightboxClose = document.getElementById('cert-lightbox-close');

    if (certCards.length && certLightbox && certLightboxImg && certLightboxClose) {
        certCards.forEach(card => {
            card.addEventListener('click', () => {
                const imgElement = card.querySelector('.cert-img');
                if (imgElement) {
                    certLightboxImg.src = imgElement.src;
                    certLightboxImg.alt = imgElement.alt;
                    certLightbox.classList.add('active');
                    document.body.style.overflow = 'hidden'; // Lock scrolling
                }
            });
        });

        const dismissLightbox = () => {
            certLightbox.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
            setTimeout(() => {
                certLightboxImg.src = '';
            }, 300);
        };

        certLightboxClose.addEventListener('click', (e) => {
            e.stopPropagation();
            dismissLightbox();
        });

        certLightbox.addEventListener('click', () => {
            dismissLightbox();
        });

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && certLightbox.classList.contains('active')) {
                dismissLightbox();
            }
        });
    }
});
