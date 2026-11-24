import { flowState, getStepName, prefersReducedMotion } from './state';

// ============================================================================
// Pointer & Keyboard Drag-and-Drop (with Drop Marker, FLIP & Auto-Scroll)
// ============================================================================

export function initFlowDragAndDrop({
    moveNode,
    animateFlip,
    syncOrderFromDom,
    announceLive,
}) {
    const list = document.getElementById('flow-list-row');
    const scroller = document.getElementById('flow-scroll-container');
    if (!list || !scroller) return;

    let drag = null;
    let grabbed = null;
    let suppressBlur = false;

    const getItems = () =>
        Array.from(list.querySelectorAll(':scope > .flow-step-item'));

    function clearDropMarker() {
        list.removeAttribute('data-drop');
        list.style.removeProperty('--drop-x');
        list.style.removeProperty('--drop-y');
        list.style.removeProperty('--drop-w');
        list.style.removeProperty('--drop-h');
    }

    function computeDropTarget(clientY) {
        const items = getItems();
        const scrollerRect = scroller.getBoundingClientRect();
        const clampedY = Math.min(
            Math.max(clientY, scrollerRect.top),
            scrollerRect.bottom,
        );
        const listRect = list.getBoundingClientRect();
        const yInList = clampedY - listRect.top - list.clientTop;

        let referenceNode = null;
        for (const sibling of items) {
            if (sibling === drag.item) continue;
            const mid = sibling.offsetTop + sibling.offsetHeight / 2;
            if (yInList < mid) {
                referenceNode = sibling;
                break;
            }
        }
        return referenceNode;
    }

    function updateDropMarker(referenceNode) {
        if (
            !drag ||
            referenceNode === drag.item.nextElementSibling ||
            referenceNode === drag.item
        ) {
            clearDropMarker();
            return;
        }

        const items = getItems().filter((el) => el !== drag.item);
        if (items.length === 0) {
            clearDropMarker();
            return;
        }

        let markerY;
        let sampleRect;
        if (referenceNode) {
            const nextRect = referenceNode.getBoundingClientRect();
            const prevIdx = items.indexOf(referenceNode) - 1;
            const prevEl = prevIdx >= 0 ? items[prevIdx] : null;
            markerY = prevEl
                ? (prevEl.getBoundingClientRect().bottom + nextRect.top) / 2
                : nextRect.top - 3;
            sampleRect = nextRect;
        } else {
            const lastRect = items[items.length - 1].getBoundingClientRect();
            markerY = lastRect.bottom + 3;
            sampleRect = lastRect;
        }

        list.setAttribute('data-drop', '');
        list.style.setProperty('--drop-x', `${sampleRect.left}px`);
        list.style.setProperty('--drop-y', `${markerY}px`);
        list.style.setProperty('--drop-w', `${sampleRect.width}px`);
        list.style.setProperty('--drop-h', '2px');
    }

    function updateDraggedPosition() {
        if (!drag) return;
        const scrollDelta = scroller.scrollTop - drag.startScrollTop;
        const dy = drag.lastClientY - drag.startClientY + scrollDelta;
        drag.item.style.translate = `0 ${dy}px`;
        drag.referenceNode = computeDropTarget(drag.lastClientY);
        updateDropMarker(drag.referenceNode);
    }

    function autoScrollStep(now) {
        if (!drag) return;
        const dt = Math.min(32, now - (drag.lastFrameTime || now));
        drag.lastFrameTime = now;

        const rect = scroller.getBoundingClientRect();
        const edgeZone = Math.min(drag.itemHeight, rect.height / 3);
        let speed = 0;

        if (drag.lastClientY < rect.top + edgeZone) {
            const depth = rect.top + edgeZone - drag.lastClientY;
            speed = -Math.min(18, (depth / edgeZone) * 10);
        } else if (drag.lastClientY > rect.bottom - edgeZone) {
            const depth = drag.lastClientY - (rect.bottom - edgeZone);
            speed = Math.min(18, (depth / edgeZone) * 10);
        }

        if (speed !== 0) {
            const prev = scroller.scrollTop;
            scroller.scrollTop += speed * (dt / 16);
            if (scroller.scrollTop !== prev) {
                updateDraggedPosition();
            }
        }
        drag.rafId = requestAnimationFrame(autoScrollStep);
    }

    function endPointerDrag(cancelled) {
        if (!drag) return;
        const currentDrag = drag;
        drag = null;

        cancelAnimationFrame(currentDrag.rafId);
        document.documentElement.classList.remove('flow-dragging');
        clearDropMarker();

        const item = currentDrag.item;
        const items = getItems();
        const beforeRects = new Map(
            items.map((el) => [el, el.getBoundingClientRect()]),
        );
        const releasedRect = item.getBoundingClientRect();

        item.style.removeProperty('translate');

        const changed =
            !cancelled &&
            currentDrag.referenceNode !== item.nextElementSibling &&
            currentDrag.referenceNode !== item;

        if (changed) {
            moveNode(list, item, currentDrag.referenceNode);
            item.scrollIntoView({ block: 'nearest', inline: 'nearest' });
            syncOrderFromDom();
        } else if (cancelled) {
            item.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        }

        if (!prefersReducedMotion()) {
            const others = items.filter((el) => el !== item);
            if (changed) animateFlip(others, beforeRects);

            item.getAnimations().forEach((anim) => anim.finish());
            const finalRect = item.getBoundingClientRect();
            const dy = releasedRect.top - finalRect.top;
            if (Math.abs(dy) >= 0.5) {
                const anim = item.animate(
                    [{ translate: `0 ${dy}px` }, { translate: '0 0' }],
                    { duration: 180, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
                );
                anim.finished
                    .then(() => {
                        if (!drag || drag.item !== item) {
                            delete item.dataset.dragging;
                        }
                    })
                    .catch(() => {});
            } else {
                delete item.dataset.dragging;
            }
        } else {
            delete item.dataset.dragging;
        }

        if (changed) {
            const newIdx = getItems().indexOf(item);
            const step = flowState.sortFlow[newIdx];
            if (step) {
                announceLive(
                    `Moved ${getStepName(step)} to position ${newIdx + 1} of ${flowState.sortFlow.length}`,
                );
            }
        } else if (cancelled) {
            announceLive('Reorder cancelled');
        }
    }

    list.addEventListener('pointerdown', (e) => {
        if (e.button !== 0 || drag || flowState.searchQuery.trim() !== '')
            return;
        const handle = e.target.closest('.flow-drag-handle');
        if (!handle || handle.disabled) return;
        const item = handle.closest('.flow-step-item');
        if (!item) return;

        e.preventDefault();
        handle.setPointerCapture(e.pointerId);

        item.getAnimations().forEach((anim) => anim.finish());
        item.dataset.dragging = 'true';
        document.documentElement.classList.add('flow-dragging');

        drag = {
            pointerId: e.pointerId,
            handle,
            item,
            itemHeight: item.getBoundingClientRect().height,
            startClientY: e.clientY,
            lastClientY: e.clientY,
            startScrollTop: scroller.scrollTop,
            referenceNode: item.nextElementSibling,
            rafId: 0,
            lastFrameTime: performance.now(),
        };
        drag.rafId = requestAnimationFrame(autoScrollStep);
    });

    document.addEventListener('pointermove', (e) => {
        if (!drag || e.pointerId !== drag.pointerId) return;
        drag.lastClientY = e.clientY;
        updateDraggedPosition();
    });

    document.addEventListener('pointerup', (e) => {
        if (!drag || e.pointerId !== drag.pointerId) return;
        endPointerDrag(false);
    });

    document.addEventListener('pointercancel', (e) => {
        if (!drag || e.pointerId !== drag.pointerId) return;
        endPointerDrag(true);
    });

    list.addEventListener('lostpointercapture', (e) => {
        if (!drag || e.pointerId !== drag.pointerId) return;
        endPointerDrag(false);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && drag) {
            e.preventDefault();
            endPointerDrag(true);
        }
    });

    // Keyboard grab-move-drop on drag handle
    function dropKeyboardGrab(cancelled) {
        if (!grabbed) return;
        const { item, handle, origRefNode, origIndex } = grabbed;
        grabbed = null;

        handle.setAttribute('aria-pressed', 'false');
        delete item.dataset.grabbed;
        const hint = item.querySelector('.flow-kbd-hint');
        if (hint) hint.textContent = 'Space to reorder';

        if (cancelled) {
            const items = getItems();
            const beforeRects = new Map(
                items.map((el) => [el, el.getBoundingClientRect()]),
            );
            suppressBlur = true;
            moveNode(list, item, origRefNode);
            item.scrollIntoView({ block: 'nearest', inline: 'nearest' });
            handle.focus({ preventScroll: true });
            suppressBlur = false;
            animateFlip(items, beforeRects);
            syncOrderFromDom();
            announceLive(
                `Reorder cancelled. Returned to position ${origIndex + 1}`,
            );
        } else {
            const newIdx = getItems().indexOf(item);
            if (newIdx !== origIndex) {
                const step = flowState.sortFlow[newIdx];
                announceLive(
                    `Dropped ${getStepName(step)} at position ${newIdx + 1} of ${flowState.sortFlow.length}`,
                );
            }
        }
    }

    list.addEventListener('keydown', (e) => {
        const handle = e.target.closest('.flow-drag-handle');
        if (!handle || handle.disabled) return;
        const item = handle.closest('.flow-step-item');
        if (!item) return;

        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            if (grabbed && grabbed.item === item) {
                dropKeyboardGrab(false);
            } else {
                const items = getItems();
                const origIndex = items.indexOf(item);
                grabbed = {
                    item,
                    handle,
                    origIndex,
                    origRefNode: item.nextElementSibling,
                };
                handle.setAttribute('aria-pressed', 'true');
                item.dataset.grabbed = 'true';
                const hint = item.querySelector('.flow-kbd-hint');
                if (hint) {
                    hint.textContent =
                        'Arrows to move · Space to drop · Esc to cancel';
                }
                const step = flowState.sortFlow[origIndex];
                announceLive(
                    `Grabbed ${getStepName(step)}, position ${origIndex + 1} of ${items.length}. Use Up and Down arrows to move, Space to drop, Escape to cancel.`,
                );
            }
            return;
        }

        if (!grabbed || grabbed.item !== item) return;

        if (e.key === 'Escape') {
            e.preventDefault();
            dropKeyboardGrab(true);
            return;
        }

        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
            const direction = e.key === 'ArrowUp' ? -1 : 1;
            const items = getItems();
            const idx = items.indexOf(item);
            const targetIdx = idx + direction;
            if (targetIdx < 0 || targetIdx >= items.length) return;

            const beforeRects = new Map(
                items.map((el) => [el, el.getBoundingClientRect()]),
            );
            const refNode =
                direction < 0
                    ? items[targetIdx]
                    : items[targetIdx].nextElementSibling;
            suppressBlur = true;
            moveNode(list, item, refNode);
            item.scrollIntoView({ block: 'nearest', inline: 'nearest' });
            handle.focus({ preventScroll: true });
            suppressBlur = false;
            animateFlip(items, beforeRects);
            syncOrderFromDom();

            const step = flowState.sortFlow[targetIdx];
            announceLive(
                `${getStepName(step)}, position ${targetIdx + 1} of ${items.length}`,
            );
        }
    });

    list.addEventListener(
        'focusout',
        (e) => {
            if (suppressBlur) return;
            if (grabbed && e.target === grabbed.handle) {
                dropKeyboardGrab(false);
            }
        },
        true,
    );

    list.addEventListener('focusin', (e) => {
        const item = e.target.closest('.flow-step-item');
        if (!item) return;
        if (
            e.target.matches(':focus-visible') &&
            item.getAnimations().length === 0
        ) {
            item.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        }
    });
}
