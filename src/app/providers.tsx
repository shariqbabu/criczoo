import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../context/AuthContext';

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
      <Toaster
        position="top-right"
        gutter={8}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#0f172a',
            color: '#f1f5f9',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
          },
          success: {
            iconTheme: { primary: '#22c55e', secondary: '#0f172a' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#0f172a' },
          },
        }}
      />
    </AuthProvider>
  </BrowserRouter>
);
