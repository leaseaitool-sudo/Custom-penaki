import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from '@/app/App';
import { AuthProvider } from '@/app/providers/AuthContext';
import { GlobalErrorBoundary } from '@/app/providers/GlobalErrorBoundary';
import './styles/global.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </GlobalErrorBoundary>
  </React.StrictMode>
);