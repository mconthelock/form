import { ref, computed, onMounted } from 'vue'
import { useData } from 'vitepress'
import CryptoJS from 'crypto-js'
import {
  ROLES,
  getRoleMeta,
  hasRoleAccess,
  mapGroupCodeToRole,
} from '../../roles.js'

// Shared singleton reactive state across all components
const role = ref('GUEST')
const empno = ref('')
const empName = ref('')
const groupCode = ref('')
const isAuthenticated = ref(false)
const isLoading = ref(false)
const isReady = ref(false)

let listenersBound = false
let inFlightPromise = null

/**
 * อ่านค่า Cookie ตามชื่อ (Client-only)
 * @param {string} name
 * @returns {string | null}
 */
function readCookie(name) {
  if (typeof document === 'undefined' || !name) return null
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${escaped}=([^;]*)`))
  if (!match) return null
  try {
    return decodeURIComponent(match[1])
  } catch {
    return match[1]
  }
}

/**
 * อ่านข้อมูล GROUP_CODE จาก IndexedDB ("userAuth" -> store "group") แบบ read-only
 * ห้ามสร้างฐานข้อมูลใหม่หรืออัปเกรด schema หากยังไม่มี DB
 * @param {string} recordId รูปแบบ `${appid}-${empno}`
 * @returns {Promise<{ groupCode: string | null, empName?: string } | null>}
 */
async function readGroupFromIndexedDB(recordId) {
  if (typeof window === 'undefined' || typeof indexedDB === 'undefined' || !recordId) {
    return null
  }

  try {
    // ตรวจสอบรายชื่อ DB ก่อน (ถ้า browser รองรับ) เพื่อหลีกเลี่ยงการเปิด/สร้าง DB ที่ยังไม่มี
    if (typeof indexedDB.databases === 'function') {
      const dbs = await indexedDB.databases()
      const exists = Array.isArray(dbs) && dbs.some((db) => db && db.name === 'userAuth')
      if (!exists) return null
    }
  } catch {
    // หาก indexedDB.databases() ถูกจำกัดสิทธิ์ ให้ตรวจต่อผ่าน onupgradeneeded abort
  }

  return new Promise((resolve) => {
    let abortedUpgrade = false
    let request

    try {
      // เปิดโดยไม่ระบุ version เพื่ออ่าน schema ปัจจุบันเท่านั้น
      request = indexedDB.open('userAuth')
    } catch {
      resolve(null)
      return
    }

    request.onupgradeneeded = (event) => {
      // ห้ามสร้างหรือแก้ schema DB ถ้ายังไม่มี
      abortedUpgrade = true
      try {
        event.target.transaction?.abort()
      } catch {
        // ignore abort errors
      }
      resolve(null)
    }

    request.onerror = () => {
      resolve(null)
    }

    request.onsuccess = (event) => {
      const db = event.target.result
      if (abortedUpgrade) {
        try {
          db.close()
        } catch {
          // ignore
        }
        resolve(null)
        return
      }

      if (!db.objectStoreNames.contains('group')) {
        try {
          db.close()
        } catch {
          // ignore
        }
        resolve(null)
        return
      }

      try {
        const tx = db.transaction('group', 'readonly')
        const store = tx.objectStore('group')
        const getReq = store.get(recordId)

        getReq.onsuccess = (e) => {
          const record = e.target.result
          const code =
            record?.data?.GROUP_CODE ??
            record?.GROUP_CODE ??
            null
          try {
            db.close()
          } catch {
            // ignore
          }
          resolve(code ? { groupCode: String(code) } : null)
        }

        getReq.onerror = () => {
          try {
            db.close()
          } catch {
            // ignore
          }
          resolve(null)
        }
      } catch {
        try {
          db.close()
        } catch {
          // ignore
        }
        resolve(null)
      }
    }
  })
}

/**
 * Fallback เรียก POST ${APP_API}/auth/directlogin/ เมื่อมี Cookie แต่ยังไม่มีข้อมูลใน IndexedDB
 * @param {string} empId
 * @param {string} appId
 * @param {string} appApi
 * @returns {Promise<{ groupCode: string | null, empName?: string } | null>}
 */
async function fetchGroupViaDirectLogin(empId, appId, appApi) {
  if (typeof fetch === 'undefined' || !appApi || !empId || !appId) {
    return null
  }

  try {
    const cleanApi = appApi.replace(/\/+$/, '')
    const username = CryptoJS.MD5(String(empId)).toString().toUpperCase()
    const response = await fetch(`${cleanApi}/auth/directlogin/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        username,
        appid: appId,
      }),
    })

    if (!response.ok) return null
    const data = await response.json()
    const code = data?.appgroup?.GROUP_CODE ?? data?.GROUP_CODE ?? null
    const name = data?.appuser?.SNAME ?? ''
    return code ? { groupCode: String(code), empName: name } : null
  } catch {
    return null
  }
}

/**
 * รีเซ็ตสถานะกลับเป็น GUEST เสมอเมื่อไม่มีการ Login / Cookie หมดอายุ / ไม่พบสิทธิ์
 */
function resetToGuest() {
  role.value = 'GUEST'
  empno.value = ''
  empName.value = ''
  groupCode.value = ''
  isAuthenticated.value = false
  isReady.value = true
}

/**
 * ตรวจสอบสถานะการเข้าสู่ระบบและ Role ปัจจุบันจาก Cookie -> IndexedDB -> directlogin API
 * @param {Object} authConfig
 */
async function resolveUserRole(authConfig) {
  if (typeof window === 'undefined') return

  if (inFlightPromise) {
    return inFlightPromise
  }

  inFlightPromise = (async () => {
    isLoading.value = true
    try {
      const appName = authConfig?.appName || 'form'
      const fallbackAppId = authConfig?.appId || '1'
      const appApi = authConfig?.appApi || ''

      const cookieValue = readCookie(appName)
      if (!cookieValue) {
        resetToGuest()
        return
      }

      // ถอดรหัส Cookie ด้วย CryptoJS.AES.decrypt เพื่อให้ได้ `${appid}-${empno}`
      let decrypted = ''
      try {
        const bytes = CryptoJS.AES.decrypt(cookieValue, appName)
        decrypted = bytes.toString(CryptoJS.enc.Utf8)
      } catch {
        resetToGuest()
        return
      }

      if (!decrypted || !decrypted.includes('-')) {
        resetToGuest()
        return
      }

      const [cookieAppId, cookieEmpNo] = decrypted.split('-').map((s) => s.trim())
      const resolvedAppId = cookieAppId || String(fallbackAppId)

      if (!resolvedAppId || !cookieEmpNo) {
        resetToGuest()
        return
      }

      const indexedDbId = `${resolvedAppId}-${cookieEmpNo}`

      // 1) ลองอ่าน GROUP_CODE จาก IndexedDB แบบ read-only ก่อน
      let authResult = await readGroupFromIndexedDB(indexedDbId)

      // 2) หากยังไม่มีข้อมูลใน IndexedDB ให้ fallback เรียก directlogin API
      if (!authResult?.groupCode && appApi) {
        authResult = await fetchGroupViaDirectLogin(cookieEmpNo, resolvedAppId, appApi)
      }

      // หากไม่พบสิทธิ์ ให้เข้าสิทธิ์ GUEST เสมอ
      if (!authResult?.groupCode) {
        resetToGuest()
        return
      }

      const mappedRole = mapGroupCodeToRole(authResult.groupCode)
      if (mappedRole === 'GUEST') {
        resetToGuest()
        return
      }

      role.value = mappedRole
      empno.value = cookieEmpNo
      empName.value = authResult.empName || ''
      groupCode.value = authResult.groupCode
      isAuthenticated.value = true
      isReady.value = true
    } catch {
      resetToGuest()
    } finally {
      isLoading.value = false
      inFlightPromise = null
    }
  })()

  return inFlightPromise
}

/**
 * Composable สำหรับจัดการและตรวจสอบ User Role ใน VitePress Docs (SSR-safe)
 */
export function useUserRole() {
  const { theme } = useData()

  const authConfig = computed(() => theme.value?.auth || {})

  const loginUrl = computed(() => {
    const host = (authConfig.value.appHost || '').replace(/\/+$/, '')
    const appId = authConfig.value.appId || '1'
    return `${host}/form/authen/index/${appId}/`
  })

  const roleInfo = computed(() => getRoleMeta(role.value))

  const refreshAuth = () => resolveUserRole(authConfig.value)

  const hasAccess = (allowedRoles) => hasRoleAccess(role.value, allowedRoles)

  onMounted(() => {
    refreshAuth()

    if (!listenersBound && typeof window !== 'undefined') {
      listenersBound = true
      window.addEventListener('focus', () => {
        resolveUserRole(authConfig.value)
      })
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          resolveUserRole(authConfig.value)
        }
      })
    }
  })

  return {
    ROLES,
    role,
    roleInfo,
    empno,
    empName,
    groupCode,
    isAuthenticated,
    isLoading,
    isReady,
    loginUrl,
    refreshAuth,
    hasAccess,
  }
}
