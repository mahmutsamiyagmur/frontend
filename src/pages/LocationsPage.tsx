import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, CircularProgress, Alert, Button } from '@mui/material';
import { Pencil, Trash } from 'lucide-react';
import { Location } from '../types';
import { getLocations, deleteLocation } from '../services/api';

// API testing moved to browser console for easier debugging

export const LocationsPage: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      console.log('Fetching locations...');
      const data = await getLocations();
      console.log('Locations response:', data);
      
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
              console.log(`Found locations in ${prop} property:`, processedData);
              break;
            }
          }
          
          // If we couldn't find an array in known properties but the object looks like a single location
          if (processedData.length === 0 && 'id' in data && 'name' in data) {
            processedData = [data as unknown as Location];
            console.log('Found a single location object:', processedData);
          }
        }
        
        // Additional validation - ensure the items look like locations
        if (processedData.length > 0) {
          // Validate that the objects have the expected structure
          const validLocations = processedData.filter(item => 
            item && typeof item === 'object' && 'id' in item && 'name' in item
          );
          
          console.log(`Found ${validLocations.length} valid locations out of ${processedData.length} items`);
          setLocations(validLocations);
        } else {
          console.warn('No valid locations found in the response');
          setLocations([]);
        }
      } else {
        console.warn('Received null or undefined data from API');
        setLocations([]);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching locations:', err);
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