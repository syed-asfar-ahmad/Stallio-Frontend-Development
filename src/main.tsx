import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AffiliateAuthProvider } from './affiliate/AffiliateAuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ThemedToaster from './components/ThemedToaster';
import App from './App';
import './globals.css';
import { i18nReady } from './i18n/config';

void i18nReady.then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <AffiliateAuthProvider>
              <App />
              <ThemedToaster />
            </AffiliateAuthProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </React.StrictMode>,
  );
});
