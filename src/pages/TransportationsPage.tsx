import React, { useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Chip } from '@mui/material';
import { Pencil, Trash } from 'lucide-react';
import { mockTransportations } from '../data/mockData';
import { Transportation } from '../types';

export const TransportationsPage: React.FC = () => {
  const [transportations] = useState<Transportation[]>(mockTransportations);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'bus':
        return 'primary';
      case 'train':
        return 'secondary';
      case 'plane':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Transportations Management
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Capacity</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transportations.map((transportation) => (
              <TableRow key={transportation.id}>
                <TableCell>{transportation.name}</TableCell>
                <TableCell>
                  <Chip 
                    label={transportation.type} 
                    color={getTypeColor(transportation.type)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{transportation.capacity}</TableCell>
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