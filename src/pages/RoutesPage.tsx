import React, { useState } from 'react';
import { Box, Grid, Paper, Typography, FormControl, InputLabel, Select, MenuItem, Button, Card, CardContent, Drawer } from '@mui/material';
import { Location, Route } from '../types';
import { mockLocations, mockRoutes } from '../data/mockData';

export const RoutesPage: React.FC = () => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);

  const handleSearch = () => {
    // Filter routes based on selected origin and destination
    const filteredRoutes = mockRoutes.filter(route => {
      const matchesOrigin = !origin || route.origin.id === origin;
      const matchesDestination = !destination || route.destination.id === destination;
      return matchesOrigin && matchesDestination;
    });
    setRoutes(filteredRoutes);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Search Routes
      </Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Origin</InputLabel>
              <Select
                value={origin}
                label="Origin"
                onChange={(e) => setOrigin(e.target.value)}
              >
                {mockLocations.map((location) => (
                  <MenuItem key={location.id} value={location.id}>
                    {location.name}
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
                onChange={(e) => setDestination(e.target.value)}
              >
                {mockLocations.map((location) => (
                  <MenuItem key={location.id} value={location.id}>
                    {location.name}
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
          <Button variant="contained" onClick={handleSearch}>
            Search Routes
          </Button>
        </Box>
      </Paper>

      <Grid container spacing={2}>
        {routes.map((route) => (
          <Grid item xs={12} key={route.id}>
            <Card 
              sx={{ cursor: 'pointer' }}
              onClick={() => setSelectedRoute(route)}
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
                      {route.transportation.name}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Drawer
        anchor="right"
        open={!!selectedRoute}
        onClose={() => setSelectedRoute(null)}
        sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: 400 } } }}
      >
        {selectedRoute && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Route Details
            </Typography>
            <Typography variant="h6" gutterBottom>
              {selectedRoute.origin.name} → {selectedRoute.destination.name}
            </Typography>
            <Typography variant="body1" paragraph>
              Transportation: {selectedRoute.transportation.name}
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
          </Box>
        )}
      </Drawer>
    </Box>
  );
};