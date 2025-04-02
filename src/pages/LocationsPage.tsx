import React, { useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton } from '@mui/material';
import { Pencil, Trash } from 'lucide-react';
import { mockLocations } from '../data/mockData';
import { Location } from '../types';

export const LocationsPage: React.FC = () => {
  const [locations] = useState<Location[]>(mockLocations);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Locations Management
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Address</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {locations.map((location) => (
              <TableRow key={location.id}>
                <TableCell>{location.name}</TableCell>
                <TableCell>{location.address}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="primary">
                    <Pencil size={18} />
                  </IconButton>
                  <IconButton size="small" color="error">
                    <Trash size={18} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};