const markColors = {G: "#53c876", R: "#f45c59", O: "#ffa234", Y: "#ffdc52", B: "#60abef", W: "#ffffff"};

export function lampColor(params) {
  if (/^#[0-9a-f]{6}$/i.test(params?.lampColor)) return params.lampColor;
  return markColors[params?.lampMark?.toUpperCase?.()] ?? markColors.G;
}

// A shared tone makes multiple energized sounders audible without stacking their gains.
export class BuzzerAudio {
  constructor() {
    this.enabled = true;
    this.wanted = false;
    this.context = null;
    this.voice = null;
  }

  async unlock() {
    if (!this.enabled) return;
    this.context ??= new AudioContext();
    if (this.context.state === "suspended") await this.context.resume();
    this.sync(this.wanted);
  }

  sync(active) {
    this.wanted = active;
    const context = this.context;
    if (!active || !this.enabled || context?.state !== "running") {
      if (this.voice) {
        const {oscillator, gain} = this.voice;
        const t = context.currentTime;
        gain.gain.cancelScheduledValues(t);
        gain.gain.setValueAtTime(gain.gain.value, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.015);
        oscillator.stop(t + 0.02);
        this.voice = null;
      }
      return;
    }
    if (this.voice) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "square";
    oscillator.frequency.value = 760;
    gain.gain.setValueAtTime(0, context.currentTime);
    gain.gain.linearRampToValueAtTime(0.045, context.currentTime + 0.025);
    oscillator.connect(gain).connect(context.destination);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    oscillator.start();
    this.voice = {oscillator, gain};
  }
}
