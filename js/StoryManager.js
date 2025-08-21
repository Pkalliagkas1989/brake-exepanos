// Simple cutscene text blips (disappear after a duration).
export class StoryManager {
  show(message, duration = 1400) {
    const overlay = document.createElement('div');
    overlay.className = 'cutscene';
    overlay.textContent = message;
    document.getElementById('board').appendChild(overlay);
    setTimeout(() => overlay.remove(), duration);
  }
}
