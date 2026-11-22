<script setup>
import { computed, onMounted, ref } from 'vue'
import { hasRoleAccess } from '../../roles.js'
import { useUserRole } from '../composables/useUserRole.js'

const props = defineProps({
  roles: {
    type: Array,
    default: () => [],
  },
})

const { role } = useUserRole()
const isMounted = ref(false)

const allowed = computed(() => {
  if (!isMounted.value) return false
  return hasRoleAccess(role.value, props.roles)
})

onMounted(() => {
  isMounted.value = true
})
</script>

<template>
  <template v-if="allowed">
    <slot />
  </template>
  <template v-else-if="isMounted && $slots.fallback">
    <slot name="fallback" />
  </template>
</template>
