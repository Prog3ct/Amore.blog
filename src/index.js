import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx'; // <- qui specifichiamo l'estensione .jsx
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Se vuoi misurare le performance della tua app
// puoi passare una funzione come reportWebVitals(console.log)
reportWebVitals();
