import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AppProvider } from './context/AppContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import ToastContainer from './components/ui/Toast.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <AuthProvider>
        <NotificationProvider>
          <ToastProvider>
            <App />
            <ToastContainer />
          </ToastProvider>
        </NotificationProvider>
      </AuthProvider>
    </AppProvider>
  </StrictMode>
);
