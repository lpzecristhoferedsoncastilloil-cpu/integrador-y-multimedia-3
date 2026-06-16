import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

export default function SpaceParallaxBackground({ launchTrigger = 0 }) {
  const gameRef = useRef(null);
  const phaserRef = useRef(null);

  // Initialize Phaser
  useEffect(() => {
    if (!gameRef.current || phaserRef.current) return;

    const parentWidth = gameRef.current.clientWidth || window.innerWidth || 1200;
    const parentHeight = gameRef.current.clientHeight || window.innerHeight || 800;

    class RocketScene extends Phaser.Scene {
      constructor() { super({ key: 'RocketScene' }); }

      create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.cameras.main.setBackgroundColor('#0a0a2e');

        // 250 Estrellas con efecto parallax (se mueven en update)
        this.stars = [];
        for (let i = 0; i < 250; i++) {
          const x = Phaser.Math.Between(0, width);
          const y = Phaser.Math.Between(0, height);
          const size = Phaser.Math.Between(1, 4);
          let speedX = 0;
          let color = 0xffffff;

          if (size === 1) {
            speedX = 0.04 + Phaser.Math.FloatBetween(0, 0.04);
            color = 0x94a3b8; // dim grey
          } else if (size === 2) {
            speedX = 0.12 + Phaser.Math.FloatBetween(0, 0.08);
            color = 0xe2e8f0; // white
          } else {
            speedX = 0.35 + Phaser.Math.FloatBetween(0, 0.2);
            // close glowing stars in colors
            const randCol = Phaser.Math.Between(1, 4);
            if (randCol === 1) color = 0xfacc15; // yellow
            else if (randCol === 2) color = 0x22d3ee; // cyan
            else if (randCol === 3) color = 0xe879f9; // fuchsia
            else color = 0xffffff;
          }

          const star = this.add.circle(x, y, size, color, Phaser.Math.FloatBetween(0.4, 1.0));
          star.speedX = speedX;

          // Twinkling effect
          this.tweens.add({
            targets: star,
            alpha: 0.15,
            duration: Phaser.Math.Between(800, 2200),
            yoyo: true,
            repeat: -1
          });

          this.stars.push(star);
        }

        // Planetas y nubes
        this.add.text(width * 0.1, height * 0.15, '🌙', { fontSize: '42px' }).setAlpha(0.85);
        this.add.text(width * 0.75, height * 0.18, '⭐', { fontSize: '32px' }).setAlpha(0.9);
        this.add.text(width * 0.45, height * 0.1, '🪐', { fontSize: '52px' }).setAlpha(0.8);
        this.add.text(width * 0.8, height * 0.5, '🛸', { fontSize: '42px' }).setAlpha(0.7);

        // Crear cohetes pequeños decorativos
        this.createSmallRocket(width * 0.18, height * 0.45, '36px');
        this.createSmallRocket(width * 0.82, height * 0.32, '26px');

        // Cohete Principal Centrado
        this.rocket = this.add.text(width / 2, height - 90, '🚀', { fontSize: '80px' }).setOrigin(0.5);

        // Llamas del Cohete Principal
        this.flames = [];
        for (let i = 0; i < 5; i++) {
          const f = this.add.text(width / 2, height - 50, ['🔥', '✨', '💫'][i % 3], { fontSize: '30px' }).setOrigin(0.5).setAlpha(0);
          this.flames.push(f);
        }
      }

      createSmallRocket(x, y, scaleText) {
        const rText = this.add.text(x, y, '🚀', { fontSize: scaleText }).setOrigin(0.5);
        rText.setAngle(-45); // inclinado

        const fText = this.add.text(x - 12, y + 12, '🔥', { fontSize: (parseInt(scaleText) * 0.4) + 'px' }).setOrigin(0.5).setAlpha(0.8);
        fText.setAngle(-45);

        // Bobbing
        this.tweens.add({
          targets: [rText, fText],
          y: y - 10,
          duration: Phaser.Math.Between(1800, 2600),
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });

        // Flicker llamas
        this.tweens.add({
          targets: fText,
          scaleX: 1.25,
          scaleY: 1.25,
          alpha: 0.5,
          duration: Phaser.Math.Between(250, 450),
          yoyo: true,
          repeat: -1
        });

        // Lanzamiento aleatorio recurrente
        const launchDelay = Phaser.Math.Between(9000, 16000);
        this.time.addEvent({
          delay: launchDelay,
          callback: () => {
            const startX = rText.x;
            const startY = rText.y;

            this.tweens.add({
              targets: [rText, fText],
              x: startX + 500,
              y: startY - 500,
              duration: 1600,
              ease: 'Power1.easeIn',
              onComplete: () => {
                rText.setPosition(startX - 150, startY + 150);
                fText.setPosition(startX - 162, startY + 162);
                this.tweens.add({
                  targets: [rText, fText],
                  x: startX,
                  y: startY,
                  duration: 2000,
                  ease: 'Power2.easeOut'
                });
              }
            });
          },
          loop: true
        });
      }

      update(time, delta) {
        if (this.stars) {
          const width = this.cameras.main.width;
          const height = this.cameras.main.height;
          this.stars.forEach(star => {
            star.x -= star.speedX * (delta / 16.666);
            if (star.x < -10) {
              star.x = width + 10;
              star.y = Phaser.Math.Between(0, height);
            }
          });
        }
      }

      launchRocket() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.tweens.add({
          targets: this.rocket,
          y: -150,
          x: width / 2 + Phaser.Math.Between(-80, 80),
          duration: 1500,
          ease: 'Power2.easeIn',
          onComplete: () => {
            this.rocket.setPosition(width / 2, height - 90);
            this.tweens.add({ targets: this.rocket, alpha: 1, duration: 300 });
          }
        });

        this.flames.forEach((f, i) => {
          f.setPosition(width / 2 + Phaser.Math.Between(-30, 30), height - 40);
          this.tweens.add({
            targets: f,
            alpha: 1,
            y: f.y + 100,
            x: f.x + Phaser.Math.Between(-20, 20),
            duration: 400,
            delay: i * 70,
            yoyo: true,
            onComplete: () => f.setAlpha(0)
          });
        });

        // Beep audio
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(523, ctx.currentTime);
          osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
          osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
          gain.gain.setValueAtTime(0.25, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.5);
        } catch (e) {}
      }
    }

    phaserRef.current = new Phaser.Game({
      type: Phaser.AUTO,
      width: parentWidth,
      height: parentHeight,
      parent: gameRef.current,
      backgroundColor: '#0a0a2e',
      scene: RocketScene,
      audio: { disableWebAudio: false },
    });

    const handleResize = () => {
      if (phaserRef.current && gameRef.current) {
        const w = gameRef.current.clientWidth || window.innerWidth || 1200;
        const h = gameRef.current.clientHeight || window.innerHeight || 800;
        phaserRef.current.scale.resize(w, h);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (phaserRef.current) { phaserRef.current.destroy(true); phaserRef.current = null; }
    };
  }, []);

  // React to prop trigger to launch the rocket
  useEffect(() => {
    if (phaserRef.current && launchTrigger > 0) {
      const scene = phaserRef.current.scene.getScene('RocketScene');
      if (scene) {
        scene.launchRocket();
      }
    }
  }, [launchTrigger]);

  return <div ref={gameRef} style={styles.phaserCanvasContainer} />;
}

const styles = {
  phaserCanvasContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
    overflow: 'hidden'
  }
};
