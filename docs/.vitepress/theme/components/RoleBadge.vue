<script setup>
import { onMounted, ref } from 'vue'
import { useUserRole } from '../composables/useUserRole.js'

const { role, roleInfo, empno, groupCode, isAuthenticated, loginUrl } = useUserRole()

// isMounted guard ป้องกัน SSR hydration mismatch
const isMounted = ref(false)

onMounted(() => {
  isMounted.value = true
})
</script>

<template>
  <div v-if="isMounted" class="role-badge-wrap">
    <!-- Authenticated user: แสดงป้าย Role + รหัสพนักงาน (อ่านอย่างเดียว ไม่มี dropdown สลับ role) -->
    <div
      v-if="isAuthenticated && role !== 'GUEST'"
      class="role-pill role-pill--auth"
      :style="{
        '--role-color': roleInfo.color,
        '--role-bg': roleInfo.bg,
        '--role-border': roleInfo.border,
      }"
      :title="`บทบาท: ${roleInfo.label} (${roleInfo.thLabel})${groupCode ? ` | Group: ${groupCode}` : ''}`"
    >
      <span class="role-dot" aria-hidden="true"></span>
      <span class="role-label">{{ roleInfo.label }}</span>
      <span v-if="empno" class="role-empno">{{ empno }}</span>
    </div>

    <!-- Guest user: แสดงป้าย Guest พร้อมปุ่ม Login -->
    <template v-else>
      <div
        class="role-pill role-pill--guest"
        :style="{
          '--role-color': roleInfo.color,
          '--role-bg': roleInfo.bg,
          '--role-border': roleInfo.border,
        }"
        title="ผู้เยี่ยมชม — เข้าสู่ระบบเพื่อดูเอกสารทั้งหมดตามสิทธิ์"
      >
        <span class="role-dot" aria-hidden="true"></span>
        <span class="role-label">Guest</span>
      </div>
      <a
        :href="loginUrl"
        class="role-login-btn"
        rel="noopener"
      >
        Login
      </a>
    </template>
  </div>
</template>

<style scoped>
.role-badge-wrap {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-left: 12px;
  flex-shrink: 0;
}

.role-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--role-color);
  background: var(--role-bg);
  border: 1px solid var(--role-border);
  white-space: nowrap;
  user-select: none;
}

.role-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: var(--role-color);
  flex-shrink: 0;
}

.role-empno {
  padding-left: 6px;
  border-left: 1px solid var(--role-border);
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
  opacity: 0.9;
}

.role-login-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
  color: #ffffff !important;
  background: linear-gradient(135deg, #2563eb, #0284c7);
  text-decoration: none !important;
  transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.28);
  white-space: nowrap;
}

.role-login-btn:hover {
  filter: brightness(1.08);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.36);
}

@media (max-width: 767px) {
  .role-badge-wrap {
    margin-left: 0;
    margin-top: 12px;
    justify-content: flex-start;
  }
}
</style>
