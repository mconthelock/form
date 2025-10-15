<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { withBase } from "vitepress";

type Img = {
    src: string;
    alt?: string;
    caption?: string;
    thumb?: string;
};

const props = withDefaults(
    defineProps<{
        /** Single image source (use this OR images[]) */
        src?: string;
        /** Alt text for single image */
        alt?: string;
        /** Optional caption for single image */
        caption?: string;
        /** Optional width of the inline (thumbnail) image, e.g. '320' or '50%'. */
        width?: string;
        /** Optional height of the inline (thumbnail) image. */
        height?: string;
        /** If provided, renders a gallery that opens a lightbox. */
        images?: Img[];
        /** Enable zoom-in animation */
        animated?: boolean;
        /** Click on dark area closes (default: true) */
        backdropClosable?: boolean;
        /** Show a big inline preview (hero) when images[] provided */
        hero?: boolean;
        /** Height of the hero area (e.g. '420px', '50vh') */
        heroHeight?: string;
        /** Show thumbnail strip under hero */
        showThumbs?: boolean;
        /** Autoplay interval in ms for hero/overlay (0 to disable) */
        autoplayMs?: number;
        /** Pause autoplay on hover */
        pauseOnHover?: boolean;
    }>(),
    {
        animated: true,
        backdropClosable: true,
        hero: true,
        heroHeight: "420px",
        showThumbs: true,
        autoplayMs: 4000,
        pauseOnHover: true,
    }
);
// helper ให้ path ถูกกับ base เสมอ
const r = (s?: string) => (s ? withBase(s) : "");

const isOpen = ref(false);
const activeIndex = ref(0);

// const list = computed<Img[]>(() => {
//     if (props.images && props.images.length) return props.images;
//     if (props.src)
//         return [{ src: props.src, alt: props.alt, caption: props.caption }];
//     return [];
// });

const list = computed<Img[]>(() => {
  const arr = props.images && props.images.length
    ? props.images
    : (props.src ? [{ src: props.src, alt: props.alt, caption: props.caption }] : []);
  // map ให้ src/thumb ผ่าน withBase ตั้งแต่ต้น
  return arr.map(it => ({ ...it, src: r(it.src), thumb: r(it.thumb) }));
});

function open(idx = 0) {
    activeIndex.value = idx;
    isOpen.value = true;
}

function close() {
    isOpen.value = false;
}
function next() {
    activeIndex.value = (activeIndex.value + 1) % list.value.length;
}
function prev() {
    activeIndex.value =
        (activeIndex.value - 1 + list.value.length) % list.value.length;
}

function onKey(e: KeyboardEvent) {
    if (!isOpen.value) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowRight") next();
    else if (e.key === "ArrowLeft") prev();
}

function onBackdrop(e: MouseEvent) {
    if (!props.backdropClosable) return;
    const el = e.target as HTMLElement;
    // อย่าปิดเมื่อคลิกบนปุ่ม/ทูลบาร์/แคปชัน
    if (
        el.closest(".fancy-btn") ||
        el.closest(".fancy-toolbar") ||
        el.closest(".fancy-caption") ||
        el.closest(".fancy-lightbox-thumbs")
    )
        return;
    // ปิดเมื่อคลิกพื้นที่มืดที่อยู่นอกตัวรูปเต็ม
    if (!el.closest("img.fancy-full")) close();
}

function onStageClick(e: MouseEvent) {
    if (!props.backdropClosable) return;
    const el = e.target as HTMLElement;
    // ภายใน stage ถ้าคลิกไม่โดนรูป ให้ปิด
    if (
        !(el instanceof HTMLImageElement) ||
        !el.classList.contains("fancy-full")
    ) {
        close();
    }
}

let timer: number | undefined;
function startAutoplay() {
    if (!props.autoplayMs || props.autoplayMs <= 0) return;
    if (list.value.length <= 1) return;
    stopAutoplay();
    timer = window.setInterval(() => next(), props.autoplayMs);
}
function stopAutoplay() {
    if (timer) {
        clearInterval(timer);
        timer = undefined;
    }
}
function pause() {
    if (props.pauseOnHover) stopAutoplay();
}
function resume() {
    if (props.pauseOnHover) startAutoplay();
}

watch([isOpen, () => props.autoplayMs, () => list.value.length], () => {
    stopAutoplay();
    if (isOpen.value || props.hero) startAutoplay();
});

onMounted(() => {
    window.addEventListener("keydown", onKey);
    if (props.hero) startAutoplay();
});

onBeforeUnmount(() => {
    window.removeEventListener("keydown", onKey);
    stopAutoplay();
});
</script>

<template>
    <!-- Inline single image mode -->
    <figure v-if="(!images || images.length === 0) && src" class="fancy-fig">
        <img
            :src="withBase(src)"
            :alt="alt"
            class="fancy-thumb"
            :style="{ width: width || 'auto', height: height || 'auto' }"
            @click="open(0)"
            loading="lazy"
            decoding="async"
        />
        <figcaption v-if="caption" class="fancy-cap">{{ caption }}</figcaption>
    </figure>

    <!-- Hero + thumbnails (when images[] provided) -->
    <div
        v-else-if="images && images.length"
        class="fancy-hero"
        :style="{ height: heroHeight }"
        @mouseenter="pause"
        @mouseleave="resume"
    >
        <div class="fancy-hero-main">
            <img
                :src="list[activeIndex]?.src"
                :alt="list[activeIndex]?.alt || ''"
                class="fancy-hero-img"
                @click="open(activeIndex)"
                draggable="false"
                loading="lazy"
                decoding="async"
            />
        </div>
        <div v-if="showThumbs" class="fancy-thumbs">
            <img
                v-for="(img, i) in list"
                :key="i"
                :src="img.thumb || img.src"
                :alt="img.alt || ''"
                class="fancy-thumb small"
                :class="{ active: i === activeIndex }"
                @click="activeIndex = i"
                loading="lazy"
                decoding="async"
            />
        </div>
    </div>

    <!-- Lightbox -->
    <teleport to="body">
        <div
            v-if="isOpen"
            class="fancy-overlay"
            @click="onBackdrop"
            @mouseenter="pause"
            @mouseleave="resume"
        >
            <div class="fancy-toolbar">
                <button
                    class="fancy-btn"
                    aria-label="Previous"
                    @click.stop.prevent="prev"
                    v-if="list.length > 1"
                >
                    ◀
                </button>
                <button
                    class="fancy-btn"
                    aria-label="Close"
                    @click.stop.prevent="close"
                >
                    ✕
                </button>
                <button
                    class="fancy-btn"
                    aria-label="Next"
                    @click.stop.prevent="next"
                    v-if="list.length > 1"
                >
                    ▶
                </button>
            </div>

            <div class="fancy-stage" @click="onStageClick">
                <transition name="zoom" mode="out-in" v-if="animated">
                    <img
                        :key="list[activeIndex]?.src"
                        class="fancy-full"
                        :src="list[activeIndex]?.src"
                        :alt="list[activeIndex]?.alt || ''"
                        draggable="false"
                    />
                </transition>
                <img
                    v-else
                    class="fancy-full"
                    :src="list[activeIndex]?.src"
                    :alt="list[activeIndex]?.alt || ''"
                    draggable="false"
                />
            </div>

            <div v-if="list.length > 1" class="fancy-lightbox-thumbs">
                <img
                    v-for="(img, i) in list"
                    :key="i"
                    :src="img.thumb || img.src"
                    :alt="img.alt || ''"
                    class="fancy-thumb small"
                    :class="{ active: i === activeIndex }"
                    @click.stop="activeIndex = i"
                />
            </div>

            <p v-if="list[activeIndex]?.caption" class="fancy-caption">
                {{ list[activeIndex]?.caption }}
            </p>
        </div>
    </teleport>
</template>

<style scoped>
/* Inline thumbs in simple mode */
.fancy-gallery {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
}
.fancy-fig {
    margin: 0;
}
.fancy-thumb {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    cursor: zoom-in;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: transform 0.15s ease;
}
.fancy-thumb:hover {
    transform: translateY(-2px);
}
.fancy-cap {
    font-size: 0.85rem;
    color: var(--vp-c-text-2);
    margin-top: 4px;
}

/* Hero + thumbnails */
.fancy-hero {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.fancy-hero-main {
    flex: 1;
    display: grid;
    place-items: center;
    background: var(--vp-c-bg-soft);
    border-radius: 12px;
    overflow: hidden;
}
.fancy-hero-img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    cursor: zoom-in;
}
.fancy-thumbs {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 6px;
    justify-content: center;
    background-color: var(--vp-c-bg-soft);
    padding: 6px;
    border-radius: 8px;
}
.fancy-thumb.small {
    width: 90px;
    height: 60px;
    object-fit: cover;
    border-radius: 6px;
    opacity: 0.75;
    cursor: pointer;
}
.fancy-thumb.small.active {
    outline: 2px solid var(--vp-c-brand);
    opacity: 1;
}

/* Lightbox */
.fancy-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.9);
    display: grid;
    grid-template-rows: auto 1fr auto;
    z-index: 9999;
}
.fancy-stage {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    overflow: hidden;
    z-index: 1;
}

.fancy-full {
    display: block;
    margin: 0 auto;
    max-width: min(90vw, 1400px);
    max-height: 80vh;
    object-fit: contain;
    user-select: none;
}

/* Thumbnails bar inside lightbox */
.fancy-lightbox-thumbs {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 8px;
    max-width: 90vw;
    overflow-x: auto;
    padding: 6px 12px;
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    z-index: 1;
}

.fancy-lightbox-thumbs img {
    width: 80px;
    height: 56px;
    object-fit: cover;
    border-radius: 6px;
    opacity: 0.6;
    cursor: pointer;
    transition: opacity 0.2s;
}

.fancy-lightbox-thumbs img.active,
.fancy-lightbox-thumbs img:hover {
    opacity: 1;
    outline: 2px solid var(--vp-c-brand);
}
.fancy-caption {
    color: #ddd;
    text-align: center;
    padding: 10px 16px;
}

/* Toolbar & arrows at sides */
.fancy-toolbar {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 2;
}
.fancy-btn {
    all: unset; /* reset ปุ่มกันสไตล์จากธีมมากระทบ */
    pointer-events: auto;
    background: rgba(0, 0, 0, 0.35);
    color: #fff;
    width: 40px;
    height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border-radius: 999px;
    cursor: pointer;
}
.fancy-btn:hover {
    background: rgba(255, 255, 255, 0.25);
}
.fancy-toolbar [aria-label="Previous"] {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 28px;
}
.fancy-toolbar [aria-label="Next"] {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 28px;
}
.fancy-toolbar [aria-label="Close"] {
    position: absolute;
    right: 16px;
    top: 16px;
    font-size: 18px;
}

/* Zoom transition */
.zoom-enter-active,
.zoom-leave-active {
    transition: opacity 0.18s ease, transform 0.18s ease;
}
.zoom-enter-from,
.zoom-leave-to {
    opacity: 0;
    transform: scale(0.98);
}
</style>
