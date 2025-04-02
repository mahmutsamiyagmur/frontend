import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { Layout } from './components/Layout';
import { LocationsPage } from './pages/LocationsPage';
import { TransportationsPage } from './pages/TransportationsPage';
import { RoutesPage } from './pages/RoutesPage';
import { useAuthStore } from './store/useAuthStore';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function RequireAdmin({ children }: { children: JSX.Element }) {
  const user = useAuthStore((state) => state.user);
  
  if (user?.role !== 'admin') {
    return <Navigate to="/routes" replace />;
  }

  return children;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/routes" replace />} />
            <Route 
              path="/locations" 
              element={
                <RequireAdmin>
                  <LocationsPage />
                </RequireAdmin>
              } 
            />
            <Route 
              path="/transportations" 
              element={
                <RequireAdmin>
                  <TransportationsPage />
                </RequireAdmin>
              } 
            />
            <Route path="/routes" element={<RoutesPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;