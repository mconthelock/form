<script setup>
import { computed, onMounted, ref } from 'vue'
import DefaultTheme from 'vitepress/theme'
import { useData, useRoute, withBase } from 'vitepress'
import {
  getRequiredRolesForPage,
  getRoleMeta,
  hasRoleAccess,
} from '../../roles.js'
import { useUserRole } from '../composables/useUserRole.js'
import RoleBadge from './RoleBadge.vue'

const { Layout } = DefaultTheme
const { frontmatter, theme, site } = useData()
const route = useRoute()
const { role, roleInfo, empno, isAuthenticated, loginUrl } = useUserRole()

const isMounted = ref(false)

onMounted(() => {
  isMounted.value = true
})

const isHomePage = computed(() => frontmatter.value?.layout === 'home')

const requiredRoles = computed(() =>
  getRequiredRolesForPage(
    route.path,
    frontmatter.value,
    theme.value?.sidebar,
    site.value?.base || ''
  )
)

const isPublicPage = computed(
  () =>
    !requiredRoles.value ||
    requiredRoles.value.length === 0 ||
    requiredRoles.value.includes('*')
)

const requiredRoleMetas = computed(() => {
  if (isPublicPage.value) return []
  return requiredRoles.value.map((r) => getRoleMeta(r))
})

const canAccess = computed(() => {
  if (!isMounted.value || isHomePage.value) return true
  return hasRoleAccess(role.value, requiredRoles.value)
})
</script>

<template>
  <div
    class="form-docs-layout"
    :class="{ 'is-role-restricted': isMounted && !canAccess && !isHomePage }"
  >
    <Layout>
      <!-- ป้าย Role + Login บน Navbar (Desktop) -->
      <template #nav-bar-content-after>
        <RoleBadge />
      </template>

      <!-- ป้าย Role + Login ใน Mobile Menu -->
      <template #nav-screen-content-after>
        <RoleBadge />
      </template>

      <!-- หน้าแจ้งเตือนเมื่อเข้าถึง URL ที่ไม่มีสิทธิ์ -->
      <template #doc-top>
        <div
          v-if="isMounted && !canAccess && !isHomePage"
          class="access-restricted-wrap"
          role="alert"
        >
          <div class="access-restricted-card">
            <div class="access-restricted-icon" aria-hidden="true">🔒</div>
            <h1 class="access-restricted-title">Access Restricted</h1>
            <p class="access-restricted-desc">
              เอกสารหน้านี้จำกัดสิทธิ์การเข้าถึงตามบทบาทผู้ใช้งาน (User Role)
            </p>

            <div class="access-restricted-meta">
              <div class="meta-row">
                <span class="meta-label">บทบาทปัจจุบันของคุณ:</span>
                <span
                  class="meta-badge"
                  :style="{
                    color: roleInfo.color,
                    background: roleInfo.bg,
                    borderColor: roleInfo.border,
                  }"
                >
                  {{ roleInfo.label }} ({{ roleInfo.thLabel }})
                  <template v-if="empno"> · {{ empno }}</template>
                </span>
              </div>

              <div class="meta-row">
                <span class="meta-label">บทบาทที่ได้รับอนุญาต:</span>
                <div class="meta-badges">
                  <span
                    v-for="meta in requiredRoleMetas"
                    :key="meta.id"
                    class="meta-badge"
                    :style="{
                      color: meta.color,
                      background: meta.bg,
                      borderColor: meta.border,
                    }"
                  >
                    {{ meta.label }}
                  </span>
                </div>
              </div>
            </div>

            <div class="access-restricted-actions">
              <a
                v-if="!isAuthenticated || role === 'GUEST'"
                :href="loginUrl"
                class="ar-btn ar-btn--primary"
              >
                เข้าสู่ระบบ (Login)
              </a>
              <a :href="withBase('/quick-start')" class="ar-btn ar-btn--secondary">
                ไปหน้า Quick Start
              </a>
              <a :href="withBase('/')" class="ar-btn ar-btn--ghost">
                กลับหน้าแรก
              </a>
            </div>
          </div>
        </div>
      </template>

      <!-- แถบแสดงบทบาทที่เข้าถึงได้ด้านบนหน้าเอกสาร -->
      <template #doc-before>
        <div
          v-if="isMounted && canAccess && !isHomePage"
          class="doc-role-banner"
        >
          <span class="doc-role-banner-label">สิทธิ์การเข้าถึงเอกสารนี้:</span>
          <span v-if="isPublicPage" class="doc-role-chip doc-role-chip--public">
            ทุกคน (Public)
          </span>
          <template v-else>
            <span
              v-for="meta in requiredRoleMetas"
              :key="meta.id"
              class="doc-role-chip"
              :style="{
                color: meta.color,
                background: meta.bg,
                borderColor: meta.border,
              }"
            >
              {{ meta.label }}
            </span>
          </template>
        </div>
      </template>
    </Layout>
  </div>
</template>

<style scoped>
/* ซ่อนเนื้อหาเอกสารและสารบัญเมื่อผู้ใช้ไม่มีสิทธิ์ */
.is-role-restricted :deep(.VPDoc .main),
.is-role-restricted :deep(.VPDoc .aside),
.is-role-restricted :deep(.VPDocFooter) {
  display: none !important;
}

.doc-role-banner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  margin-bottom: 20px;
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  font-size: 12.5px;
}

.doc-role-banner-label {
  color: var(--vp-c-text-2);
  font-weight: 500;
  margin-right: 4px;
}

.doc-role-chip {
  display: inline-flex;
  align-items: center;
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 600;
  border: 1px solid transparent;
  line-height: 1.4;
}

.doc-role-chip--public {
  color: #0369a1;
  background: rgba(14, 165, 233, 0.12);
  border-color: rgba(14, 165, 233, 0.3);
}

.dark .doc-role-chip--public {
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.14);
  border-color: rgba(56, 189, 248, 0.32);
}

.access-restricted-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 220px);
  padding: 40px 20px;
}

.access-restricted-card {
  width: 100%;
  max-width: 560px;
  padding: 36px 32px;
  border-radius: 18px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
  text-align: center;
}

.access-restricted-icon {
  font-size: 44px;
  line-height: 1;
  margin-bottom: 14px;
}

.access-restricted-title {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.access-restricted-desc {
  margin: 0 0 24px;
  font-size: 14.5px;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}

.access-restricted-meta {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  margin-bottom: 24px;
  border-radius: 12px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  text-align: left;
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.meta-label {
  color: var(--vp-c-text-2);
  font-weight: 500;
}

.meta-badges {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 6px;
}

.meta-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid transparent;
}

.access-restricted-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

.ar-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 9px 18px;
  border-radius: 10px;
  font-size: 13.5px;
  font-weight: 600;
  text-decoration: none !important;
  transition: transform 0.15s ease, filter 0.15s ease, background 0.15s ease;
}

.ar-btn:hover {
  transform: translateY(-1px);
}

.ar-btn--primary {
  color: #ffffff !important;
  background: linear-gradient(135deg, #2563eb, #0284c7);
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);
}

.ar-btn--secondary {
  color: var(--vp-c-text-1) !important;
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-divider);
}

.ar-btn--ghost {
  color: var(--vp-c-text-2) !important;
  background: transparent;
}
</style>
