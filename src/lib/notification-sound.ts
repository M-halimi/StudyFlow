let audioContext: AudioContext | null = null

function getContext() {
  if (!audioContext) {
    audioContext = new AudioContext()
  }
  return audioContext
}

// Simple notification sound for general alerts (bell/notification dropdown)
export function playNotificationSound() {
  try {
    const ctx = getContext()
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = "sine"
    osc.frequency.setValueAtTime(880, now)
    osc.frequency.setValueAtTime(660, now + 0.1)
    gain.gain.setValueAtTime(0.15, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3)
    osc.start(now)
    osc.stop(now + 0.3)
  } catch {
    // Audio not available
  }
}

type SessionType = "STUDY" | "WORK" | "BREAK" | "COFFEE"

export function playSessionEndSound(sessionType: SessionType) {
  try {
    const ctx = getContext()
    const now = ctx.currentTime

    if (sessionType === "STUDY") {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = "sine"
      osc.frequency.setValueAtTime(880, now)
      gain.gain.setValueAtTime(0.12, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35)
      osc.start(now)
      osc.stop(now + 0.35)
    } else if (sessionType === "WORK") {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = "triangle"
      osc.frequency.setValueAtTime(660, now)
      osc.frequency.setValueAtTime(880, now + 0.08)
      gain.gain.setValueAtTime(0.15, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4)
      osc.start(now)
      osc.stop(now + 0.4)
    } else if (sessionType === "BREAK") {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = "sine"
      osc.frequency.setValueAtTime(660, now)
      gain.gain.setValueAtTime(0.08, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25)
      osc.start(now)
      osc.stop(now + 0.25)
    } else if (sessionType === "COFFEE") {
      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      const gain = ctx.createGain()
      osc1.connect(gain)
      osc2.connect(gain)
      gain.connect(ctx.destination)
      osc1.type = "sine"
      osc1.frequency.setValueAtTime(440, now)
      osc2.type = "sine"
      osc2.frequency.setValueAtTime(554.37, now)
      gain.gain.setValueAtTime(0.1, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5)
      osc1.start(now)
      osc1.stop(now + 0.5)
      osc2.start(now)
      osc2.stop(now + 0.5)
    }
  } catch {
    // Audio not available
  }
}
