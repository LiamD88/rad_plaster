(function () {
    'use strict';

    var PAIR_COUNT = 13;
    var EXTRA_AFTER_FROM = 14;
    var EXTRA_AFTER_TO = 29;
    var IMG = 'assets/images';

    function padUrl(prefix, n) {
        return IMG + '/' + prefix + n + '.jpeg';
    }

    function buildCompareCard(n) {
        var beforeSrc = padUrl('before', n);
        var afterSrc = padUrl('after', n);
        var col = document.createElement('div');
        col.className = 'col';
        col.setAttribute('data-aos', 'fade-up');
        col.setAttribute('data-aos-delay', String(Math.min(n * 35, 350)));
        col.innerHTML =
            '<article class="premium-card portfolio-ba-card p-0 overflow-hidden h-100">' +
            '  <header class="portfolio-ba-head px-3 py-2 d-flex justify-content-between align-items-center">' +
            '    <span class="small fw-semibold text-muted text-uppercase tracking-tight">Project ' + n + '</span>' +
            '    <button type="button" class="btn btn-sm btn-link portfolio-expand p-0 text-decoration-none"' +
            '      data-bs-toggle="modal" data-bs-target="#portfolioLightbox"' +
            '      data-lightbox-before="' + beforeSrc + '"' +
            '      data-lightbox-after="' + afterSrc + '"' +
            '      data-lightbox-title="Project ' + n + '">Open</button>' +
            '  </header>' +
            '  <div class="ba-compare" data-ba-compare data-pct="50"' +
            '       role="application" aria-label="Before and after comparison for project ' + n + '">' +
            '    <img class="ba-layer ba-after" src="' + afterSrc + '" alt="After: project ' + n + '" draggable="false">' +
            '    <div class="ba-clip" data-ba-clip>' +
            '      <img class="ba-layer ba-before" src="' + beforeSrc + '" alt="Before: project ' + n + '" draggable="false">' +
            '    </div>' +
            '    <div class="ba-handle" data-ba-handle tabindex="0" role="slider"' +
            '         aria-valuemin="0" aria-valuemax="100" aria-valuenow="50"' +
            '         aria-label="Reveal before or after"></div>' +
            '    <span class="ba-badge ba-badge-before">Before</span>' +
            '    <span class="ba-badge ba-badge-after">After</span>' +
            '    <button type="button" class="ba-reset btn btn-dark btn-sm" data-ba-reset>Reset</button>' +
            '  </div>' +
            '</article>';
        return col;
    }

    function syncBeforeImageWidth(compareEl) {
        var clip = compareEl.querySelector('[data-ba-clip]');
        var beforeImg = clip && clip.querySelector('.ba-before');
        if (!beforeImg) return;
        beforeImg.style.width = compareEl.offsetWidth + 'px';
    }

    function setPct(compareEl, pct, skipAria) {
        pct = Math.max(0, Math.min(100, pct));
        compareEl.dataset.pct = String(pct);
        var clip = compareEl.querySelector('[data-ba-clip]');
        var handle = compareEl.querySelector('[data-ba-handle]');
        if (clip) clip.style.width = pct + '%';
        if (handle) handle.style.left = pct + '%';
        if (!skipAria && handle) {
            handle.setAttribute('aria-valuenow', String(Math.round(pct)));
        }
    }

    function initCompare(compareEl) {
        var dragging = false;
        var clip = compareEl.querySelector('[data-ba-clip]');
        var handle = compareEl.querySelector('[data-ba-handle]');
        var resetBtn = compareEl.querySelector('[data-ba-reset]');

        function pointerToPct(clientX) {
            var rect = compareEl.getBoundingClientRect();
            if (rect.width <= 0) return 50;
            return ((clientX - rect.left) / rect.width) * 100;
        }

        function onPointerDown(e) {
            if (e.target.closest('[data-ba-reset]')) return;
            dragging = true;
            compareEl.setPointerCapture(e.pointerId);
            setPct(compareEl, pointerToPct(e.clientX));
        }

        function onPointerMove(e) {
            if (!dragging) return;
            setPct(compareEl, pointerToPct(e.clientX));
        }

        function onPointerUp(e) {
            if (dragging) {
                dragging = false;
                try {
                    compareEl.releasePointerCapture(e.pointerId);
                } catch (err) { /* ignore */ }
            }
        }

        compareEl.addEventListener('pointerdown', onPointerDown);
        compareEl.addEventListener('pointermove', onPointerMove);
        compareEl.addEventListener('pointerup', onPointerUp);
        compareEl.addEventListener('pointercancel', onPointerUp);

        if (handle) {
            handle.addEventListener('keydown', function (e) {
                var step = e.shiftKey ? 25 : 8;
                var cur = parseFloat(compareEl.dataset.pct) || 50;
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
            resetBtn.addEventListener('click', function () {
                setPct(compareEl, 50);
            });
        }

        var ro = new ResizeObserver(function () {
            syncBeforeImageWidth(compareEl);
        });
        ro.observe(compareEl);

        var initial = parseFloat(compareEl.dataset.pct);
        if (isNaN(initial)) initial = 50;
        setPct(compareEl, initial);
        syncBeforeImageWidth(compareEl);
    }

    function refreshAllCompareSliders() {
        document.querySelectorAll('[data-ba-compare]').forEach(function (compareEl) {
            var pct = parseFloat(compareEl.dataset.pct);
            if (isNaN(pct)) pct = 50;
            syncBeforeImageWidth(compareEl);
            setPct(compareEl, pct);
        });
    }

    function wirePortfolioCollapse() {
        var collapseEl = document.getElementById('portfolioCollapse');
        var toggleBtn = document.getElementById('portfolioToggleBtn');
        if (!collapseEl || !toggleBtn) return;

        collapseEl.addEventListener('shown.bs.collapse', function () {
            toggleBtn.textContent = 'Hide gallery';
            toggleBtn.setAttribute('aria-expanded', 'true');
            refreshAllCompareSliders();
            if (typeof AOS !== 'undefined' && AOS.refresh) {
                AOS.refresh();
            }
        });

        collapseEl.addEventListener('hidden.bs.collapse', function () {
            toggleBtn.textContent = 'Photos';
            toggleBtn.setAttribute('aria-expanded', 'false');
        });
    }

    function buildReelItem(n) {
        var src = padUrl('after', n);
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'portfolio-reel-item';
        btn.setAttribute('role', 'listitem');
        btn.setAttribute('data-bs-toggle', 'modal');
        btn.setAttribute('data-bs-target', '#portfolioLightbox');
        btn.setAttribute('data-lightbox-after', src);
        btn.setAttribute('data-lightbox-title', 'Finished work ' + n);
        btn.innerHTML =
            '<span class="portfolio-reel-frame ratio ratio-4x3 d-block">' +
            '  <img src="' + src + '" alt="Finished plasterwork ' + n + '" class="object-fit-cover" loading="lazy">' +
            '</span>' +
            '<span class="portfolio-reel-label">#' + n + '</span>';
        return btn;
    }

    function wireLightbox(modalEl) {
        var imgB = document.getElementById('lightboxBefore');
        var imgA = document.getElementById('lightboxAfter');
        var titleEl = document.getElementById('portfolioLightboxLabel');
        if (!modalEl || !imgB || !imgA) return;

        modalEl.addEventListener('show.bs.modal', function (event) {
            var trigger = event.relatedTarget;
            if (!trigger) return;
            var before = trigger.getAttribute('data-lightbox-before');
            var after = trigger.getAttribute('data-lightbox-after');
            var title = trigger.getAttribute('data-lightbox-title') || 'Project';

            var colBefore = imgB.closest('.col-md-6');
            var colAfter = imgA.closest('.col-md-6');
            var subB = colBefore && colBefore.querySelector('p');
            var subA = colAfter && colAfter.querySelector('p');

            if (colBefore) colBefore.classList.remove('d-none');
            if (colAfter) colAfter.classList.remove('col-12');
            if (subB) subB.classList.remove('d-none');
            if (subA) subA.textContent = 'After';

            if (titleEl) titleEl.textContent = title;

            if (before) {
                imgB.src = before;
                imgB.alt = 'Before: ' + title;
                imgA.src = after || '';
                imgA.alt = 'After: ' + title;
            } else if (after) {
                imgB.removeAttribute('src');
                imgA.src = after;
                imgA.alt = title;
                if (colBefore) colBefore.classList.add('d-none');
                if (colAfter) colAfter.classList.add('col-12');
                if (subB) subB.classList.add('d-none');
                if (subA) subA.textContent = 'Finished';
            }
        });

        modalEl.addEventListener('hidden.bs.modal', function () {
            imgB.removeAttribute('src');
            imgA.removeAttribute('src');
        });
    }

    function init() {
        var grid = document.getElementById('beforeAfterGrid');
        var reel = document.getElementById('afterReel');
        var modal = document.getElementById('portfolioLightbox');

        if (grid) {
            for (var i = 1; i <= PAIR_COUNT; i++) {
                grid.appendChild(buildCompareCard(i));
            }
            grid.querySelectorAll('[data-ba-compare]').forEach(initCompare);
        }

        if (reel) {
            for (var j = EXTRA_AFTER_FROM; j <= EXTRA_AFTER_TO; j++) {
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
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
