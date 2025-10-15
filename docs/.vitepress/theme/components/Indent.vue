<!-- <template>
  <component :is="tag" :style="styleObj">
    <slot></slot>
  </component>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'

type Mode = 'first-line' | 'block'
type Unit = 'em' | 'px' | 'rem' | 'ch'

interface Props {
  amount?: number | string
  unit?: Unit
  mode?: Mode
  tag?: string
}

const props = withDefaults(defineProps<Props>(), {
  amount: 2,
  unit: 'em',
  mode: 'first-line',
  tag: 'p'
})

const styleObj = computed<CSSProperties>(() => {
  const n = typeof props.amount === 'number' ? props.amount : parseFloat(String(props.amount)) || 0
  const distance = `${n}${props.unit}`
  return props.mode === 'first-line'
    ? { textIndent: distance }
    : { marginLeft: distance }
})
</script> -->

<template>
  <component :is="tag" :style="styleObj">
    <slot></slot>
  </component>
</template>

<script setup>
import { computed } from 'vue'

const { amount = 2, unit = 'em', mode = 'first-line', tag = 'p' } = defineProps({
  amount: { type: [Number, String], default: 2 },
  unit:   { type: String, default: 'em' },
  mode:   { type: String, default: 'first-line' }, // or 'block'
  tag:    { type: String, default: 'p' }
})

const styleObj = computed(() => {
  const n = typeof amount === 'number' ? amount : parseFloat(String(amount)) || 0
  const distance = `${n}${unit}`
  return mode === 'first-line'
    ? { textIndent: distance }
    : { marginLeft: distance }
})
</script>

