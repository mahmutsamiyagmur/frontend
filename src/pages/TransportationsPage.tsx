import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Chip, CircularProgress, Alert } from '@mui/material';
import { Pencil, Trash } from 'lucide-react';
import { Transportation } from '../types';
import { getTransportations, deleteTransportation } from '../services/api';

export const TransportationsPage: React.FC = () => {
  const [transportations, setTransportations] = useState<Transportation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchTransportations();
  }, []);

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
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
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
                  <TableCell colSpan={4} align="center">No transportations found</TableCell>
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
      )}
    </Box>
  );
};