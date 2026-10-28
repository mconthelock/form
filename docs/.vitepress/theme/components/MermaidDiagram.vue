
<template>
  <div class="mermaid-wrapper">
    <div v-if="error" class="mermaid-error">
      ไม่สามารถแสดง Mermaid Diagram ได้
      <pre>{{ error }}</pre>
    </div>

    <div
      v-else
      class="mermaid-diagram"
      v-html="svg"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, useId, watch } from 'vue'
import { useData } from 'vitepress'
import mermaid from 'mermaid'

const props = defineProps({
  code: {
    type: String,
    required: true
  }
})

const { isDark } = useData()

const theme = computed(() =>
  isDark.value ? 'dark' : 'default'
)

const svg = ref('')
const error = ref('')
const mounted = ref(false)

let renderVersion = 0
const diagramId = `mermaid-${useId()}`

async function renderDiagram() {
  if (!mounted.value) return

  const version = ++renderVersion

  try {
    error.value = ''

    await document.fonts.ready

    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      fontFamily: getComputedStyle(document.body).fontFamily,
      theme: theme.value
    })

    const result = await mermaid.render(diagramId, props.code)

    if (version !== renderVersion) return

    svg.value = result.svg
  } catch (err) {
    if (version !== renderVersion) return

    svg.value = ''
    error.value = err instanceof Error
      ? err.message
      : String(err)
  }
}

onMounted(() => {
  mounted.value = true
  void renderDiagram()
})

watch(
  [() => props.code, theme],
  () => void renderDiagram()
)
</script>

<style scoped>
.mermaid-wrapper {
  width: 100%;
  margin: 1.5rem 0;
  overflow-x: auto;
}

.mermaid-diagram {
  display: flex;
  justify-content: center;
  min-width: fit-content;
}

.mermaid-diagram :deep(svg) {
  max-width: 100%;
  height: auto;
}

.mermaid-diagram :deep(.nodeLabel p) {
  line-height: 1.5;
}

.mermaid-error {
  color: #dc2626;
  padding: 1rem;
  border: 1px solid currentColor;
  border-radius: 8px;
}

.mermaid-error pre {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
</style>
