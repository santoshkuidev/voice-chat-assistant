import React from 'react';
import ReactDOM from 'react-dom/client';
import Main from './Main';

// Set mode cookie to 'profile' on initialization
if (typeof document !== 'undefined') {
  document.cookie = 'mode=profile; path=/';
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);
