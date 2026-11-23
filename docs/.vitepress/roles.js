/**
 * ศูนย์กลางกำหนดสิทธิ์การเข้าถึงเอกสารตาม User Role สำหรับระบบ Form (New Webflow)
 */

export const ROLES = {
  ADMIN: {
    id: 'ADMIN',
    label: 'Admin',
    thLabel: 'ผู้ดูแลระบบ',
    color: '#dc2626',
    bg: 'rgba(220, 38, 38, 0.12)',
    border: 'rgba(220, 38, 38, 0.3)',
    description: 'เข้าถึงเอกสารทั้งหมดในระบบ รวมถึงเครื่องมือขั้นสูงและคู่มือผู้ดูแลระบบ',
  },
  REQUESTER: {
    id: 'REQUESTER',
    label: 'Requester',
    thLabel: 'ผู้ยื่นคำร้อง',
    color: '#2563eb',
    bg: 'rgba(37, 99, 235, 0.12)',
    border: 'rgba(37, 99, 235, 0.3)',
    description: 'เข้าถึงคู่มือการสร้างและติดตามแบบฟอร์มคำร้อง (IS, QA และฟอร์มทั่วไป)',
  },
  APPROVER: {
    id: 'APPROVER',
    label: 'Approver',
    thLabel: 'ผู้อนุมัติ',
    color: '#059669',
    bg: 'rgba(5, 150, 105, 0.12)',
    border: 'rgba(5, 150, 105, 0.3)',
    description: 'เข้าถึงคู่มือการตรวจสอบ อนุมัติ และมอบหมายตัวแทน',
  },
  MANAGER: {
    id: 'MANAGER',
    label: 'Manager',
    thLabel: 'ผู้จัดการ',
    color: '#7c3aed',
    bg: 'rgba(124, 58, 237, 0.12)',
    border: 'rgba(124, 58, 237, 0.3)',
    description: 'เข้าถึงคู่มือการอนุมัติระดับผู้บริหาร รายงาน และเครื่องมือขั้นสูง',
  },
  HR: {
    id: 'HR',
    label: 'HR',
    thLabel: 'ฝ่ายบุคคล',
    color: '#d97706',
    bg: 'rgba(217, 119, 6, 0.12)',
    border: 'rgba(217, 119, 6, 0.3)',
    description: 'เข้าถึงคู่มือแบบฟอร์มด้านบุคคล สวัสดิการ และการจัดการข้อมูลองค์กร',
  },
  GUEST: {
    id: 'GUEST',
    label: 'Guest',
    thLabel: 'ผู้เยี่ยมชม',
    color: '#64748b',
    bg: 'rgba(100, 116, 139, 0.14)',
    border: 'rgba(100, 116, 139, 0.32)',
    description: 'เข้าถึงเฉพาะเอกสารสาธารณะ (หน้าแรก, Quick Start และ Change Log)',
  },
}

/**
 * กลุ่ม Role ที่มีสิทธิ์ระดับผู้ดูแลระบบ (เข้าถึงได้ทุกหน้า)
 */
export const ADMIN_ROLES = ['ADMIN']

/**
 * Map ค่า GROUP_CODE จาก @amec/webasset ไปยัง Role ภายในระบบเอกสาร
 */
export const GROUP_CODE_TO_ROLE = {
  // Admin / System / Developer
  ADMIN: 'ADMIN',
  ADM: 'ADMIN',
  SYSADMIN: 'ADMIN',
  SUPERADMIN: 'ADMIN',
  DEV: 'ADMIN',
  WSD: 'ADMIN',
  ISD: 'ADMIN',
  IS: 'ADMIN',
  IT: 'ADMIN',

  // Manager / Executive
  MANAGER: 'MANAGER',
  MGR: 'MANAGER',
  DM: 'MANAGER',
  AGM: 'MANAGER',
  GM: 'MANAGER',
  SEM: 'MANAGER',
  DIR: 'MANAGER',
  DIRECTOR: 'MANAGER',
  EXEC: 'MANAGER',

  // Approver / Supervisor
  APPROVER: 'APPROVER',
  APV: 'APPROVER',
  APP: 'APPROVER',
  SUP: 'APPROVER',
  SUPERVISOR: 'APPROVER',
  LEAD: 'APPROVER',
  CHIEF: 'APPROVER',
  HEAD: 'APPROVER',
  SEC: 'APPROVER',

  // HR / GA
  HR: 'HR',
  GA: 'HR',
  HRGA: 'HR',
  HRM: 'HR',
  HRD: 'HR',

  // Requester / General User
  REQUESTER: 'REQUESTER',
  REQ: 'REQUESTER',
  USER: 'REQUESTER',
  USR: 'REQUESTER',
  EMP: 'REQUESTER',
  EMPLOYEE: 'REQUESTER',
  STAFF: 'REQUESTER',
  OPERATOR: 'REQUESTER',
  MEMBER: 'REQUESTER',
  GENERAL: 'REQUESTER',
  GUEST: 'GUEST',
}

/**
 * กฎสำรองกำหนดสิทธิ์ตามเส้นทางเอกสาร (ใช้เมื่อหน้าเอกสารไม่ได้ระบุ frontmatter.roles หรือไม่ได้อยู่ใน sidebar)
 */
export const PAGE_ROLE_RULES = [
  { pattern: '/', roles: ['*'] },
  { pattern: '/index', roles: ['*'] },
  { pattern: '/quick-start', roles: ['*'] },
  { pattern: '/get-start', roles: ['*'] },
  { pattern: '/changelog', roles: ['*'] },
  { pattern: '/form/tool/', roles: ['ADMIN', 'MANAGER'] },
  { pattern: '/form/isform/', roles: ['ADMIN', 'REQUESTER', 'APPROVER', 'MANAGER'] },
  { pattern: '/form/purform/', roles: ['ADMIN', 'REQUESTER', 'APPROVER', 'MANAGER'] },
  { pattern: '/form/qaform/', roles: ['ADMIN', 'REQUESTER', 'APPROVER', 'MANAGER'] },
  { pattern: '/form/gpform/', roles: ['ADMIN', 'REQUESTER', 'APPROVER', 'MANAGER', 'HR'] },
  { pattern: '/form/', roles: ['ADMIN', 'REQUESTER', 'APPROVER', 'MANAGER', 'HR'] },
  { pattern: '/formmst', roles: ['ADMIN', 'HR', 'MANAGER'] },
  { pattern: '/organization', roles: ['ADMIN', 'HR', 'MANAGER'] },
  { pattern: '/report', roles: ['ADMIN', 'APPROVER', 'MANAGER', 'HR'] },
  { pattern: '/electronic-form', roles: ['ADMIN', 'REQUESTER', 'APPROVER', 'MANAGER', 'HR'] },
  { pattern: '/password', roles: ['ADMIN', 'REQUESTER', 'APPROVER', 'MANAGER', 'HR'] },
  { pattern: '/set-represent', roles: ['ADMIN', 'APPROVER', 'MANAGER'] },
  { pattern: '/set-noti', roles: ['ADMIN', 'REQUESTER', 'APPROVER', 'MANAGER', 'HR'] },
]

/**
 * แปลง GROUP_CODE จากระบบ Authen เป็น Role ID
 * @param {string | null | undefined} groupCode
 * @returns {string}
 */
export function mapGroupCodeToRole(groupCode) {
  if (!groupCode || typeof groupCode !== 'string') {
    return 'GUEST'
  }
  const normalized = groupCode.trim().toUpperCase()
  if (!normalized) return 'GUEST'

  if (GROUP_CODE_TO_ROLE[normalized]) {
    return GROUP_CODE_TO_ROLE[normalized]
  }

  // Fallback heuristics สำหรับรหัสกลุ่มที่มี prefix/suffix เพิ่มเติม
  if (normalized.includes('ADMIN') || normalized.startsWith('ADM')) return 'ADMIN'
  if (normalized.includes('MGR') || normalized.includes('MANAGER')) return 'MANAGER'
  if (normalized.includes('APV') || normalized.includes('APPROV')) return 'APPROVER'
  if (normalized.includes('HR')) return 'HR'
  if (normalized.includes('GUEST')) return 'GUEST'

  // ผู้ใช้ที่ผ่านการ Login และมี GROUP_CODE อื่นๆ ให้เป็น REQUESTER
  return 'REQUESTER'
}

/**
 * แปลง path ให้เป็นรูปแบบมาตรฐานสำหรับการเทียบสิทธิ์ (ตัด base, .html, .md, query, hash)
 * @param {string} path
 * @param {string} [base='']
 * @returns {string}
 */
export function normalizeDocPath(path, base = '') {
  if (!path) return '/'
  let p = String(path).split(/[?#]/)[0]

  if (base && base !== '/') {
    const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base
    if (p.startsWith(cleanBase + '/')) {
      p = p.slice(cleanBase.length)
    } else if (p === cleanBase) {
      p = '/'
    }
  }

  p = p.replace(/\.(html|md)$/i, '')
  if (!p.startsWith('/')) p = '/' + p
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1)
  if (p === '/index') return '/'
  return p
}

/**
 * ตรวจสอบว่า userRole มีสิทธิ์เข้าถึง allowedRoles หรือไม่
 * @param {string} userRole
 * @param {string[] | undefined | null} allowedRoles
 * @returns {boolean}
 */
export function hasRoleAccess(userRole, allowedRoles) {
  if (!allowedRoles || !Array.isArray(allowedRoles) || allowedRoles.length === 0) {
    return true
  }
  if (allowedRoles.includes('*')) {
    return true
  }
  const normalizedRole = (userRole || 'GUEST').toUpperCase()
  if (ADMIN_ROLES.includes(normalizedRole)) {
    return true
  }
  return allowedRoles.some((r) => String(r).toUpperCase() === normalizedRole)
}

/**
 * ค้นหา roles ที่กำหนดไว้ใน sidebar items สำหรับ path ที่ระบุ
 * @param {Array|Object} sidebar
 * @param {string} targetPath
 * @param {string[] | null} [inheritedRoles=null]
 * @returns {string[] | null}
 */
function findRolesInSidebar(sidebar, targetPath, inheritedRoles = null) {
  if (!sidebar) return null

  const list = Array.isArray(sidebar)
    ? sidebar
    : Object.values(sidebar).flat()

  for (const item of list) {
    if (!item || typeof item !== 'object') continue
    const effectiveRoles = Array.isArray(item.roles) && item.roles.length > 0
      ? item.roles
      : inheritedRoles

    if (item.link) {
      const itemPath = normalizeDocPath(item.link)
      if (itemPath === targetPath) {
        return effectiveRoles
      }
    }

    if (Array.isArray(item.items) && item.items.length > 0) {
      const found = findRolesInSidebar(item.items, targetPath, effectiveRoles)
      if (found) return found
    }
  }

  return null
}

/**
 * คืนรายการ Role ที่มีสิทธิ์เข้าถึงหน้าเอกสารตามลำดับความสำคัญ:
 * 1. frontmatter.roles
 * 2. sidebar item/group roles
 * 3. PAGE_ROLE_RULES (exact match -> longest prefix match)
 * @param {string} path
 * @param {Object} [frontmatter={}]
 * @param {Array|Object} [sidebar=null]
 * @param {string} [base='']
 * @returns {string[]}
 */
export function getRequiredRolesForPage(path, frontmatter = {}, sidebar = null, base = '') {
  if (frontmatter && Array.isArray(frontmatter.roles) && frontmatter.roles.length > 0) {
    return frontmatter.roles
  }

  const normPath = normalizeDocPath(path, base)

  const sidebarRoles = findRolesInSidebar(sidebar, normPath)
  if (sidebarRoles && sidebarRoles.length > 0) {
    return sidebarRoles
  }

  // Exact match in PAGE_ROLE_RULES
  for (const rule of PAGE_ROLE_RULES) {
    if (!rule.pattern.endsWith('/') && normalizeDocPath(rule.pattern) === normPath) {
      return rule.roles
    }
  }

  // Longest prefix match in PAGE_ROLE_RULES
  let matchedRule = null
  for (const rule of PAGE_ROLE_RULES) {
    if (rule.pattern.endsWith('/')) {
      const prefix = rule.pattern.slice(0, -1)
      if (normPath === prefix || normPath.startsWith(rule.pattern)) {
        if (!matchedRule || rule.pattern.length > matchedRule.pattern.length) {
          matchedRule = rule
        }
      }
    }
  }

  if (matchedRule) {
    return matchedRule.roles
  }

  return ['*']
}

/**
 * กรองรายการเมนู Sidebar ตาม Role ของผู้ใช้ (Recursive)
 * @param {Array} items
 * @param {string} userRole
 * @returns {Array}
 */
export function filterSidebarItems(items, userRole) {
  if (!Array.isArray(items)) return []

  const result = []
  for (const item of items) {
    if (!item || typeof item !== 'object') continue

    // ตรวจสอบสิทธิ์ของระดับกลุ่ม/รายการปัจจุบันก่อน
    if (Array.isArray(item.roles) && item.roles.length > 0) {
      if (!hasRoleAccess(userRole, item.roles)) {
        continue
      }
    }

    if (Array.isArray(item.items)) {
      const filteredChildren = filterSidebarItems(item.items, userRole)
      // หากไม่มีลิงก์ของตัวเองและไม่มีรายการย่อยเหลือหลังกรอง ให้ซ่อนกลุ่มนี้
      if (!item.link && filteredChildren.length === 0) {
        continue
      }
      result.push({
        ...item,
        items: filteredChildren,
      })
    } else {
      result.push({ ...item })
    }
  }

  return result
}

/**
 * คืนข้อมูล metadata ของ Role
 * @param {string} roleId
 */
export function getRoleMeta(roleId) {
  const key = (roleId || 'GUEST').toUpperCase()
  return ROLES[key] || ROLES.GUEST
}
