// Shared foundations first, then each theme's variables and personality.
// These are imported before any component so component styles can override them.
import './themes/base.css';
import './components/CelebrationLayer.css';
import './themes/jolly/jolly.css';
import './themes/makeup/makeup.css';
import './themes/cat/cat.css';
import './themes/aesthetic/aesthetic.css';
import './themes/minimalist/minimalist.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
);
