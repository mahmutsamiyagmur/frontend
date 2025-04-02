import React, { useState } from 'react';
import { Box, Button, Typography, Avatar, Menu, MenuItem, IconButton } from '@mui/material';
import { User, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { LoginModal } from './LoginModal';

export const AuthSection: React.FC = () => {
  const { user, isLoggedIn, logout } = useAuthStore();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleCloseUserMenu = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = () => {
    logout();
    handleCloseUserMenu();
  };

  return (
    <>
      {isLoggedIn ? (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="body2" sx={{ color: 'white' }}>
              {user?.name}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              {user?.role === 'admin' ? 'Administrator' : 'Travel Agency'}
            </Typography>
          </Box>
          
          <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
            <Avatar sx={{ bgcolor: user?.role === 'admin' ? 'primary.dark' : 'secondary.dark' }}>
              {user?.name ? user.name[0].toUpperCase() : <User size={20} />}
            </Avatar>
          </IconButton>
          
          <Menu
            sx={{ mt: '45px' }}
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleCloseUserMenu}
          >
            <MenuItem onClick={handleLogout}>
              <LogOut size={16} style={{ marginRight: 8 }} />
              <Typography textAlign="center">Logout</Typography>
            </MenuItem>
          </Menu>
        </Box>
      ) : (
        <Button 
          variant="contained" 
          color="secondary" 
          onClick={() => setLoginModalOpen(true)}
          sx={{ whiteSpace: 'nowrap' }}
        >
          Sign In
        </Button>
      )}
      
      <LoginModal 
        open={loginModalOpen} 
        onClose={() => setLoginModalOpen(false)} 
      />
    </>
  );
};
