<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useData } from 'vitepress'

const { isDark } = useData()

const containerRef = ref(null)
const canvasRef = ref(null)
const timePhase = ref('day')

let THREE = null
let renderer = null
let scene = null
let camera = null
let animFrameId = null
let minuteTimer = null
let resizeHandler = null
let pointerMoveHandler = null
let motionMediaQuery = null
let motionChangeHandler = null
let reducedMotion = false

// Dynamic scene refs
let hemiLight = null
let dirLight = null
let fillLight = null
let moonLight = null
let skyMat = null
let groundMat = null
let windowMaterials = []
let lampBulbMaterials = []
let lampLights = []
let elevatorBeamMat = null
let elevatorRingMat = null
let elevatorCabin = null
let elevatorCabinGlow = null
let elevatorCurve = null
let elevatorPulseOrbs = []
let moonMesh = null
let moonHaloMat = null
let moonDockRing = null
let rocketGroup = null
let rocketFlame = null
let rocketFlameLight = null
let rocketTrailPuffs = []
let rocketOrigin = null
let rocketDir = null
let windRotors = []
let cloudGroup = null
let starField = null
let disposableTextures = []

// ตำแหน่งหอทดสอบลิฟต์และดวงจันทร์ที่อยู่ไกลออกไปในห้วงอวกาศ
const TOWER_X = 6.2
const TOWER_Z = -1.6
const ELEVATOR_START = { x: TOWER_X + 0.25, y: 10.6, z: TOWER_Z }
const MOON_POS = { x: TOWER_X + 7.2, y: 27.5, z: TOWER_Z - 16.5 }
const MOON_RADIUS = 3.2

// Parallax & Camera framing (มุมกว้าง เห็นตึก AMEC + หอทดสอบลิฟต์ + ลิฟต์พุ่งขึ้นไกลไปถึงดวงจันทร์ + จรวดปล่อยออกจากดวงจันทร์)
const pointer = { x: 0, y: 0, curX: 0, curY: 0 }
const baseCamPos = { x: -5.8, y: 10.8, z: 36.8 }
const baseLookAt = { x: -0.6, y: 12.2, z: -2.5 }

function detectTimePhase() {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 11) return 'morning'
  if (hour >= 11 && hour < 16) return 'day'
  if (hour >= 16 && hour < 19) return 'afternoon'
  return 'twilight'
}

const PALETTES = {
  morning: {
    skyTop: 0x62a8e5,
    skyBottom: 0xfef4e4,
    fog: 0xeaf3fb,
    hemiSky: 0xdbeeff,
    hemiGround: 0xd2e6cf,
    hemiIntensity: 1.05,
    dirColor: 0xfff1d6,
    dirIntensity: 1.38,
    dirPos: [18, 24, 18],
    fillColor: 0x93c5fd,
    fillIntensity: 0.48,
    groundColor: 0xdfe9df,
    windowColor: 0x263547,
    windowEmissive: 0x38bdf8,
    windowEmissiveInt: 0.14,
    lampIntensity: 0.0,
    lampEmissiveInt: 0.1,
    beamOpacity: 0.55,
    beamEmissiveInt: 0.75,
    moonEmissiveInt: 0.16,
    moonHaloOpacity: 0.18,
    cloudsOpacity: 0.72,
    starsOpacity: 0.05,
  },
  day: {
    skyTop: 0x3f8fd2,
    skyBottom: 0xe6f4ff,
    fog: 0xe3f1fc,
    hemiSky: 0xe0f2fe,
    hemiGround: 0xcfe5cf,
    hemiIntensity: 1.15,
    dirColor: 0xffffff,
    dirIntensity: 1.45,
    dirPos: [14, 30, 20],
    fillColor: 0xbae6fd,
    fillIntensity: 0.52,
    groundColor: 0xdce8dc,
    windowColor: 0x1e2c3d,
    windowEmissive: 0x0ea5e9,
    windowEmissiveInt: 0.12,
    lampIntensity: 0.0,
    lampEmissiveInt: 0.08,
    beamOpacity: 0.52,
    beamEmissiveInt: 0.7,
    moonEmissiveInt: 0.14,
    moonHaloOpacity: 0.16,
    cloudsOpacity: 0.78,
    starsOpacity: 0.0,
  },
  afternoon: {
    skyTop: 0x5c8fd6,
    skyBottom: 0xffe8cb,
    fog: 0xf5ece3,
    hemiSky: 0xffedd5,
    hemiGround: 0xd3ddc8,
    hemiIntensity: 1.02,
    dirColor: 0xffd296,
    dirIntensity: 1.48,
    dirPos: [-16, 18, 22],
    fillColor: 0xa5b4fc,
    fillIntensity: 0.45,
    groundColor: 0xe3e8db,
    windowColor: 0x2a3342,
    windowEmissive: 0xf59e0b,
    windowEmissiveInt: 0.24,
    lampIntensity: 0.4,
    lampEmissiveInt: 0.45,
    beamOpacity: 0.65,
    beamEmissiveInt: 0.85,
    moonEmissiveInt: 0.24,
    moonHaloOpacity: 0.24,
    cloudsOpacity: 0.66,
    starsOpacity: 0.1,
  },
  // ช่วงค่ำใน Light Mode: Twilight สว่างสบายตา เปิดไฟอาคาร ดวงจันทร์ และลิฟต์ชัดเจน
  twilight: {
    skyTop: 0x4368b5,
    skyBottom: 0xd4e2fb,
    fog: 0xc2d3f2,
    hemiSky: 0xc7d8ff,
    hemiGround: 0x879cb8,
    hemiIntensity: 0.96,
    dirColor: 0xe0eaff,
    dirIntensity: 0.95,
    dirPos: [-10, 22, 18],
    fillColor: 0x60a5fa,
    fillIntensity: 0.55,
    groundColor: 0xc9d7ec,
    windowColor: 0xfef3c7,
    windowEmissive: 0xfbbf24,
    windowEmissiveInt: 0.9,
    lampIntensity: 1.4,
    lampEmissiveInt: 1.2,
    beamOpacity: 0.82,
    beamEmissiveInt: 1.2,
    moonEmissiveInt: 0.36,
    moonHaloOpacity: 0.34,
    cloudsOpacity: 0.38,
    starsOpacity: 0.42,
  },
  // Dark Mode: กลางคืนโทนน้ำเงินเข้มสว่าง เปิดไฟอาคาร หอทดสอบลิฟต์ สปอตไลท์ และลิฟต์สู่ดวงจันทร์
  dark: {
    skyTop: 0x091328,
    skyBottom: 0x182f5a,
    fog: 0x112244,
    hemiSky: 0x4f78c4,
    hemiGround: 0x1c2b4a,
    hemiIntensity: 0.8,
    dirColor: 0x93c5fd,
    dirIntensity: 0.85,
    dirPos: [-12, 24, 18],
    fillColor: 0x38bdf8,
    fillIntensity: 0.55,
    groundColor: 0x15243f,
    windowColor: 0xfef08a,
    windowEmissive: 0xfacc15,
    windowEmissiveInt: 1.15,
    lampIntensity: 2.2,
    lampEmissiveInt: 1.65,
    beamOpacity: 0.9,
    beamEmissiveInt: 1.45,
    moonEmissiveInt: 0.42,
    moonHaloOpacity: 0.42,
    cloudsOpacity: 0.14,
    starsOpacity: 0.9,
  },
}

function getActivePaletteKey() {
  if (isDark.value) return 'dark'
  return timePhase.value
}

function applyPalette() {
  if (!THREE || !scene) return
  const key = getActivePaletteKey()
  const p = PALETTES[key] || PALETTES.day

  if (scene.fog) scene.fog.color.setHex(p.fog)

  if (skyMat?.uniforms) {
    skyMat.uniforms.topColor.value.setHex(p.skyTop)
    skyMat.uniforms.bottomColor.value.setHex(p.skyBottom)
  }

  if (hemiLight) {
    hemiLight.color.setHex(p.hemiSky)
    hemiLight.groundColor.setHex(p.hemiGround)
    hemiLight.intensity = p.hemiIntensity
  }

  if (dirLight) {
    dirLight.color.setHex(p.dirColor)
    dirLight.intensity = p.dirIntensity
    dirLight.position.set(p.dirPos[0], p.dirPos[1], p.dirPos[2])
  }

  if (fillLight) {
    fillLight.color.setHex(p.fillColor)
    fillLight.intensity = p.fillIntensity
  }

  if (moonLight) {
    moonLight.intensity = key === 'dark' ? 2.6 : key === 'twilight' ? 1.8 : 0.7
  }

  if (groundMat) groundMat.color.setHex(p.groundColor)

  windowMaterials.forEach((mat, idx) => {
    mat.color.setHex(p.windowColor)
    if (key === 'dark' || key === 'twilight') {
      mat.emissive.setHex(idx % 2 === 0 ? p.windowEmissive : 0x38bdf8)
    } else {
      mat.emissive.setHex(p.windowEmissive)
    }
    mat.emissiveIntensity = p.windowEmissiveInt
  })

  lampBulbMaterials.forEach((mat) => {
    mat.emissiveIntensity = p.lampEmissiveInt
  })

  lampLights.forEach((light) => {
    light.intensity = p.lampIntensity
  })

  if (elevatorBeamMat) {
    elevatorBeamMat.opacity = p.beamOpacity
    elevatorBeamMat.emissiveIntensity = p.beamEmissiveInt
  }

  if (elevatorRingMat) {
    elevatorRingMat.emissiveIntensity = p.beamEmissiveInt
  }

  if (moonMesh?.material) {
    moonMesh.material.emissiveIntensity = p.moonEmissiveInt
  }

  if (moonHaloMat) {
    moonHaloMat.opacity = p.moonHaloOpacity
  }

  if (cloudGroup) {
    cloudGroup.traverse((obj) => {
      if (obj.isMesh && obj.material) {
        obj.material.opacity = p.cloudsOpacity
      }
    })
  }

  if (starField?.material) {
    starField.material.opacity = p.starsOpacity
    starField.visible = p.starsOpacity > 0.01
  }

  if (reducedMotion && renderer && camera) {
    renderer.render(scene, camera)
  }
}

/**
 * สร้าง Texture ป้ายโลโก้ Mitsubishi Electric / Mitsubishi Elevator Asia บนหน้าอาคาร
 */
function createAmecSignTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 160
  const ctx = canvas.getContext('2d')

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // โลโก้เพชรสีแดง 3 ดวง (Mitsubishi 3-Diamond)
  const drawDiamond = (cx, cy, r, angleDeg) => {
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate((angleDeg * Math.PI) / 180)
    ctx.beginPath()
    ctx.moveTo(0, -r)
    ctx.lineTo(r * 0.56, 0)
    ctx.lineTo(0, r)
    ctx.lineTo(-r * 0.56, 0)
    ctx.closePath()
    ctx.fillStyle = '#dc2626'
    ctx.fill()
    ctx.restore()
  }

  const lx = 84
  const ly = 64
  drawDiamond(lx, ly - 24, 24, 0)
  drawDiamond(lx - 21, ly + 13, 24, -60)
  drawDiamond(lx + 21, ly + 13, 24, 60)

  // ข้อความ MITSUBISHI ELECTRIC
  ctx.fillStyle = '#1e293b'
  ctx.font = '800 32px sans-serif'
  ctx.fillText('MITSUBISHI', 146, 56)
  ctx.fillText('ELECTRIC', 146, 90)

  // ข้อความ MITSUBISHI ELEVATOR ASIA
  ctx.fillStyle = '#334155'
  ctx.font = '700 22px sans-serif'
  ctx.fillText('MITSUBISHI ELEVATOR ASIA', 42, 134)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  disposableTextures.push(tex)
  return tex
}

/**
 * สร้าง Texture พื้นผิวดวงจันทร์ความละเอียดสูง (Color Map + Bump Map)
 * ด้วย Multi-octave FBM noise, Lunar Maria (ทะเลลาวา), หลุมอุกกาบาตมีขอบนูน-หลุมลึก และ Ejecta Rays
 */
function createMoonMaps() {
  const w = 1024
  const h = 512

  // Deterministic PRNG เพื่อให้ลวดลายดวงจันทร์สวยสม่ำเสมอทุกครั้ง
  let seed = 42197
  const rand = () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }

  // Value noise แบบ wrap รอบแกน X ได้ไร้รอยต่อ (seamless equirectangular)
  const gridW = 64
  const gridH = 32
  const noiseGrid = new Float32Array(gridW * gridH)
  for (let i = 0; i < noiseGrid.length; i++) noiseGrid[i] = rand()

  const sampleNoise = (u, v, freqX, freqY) => {
    const x = ((u * freqX) % freqX + freqX) % freqX
    const y = Math.max(0, Math.min(freqY - 0.001, v * freqY))
    const x0 = Math.floor(x) % gridW
    const y0 = Math.floor(y) % gridH
    const x1 = (x0 + 1) % gridW
    const y1 = Math.min(gridH - 1, y0 + 1)
    const fx = x - Math.floor(x)
    const fy = y - Math.floor(y)
    const sx = fx * fx * (3 - 2 * fx)
    const sy = fy * fy * (3 - 2 * fy)

    const n00 = noiseGrid[y0 * gridW + x0]
    const n10 = noiseGrid[y0 * gridW + x1]
    const n01 = noiseGrid[y1 * gridW + x0]
    const n11 = noiseGrid[y1 * gridW + x1]
    const nx0 = n00 + (n10 - n00) * sx
    const nx1 = n01 + (n11 - n01) * sx
    return nx0 + (nx1 - nx0) * sy
  }

  const fbm = (u, v) => {
    let sum = 0
    let amp = 0.5
    let fx = 6
    let fy = 3
    for (let o = 0; o < 5; o++) {
      sum += sampleNoise(u, v, fx, fy) * amp
      fx *= 2
      fy *= 2
      amp *= 0.5
    }
    return sum
  }

  // ข้อมูลทะเลดวงจันทร์ (Lunar Maria)
  const maria = [
    { u: 0.28, v: 0.42, rx: 0.13, ry: 0.16, depth: 0.36 },
    { u: 0.43, v: 0.48, rx: 0.15, ry: 0.18, depth: 0.42 },
    { u: 0.62, v: 0.36, rx: 0.11, ry: 0.14, depth: 0.34 },
    { u: 0.74, v: 0.54, rx: 0.12, ry: 0.15, depth: 0.38 },
    { u: 0.18, v: 0.58, rx: 0.09, ry: 0.12, depth: 0.3 },
    { u: 0.53, v: 0.62, rx: 0.08, ry: 0.1, depth: 0.28 },
  ]

  // สร้างรายการหลุมอุกกาบาตหลายขนาด (ใหญ่ กลาง เล็ก)
  const craters = []
  // หลุมใหญ่เด่นๆ พร้อม ejecta rays
  const heroCraters = [
    { u: 0.36, v: 0.68, r: 0.048, rays: true },
    { u: 0.57, v: 0.44, r: 0.042, rays: true },
    { u: 0.22, v: 0.32, r: 0.036, rays: false },
    { u: 0.78, v: 0.38, r: 0.044, rays: true },
    { u: 0.66, v: 0.66, r: 0.038, rays: false },
  ]
  heroCraters.forEach((c) => craters.push({ ...c, depth: 0.45 }))

  // หลุมขนาดกลาง 45 หลุม
  for (let i = 0; i < 45; i++) {
    craters.push({
      u: rand(),
      v: 0.12 + rand() * 0.76,
      r: 0.012 + rand() * 0.024,
      depth: 0.24 + rand() * 0.2,
      rays: false,
    })
  }
  // หลุมขนาดเล็ก 140 หลุม
  for (let i = 0; i < 140; i++) {
    craters.push({
      u: rand(),
      v: 0.08 + rand() * 0.84,
      r: 0.004 + rand() * 0.009,
      depth: 0.16 + rand() * 0.15,
      rays: false,
    })
  }

  const colorCanvas = document.createElement('canvas')
  colorCanvas.width = w
  colorCanvas.height = h
  const colorCtx = colorCanvas.getContext('2d')
  const colorImg = colorCtx.createImageData(w, h)

  const bumpCanvas = document.createElement('canvas')
  bumpCanvas.width = w
  bumpCanvas.height = h
  const bumpCtx = bumpCanvas.getContext('2d')
  const bumpImg = bumpCtx.createImageData(w, h)

  const cData = colorImg.data
  const bData = bumpImg.data

  for (let y = 0; y < h; y++) {
    const v = y / h
    // ชดเชยความยืดตามละติจูดของ equirectangular projection
    const latScale = Math.max(0.25, Math.sin(v * Math.PI))
    for (let x = 0; x < w; x++) {
      const u = x / w

      // พื้นฐาน Regolith Highlands
      const n = fbm(u, v)
      const fine = (rand() - 0.5) * 0.045
      let height = 0.54 + (n - 0.5) * 0.34 + fine
      let albedo = 0.76 + (n - 0.5) * 0.22 + fine

      // ทะเลดวงจันทร์สีเข้ม (Maria)
      for (let m = 0; m < maria.length; m++) {
        const ma = maria[m]
        let du = Math.abs(u - ma.u)
        if (du > 0.5) du = 1 - du
        const dv = v - ma.v
        const dist = Math.sqrt((du / ma.rx) ** 2 + (dv / ma.ry) ** 2)
        const warped = dist + (n - 0.5) * 0.45
        if (warped < 1.0) {
          const factor = (1 - warped) * (1 - warped)
          albedo -= factor * ma.depth
          height -= factor * 0.14
        }
      }

      // หลุมอุกกาบาต (Crater bowl + raised rim + central peak + ejecta rays)
      for (let c = 0; c < craters.length; c++) {
        const cr = craters[c]
        let du = u - cr.u
        if (du > 0.5) du -= 1
        if (du < -0.5) du += 1
        const duScaled = du * latScale * 2.0
        const dv = v - cr.v
        const dist = Math.sqrt(duScaled * duScaled + dv * dv)
        const r = cr.r

        if (dist < r * 2.4) {
          const q = dist / r
          if (q < 0.82) {
            // ก้นหลุมเว้าลง
            const bowl = Math.cos((q / 0.82) * (Math.PI * 0.5))
            height -= bowl * cr.depth * 0.55
            albedo -= bowl * cr.depth * 0.22
            // ยอดกลางหลุมสำหรับหลุมใหญ่
            if (r > 0.03 && q < 0.18) {
              height += (1 - q / 0.18) * 0.12
            }
          } else if (q < 1.25) {
            // ขอบหลุมนูนสว่าง (Raised Rim)
            const rim = Math.sin(((q - 0.82) / 0.43) * Math.PI)
            height += rim * cr.depth * 0.32
            albedo += rim * cr.depth * 0.18
          } else if (cr.rays && q < 2.4) {
            // เส้นรัศมี Ejecta Rays
            const angle = Math.atan2(dv, duScaled)
            const rayPattern = Math.pow(Math.max(0, Math.sin(angle * 7 + c * 2.1)), 3)
            const fade = (1 - (q - 1.25) / 1.15)
            albedo += rayPattern * fade * 0.16
          }
        }
      }

      const hClamped = Math.max(0, Math.min(1, height))
      const aClamped = Math.max(0.18, Math.min(0.96, albedo))

      const idx = (y * w + x) * 4
      // โทนสีดวงจันทร์สมจริง (เทาเงินอบอุ่นเล็กน้อย)
      cData[idx] = Math.round(aClamped * 246)
      cData[idx + 1] = Math.round(aClamped * 244)
      cData[idx + 2] = Math.round(aClamped * 238)
      cData[idx + 3] = 255

      const bVal = Math.round(hClamped * 255)
      bData[idx] = bVal
      bData[idx + 1] = bVal
      bData[idx + 2] = bVal
      bData[idx + 3] = 255
    }
  }

  colorCtx.putImageData(colorImg, 0, 0)
  bumpCtx.putImageData(bumpImg, 0, 0)

  const colorTex = new THREE.CanvasTexture(colorCanvas)
  colorTex.colorSpace = THREE.SRGBColorSpace
  colorTex.anisotropy = 4

  const bumpTex = new THREE.CanvasTexture(bumpCanvas)
  bumpTex.anisotropy = 4

  disposableTextures.push(colorTex, bumpTex)
  return { colorTex, bumpTex }
}

/**
 * สร้างอาคาร Mitsubishi Elevator Asia (AMEC) + หอทดสอบลิฟต์ (Test Tower) ตามภาพต้นแบบ
 */
function createAmecCampus() {
  const campus = new THREE.Group()

  const wallWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xf1f0ec,
    roughness: 0.55,
    metalness: 0.06,
  })
  const wallLightGrayMat = new THREE.MeshStandardMaterial({
    color: 0xe4e5e2,
    roughness: 0.6,
    metalness: 0.08,
  })
  const towerDarkGrayMat = new THREE.MeshStandardMaterial({
    color: 0x525a61,
    roughness: 0.58,
    metalness: 0.16,
  })
  const trimDarkMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.45,
    metalness: 0.35,
  })

  const ribbonGlassMat = new THREE.MeshStandardMaterial({
    color: 0x1e2c3d,
    emissive: 0x0ea5e9,
    emissiveIntensity: 0.14,
    roughness: 0.16,
    metalness: 0.62,
  })
  windowMaterials.push(ribbonGlassMat)

  const towerWinMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    emissive: 0xfbbf24,
    emissiveIntensity: 0.15,
    roughness: 0.2,
    metalness: 0.5,
  })
  windowMaterials.push(towerWinMat)

  // === 1. อาคารสำนักงาน 2 ชั้นฝั่งซ้าย-หน้า (Main Office Wing) ===
  const wingW = 9.2
  const wingH = 3.1
  const wingD = 4.6
  const wingX = -0.2
  const wingZ = 2.0

  const mainWing = new THREE.Mesh(new THREE.BoxGeometry(wingW, wingH, wingD), wallWhiteMat)
  mainWing.position.set(wingX, wingH / 2 + 0.18, wingZ)
  mainWing.castShadow = true
  mainWing.receiveShadow = true
  campus.add(mainWing)

  // แถบกระจกยาวต่อเนื่อง 2 ชั้น (Wrapping Corner Ribbon Windows)
  const floorHeights = [0.92, 2.05]
  floorHeights.forEach((fy) => {
    // ด้านหน้า
    const frontGlass = new THREE.Mesh(
      new THREE.BoxGeometry(wingW - 0.1, 0.56, 0.08),
      ribbonGlassMat
    )
    frontGlass.position.set(wingX, fy, wingZ + wingD / 2 + 0.02)
    campus.add(frontGlass)

    // ด้านข้างซ้าย (ห่อหุ้มมุมอาคาร)
    const sideGlass = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.56, wingD * 0.55),
      ribbonGlassMat
    )
    sideGlass.position.set(wingX - wingW / 2 - 0.02, fy, wingZ + wingD * 0.21)
    campus.add(sideGlass)
  })

  // เฟรมขอบหลังคาด้านบน
  const roofTrim = new THREE.Mesh(
    new THREE.BoxGeometry(wingW + 0.12, 0.12, wingD + 0.12),
    wallLightGrayMat
  )
  roofTrim.position.set(wingX, wingH + 0.22, wingZ)
  campus.add(roofTrim)

  // ป้ายโลโก้ MITSUBISHI ELECTRIC / MITSUBISHI ELEVATOR ASIA ด้านบนมุมซ้ายหน้าอาคาร
  const signTex = createAmecSignTexture()
  const signMat = new THREE.MeshBasicMaterial({
    map: signTex,
    transparent: true,
  })
  const signPlane = new THREE.Mesh(new THREE.PlaneGeometry(3.1, 0.96), signMat)
  signPlane.position.set(wingX - wingW / 2 + 1.8, wingH - 0.22, wingZ + wingD / 2 + 0.06)
  campus.add(signPlane)

  // === 2. โถงกระจกกลางและกันสาดทางเข้า (Glass Atrium + Entrance Canopy) ===
  const atrium = new THREE.Mesh(
    new THREE.BoxGeometry(2.1, 2.75, 3.8),
    ribbonGlassMat
  )
  atrium.position.set(wingX + wingW / 2 + 0.95, 1.55, wingZ - 0.2)
  atrium.castShadow = true
  campus.add(atrium)

  const canopy = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.18, 2.0), trimDarkMat)
  canopy.position.set(wingX + wingW / 2 + 1.15, 1.38, wingZ + 2.2)
  canopy.castShadow = true
  campus.add(canopy)

  // เสาค้ำกันสาดทางเข้า
  for (const dx of [-1.35, 1.35]) {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.35, 8), trimDarkMat)
    pillar.position.set(wingX + wingW / 2 + 1.15 + dx, 0.68, wingZ + 2.95)
    campus.add(pillar)
  }

  // === 3. ปีกอาคารฝั่งขวา (Right Annex Wing) ===
  const rightWing = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.85, 4.2), wallWhiteMat)
  rightWing.position.set(wingX + wingW / 2 + 3.9, 1.6, wingZ - 0.3)
  rightWing.castShadow = true
  rightWing.receiveShadow = true
  campus.add(rightWing)

  floorHeights.forEach((fy) => {
    const rGlass = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.48, 0.08), ribbonGlassMat)
    rGlass.position.set(wingX + wingW / 2 + 3.9, fy - 0.05, wingZ - 0.3 + 2.12)
    campus.add(rGlass)
  })

  // === 4. หอทดสอบลิฟต์สูงตระหง่าน (Iconic AMEC Elevator Test Tower) ===
  const towerGroup = new THREE.Group()
  towerGroup.position.set(TOWER_X, 0, TOWER_Z)

  const tW = 3.25
  const tH = 10.2
  const tD = 2.65

  // ตัวหอหลักสีขาวนวล
  const towerBase = new THREE.Mesh(new THREE.BoxGeometry(tW, tH, tD), wallWhiteMat)
  towerBase.position.y = tH / 2 + 0.18
  towerBase.castShadow = true
  towerBase.receiveShadow = true
  towerGroup.add(towerBase)

  // แถบปล่องลิฟต์สีเทาเข้มแนวตั้ง 2 แถบ (ด้านหน้า-หลัง) เหมือนในภาพต้นแบบ
  const stripePositions = [-0.42, 0.68]
  stripePositions.forEach((sx, idx) => {
    const stripeH = idx === 1 ? tH + 0.55 : tH + 0.08
    const stripeW = idx === 1 ? 0.86 : 0.72
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(stripeW, stripeH, tD + 0.08),
      towerDarkGrayMat
    )
    stripe.position.set(sx, stripeH / 2 + 0.18, 0)
    stripe.castShadow = true
    towerGroup.add(stripe)
  })

  // ส่วนยอดหอแบบขั้นบันได (Stepped Crown)
  const crown = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.62, tD + 0.04), towerDarkGrayMat)
  crown.position.set(0.45, tH + 0.48, 0)
  towerGroup.add(crown)

  // แถบคาดแนวนอนสีเทาเข้มช่วง 2/3 ของหอ
  const horizBand = new THREE.Mesh(
    new THREE.BoxGeometry(tW + 0.12, 0.24, tD + 0.12),
    towerDarkGrayMat
  )
  horizBand.position.y = tH * 0.72
  towerGroup.add(horizBand)

  // หน้าต่างสี่เหลี่ยมจัตุรัสเรียงแนวตั้งบนปล่องสีเทาเข้ม (11 ชั้น)
  for (let row = 0; row < 11; row++) {
    const wy = 1.6 + row * 0.74
    const cols = [-0.62, -0.22, 0.46, 0.88]
    cols.forEach((cx) => {
      const sqWin = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.2, 0.06), towerWinMat)
      sqWin.position.set(cx, wy, tD / 2 + 0.06)
      towerGroup.add(sqWin)
    })
  }

  // ช่องปล่อยลิฟต์ขึ้นฟ้าบนยอดหอ (Rooftop Launch Collar)
  const launchCollar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.68, 0.82, 0.35, 16),
    trimDarkMat
  )
  launchCollar.position.set(0.25, tH + 0.85, 0)
  towerGroup.add(launchCollar)

  campus.add(towerGroup)

  // === 5. ถนนทางเข้า สนามหญ้าหน้าตึก และขอบทางเดินอิฐ ===
  const lawn = new THREE.Mesh(
    new THREE.BoxGeometry(11.8, 0.18, 6.2),
    new THREE.MeshStandardMaterial({ color: 0x65a30d, roughness: 0.9 })
  )
  lawn.position.set(-1.1, 0.09, 6.2)
  lawn.receiveShadow = true
  campus.add(lawn)

  // ขอบทางเดินสีส้มอิฐหน้าสนามหญ้า
  const walkway = new THREE.Mesh(
    new THREE.BoxGeometry(12.2, 0.2, 0.65),
    new THREE.MeshStandardMaterial({ color: 0xc2784a, roughness: 0.85 })
  )
  walkway.position.set(-1.1, 0.1, 9.4)
  campus.add(walkway)

  // ถนนคอนกรีตหน้าทางเข้า
  const driveway = new THREE.Mesh(
    new THREE.BoxGeometry(6.8, 0.12, 9.5),
    new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.88 })
  )
  driveway.position.set(7.6, 0.06, 6.8)
  driveway.receiveShadow = true
  campus.add(driveway)

  // ป้ายบอกทางหน้าตึกมุมซ้ายล่าง
  const dirSign = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 1.15, 0.08),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4, metalness: 0.3 })
  )
  dirSign.position.set(-5.6, 0.72, 8.1)
  campus.add(dirSign)

  // พุ่มไม้ตกแต่งหน้าอาคาร
  const bushMat = new THREE.MeshStandardMaterial({ color: 0x3f8f29, roughness: 0.85 })
  const bushCoords = [
    [-4.2, 6.8, 0.65], [-2.8, 7.6, 0.52], [-0.4, 7.2, 0.62],
    [1.4, 7.5, 0.55], [2.8, 7.1, 0.6], [3.6, 6.2, 0.48],
    [9.4, 5.4, 0.58], [10.4, 6.6, 0.52],
  ]
  bushCoords.forEach(([bx, bz, br]) => {
    const bush = new THREE.Mesh(new THREE.DodecahedronGeometry(br, 1), bushMat)
    bush.position.set(bx, br * 0.65 + 0.12, bz)
    bush.scale.y = 0.72
    bush.castShadow = true
    campus.add(bush)
  })

  scene.add(campus)
}

/**
 * สร้างดวงจันทร์ไกลออกไปในอวกาศ + ลิฟต์อวกาศเชื่อมจากยอดหอทดสอบลิฟต์ + จรวดปล่อยออกจากดวงจันทร์
 */
function createMoonAndSpaceElevator() {
  const startVec = new THREE.Vector3(ELEVATOR_START.x, ELEVATOR_START.y, ELEVATOR_START.z)
  const moonCenter = new THREE.Vector3(MOON_POS.x, MOON_POS.y, MOON_POS.z)

  // จุดสถานีจอดลิฟต์ที่ขอบล่าง-หน้าของดวงจันทร์
  const toStartDir = new THREE.Vector3().subVectors(startVec, moonCenter).normalize()
  const dockVec = moonCenter.clone().addScaledVector(toStartDir, MOON_RADIUS + 0.45)

  // เส้นทางโค้งอ่อนๆ ของลิฟต์อวกาศจากยอดหอทดสอบลิฟต์พุ่งขึ้นไปเชื่อมดวงจันทร์ไกลออกไป
  const mid1 = startVec.clone().lerp(dockVec, 0.32)
  mid1.y += 1.6
  const mid2 = startVec.clone().lerp(dockVec, 0.7)
  mid2.y += 0.9
  elevatorCurve = new THREE.CatmullRomCurve3([startVec, mid1, mid2, dockVec])

  // === 1. ดวงจันทร์ 3D สมจริง (อยู่ไกลออกไปเพื่อมิติความลึก) ===
  const { colorTex: moonColorTex, bumpTex: moonBumpTex } = createMoonMaps()
  const moonMat = new THREE.MeshStandardMaterial({
    map: moonColorTex,
    bumpMap: moonBumpTex,
    bumpScale: 0.22,
    emissiveMap: moonColorTex,
    emissive: 0xdbeafe,
    emissiveIntensity: 0.22,
    roughness: 0.94,
    metalness: 0.02,
  })
  moonMesh = new THREE.Mesh(new THREE.SphereGeometry(MOON_RADIUS, 64, 48), moonMat)
  moonMesh.position.copy(moonCenter)
  scene.add(moonMesh)

  // ออร่าแสงนุ่มรอบดวงจันทร์
  moonHaloMat = new THREE.MeshBasicMaterial({
    color: 0xbae6fd,
    transparent: true,
    opacity: 0.2,
    side: THREE.BackSide,
  })
  const moonHalo = new THREE.Mesh(new THREE.SphereGeometry(MOON_RADIUS * 1.22, 32, 24), moonHaloMat)
  moonHalo.position.copy(moonCenter)
  scene.add(moonHalo)

  // แสงจากดวงจันทร์
  moonLight = new THREE.PointLight(0xbae6fd, 0.8, 36, 1.4)
  moonLight.position.copy(dockVec).add(new THREE.Vector3(-1.5, -1.5, 3.0))
  scene.add(moonLight)

  // วงแหวนสถานีจอดลิฟต์ใต้ดวงจันทร์ (Lunar Docking Ring)
  elevatorRingMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.85,
    roughness: 0.25,
    metalness: 0.5,
  })
  moonDockRing = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.07, 10, 36), elevatorRingMat)
  moonDockRing.position.copy(dockVec)
  moonDockRing.lookAt(moonCenter)
  scene.add(moonDockRing)

  // === 2. รางลิฟต์และลำแสงนำทางพุ่งจากยอดหอทดสอบลิฟต์ไปถึงดวงจันทร์ ===
  elevatorBeamMat = new THREE.MeshStandardMaterial({
    color: 0x7dd3fc,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.75,
    transparent: true,
    opacity: 0.52,
    roughness: 0.15,
  })
  const centerBeam = new THREE.Mesh(
    new THREE.TubeGeometry(elevatorCurve, 64, 0.11, 10, false),
    elevatorBeamMat
  )
  scene.add(centerBeam)

  // รางคู่ขนานโลหะเรืองแสงตามแนวโค้ง
  const railMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.35,
    roughness: 0.25,
    metalness: 0.75,
  })
  for (const offsetX of [-0.32, 0.32]) {
    const railPts = elevatorCurve.getPoints(32).map((pt) => new THREE.Vector3(pt.x + offsetX, pt.y, pt.z))
    const railCurve = new THREE.CatmullRomCurve3(railPts)
    const railMesh = new THREE.Mesh(new THREE.TubeGeometry(railCurve, 48, 0.028, 6, false), railMat)
    scene.add(railMesh)
  }

  // วงแหวนนำทางเรืองแสงเรียงเป็นระยะตลอดเส้นทาง
  const ringCount = 7
  const upAxis = new THREE.Vector3(0, 0, 1)
  for (let i = 0; i < ringCount; i++) {
    const t = (i + 0.6) / (ringCount + 0.4)
    const pos = elevatorCurve.getPointAt(t)
    const tan = elevatorCurve.getTangentAt(t).normalize()
    const guideRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.48, 0.028, 8, 24),
      elevatorRingMat
    )
    guideRing.position.copy(pos)
    guideRing.quaternion.setFromUnitVectors(upAxis, tan)
    scene.add(guideRing)
  }

  // === 3. ตัวลิฟต์แก้วเรืองแสงวิ่งขึ้น-ลงระหว่างยอดตึกกับดวงจันทร์ ===
  elevatorCabin = new THREE.Group()
  elevatorCabin.position.copy(startVec)

  const capMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.25,
    metalness: 0.65,
  })
  const cabinTop = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, 0.22, 12), capMat)
  cabinTop.position.y = 0.56
  elevatorCabin.add(cabinTop)

  const cabinBottom = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.38, 0.22, 12), capMat)
  cabinBottom.position.y = -0.56
  elevatorCabin.add(cabinBottom)

  const cabinGlassMat = new THREE.MeshStandardMaterial({
    color: 0xe0f2fe,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.95,
    roughness: 0.12,
    metalness: 0.35,
    transparent: true,
    opacity: 0.92,
  })
  const cabinBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.42, 0.92, 12),
    cabinGlassMat
  )
  elevatorCabin.add(cabinBody)

  const accentBand = new THREE.Mesh(
    new THREE.TorusGeometry(0.44, 0.032, 8, 24),
    new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xef4444,
      emissiveIntensity: 0.9,
    })
  )
  accentBand.rotation.x = Math.PI / 2
  accentBand.position.y = 0.4
  elevatorCabin.add(accentBand)

  elevatorCabinGlow = new THREE.PointLight(0x38bdf8, 1.8, 7.5, 1.6)
  elevatorCabinGlow.position.set(0, 0, 0.55)
  elevatorCabin.add(elevatorCabinGlow)
  scene.add(elevatorCabin)

  // แสงสัญญาณวิ่งวนตามแนวเส้นทางลิฟต์
  for (let i = 0; i < 4; i++) {
    const orb = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0x7dd3fc })
    )
    scene.add(orb)
    elevatorPulseOrbs.push({
      mesh: orb,
      offset: i / 4,
      angle: i * (Math.PI / 2),
    })
  }

  // === 4. จรวดปล่อยออกจากพื้นผิวดวงจันทร์ (Lunar Rocket Launch) ===
  // ทิศทางปล่อยจรวดเฉียงขึ้นไปทางซ้ายบน/ขวาบนให้เห็นชัดเจนในเฟรม
  rocketDir = new THREE.Vector3(-0.62, 0.72, 0.32).normalize()
  rocketOrigin = moonCenter.clone().addScaledVector(rocketDir, MOON_RADIUS + 0.18)

  // แท่นปล่อยจรวดขนาดย่อมบนผิวดวงจันทร์
  const pad = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.72, 0.18, 12),
    new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.5, metalness: 0.6 })
  )
  pad.position.copy(moonCenter).addScaledVector(rocketDir, MOON_RADIUS + 0.04)
  pad.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), rocketDir)
  scene.add(pad)

  // ตัวจรวด 3D
  rocketGroup = new THREE.Group()
  rocketGroup.position.copy(rocketOrigin)
  rocketGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), rocketDir)

  const bodyWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.3,
    metalness: 0.35,
  })
  const redAccentMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626,
    emissive: 0x991b1b,
    emissiveIntensity: 0.25,
    roughness: 0.35,
    metalness: 0.3,
  })
  const darkMetalMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.4,
    metalness: 0.75,
  })

  // ลำตัวจรวด
  const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.32, 1.55, 14), bodyWhiteMat)
  fuselage.position.y = 0.85
  rocketGroup.add(fuselage)

  // หัวกรวยสีแดง
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.62, 14), redAccentMat)
  nose.position.y = 1.93
  rocketGroup.add(nose)

  // แถบคาดสีแดงรอบลำตัว
  const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.275, 0.29, 0.18, 14), redAccentMat)
  stripe.position.y = 1.18
  rocketGroup.add(stripe)

  // หน้าต่างห้องนักบินเรืองแสงสีฟ้า
  const porthole = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 10, 10),
    new THREE.MeshStandardMaterial({
      color: 0x7dd3fc,
      emissive: 0x38bdf8,
      emissiveIntensity: 1.1,
    })
  )
  porthole.position.set(0, 1.38, 0.22)
  rocketGroup.add(porthole)

  // ครีบหาง 4 ด้าน
  for (let i = 0; i < 4; i++) {
    const finWrap = new THREE.Group()
    finWrap.rotation.y = (i * Math.PI) / 2
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.46, 0.32), redAccentMat)
    fin.position.set(0, 0.28, 0.32)
    fin.rotation.x = 0.28
    finWrap.add(fin)
    rocketGroup.add(finWrap)
  }

  // ท่อไอพ่น
  const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.24, 0.24, 12), darkMetalMat)
  nozzle.position.y = 0.02
  rocketGroup.add(nozzle)

  // เปลวไฟไอพ่นเรืองแสง (Outer Orange + Inner Yellow-White)
  rocketFlame = new THREE.Group()
  rocketFlame.position.y = -0.1
  const outerFlame = new THREE.Mesh(
    new THREE.ConeGeometry(0.24, 1.15, 10),
    new THREE.MeshBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.88 })
  )
  outerFlame.rotation.x = Math.PI
  outerFlame.position.y = -0.55
  rocketFlame.add(outerFlame)

  const innerFlame = new THREE.Mesh(
    new THREE.ConeGeometry(0.13, 0.72, 10),
    new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.95 })
  )
  innerFlame.rotation.x = Math.PI
  innerFlame.position.y = -0.35
  rocketFlame.add(innerFlame)
  rocketGroup.add(rocketFlame)

  rocketFlameLight = new THREE.PointLight(0xfb923c, 2.2, 10, 1.6)
  rocketFlameLight.position.y = -0.6
  rocketGroup.add(rocketFlameLight)

  scene.add(rocketGroup)

  // กลุ่มควัน/ไอพ่นติดตามท้ายจรวด
  for (let i = 0; i < 10; i++) {
    const puff = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 8, 8),
      new THREE.MeshBasicMaterial({
        color: 0xf1f5f9,
        transparent: true,
        opacity: 0,
      })
    )
    scene.add(puff)
    rocketTrailPuffs.push({ mesh: puff, lag: i * 0.028 })
  }
}

/**
 * สร้างต้นไม้ โซน Eco (แผงโซลาร์ + กังหันลม) และเสาไฟรอบพื้นที่
 */
function createTree(x, z, scale = 1) {
  const tree = new THREE.Group()
  tree.position.set(x, 0, z)

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1 * scale, 0.16 * scale, 0.85 * scale, 7),
    new THREE.MeshStandardMaterial({ color: 0x7c5335, roughness: 0.9 })
  )
  trunk.position.y = 0.425 * scale
  trunk.castShadow = true
  tree.add(trunk)

  const foliageColors = [0x22c55e, 0x15803d, 0x4ade80]
  for (let i = 0; i < 3; i++) {
    const crown = new THREE.Mesh(
      new THREE.DodecahedronGeometry((0.88 - i * 0.16) * scale, 1),
      new THREE.MeshStandardMaterial({
        color: foliageColors[i % foliageColors.length],
        roughness: 0.82,
      })
    )
    crown.position.set(
      (i === 1 ? 0.25 : i === 2 ? -0.2 : 0) * scale,
      (1.25 + i * 0.42) * scale,
      (i === 1 ? -0.15 : 0.1) * scale
    )
    crown.castShadow = true
    tree.add(crown)
  }

  scene.add(tree)
}

function createSolarArray(startX, startZ, cols = 3, rows = 2) {
  const group = new THREE.Group()
  const panelMat = new THREE.MeshStandardMaterial({
    color: 0x1d4ed8,
    emissive: 0x1e40af,
    emissiveIntensity: 0.22,
    roughness: 0.22,
    metalness: 0.75,
  })
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1,
    roughness: 0.4,
    metalness: 0.6,
  })

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const unit = new THREE.Group()
      unit.position.set(startX + c * 1.05, 0, startZ + r * 0.95)

      const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.38, 6), frameMat)
      stand.position.y = 0.19
      unit.add(stand)

      const panel = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.06, 0.56), panelMat)
      panel.position.y = 0.42
      panel.rotation.x = 0.42
      unit.add(panel)

      group.add(unit)
    }
  }
  scene.add(group)
}

function createWindTurbine(x, z, height = 5.0) {
  const turbine = new THREE.Group()
  turbine.position.set(x, 0, z)

  const whiteMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.35,
    metalness: 0.2,
  })

  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.13, height, 10), whiteMat)
  pole.position.y = height / 2
  pole.castShadow = true
  turbine.add(pole)

  const rotor = new THREE.Group()
  rotor.position.set(0, height, 0.22)
  for (let i = 0; i < 3; i++) {
    const bladeWrap = new THREE.Group()
    bladeWrap.rotation.z = (i * Math.PI * 2) / 3
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.35, 0.03), whiteMat)
    blade.position.y = 0.68
    bladeWrap.add(blade)
    rotor.add(bladeWrap)
  }
  turbine.add(rotor)
  windRotors.push(rotor)
  scene.add(turbine)
}

function createStreetLamp(x, z, addPointLight = false) {
  const lamp = new THREE.Group()
  lamp.position.set(x, 0, z)

  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.06, 2.3, 8),
    new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5, metalness: 0.6 })
  )
  pole.position.y = 1.15
  lamp.add(pole)

  const bulbMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xfde047,
    emissiveIntensity: 0.2,
    roughness: 0.2,
  })
  lampBulbMaterials.push(bulbMat)

  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), bulbMat)
  bulb.position.y = 2.35
  lamp.add(bulb)

  if (addPointLight) {
    const pt = new THREE.PointLight(0xfde68a, 0, 8.5, 1.8)
    pt.position.set(0, 2.35, 0)
    lamp.add(pt)
    lampLights.push(pt)
  }

  scene.add(lamp)
}

async function initScene() {
  if (!canvasRef.value || !containerRef.value) return

  THREE = await import('three')

  const width = containerRef.value.clientWidth || window.innerWidth
  const height = containerRef.value.clientHeight || window.innerHeight

  scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0xe3f1fc, 0.0085)

  camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 200)
  camera.position.set(baseCamPos.x, baseCamPos.y, baseCamPos.z)
  camera.lookAt(baseLookAt.x, baseLookAt.y, baseLookAt.z)

  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setSize(width, height)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.08

  // 1. ท้องฟ้า Gradient Dome
  const skyGeo = new THREE.SphereGeometry(110, 24, 16)
  skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      topColor: { value: new THREE.Color(0x3f8fd2) },
      bottomColor: { value: new THREE.Color(0xe6f4ff) },
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition + vec3(0.0, 14.0, 0.0)).y;
        float t = pow(max(h, 0.0), 0.62);
        gl_FragColor = vec4(mix(bottomColor, topColor, t), 1.0);
      }
    `,
  })
  scene.add(new THREE.Mesh(skyGeo, skyMat))

  // ดวงดาวบนท้องฟ้า
  const starCount = 220
  const starPos = new Float32Array(starCount * 3)
  for (let i = 0; i < starCount; i++) {
    const theta = Math.random() * Math.PI * 2
    const phi = Math.random() * Math.PI * 0.45
    const r = 74 + Math.random() * 18
    starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
    starPos[i * 3 + 1] = r * Math.cos(phi) + 8
    starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
  }
  const starGeo = new THREE.BufferGeometry()
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
  starField = new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({ color: 0xe0f2fe, size: 0.45, transparent: true, opacity: 0 })
  )
  scene.add(starField)

  // 2. ระบบแสงหลัก
  hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0xcfe5cf, 1.15)
  scene.add(hemiLight)

  dirLight = new THREE.DirectionalLight(0xffffff, 1.45)
  dirLight.position.set(14, 30, 20)
  dirLight.castShadow = true
  dirLight.shadow.mapSize.set(1024, 1024)
  dirLight.shadow.camera.near = 2
  dirLight.shadow.camera.far = 75
  const d = 22
  dirLight.shadow.camera.left = -d
  dirLight.shadow.camera.right = d
  dirLight.shadow.camera.top = d
  dirLight.shadow.camera.bottom = -d
  scene.add(dirLight)

  fillLight = new THREE.DirectionalLight(0xbae6fd, 0.5)
  fillLight.position.set(-16, 12, -10)
  scene.add(fillLight)

  // 3. พื้นโลกหลัก
  groundMat = new THREE.MeshStandardMaterial({
    color: 0xdce8dc,
    roughness: 0.92,
    metalness: 0.02,
  })
  const ground = new THREE.Mesh(new THREE.CircleGeometry(55, 48), groundMat)
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)

  // 4. อาคาร Mitsubishi Elevator Asia + หอทดสอบลิฟต์
  createAmecCampus()

  // 5. ดวงจันทร์ + ลิฟต์อวกาศพุ่งขึ้นจากหอทดสอบลิฟต์
  createMoonAndSpaceElevator()

  // 6. ต้นไม้ โซน Eco (โซลาร์เซลล์ + กังหันลม) และเสาไฟ
  const treeCoords = [
    [-7.2, 4.6, 1.45],
    [-6.0, 2.0, 1.15],
    [-3.6, 5.2, 0.85],
    [11.2, 2.2, 1.1],
    [12.4, -1.8, 1.25],
    [9.4, -5.2, 1.05],
    [-1.2, -4.4, 1.1],
  ]
  treeCoords.forEach(([tx, tz, sc]) => createTree(tx, tz, sc))

  createSolarArray(-4.6, -4.6, 3, 2)
  createWindTurbine(11.8, -5.8, 5.2)
  createWindTurbine(13.6, -3.4, 4.4)

  const lampCoords = [
    [4.4, 5.2, true],
    [9.2, 5.0, true],
    [-2.4, 8.6, false],
    [5.8, 1.4, true],
  ]
  lampCoords.forEach(([lx, lz, hasLight]) => createStreetLamp(lx, lz, hasLight))

  // 7. ก้อนเมฆโปร่งแสงลอยช้าๆ
  cloudGroup = new THREE.Group()
  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.95,
    transparent: true,
    opacity: 0.75,
  })
  const cloudDefs = [
    [-10, 16.5, -18, 1.4],
    [14, 17.5, -20, 1.6],
    [0, 19.5, -24, 1.25],
  ]
  cloudDefs.forEach(([cx, cy, cz, scale]) => {
    const cg = new THREE.Group()
    cg.position.set(cx, cy, cz)
    for (let i = 0; i < 3; i++) {
      const puff = new THREE.Mesh(
        new THREE.SphereGeometry((1.2 + (i === 1 ? 0.45 : 0)) * scale, 12, 10),
        cloudMat
      )
      puff.position.set((i - 1) * 1.15 * scale, i === 1 ? 0.35 : 0, 0)
      puff.scale.y = 0.6
      cg.add(puff)
    }
    cloudGroup.add(cg)
  })
  scene.add(cloudGroup)

  // 8. ตั้งค่าแสงตามเวลาจริง + อัปเดตทุก 1 นาที
  timePhase.value = detectTimePhase()
  applyPalette()

  minuteTimer = window.setInterval(() => {
    const nextPhase = detectTimePhase()
    if (nextPhase !== timePhase.value) {
      timePhase.value = nextPhase
      applyPalette()
    }
  }, 60 * 1000)

  // 9. Event Listeners
  resizeHandler = () => {
    if (!containerRef.value || !renderer || !camera) return
    const w = containerRef.value.clientWidth || window.innerWidth
    const h = containerRef.value.clientHeight || window.innerHeight
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
    if (reducedMotion) renderer.render(scene, camera)
  }
  window.addEventListener('resize', resizeHandler)

  pointerMoveHandler = (e) => {
    if (reducedMotion) return
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1
  }
  window.addEventListener('pointermove', pointerMoveHandler, { passive: true })

  motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion = motionMediaQuery.matches
  motionChangeHandler = (e) => {
    reducedMotion = e.matches
    if (reducedMotion) {
      if (animFrameId != null) {
        cancelAnimationFrame(animFrameId)
        animFrameId = null
      }
      renderer?.render(scene, camera)
    } else if (animFrameId == null) {
      startLoop()
    }
  }
  motionMediaQuery.addEventListener?.('change', motionChangeHandler)

  if (reducedMotion) {
    renderer.render(scene, camera)
  } else {
    startLoop()
  }
}

let lastTimestamp = 0

function startLoop() {
  lastTimestamp = performance.now()
  const animate = (now) => {
    if (!renderer || !scene || !camera) return
    animFrameId = requestAnimationFrame(animate)

    const dt = Math.min((now - lastTimestamp) / 1000, 0.05)
    lastTimestamp = now
    const elapsed = now * 0.001

    // Mouse Parallax
    pointer.curX += (pointer.x - pointer.curX) * 0.04
    pointer.curY += (pointer.y - pointer.curY) * 0.04
    camera.position.x = baseCamPos.x + pointer.curX * 1.5
    camera.position.y = baseCamPos.y - pointer.curY * 0.85
    camera.lookAt(baseLookAt.x, baseLookAt.y, baseLookAt.z)

    // แอนิเมชันลิฟต์วิ่งออกจากยอดตึกตามรางโค้งขึ้นไปถึงดวงจันทร์ที่อยู่ไกลออกไป แล้ววิ่งกลับลงมา
    const yAxis = new THREE.Vector3(0, 1, 0)
    if (elevatorCabin && elevatorCurve) {
      const cycle = (elapsed * 0.12) % 1 // ~8.3 วินาทีต่อรอบไป-กลับ
      let progress
      if (cycle < 0.42) {
        const u = cycle / 0.42
        progress = u * u * (3 - 2 * u)
      } else if (cycle < 0.54) {
        progress = 1
      } else if (cycle < 0.92) {
        const u = (cycle - 0.54) / 0.38
        progress = 1 - u * u * (3 - 2 * u)
      } else {
        progress = 0
      }

      const t = 0.04 + progress * 0.92
      const pos = elevatorCurve.getPointAt(t)
      const tan = elevatorCurve.getTangentAt(t).normalize()
      elevatorCabin.position.copy(pos)
      elevatorCabin.quaternion.setFromUnitVectors(yAxis, tan)
    }

    // แสงสัญญาณวิ่งวนตามแนวเส้นทางลิฟต์สู่ดวงจันทร์
    if (elevatorCurve) {
      for (const item of elevatorPulseOrbs) {
        const t = (elapsed * 0.32 + item.offset) % 1
        const pos = elevatorCurve.getPointAt(t)
        const ang = elapsed * 2.4 + item.angle
        item.mesh.position.set(
          pos.x + Math.cos(ang) * 0.36,
          pos.y,
          pos.z + Math.sin(ang) * 0.36
        )
      }
    }

    // แอนิเมชันจรวดปล่อยออกจากพื้นผิวดวงจันทร์ (จุดไฟ -> เร่งเครื่องพุ่งทะยาน -> ควันตามหลัง -> รีเซ็ต)
    if (rocketGroup && rocketOrigin && rocketDir) {
      const rCycle = (elapsed * 0.14) % 1 // ~7 วินาทีต่อรอบการปล่อย
      const maxDist = 17.0

      if (rCycle < 0.14) {
        // เตรียมจุดไฟและสั่นเบาๆ บนแท่นปล่อยดวงจันทร์
        const shake = Math.sin(elapsed * 45) * 0.04
        rocketGroup.position.copy(rocketOrigin).add(new THREE.Vector3(shake, 0, shake))
        rocketGroup.scale.setScalar(1)
        if (rocketFlame) {
          const ignition = rCycle / 0.14
          rocketFlame.visible = true
          rocketFlame.scale.set(0.6 + ignition * 0.4, 0.4 + ignition * 0.8 + Math.sin(elapsed * 40) * 0.15, 0.6 + ignition * 0.4)
        }
        if (rocketFlameLight) rocketFlameLight.intensity = 1.2 + (rCycle / 0.14) * 1.6
        rocketTrailPuffs.forEach((p) => {
          p.mesh.material.opacity = 0
        })
      } else if (rCycle < 0.82) {
        // พุ่งทะยานออกจากดวงจันทร์ด้วยความเร่ง
        const u = (rCycle - 0.14) / 0.68
        const dist = Math.pow(u, 2.05) * maxDist
        rocketGroup.position.copy(rocketOrigin).addScaledVector(rocketDir, dist)

        // ค่อยๆ ย่อเล็กลงเมื่อพุ่งเข้าห้วงอวกาศไกลออกไป
        const shrink = u > 0.72 ? Math.max(0.01, 1 - (u - 0.72) / 0.28) : 1
        rocketGroup.scale.setScalar(shrink)

        if (rocketFlame) {
          rocketFlame.visible = true
          const flicker = 0.85 + Math.sin(elapsed * 52) * 0.22
          rocketFlame.scale.set(1, flicker * (1.1 + u * 0.5), 1)
        }
        if (rocketFlameLight) rocketFlameLight.intensity = 2.6 * shrink

        // กลุ่มควัน/ไอพ่นติดตามท้ายจรวด
        for (const p of rocketTrailPuffs) {
          const pu = u - p.lag
          if (pu > 0 && pu < 0.85) {
            const pDist = Math.pow(pu, 2.05) * maxDist
            p.mesh.position.copy(rocketOrigin).addScaledVector(rocketDir, Math.max(0, pDist - 0.35))
            const age = p.lag / 0.28
            p.mesh.scale.setScalar(0.65 + age * 1.4)
            p.mesh.material.opacity = Math.max(0, (1 - age) * 0.55 * shrink)
          } else {
            p.mesh.material.opacity = 0
          }
        }
      } else {
        // พักก่อนเตรียมปล่อยจรวดลำถัดไป
        const ready = (rCycle - 0.82) / 0.18
        rocketGroup.position.copy(rocketOrigin)
        rocketGroup.scale.setScalar(Math.min(1, ready * 1.4))
        if (rocketFlame) rocketFlame.visible = false
        if (rocketFlameLight) rocketFlameLight.intensity = 0
        rocketTrailPuffs.forEach((p) => {
          p.mesh.material.opacity = 0
        })
      }
    }

    // ดวงจันทร์หมุนช้าๆ + วงแหวนจอดลิฟต์หมุน
    if (moonMesh) {
      moonMesh.rotation.y = elapsed * 0.06
    }
    if (moonDockRing) {
      moonDockRing.rotation.z = elapsed * 0.65
    }

    // กังหันลมหมุน
    for (const rotor of windRotors) {
      rotor.rotation.z -= dt * 1.55
    }

    // เมฆลอยช้าๆ
    if (cloudGroup) {
      cloudGroup.position.x = Math.sin(elapsed * 0.05) * 2.4
    }

    renderer.render(scene, camera)
  }
  animFrameId = requestAnimationFrame(animate)
}

function disposeScene() {
  if (animFrameId != null) {
    cancelAnimationFrame(animFrameId)
    animFrameId = null
  }
  if (minuteTimer != null) {
    clearInterval(minuteTimer)
    minuteTimer = null
  }
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler)
    resizeHandler = null
  }
  if (pointerMoveHandler) {
    window.removeEventListener('pointermove', pointerMoveHandler)
    pointerMoveHandler = null
  }
  if (motionMediaQuery && motionChangeHandler) {
    motionMediaQuery.removeEventListener?.('change', motionChangeHandler)
    motionMediaQuery = null
    motionChangeHandler = null
  }

  disposableTextures.forEach((tex) => tex.dispose())
  disposableTextures = []

  if (scene) {
    scene.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose()
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => {
            m.map?.dispose()
            m.dispose()
          })
        } else {
          obj.material.map?.dispose()
          obj.material.dispose()
        }
      }
    })
    scene = null
  }

  if (renderer) {
    renderer.dispose()
    renderer = null
  }

  camera = null
  hemiLight = null
  dirLight = null
  fillLight = null
  moonLight = null
  skyMat = null
  groundMat = null
  windowMaterials = []
  lampBulbMaterials = []
  lampLights = []
  elevatorBeamMat = null
  elevatorRingMat = null
  elevatorCabin = null
  elevatorCabinGlow = null
  elevatorCurve = null
  elevatorPulseOrbs = []
  moonMesh = null
  moonHaloMat = null
  moonDockRing = null
  rocketGroup = null
  rocketFlame = null
  rocketFlameLight = null
  rocketTrailPuffs = []
  rocketOrigin = null
  rocketDir = null
  windRotors = []
  cloudGroup = null
  starField = null
}

watch(isDark, () => {
  applyPalette()
})

onMounted(() => {
  initScene()
})

onBeforeUnmount(() => {
  disposeScene()
})
</script>

<template>
  <div
    ref="containerRef"
    class="form-scene-bg"
    :data-phase="isDark ? 'dark' : timePhase"
    aria-hidden="true"
  >
    <canvas ref="canvasRef" class="form-scene-canvas"></canvas>
    <!-- Gradient Vignette ฝั่งซ้ายช่วยให้ข้อความ Hero อ่านง่ายชัดเจน -->
    <div class="form-scene-vignette"></div>
  </div>
</template>

<style scoped>
.form-scene-bg {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.form-scene-canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.form-scene-vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    95deg,
    rgba(248, 251, 255, 0.92) 0%,
    rgba(248, 251, 255, 0.78) 32%,
    rgba(248, 251, 255, 0.22) 58%,
    rgba(248, 251, 255, 0.0) 100%
  );
  transition: background 0.4s ease;
}

.dark .form-scene-vignette {
  background: linear-gradient(
    95deg,
    rgba(9, 19, 40, 0.92) 0%,
    rgba(9, 19, 40, 0.76) 34%,
    rgba(15, 29, 58, 0.26) 60%,
    rgba(15, 29, 58, 0.05) 100%
  );
}

@media (max-width: 959px) {
  .form-scene-vignette {
    background: linear-gradient(
      180deg,
      rgba(248, 251, 255, 0.88) 0%,
      rgba(248, 251, 255, 0.72) 46%,
      rgba(248, 251, 255, 0.32) 100%
    );
  }

  .dark .form-scene-vignette {
    background: linear-gradient(
      180deg,
      rgba(9, 19, 40, 0.9) 0%,
      rgba(9, 19, 40, 0.72) 48%,
      rgba(15, 29, 58, 0.36) 100%
    );
  }
}
</style>
