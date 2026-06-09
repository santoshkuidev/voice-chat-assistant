import React from 'react';
import App from './App';
import ProfileAssistant from './ProfileAssistant';

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

export default function Main() {
  const mode = getCookie('mode') || 'profile';

  if (mode === 'interview') {
    return <App />;
  }

  return <ProfileAssistant />;
}
