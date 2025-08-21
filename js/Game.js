// Game orchestrator: state, level loading, sim/render, UI, input, audio.
import { InputHandler } from './InputHandler.js';
import { Paddle } from './Paddle.js';
import { Ball } from './Ball.js';
import { UI } from './UI.js';
import { StoryManager } from './StoryManager.js';
import { Sound } from './Sound.js';
import { ColliderGrid } from './ColliderGrid.js';
import { levelSpec } from './levels/index.js';

export class Game {
  constructor() {
    this.gameRoot = document.getElementById('game');
    this.board = document.getElementById('board');
    this.layerBricks = document.getElementById('bricks');
    this.layerEntities = document.getElementById('entities');
    this.fxOverlay = document.getElementById('glitchOverlay');

    // Initial board size
    const r = this.board.getBoundingClientRect();
    this.width = r.width;
    this.height = r.height;

    // Subsystems
    this.ui = new UI();
    this.story = new StoryManager();
    this.input = new InputHandler();
    this.sound = new Sound();

    // Game state
    this.score = 0;
    this.lives = 3;
    this.level = 1;

    this.bricks = [];
    this.grid = new ColliderGrid();
    this._gridRebuildCooldown = 0;

    this.paddle = new Paddle(document.getElementById('paddle'), this);
    this.ball = new Ball(document.getElementById('ball'), this);

    this._pauseShown = false;
    this._lifeLock = false;
    this._reducedMotion = !!this.ui.getSettings().reducedMotion;

    this._projectiles = [];
    this._boss = null;

    // UI buttons
    this.ui.onRetry(() => this.resetAll());
    this.ui.onExit(()  => this.exitToTitle());
    this.ui.onPauseContinue(() => this._continueFromPause());
    this.ui.onPauseRestart(()  => this.restartLevel());

    // Level select control
    document.getElementById('goLevel')?.addEventListener('click', () => {
      const lvl = parseInt(document.getElementById('levelBtn').value, 10);
      this.jumpToLevel(lvl);
    });

    // Keyboard shortcuts for quick jump and pause menu helpers
    document.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      if (e.key >= '1' && e.key <= '9') this.jumpToLevel(parseInt(e.key, 10));
      if (e.key === '0') this.jumpToLevel(10);
      if (this.input.paused) {
        const k = e.key.toLowerCase();
        if (k === 'c') this._continueFromPause();
        if (k === 'r') this.restartLevel();
      }
    });

    // Auto-pause on tab hide
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.input.paused = true;
    });

    // Resize observer updates bounds + rebuilds grid if needed
    this._resizeObs = new ResizeObserver(entries => {
      for (const e of entries) {
        const cr = e.contentRect;
        this.width = cr.width;
        this.height = cr.height;
        this.paddle.clamp();
        this.ball.nudgeInsideBounds();
        if (this.bricks?.length) this.grid.build(this.bricks, this.width, this.height);
      }
    });
    this._resizeObs.observe(this.board);

    this.board.focus();
    this.loadLevel(this.level);
  }

  // ----- Simulation tick (fixed step) -----
  simulate(stepMs) {
    // Overlay state + paused class (lets CSS throttle transitions)
    if (this.input.paused && !this._pauseShown) {
      this._pauseShown = true;
      this.ui.showPause();
      this.gameRoot.classList.add('paused');
    } else if (!this.input.paused && this._pauseShown) {
      this._pauseShown = false;
      this.ui.hidePause();
      this.gameRoot.classList.remove('paused');
    }

    if (this.input.paused) return;

    // Effects mode and reduced motion
    const { effects, reducedMotion } = this.ui.getSettings();
    this._reducedMotion = !!reducedMotion;
    if (effects === 'auto') {
      const drops = this.ui.getDropsPerSec();
      const threshold = 10;
      if (drops > threshold) this.board.classList.add('lowfx');
      else this.board.classList.remove('lowfx');
    } else if (effects === 'on') {
      this.board.classList.remove('lowfx');
    } else {
      this.board.classList.add('lowfx');
    }

    // Entities update
    this.paddle.update(stepMs, this.input);
    this.ball.update(stepMs, this.paddle);

    // Moving bricks + periodic grid rebuild when motion exists
    let moving = false;
    for (const b of this.bricks) {
      if ((b.vx || b.vy) && b.alive) { moving = true; b.tick(stepMs, this); }
    }
    if (moving) {
      this._gridRebuildCooldown -= stepMs;
      if (this._gridRebuildCooldown <= 0) {
        this.grid.build(this.bricks, this.width, this.height);
        this._gridRebuildCooldown = 250;
      }
    }

    // Level script update (custom logic per level)
    this.script?.onUpdate?.(stepMs, this);

    // Boss + projectiles
    if (this._boss) this._boss.update(stepMs);
    if (this._projectiles.length) {
      for (let i = this._projectiles.length - 1; i >= 0; i--) {
        const p = this._projectiles[i];
        p.update(stepMs, this);
        if (!p.alive) this._projectiles.splice(i, 1);
      }
    }

    // Completion: either level script decides, or no bricks remain
    const complete = this.script?.isComplete ? this.script.isComplete(this) : (this.bricks.length === 0);
    if (complete) {
      this.level++;
      if (this.level <= 10) this.loadLevel(this.level);
      else { this.story.show("ROOT UNLOCKED. You escaped BREAKOUT.EXE!"); this.resetAll(); }
    }
  }

  // ----- Render (once per rAF) -----
  render(ts) {
    this.ui.updateScore(this.score);
    this.ui.updateLives(this.lives);
    if (!this.input.paused) this.ui.updateTimer(); // freeze timer label while paused
    const ignoreDrops = this.input.paused || document.hidden;
    this.ui.updateFPS(ts, ignoreDrops);
  }

  // ----- Game flow helpers -----
  jumpToLevel(n) {
    this.level = Math.max(1, Math.min(10, n));
    this.score = 0;
    this.lives = 3;
    this.ui.updateScore(this.score);
    this.ui.updateLives(this.lives);
    this.ui.resetTimer();
    this.input.paused = false;
    this._lifeLock = false;
    this.loadLevel(this.level);
    this.board.focus();
  }

  loadLevel(n) {
    // Clear boss/projectiles
    for (const p of this._projectiles) p.destroy();
    this._projectiles = [];
    if (this._boss) { this._boss.destroy(); this._boss = null; }

    this.script?.onExit?.(this);
    this.script = levelSpec(n);

    this.story.show(`${this.script.name}: ${this.script.message}`);

    // Theme
    this.board.classList.remove('theme-crt','theme-firewall','theme-glitch');
    if (this.script.theme) this.board.classList.add(this.script.theme);

    // Speed multipliers
    this.ball.setSpeedMultiplier(this.script.speedMul ?? 1);
    this.paddle.setSpeedMultiplier(this.script.speedMul ?? 1);

    // Bricks
    this.layerBricks.innerHTML = '';
    this.bricks = this.script.createBricks(this);
    this.grid.build(this.bricks, this.width, this.height);
    this._gridRebuildCooldown = 0;

    // Auto low-fx for massive brick counts
    if (this.bricks.length > 240) this.board.classList.add('lowfx');
    else this.board.classList.remove('lowfx');

    // Ball reset
    this.ball.resetToPaddle(this.paddle);

    // Level hook
    this.script.onEnter?.(this);
  }

  resetAll() {
    this.ui.hideGameOver();
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.input.paused = false;
    this._lifeLock = false;
    this.ui.updateScore(this.score);
    this.ui.updateLives(this.lives);
    this.ui.resetTimer();
    this.gameRoot.classList.remove('paused');
    this.loadLevel(this.level);
    this.board.focus();
  }

  restartLevel() {
    this.score = 0;
    this.lives = 3;
    this.ui.updateScore(this.score);
    this.ui.updateLives(this.lives);
    this.layerBricks.innerHTML = '';
    this.bricks = this.script.createBricks(this);
    this.grid.build(this.bricks, this.width, this.height);
    this.ball.resetToPaddle(this.paddle);
    this.input.paused = false;
    this._lifeLock = false;
    this.ui.resetTimer();
    this.ui.hidePause();
    this.gameRoot.classList.remove('paused');
  }

  exitToTitle() { window.location.reload(); }
  _continueFromPause() { this.input.paused = false; this.gameRoot.classList.remove('paused'); }
  addScore(v = 10) { this.score += v; }

  // Life loss + small glitch feedback
  loseLife() {
    if (this._lifeLock) return;
    this._lifeLock = true;

    this.sound.play('life');
    this._glitchScreen(280);

    this.lives = Math.max(0, this.lives - 1);
    this.ui.updateLives(this.lives);

    if (this.lives <= 0) {
      setTimeout(() => { this.ui.showGameOver(); this.input.paused = true; }, 200);
      return;
    }
    setTimeout(() => { this.ball.resetToPaddle(this.paddle); this._lifeLock = false; }, 220);
  }

  // Visual glitch pulse (transform/opacity only)
  _glitchScreen(ms = 280) {
    if (this._reducedMotion) return;
    this.board.classList.add('glitch-mode');
    this.fxOverlay.classList.add('glitch-show');
    setTimeout(() => {
      this.fxOverlay.classList.remove('glitch-show');
      this.board.classList.remove('glitch-mode');
    }, ms);
  }
}
