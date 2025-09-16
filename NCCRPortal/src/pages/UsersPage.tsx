import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Avatar,
} from '@mui/material';
import {
  Search,
  Visibility,
  CheckCircle,
  Cancel,
  Person,
  Phone,
  LocationOn,
} from '@mui/icons-material';
import { useBlockchain } from '../contexts/BlockchainContext';

const UsersPage: React.FC = () => {
  const { users, approveKYC, rejectKYC } = useBlockchain();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [kycDialogOpen, setKycDialogOpen] = useState(false);
  const [kycAction, setKycAction] = useState<'approve' | 'reject'>('approve');
  const [rejectionReason, setRejectionReason] = useState('');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phoneNumber.includes(searchTerm) ||
                         user.walletAddress.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || user.kycStatus === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalUsers = users.length;
  const verifiedUsers = users.filter(u => u.kycStatus === 'VERIFIED').length;
  const pendingUsers = users.filter(u => u.kycStatus === 'PENDING').length;
  const rejectedUsers = users.filter(u => u.kycStatus === 'REJECTED').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED': return 'success';
      case 'REJECTED': return 'error';
      case 'PENDING': return 'warning';
      default: return 'default';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'NGO_OFFICER': return 'NGO Field Officer';
      case 'COMMUNITY_HEAD': return 'Community Head';
      case 'COASTAL_PANCHAYAT': return 'Coastal Panchayat';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'NGO_OFFICER': return '#1976d2';
      case 'COMMUNITY_HEAD': return '#4caf50';
      case 'COASTAL_PANCHAYAT': return '#ff9800';
      default: return '#666';
    }
  };

  const openDetailsDialog = (user: any) => {
    setSelectedUser(user);
    setDetailsDialogOpen(true);
  };

  const closeDetailsDialog = () => {
    setDetailsDialogOpen(false);
    setSelectedUser(null);
  };

  const openKycDialog = (user: any, action: 'approve' | 'reject') => {
    setSelectedUser(user);
    setKycAction(action);
    setRejectionReason('');
    setKycDialogOpen(true);
  };

  const closeKycDialog = () => {
    setKycDialogOpen(false);
    setSelectedUser(null);
    setRejectionReason('');
  };

  const handleKycAction = async () => {
    if (!selectedUser) return;

    try {
      if (kycAction === 'approve') {
        await approveKYC(selectedUser.id);
      } else {
        await rejectKYC(selectedUser.id, rejectionReason);
      }
      closeKycDialog();
    } catch (error) {
      console.error('Error processing KYC action:', error);
    }
  };

  const UserDetailsDialog = () => (
    <Dialog open={detailsDialogOpen} onClose={closeDetailsDialog} maxWidth="md" fullWidth>
      <DialogTitle>User Details</DialogTitle>
      <DialogContent>
        {selectedUser && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ width: 60, height: 60, mr: 2, bgcolor: getRoleColor(selectedUser.role) }}>
                  {selectedUser.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedUser.name}</Typography>
                  <Chip 
                    label={getRoleDisplayName(selectedUser.role)}
                    size="small"
                    sx={{ bgcolor: getRoleColor(selectedUser.role), color: 'white', mr: 1 }}
                  />
                  <Chip 
                    label={selectedUser.kycStatus} 
                    color={getStatusColor(selectedUser.kycStatus) as any}
                    size="small"
                  />
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>Contact Information</Typography>
              <Typography variant="body2" gutterBottom>
                📱 Phone: {selectedUser.phoneNumber}
              </Typography>
              <Typography variant="body2" gutterBottom>
                📅 Registered: {new Date(selectedUser.registeredAt).toLocaleDateString()}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>Location</Typography>
              {selectedUser.location ? (
                <>
                  <Typography variant="body2" gutterBottom>
                    🏛️ State: {selectedUser.location.state}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    🏘️ District: {selectedUser.location.district}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    🏡 Village: {selectedUser.location.village}
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  Location information not available
                </Typography>
              )}
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>Wallet Information</Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="body2" fontFamily="monospace" fontSize="0.875rem">
                  {selectedUser.walletAddress}
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>KYC Status</Typography>
              <Box display="flex" alignItems="center">
                <Chip 
                  label={selectedUser.kycStatus} 
                  color={getStatusColor(selectedUser.kycStatus) as any}
                  sx={{ mr: 2 }}
                />
                {selectedUser.kycStatus === 'PENDING' && (
                  <Box>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      onClick={() => {
                        closeDetailsDialog();
                        openKycDialog(selectedUser, 'approve');
                      }}
                      sx={{ mr: 1 }}
                    >
                      Approve KYC
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={() => {
                        closeDetailsDialog();
                        openKycDialog(selectedUser, 'reject');
                      }}
                    >
                      Reject KYC
                    </Button>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDetailsDialog}>Close</Button>
      </DialogActions>
    </Dialog>
  );

  const KycActionDialog = () => (
    <Dialog open={kycDialogOpen} onClose={closeKycDialog} maxWidth="sm" fullWidth>
      <DialogTitle>
        {kycAction === 'approve' ? 'Approve KYC' : 'Reject KYC'}
      </DialogTitle>
      <DialogContent>
        {selectedUser && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              User: {selectedUser.name}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Role: {getRoleDisplayName(selectedUser.role)}
            </Typography>
          </Box>
        )}

        {kycAction === 'reject' && (
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Rejection Reason (Required)"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            required
            sx={{ mt: 2 }}
          />
        )}

        {kycAction === 'approve' && (
          <Alert severity="info" sx={{ mt: 2 }}>
            This will verify the user's KYC and allow them to participate in the Blue Carbon Registry.
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={closeKycDialog}>Cancel</Button>
        <Button
          onClick={handleKycAction}
          variant="contained"
          disabled={kycAction === 'reject' && !rejectionReason.trim()}
          color={kycAction === 'approve' ? 'success' : 'error'}
        >
          {kycAction === 'approve' ? 'Approve KYC' : 'Reject KYC'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        User Management
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        Manage user registrations and KYC verification for Blue Carbon Registry
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="overline">
                Total Users
              </Typography>
              <Typography variant="h4" color="primary.main">
                {totalUsers}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Registered users
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="overline">
                Verified Users
              </Typography>
              <Typography variant="h4" color="success.main">
                {verifiedUsers}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                KYC completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="overline">
                Pending KYC
              </Typography>
              <Typography variant="h4" color="warning.main">
                {pendingUsers}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Awaiting verification
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="overline">
                Verification Rate
              </Typography>
              <Typography variant="h4" color="info.main">
                {totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Success rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={roleFilter}
                  label="Role"
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <MenuItem value="ALL">All Roles</MenuItem>
                  <MenuItem value="NGO_OFFICER">NGO Officer</MenuItem>
                  <MenuItem value="COMMUNITY_HEAD">Community Head</MenuItem>
                  <MenuItem value="COASTAL_PANCHAYAT">Coastal Panchayat</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>KYC Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="KYC Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="ALL">All Status</MenuItem>
                  <MenuItem value="VERIFIED">Verified</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="REJECTED">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="body2" color="textSecondary">
                {filteredUsers.length} of {totalUsers} users
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent>
          {filteredUsers.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>KYC Status</TableCell>
                    <TableCell>Registered</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ width: 32, height: 32, mr: 2, bgcolor: getRoleColor(user.role) }}>
                            {user.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">{user.name}</Typography>
                            <Typography variant="caption" color="textSecondary" fontFamily="monospace">
                              {user.walletAddress.substring(0, 10)}...
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={getRoleDisplayName(user.role)}
                          size="small"
                          sx={{ bgcolor: getRoleColor(user.role), color: 'white' }}
                        />
                      </TableCell>
                      <TableCell>{user.phoneNumber}</TableCell>
                      <TableCell>
                        {user.location ? (
                          <Typography variant="body2">
                            {user.location.village}, {user.location.district}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="textSecondary">
                            Not provided
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.kycStatus} 
                          color={getStatusColor(user.kycStatus) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(user.registeredAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => openDetailsDialog(user)}
                          title="View Details"
                        >
                          <Visibility />
                        </IconButton>
                        {user.kycStatus === 'PENDING' && (
                          <>
                            <IconButton
                              size="small"
                              onClick={() => openKycDialog(user, 'approve')}
                              color="success"
                              title="Approve KYC"
                            >
                              <CheckCircle />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => openKycDialog(user, 'reject')}
                              color="error"
                              title="Reject KYC"
                            >
                              <Cancel />
                            </IconButton>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">
              No users found matching your search criteria.
            </Alert>
          )}
        </CardContent>
      </Card>

      <UserDetailsDialog />
      <KycActionDialog />
    </Box>
  );
};

export default UsersPage;
