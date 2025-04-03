import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CircularProgress, Box } from '@mui/material';
import { Layout } from './components/Layout';
import { LocationsPage } from './pages/LocationsPage';
import { TransportationsPage } from './pages/TransportationsPage';
import { RoutesPage } from './pages/RoutesPage';
import LoginPage from './pages/LoginPage';
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
  const { user, loading, fetchUser } = useAuthStore();
  
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Handle error silently, could display an error component in the future
  
  // Check if user is logged in
  const isAuthenticated = !!user;

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          {/* Login page outside the main layout */}
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} />

          {/* Main application routes with Layout */}
          <Route element={<Layout />}>
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
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;