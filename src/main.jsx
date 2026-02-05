import React from 'react';
import ReactDOM from 'react-dom/client';
import DemoApp from './DemoApp';  // Use DemoApp for presentations (no API needed)
// import App from './App';       // Uncomment for full version with API
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DemoApp />
    {/* <App /> */}
  </React.StrictMode>
);
