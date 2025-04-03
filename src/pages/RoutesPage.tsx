import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, FormControl, InputLabel, Select, MenuItem, Button, Card, CardContent, CircularProgress, Alert, Divider, Chip, Stack, IconButton } from '@mui/material';
import { X as CloseIcon } from 'lucide-react';
import { Plane, Car, Bus, Train, ArrowRight } from 'lucide-react';
import { Location, Route, Transportation } from '../types';
import { getLocations, searchRoutes, getRouteById } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

export const RoutesPage: React.FC = () => {
  const [origin, setOrigin] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [date, setDate] = useState('');
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [routeSegments, setRouteSegments] = useState<Transportation[][]>([]);
  
  // Check authentication status before fetching data
  const isAuthenticated = !!useAuthStore(state => state.token);
  
  // Load locations for all users once authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchLocations();
    }
  }, [isAuthenticated]);
  
  const fetchLocations = async () => {
    setLoading(true);
    try {
      const data = await getLocations();
      setLocations(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch locations');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      // Validate that required fields are present
      if (!origin) {
        setError('Origin location is required');
        setLoading(false);
        return;
      }
      
      if (!destination) {
        setError('Destination location is required');
        setLoading(false);
        return;
      }
      
      if (!date) {
        setError('Travel date is required');
        setLoading(false);
        return;
      }
      
      // Use the searchRoutes method with location codes and travel date
      const result = await searchRoutes(origin, destination, date);
      
      // Handle multi-segment routes - backend returns array of arrays
      if (Array.isArray(result) && result.length > 0 && Array.isArray(result[0])) {
        // Cast to unknown first, then to the target type to avoid direct type conversion errors
        setRouteSegments(result as unknown as Transportation[][]);
        setRoutes([]);
      } else {
        // Handle standard routes format
        setRoutes(result as Route[]);
        setRouteSegments([]);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch routes');
      setRoutes([]);
      setRouteSegments([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Search Routes
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Origin</InputLabel>
              <Select
                value={origin}
                label="Origin"
                onChange={(e) => setOrigin(e.target.value as string)}
                disabled={loading}
              >
                {locations.map((location) => (
                  <MenuItem key={location.id} value={location.locationCode}>
                    {location.name} ({location.locationCode}) - {location.city}, {location.country}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Destination</InputLabel>
              <Select
                value={destination}
                label="Destination"
                onChange={(e) => setDestination(e.target.value as string)}
                disabled={loading}
              >
                {locations.map((location) => (
                  <MenuItem key={location.id} value={location.locationCode}>
                    {location.name} ({location.locationCode}) - {location.city}, {location.country}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={loading}
                style={{
                  padding: '16.5px 14px',
                  border: '1px solid rgba(0, 0, 0, 0.23)',
                  borderRadius: '4px',
                }}
              />
            </FormControl>
          </Grid>
        </Grid>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="contained" 
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search Routes'}
          </Button>
        </Box>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : routes.length > 0 ? (
        <Grid container spacing={2}>
          {routes.map((route) => (
          <Grid item xs={12} key={route.id}>
            <Card 
              sx={{ cursor: 'pointer' }}
              onClick={async () => {
                try {
                  const routeDetail = await getRouteById(route.id);
                  setSelectedRoute(routeDetail);
                  setError(null);
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Failed to fetch route details');
                }
              }}
            >
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle1">
                      {route.origin.name} → {route.destination.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2">
                      Departure: {new Date(route.departureTime).toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                      Arrival: {new Date(route.arrivalTime).toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="h6" color="primary">
                      ${route.price}
                    </Typography>
                    <Typography variant="body2">
                      {route.transportation.transportationType} ({route.transportation.originLocationCode} → {route.transportation.destinationLocationCode})
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          ))}
        </Grid>
      ) : routeSegments.length > 0 ? (
        <Grid container spacing={3}>
          {routeSegments.map((segments, routeIndex) => (
            <Grid item xs={12} key={`route-${routeIndex}`}>
              <Card sx={{ mb: 2, overflow: 'visible' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    Multi-Segment Journey
                  </Typography>
                  <Box sx={{ pt: 1 }}>
                    {segments.map((segment, index) => {
                      // Choose icon based on transportation type
                      let TransportIcon = Bus;
                      switch(segment.transportationType) {
                        case 'FLIGHT': TransportIcon = Plane; break;
                        case 'UBER': TransportIcon = Car; break;
                        case 'SUBWAY': TransportIcon = Train; break;
                        // default is Bus
                      }

                      return (
                        <Box key={`segment-${index}`}>
                          <Stack 
                            direction="row" 
                            spacing={2} 
                            alignItems="center" 
                            sx={{ mb: 2 }}
                          >
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              backgroundColor: 'rgba(25, 118, 210, 0.1)',
                              borderRadius: '50%',
                              p: 1
                            }}>
                              <TransportIcon size={24} />
                            </Box>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="subtitle1">
                                <Chip 
                                  label={segment.originLocationCode} 
                                  size="small" 
                                  sx={{ mr: 1 }}
                                />
                                <ArrowRight size={16} style={{ verticalAlign: 'middle' }} />
                                <Chip 
                                  label={segment.destinationLocationCode} 
                                  size="small" 
                                  sx={{ ml: 1 }}
                                />
                              </Typography>
                              <Box sx={{ mt: 1 }}>
                                <Chip 
                                  label={segment.transportationType} 
                                  color="primary" 
                                  variant="outlined" 
                                  size="small"
                                />
                                <Typography variant="caption" sx={{ ml: 1 }}>
                                  Operating days: {segment.operatingDays.map(day => {
                                    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                                    return days[day - 1];
                                  }).join(', ')}
                                </Typography>
                              </Box>
                            </Box>
                          </Stack>
                          {index < segments.length - 1 && (
                            <Box sx={{ pl: 3, mb: 2 }}>
                              <Divider />
                              <Box sx={{ 
                                ml: 2, 
                                mt: -1, 
                                mb: -1, 
                                display: 'inline-block', 
                                bgcolor: 'background.paper',
                                px: 1 
                              }}>
                                <Typography variant="caption" color="text.secondary">
                                  Connection
                                </Typography>
                              </Box>
                            </Box>
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            No routes found matching your criteria. Try adjusting your search parameters.
          </Typography>
        </Box>
      )}

      {selectedRoute && (
        <Paper sx={{ mt: 4, p: 3, position: 'relative' }}>
          <IconButton 
            sx={{ position: 'absolute', top: 10, right: 10 }}
            onClick={() => setSelectedRoute(null)}
          >
            <CloseIcon size={20} />
          </IconButton>
          
          <Typography variant="h5" gutterBottom>
            Route Details
          </Typography>
          <Typography variant="h6" gutterBottom>
            {selectedRoute.origin.name} → {selectedRoute.destination.name}
          </Typography>
          <Typography variant="body1" paragraph>
            Transportation: {selectedRoute.transportation.transportationType}
            <br />
            From {selectedRoute.transportation.originLocationCode} to {selectedRoute.transportation.destinationLocationCode}
            <br />
            Operating days: {selectedRoute.transportation.operatingDays.map(day => 
              day === 1 ? 'Mon' : 
              day === 2 ? 'Tue' : 
              day === 3 ? 'Wed' : 
              day === 4 ? 'Thu' : 
              day === 5 ? 'Fri' : 
              day === 6 ? 'Sat' : 'Sun'
            ).join(', ')}
          </Typography>
          <Typography variant="body1" paragraph>
            Departure: {new Date(selectedRoute.departureTime).toLocaleString()}
          </Typography>
          <Typography variant="body1" paragraph>
            Arrival: {new Date(selectedRoute.arrivalTime).toLocaleString()}
          </Typography>
          <Typography variant="h6" color="primary">
            Price: ${selectedRoute.price}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};