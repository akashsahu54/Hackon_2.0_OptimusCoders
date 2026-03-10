import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid rgba(100,116,139,0.2)',
          },
          success: { iconTheme: { primary: '#34d399', secondary: '#1e293b' } },
          error:   { iconTheme: { primary: '#fb7185', secondary: '#1e293b' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
