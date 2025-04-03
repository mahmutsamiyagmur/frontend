import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, CircularProgress, Alert, Button } from '@mui/material';
import { Pencil, Trash } from 'lucide-react';
import { Location } from '../types';
import { getLocations, deleteLocation } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

// API testing moved to browser console for easier debugging

export const LocationsPage: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get the current user role to determine the appropriate data access method
  const userRole = useAuthStore(state => state.user?.role?.toLowerCase() || '');
  const isAgency = userRole === 'agency';
  
  // Check if the user is authenticated before fetching locations
  const isAuthenticated = !!useAuthStore(state => state.token);

  useEffect(() => {
    if (isAuthenticated) {
      fetchLocations();
    }
  }, [isAuthenticated]);

  const fetchLocations = async () => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      // We've updated our API permissions to allow agency users to access locations directly
      const data = await getLocations();
      
      
      // Process the data based on its format
      if (data) {
        // Ensure we have an array of locations
        let processedData: Location[] = [];
        
        if (Array.isArray(data)) {
          processedData = data;
        } else if (typeof data === 'object') {
          // Check for common wrapper patterns
          const possibleArrayProps = ['data', 'locations', 'items', 'content', 'results'];
          
          for (const prop of possibleArrayProps) {
            if (prop in data && Array.isArray(data[prop])) {
              processedData = data[prop];
              break;
            }
          }
          
          // If we couldn't find an array in known properties but the object looks like a single location
          if (processedData.length === 0 && 'id' in data && 'name' in data) {
            processedData = [data as unknown as Location];
          }
        }
        
        // Additional validation - ensure the items look like locations
        if (processedData.length > 0) {
          // Validate that the objects have the expected structure
          const validLocations = processedData.filter(item => 
            item && typeof item === 'object' && 'id' in item && 'name' in item
          );
          
          setLocations(validLocations);
        } else {
          setLocations([]);
        }
      } else {
        setLocations([]);
      }
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch locations');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteLocation(id);
      setLocations(locations.filter(location => location.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete location');
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">
          Locations Management
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={fetchLocations}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Box>
      
      {error && !loading && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Add information alert about agency user permissions */}
      {isAgency && !loading && !error && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Agency users have read-only access to location data
        </Alert>
      )}
      
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Code</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {locations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">No locations found</TableCell>
                </TableRow>
              ) : (
                locations.map((location) => (
                  <TableRow key={location.id}>
                    <TableCell>{location.name}</TableCell>
                    <TableCell>{location.city}, {location.country}</TableCell>
                    <TableCell>{location.locationCode}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" color="primary">
                        <Pencil size={18} />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDelete(location.id)}
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