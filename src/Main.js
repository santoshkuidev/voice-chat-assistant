import React from 'react';
import App from './App';
import ProfileAssistant from './ProfileAssistant';

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

export default function Main() {
  const mode = getCookie('mode');

  if (mode === 'interview') {
    return <App />;
  } else if (mode === 'profile') {
    return <ProfileAssistant />;
  } else {
    return (
      <div style={{ color: '#fff', background: '#23272a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Roboto, sans-serif' }}>
        <div>
          <h2>Invalid or missing mode cookie</h2>
          <p>Please set the <b>mode</b> cookie to <code>interview</code> or <code>profile</code> and refresh the page.</p>
        </div>
      </div>
    );
  }
}
