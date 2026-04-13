(() => {
    'use strict';

    const PAIR_COUNT = 13;
    const EXTRA_AFTER_FROM = 14;
    const EXTRA_AFTER_TO = 29;
    const IMG = 'assets/images';

    const padUrl = (prefix, n) => `${IMG}/${prefix}${n}.jpeg`;

    const buildCompareCard = (n) => {
        const beforeSrc = padUrl('before', n);
        const afterSrc = padUrl('after', n);
        const col = document.createElement('div');

        col.className = 'col';
        col.setAttribute('data-aos', 'fade-up');
        col.setAttribute('data-aos-delay', String(Math.min(n * 35, 350)));
        col.innerHTML = `
            <article class="premium-card portfolio-ba-card p-0 overflow-hidden h-100">
                <header class="portfolio-ba-head px-3 py-2 d-flex justify-content-between align-items-center">
                    <span class="small fw-semibold text-muted text-uppercase tracking-tight">Project ${n}</span>
                    <button type="button" class="btn btn-sm btn-link portfolio-expand p-0 text-decoration-none"
                        data-bs-toggle="modal" data-bs-target="#portfolioLightbox"
                        data-lightbox-before="${beforeSrc}" data-lightbox-after="${afterSrc}"
                        data-lightbox-title="Project ${n}">Open</button>
                </header>
                <div class="ba-compare" data-ba-compare data-pct="50"
                    role="application" aria-label="Before and after comparison for project ${n}">
                    <img class="ba-layer ba-after" src="${afterSrc}" alt="After: project ${n}" draggable="false">
                    <div class="ba-clip" data-ba-clip>
                        <img class="ba-layer ba-before" src="${beforeSrc}" alt="Before: project ${n}" draggable="false">
                    </div>
                    <div class="ba-handle" data-ba-handle tabindex="0" role="slider"
                        aria-valuemin="0" aria-valuemax="100" aria-valuenow="50"
                        aria-label="Reveal before or after"></div>
                    <span class="ba-badge ba-badge-before">Before</span>
                    <span class="ba-badge ba-badge-after">After</span>
                    <button type="button" class="ba-reset btn btn-dark btn-sm" data-ba-reset>Reset</button>
                </div>
            </article>`;
        return col;
    };

    const syncBeforeImageWidth = (compareEl) => {
        const clip = compareEl.querySelector('[data-ba-clip]');
        const beforeImg = clip && clip.querySelector('.ba-before');
        if (!beforeImg) return;
        beforeImg.style.width = `${compareEl.offsetWidth}px`;
    };

    const setPct = (compareEl, pct, skipAria = false) => {
        const boundedPct = Math.max(0, Math.min(100, pct));
        compareEl.dataset.pct = String(boundedPct);

        const clip = compareEl.querySelector('[data-ba-clip]');
        const handle = compareEl.querySelector('[data-ba-handle]');
        if (clip) clip.style.width = `${boundedPct}%`;
        if (handle) handle.style.left = `${boundedPct}%`;
        if (!skipAria && handle) {
            handle.setAttribute('aria-valuenow', String(Math.round(boundedPct)));
        }
    };

    const initCompare = (compareEl) => {
        let dragging = false;
        const handle = compareEl.querySelector('[data-ba-handle]');
        const resetBtn = compareEl.querySelector('[data-ba-reset]');

        const pointerToPct = (clientX) => {
            const rect = compareEl.getBoundingClientRect();
            if (rect.width <= 0) return 50;
            return ((clientX - rect.left) / rect.width) * 100;
        };

        const onPointerDown = (e) => {
            if (e.target.closest('[data-ba-reset]')) return;
            dragging = true;
            compareEl.setPointerCapture(e.pointerId);
            setPct(compareEl, pointerToPct(e.clientX));
        };

        const onPointerMove = (e) => {
            if (!dragging) return;
            setPct(compareEl, pointerToPct(e.clientX));
        };

        const onPointerUp = (e) => {
            if (!dragging) return;
            dragging = false;
            try {
                compareEl.releasePointerCapture(e.pointerId);
            } catch (err) {
                // Ignore release errors if capture is already gone.
            }
        };

        compareEl.addEventListener('pointerdown', onPointerDown);
        compareEl.addEventListener('pointermove', onPointerMove);
        compareEl.addEventListener('pointerup', onPointerUp);
        compareEl.addEventListener('pointercancel', onPointerUp);

        if (handle) {
            handle.addEventListener('keydown', (e) => {
                const step = e.shiftKey ? 25 : 8;
                const cur = Number.parseFloat(compareEl.dataset.pct) || 50;

                if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    setPct(compareEl, cur - step);
                } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    setPct(compareEl, cur + step);
                } else if (e.key === 'Home') {
                    e.preventDefault();
                    setPct(compareEl, 0);
                } else if (e.key === 'End') {
                    e.preventDefault();
                    setPct(compareEl, 100);
                }
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                setPct(compareEl, 50);
            });
        }

        const resizeObserver = new ResizeObserver(() => {
            syncBeforeImageWidth(compareEl);
        });
        resizeObserver.observe(compareEl);

        const initial = Number.parseFloat(compareEl.dataset.pct);
        setPct(compareEl, Number.isNaN(initial) ? 50 : initial);
        syncBeforeImageWidth(compareEl);
    };

    const refreshAllCompareSliders = () => {
        document.querySelectorAll('[data-ba-compare]').forEach((compareEl) => {
            const pct = Number.parseFloat(compareEl.dataset.pct);
            syncBeforeImageWidth(compareEl);
            setPct(compareEl, Number.isNaN(pct) ? 50 : pct);
        });
    };

    const wirePortfolioCollapse = () => {
        const collapseEl = document.getElementById('portfolioCollapse');
        const toggleBtn = document.getElementById('portfolioToggleBtn');
        if (!collapseEl || !toggleBtn) return;

        collapseEl.addEventListener('shown.bs.collapse', () => {
            toggleBtn.textContent = 'Hide gallery';
            toggleBtn.setAttribute('aria-expanded', 'true');
            refreshAllCompareSliders();
            if (typeof AOS !== 'undefined' && AOS.refresh) {
                AOS.refresh();
            }
        });

        collapseEl.addEventListener('hidden.bs.collapse', () => {
            toggleBtn.textContent = 'Photos';
            toggleBtn.setAttribute('aria-expanded', 'false');
        });
    };

    const buildReelItem = (n) => {
        const src = padUrl('after', n);
        const btn = document.createElement('button');

        btn.type = 'button';
        btn.className = 'portfolio-reel-item';
        btn.setAttribute('role', 'listitem');
        btn.setAttribute('data-bs-toggle', 'modal');
        btn.setAttribute('data-bs-target', '#portfolioLightbox');
        btn.setAttribute('data-lightbox-after', src);
        btn.setAttribute('data-lightbox-title', `Finished work ${n}`);
        btn.innerHTML = `
            <span class="portfolio-reel-frame ratio ratio-4x3 d-block">
                <img src="${src}" alt="Finished plasterwork ${n}" class="object-fit-cover" loading="lazy">
            </span>
            <span class="portfolio-reel-label">#${n}</span>`;
        return btn;
    };

    const wireLightbox = (modalEl) => {
        const imgB = document.getElementById('lightboxBefore');
        const imgA = document.getElementById('lightboxAfter');
        const titleEl = document.getElementById('portfolioLightboxLabel');
        if (!modalEl || !imgB || !imgA) return;

        modalEl.addEventListener('show.bs.modal', (event) => {
            const trigger = event.relatedTarget;
            if (!trigger) return;

            const before = trigger.getAttribute('data-lightbox-before');
            const after = trigger.getAttribute('data-lightbox-after');
            const title = trigger.getAttribute('data-lightbox-title') || 'Project';

            const colBefore = imgB.closest('.col-md-6');
            const colAfter = imgA.closest('.col-md-6');
            const subB = colBefore && colBefore.querySelector('p');
            const subA = colAfter && colAfter.querySelector('p');

            if (colBefore) colBefore.classList.remove('d-none');
            if (colAfter) colAfter.classList.remove('col-12');
            if (subB) subB.classList.remove('d-none');
            if (subA) subA.textContent = 'After';
            if (titleEl) titleEl.textContent = title;

            if (before) {
                imgB.src = before;
                imgB.alt = `Before: ${title}`;
                imgA.src = after || '';
                imgA.alt = `After: ${title}`;
                return;
            }

            if (after) {
                imgB.removeAttribute('src');
                imgA.src = after;
                imgA.alt = title;
                if (colBefore) colBefore.classList.add('d-none');
                if (colAfter) colAfter.classList.add('col-12');
                if (subB) subB.classList.add('d-none');
                if (subA) subA.textContent = 'Finished';
            }
        });

        modalEl.addEventListener('hidden.bs.modal', () => {
            imgB.removeAttribute('src');
            imgA.removeAttribute('src');
        });
    };

    const init = () => {
        const grid = document.getElementById('beforeAfterGrid');
        const reel = document.getElementById('afterReel');
        const modal = document.getElementById('portfolioLightbox');

        if (grid) {
            for (let i = 1; i <= PAIR_COUNT; i += 1) {
                grid.appendChild(buildCompareCard(i));
            }
            grid.querySelectorAll('[data-ba-compare]').forEach(initCompare);
        }

        if (reel) {
            for (let j = EXTRA_AFTER_FROM; j <= EXTRA_AFTER_TO; j += 1) {
                reel.appendChild(buildReelItem(j));
            }
        }

        if (modal) {
            wireLightbox(modal);
        }

        wirePortfolioCollapse();

        if (typeof AOS !== 'undefined' && AOS.refresh) {
            AOS.refresh();
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
