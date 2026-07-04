export const AudioEngine = {
    ctx: new (window.AudioContext || window.webkitAudioContext)(),

    playTone: function(frequency, type, duration) {
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        const oscillator = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        oscillator.type = type;
        oscillator.frequency.value = frequency;
        gainNode.gain.value = 0.1;
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        oscillator.start();
        oscillator.stop(this.ctx.currentTime + duration);
    },

    click: function() {
        this.playTone(600, 'sine', 0.1);
    },

    error: function() {
        this.playTone(150, 'sawtooth', 0.2);
    },

    win: function() {
        const freqs = [400, 500, 600, 800];
        freqs.forEach((freq, i) => {
            setTimeout(() => {
                this.playTone(freq, 'triangle', 0.3);
            }, i * 100);
        });
    },

    fail: function() {
        const freqs = [150, 100];
        freqs.forEach((freq, i) => {
            setTimeout(() => {
                this.playTone(freq, 'sawtooth', 0.4);
            }, i * 300);
        });
    },

    countdownBeep: function() {
        this.playTone(300, 'square', 0.3);
    },

    countdownGo: function() {
        this.playTone(900, 'square', 0.6);
    },

    certPop: function() {
        const freqs = [523.25, 659.25, 783.99, 1046.50];
        freqs.forEach((freq, i) => {
            setTimeout(() => {
                this.playTone(freq, 'sine', 0.5);
            }, i * 150);
        });
    }
};
