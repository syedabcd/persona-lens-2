import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  // If we are on a static page (like index.html), the root element won't exist.
  // We log a warning instead of throwing an error to prevent the "Firefox Can't Open This Page" crash.
  console.warn("React root element not found. App execution skipped.");
}