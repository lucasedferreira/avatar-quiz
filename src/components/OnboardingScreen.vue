<template>
  <div class="onboarding">
    <canvas ref="staticStarsRef" class="static-stars"></canvas>
    <canvas ref="canvasRef" class="warp-canvas"></canvas>

    <div class="onboarding__container">
      <div class="onboarding__card" ref="cardRef">
        <h1 class="onboarding__title">Bem-vindo(a) ao<br />Start Tec Senai!</h1>
        <p class="onboarding__description">
          Responda algumas perguntas e vamos criar um avatar único que representa você.
          É rápido, divertido e vai te surpreender!
        </p>
        <button class="onboarding__button" @click="handleStart" ref="buttonRef">
          <span>✨ Começar</span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
        <p class="onboarding__privacy">🔒 Nenhum dado é coletado ou enviado.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'
import { useQuizStore } from '../store/quiz'

const quizStore = useQuizStore()
const cardRef = ref(null)
const buttonRef = ref(null)
const canvasRef = ref(null)
const staticStarsRef = ref(null)

let ctx, width, height, stars = [], animationFrame
let staticCtx, staticStars = []
let speed = 0.02
const numStars = 600
const numStaticStars = 100
const maxDepth = 50
let fadeOut = false

// Inicializa estrelas estáticas
const initStaticStars = () => {
  staticStars = []
  for (let i = 0; i < numStaticStars; i++) {
    staticStars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1 + 0.5,
      brightness: Math.random() * 0.8 + 0.4
    })
  }
}

// Desenha estrelas estáticas
const drawStaticStars = () => {
  // Limpa o canvas com um fundo semi-transparente para o gradiente aparecer
  staticCtx.clearRect(0, 0, width, height)
  
  for (let star of staticStars) {
    staticCtx.beginPath()
    staticCtx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
    
    // Adiciona um brilho mais intenso
    const glow = staticCtx.createRadialGradient(
      star.x, star.y, 0,
      star.x, star.y, star.size * 2
    )
    glow.addColorStop(0, `rgba(255, 255, 255, ${star.brightness})`)
    glow.addColorStop(1, 'rgba(255, 255, 255, 0)')
    
    staticCtx.fillStyle = glow
    staticCtx.fill()
    
    // Núcleo da estrela
    staticCtx.beginPath()
    staticCtx.arc(star.x, star.y, star.size * 0.6, 0, Math.PI * 2)
    staticCtx.fillStyle = `rgba(255, 255, 255, ${star.brightness + 0.2})`
    staticCtx.fill()
  }
}

// Inicializa as estrelas em movimento
const initStars = () => {
  stars = []
  for (let i = 0; i < numStars; i++) {
    stars.push({
      x: (Math.random() - 0.5) * 2 * width,
      y: (Math.random() - 0.5) * 2 * height,
      z: Math.random() * maxDepth * 0.6 + maxDepth * 0.4,
      prevX: 0,
      prevY: 0,
      twinkleOffset: Math.random() * Math.PI * 2
    })
  }
}

// Desenha as estrelas em movimento
const drawStars = (time = 0) => {
  // Fundo gradiente - agora removido para não cobrir as estrelas estáticas
  // O gradiente ficará no CSS
  ctx.clearRect(0, 0, width, height)

  const centerX = width / 2
  const centerY = height / 2
  const scale = 200

  for (let star of stars) {
    star.z -= speed
    if (star.z <= 0) {
      star.x = (Math.random() - 0.5) * 2 * width
      star.y = (Math.random() - 0.5) * 2 * height
      star.z = maxDepth
      star.prevX = centerX
      star.prevY = centerY
      continue
    }

    const k = scale / star.z
    const x = star.x * k + centerX
    const y = star.y * k + centerY

    if (star.prevX && star.prevY) {
      ctx.beginPath()
      ctx.moveTo(star.prevX, star.prevY)
      ctx.lineTo(x, y)
      const baseOpacity = 1 - star.z / maxDepth

      const twinkle = 0.3 + 0.7 * Math.abs(Math.sin(time / 800 + star.twinkleOffset))
      const opacity = baseOpacity * twinkle

      ctx.strokeStyle = `rgba(255,255,255,${opacity})`
      ctx.lineWidth = 2 * (1 - star.z / maxDepth)
      ctx.stroke()
    }

    star.prevX = x
    star.prevY = y
  }

  if (!fadeOut) {
    animationFrame = requestAnimationFrame(drawStars)
  } else {
    ctx.fillStyle = 'rgba(0,0,0,0.1)'
    ctx.fillRect(0, 0, width, height)
    if (speed < 0.5) {
      cancelAnimationFrame(animationFrame)
      quizStore.startQuiz()
    } else {
      animationFrame = requestAnimationFrame(drawStars)
    }
  }
}

onMounted(() => {
  // Configura canvas das estrelas estáticas PRIMEIRO
  const staticCanvas = staticStarsRef.value
  staticCtx = staticCanvas.getContext('2d')
  
  // Configura canvas das estrelas em movimento
  const canvas = canvasRef.value
  ctx = canvas.getContext('2d')
  
  const resize = () => {
    width = window.innerWidth
    height = window.innerHeight
    
    // Configura ambos os canvases com as mesmas dimensões
    staticCanvas.width = canvas.width = width
    staticCanvas.height = canvas.height = height
    
    initStars()
    initStaticStars()
    drawStaticStars()
  }
  
  window.addEventListener('resize', resize)
  resize()
  drawStars()
})

onUnmounted(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
})

const handleStart = () => {
  gsap.to(buttonRef.value, { scale: 0.95, duration: 0.1 })
  gsap.to(cardRef.value, {
    scale: 0.9,
    opacity: 0,
    duration: 0.4,
    ease: 'power1.inOut'
  })

  gsap.to(staticStarsRef.value, {
    opacity: 0,
    scale: 1.5,
    duration: 0.75,
    ease: 'power1.in'
  })

  gsap.to({}, {
    duration: 2,
    ease: 'power4.in',
    onUpdate: () => {
      speed += 0.12
    },
    onComplete: () => {
      fadeOut = true
      gsap.to(canvasRef.value, {
        opacity: 0,
        duration: 1,
        ease: 'power1.out'
      })
      setTimeout(() => {
        quizStore.startQuiz()
      }, 1500)
    }
  })
}
</script>

<style lang="scss" scoped>
.onboarding {
  min-height: 100vh;
  background: linear-gradient(135deg, #0047b6 0%, #1CACEB 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.static-stars {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1; // Abaixo do warp mas acima do gradiente
}

.warp-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2; // Acima das estrelas estáticas
  transition: opacity 1s ease;
}

.onboarding__container {
  position: relative;
  z-index: 3; // Acima de tudo
  max-width: 480px;
  width: 100%;
}

.onboarding__card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 2.5rem 2rem;
  margin: 0 1.25rem;
  text-align: center;
}

.onboarding__title {
  font-size: 2rem;
  font-weight: 700;
  color: #002b6f;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.onboarding__description {
  color: #333;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.onboarding__button {
  width: 100%;
  background: #0047b6;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 71, 182, 0.3);

  &:hover {
    background: #003a94;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 71, 182, 0.4);
  }
}

.onboarding__privacy {
  margin-top: 1.5rem;
  font-size: 0.75rem;
  color: #666;
  line-height: 1.4;
}
</style>
