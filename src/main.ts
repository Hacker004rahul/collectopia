import './styles/main.css';
import { Game } from './game/Game';

const root = document.getElementById('app');

if (!root) {
  throw new Error('Missing #app root element');
}

let game: Game | null = null;

try {
  game = new Game(root);
  game.start();
} catch (error) {
  console.error('COLLECTOPIA failed to start', error);
  root.innerHTML = `
    <div style="position:fixed;inset:0;display:grid;place-items:center;padding:24px;background:#101722;color:#fff;font-family:system-ui,sans-serif;text-align:center;">
      <div>
        <h1 style="margin:0 0 10px;font-size:22px;">COLLECTOPIA could not start</h1>
        <p style="margin:0;color:#aab4c3;font-size:14px;">Please enable WebGL and reload the page.</p>
      </div>
    </div>
  `;
}

window.addEventListener(
  'beforeunload',
  () => {
    game?.dispose();
    game = null;
  },
  { once: true },
);

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    game?.dispose();
    game = null;
  });
}
