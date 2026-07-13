import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { register as registerSW } from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

registerSW({
  onUpdate(registration) {
    const shouldUpdate = window.confirm(
      'Hay una nueva versión disponible. ¿Deseas actualizar?'
    );
    if (shouldUpdate && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  },
  onSuccess() {
    console.log('App ready to work offline');
  },
});
