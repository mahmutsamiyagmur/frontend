import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Chip, CircularProgress, Alert, Button } from '@mui/material';
import { Pencil, Trash } from 'lucide-react';
import { Transportation } from '../types';
import { getTransportations, deleteTransportation } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

export const TransportationsPage: React.FC = () => {
  const [transportations, setTransportations] = useState<Transportation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get the current user role to determine access permissions
  const userRole = useAuthStore(state => state.user?.role?.toLowerCase() || '');
  const isAgency = userRole === 'agency';
  const navigate = useNavigate();
  
  // Redirect to routes page or attempt to fetch data based on role
  useEffect(() => {
    if (isAgency) {
      // For agency users, we'll show an access denied message instead of redirecting
      // This provides a better UX than an abrupt redirect
      setError('Access Denied: Agency users do not have permission to view transportation data directly');
      setLoading(false);
    } else {
      // For admin users, fetch transportation data as normal
      fetchTransportations();
    }
  }, [isAgency, navigate]);

  const fetchTransportations = async () => {
    setLoading(true);
    try {
      const data = await getTransportations();
      setTransportations(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transportations');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTransportation(id);
      setTransportations(transportations.filter(transportation => transportation.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete transportation');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'BUS':
        return 'primary';
      case 'SUBWAY':
        return 'secondary';
      case 'FLIGHT':
        return 'success';
      case 'UBER':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Transportations Management
      </Typography>
      
      {isAgency && (
        <Paper sx={{ p: 3, mb: 3, backgroundColor: '#FFF4E5' }}>
          <Typography variant="h6" color="error">
            Access Restricted
          </Typography>
          <Typography variant="body1" paragraph>
            Agency users do not have direct access to transportation data. 
            Please use the Routes page to view transportation options included with route information.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate('/routes')}
          >
            Go to Routes Page
          </Button>
        </Paper>
      )}
      
      {error && !isAgency && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {/* Conditional content based on user role and loading state */}
      {loading && !isAgency ? (
        // Loading spinner for admin users
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : !isAgency ? (
        // Transportation data table for admin users
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>From</TableCell>
                <TableCell>To</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Operating Days</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transportations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">No transportations found</TableCell>
                </TableRow>
              ) : (
                transportations.map((transportation) => (
                  <TableRow key={transportation.id}>
                    <TableCell>{transportation.originLocationCode}</TableCell>
                    <TableCell>{transportation.destinationLocationCode}</TableCell>
                    <TableCell>
                      <Chip 
                        label={transportation.transportationType} 
                        color={getTypeColor(transportation.transportationType)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{transportation.operatingDays.map(day => 
                      day === 1 ? 'Mon' : 
                      day === 2 ? 'Tue' : 
                      day === 3 ? 'Wed' : 
                      day === 4 ? 'Thu' : 
                      day === 5 ? 'Fri' : 
                      day === 6 ? 'Sat' : 'Sun'
                    ).join(', ')}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" color="primary">
                        <Pencil size={18} />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDelete(transportation.id)}
                      >
                        <Trash size={18} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      ) : null}
    </Box>
  );
};