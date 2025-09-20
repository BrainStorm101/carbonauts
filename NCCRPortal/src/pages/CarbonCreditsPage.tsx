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
  Fab,
} from '@mui/material';
import {
  Search,
  Add,
  SwapHoriz,
  AccountBalanceWallet,
  Visibility,
  Download,
} from '@mui/icons-material';
import { useBlockchain } from '../contexts/BlockchainContext';

const CarbonCreditsPage: React.FC = () => {
  const { carbonCredits, projects, mintCarbonCredits, transferCredits } = useBlockchain();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [mintDialogOpen, setMintDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [selectedCredit, setSelectedCredit] = useState<any>(null);
  const [mintForm, setMintForm] = useState({
    projectId: '',
    creditsAmount: '',
    pricePerCredit: '25.50',
  });
  const [transferForm, setTransferForm] = useState({
    toAddress: '',
  });

  const filteredCredits = carbonCredits.filter(credit => {
    const matchesSearch = credit.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         credit.projectId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || credit.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalCredits = carbonCredits.reduce((sum, credit) => sum + credit.creditsAmount, 0);
  const totalValue = carbonCredits.reduce((sum, credit) => sum + (credit.creditsAmount * credit.pricePerCredit), 0);
  const availableCredits = carbonCredits.filter(c => c.status === 'AVAILABLE').reduce((sum, credit) => sum + credit.creditsAmount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'success';
      case 'TRANSFERRED': return 'info';
      case 'RETIRED': return 'default';
      case 'PENDING': return 'warning';
      default: return 'default';
    }
  };

  const handleMintCredits = async () => {
    try {
      await mintCarbonCredits(
        mintForm.projectId,
        parseInt(mintForm.creditsAmount),
        parseFloat(mintForm.pricePerCredit)
      );
      setMintDialogOpen(false);
      setMintForm({ projectId: '', creditsAmount: '', pricePerCredit: '25.50' });
    } catch (error) {
      console.error('Error minting credits:', error);
    }
  };

  const handleTransferCredits = async () => {
    if (!selectedCredit) return;
    
    try {
      await transferCredits(selectedCredit.id, transferForm.toAddress);
      setTransferDialogOpen(false);
      setTransferForm({ toAddress: '' });
      setSelectedCredit(null);
    } catch (error) {
      console.error('Error transferring credits:', error);
    }
  };

  const openTransferDialog = (credit: any) => {
    setSelectedCredit(credit);
    setTransferDialogOpen(true);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Carbon Credits Management
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        Mint, manage, and track carbon credits in the Blue Carbon Registry
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="overline">
                Total Credits
              </Typography>
              <Typography variant="h4" color="primary.main">
                {totalCredits.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                All time issued
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="overline">
                Available Credits
              </Typography>
              <Typography variant="h4" color="success.main">
                {availableCredits.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Ready for trading
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="overline">
                Total Value
              </Typography>
              <Typography variant="h4" color="info.main">
                ₹{totalValue.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Market value
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="overline">
                Average Price
              </Typography>
              <Typography variant="h4" color="warning.main">
                ₹{totalCredits > 0 ? (totalValue / totalCredits).toFixed(2) : '0'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Per credit
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search by serial number or project ID..."
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
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="ALL">All Status</MenuItem>
                  <MenuItem value="AVAILABLE">Available</MenuItem>
                  <MenuItem value="TRANSFERRED">Transferred</MenuItem>
                  <MenuItem value="RETIRED">Retired</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="body2" color="textSecondary">
                {filteredCredits.length} of {carbonCredits.length} credits
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Credits Table */}
      <Card>
        <CardContent>
          {filteredCredits.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Serial Number</TableCell>
                    <TableCell>Project ID</TableCell>
                    <TableCell>Credits</TableCell>
                    <TableCell>Price/Credit</TableCell>
                    <TableCell>Total Value</TableCell>
                    <TableCell>Owner</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Issued Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCredits.map((credit) => (
                    <TableRow key={credit.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {credit.serialNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {credit.projectId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {credit.creditsAmount.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          ₹{credit.pricePerCredit}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="success.main">
                          ₹{(credit.creditsAmount * credit.pricePerCredit).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace" fontSize="0.75rem">
                          {credit.ownerId.substring(0, 8)}...
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={credit.status} 
                          color={getStatusColor(credit.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(credit.issuedAt).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          title="View Details"
                        >
                          <Visibility />
                        </IconButton>
                        {credit.status === 'AVAILABLE' && (
                          <IconButton
                            size="small"
                            onClick={() => openTransferDialog(credit)}
                            title="Transfer Credits"
                          >
                            <SwapHoriz />
                          </IconButton>
                        )}
                        <IconButton
                          size="small"
                          title="Download Certificate"
                        >
                          <Download />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">
              No carbon credits found matching your search criteria.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Mint Credits FAB */}
      <Fab
        color="primary"
        aria-label="mint credits"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setMintDialogOpen(true)}
      >
        <Add />
      </Fab>

      {/* Mint Credits Dialog */}
      <Dialog open={mintDialogOpen} onClose={() => setMintDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Mint New Carbon Credits</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
            <InputLabel>Project</InputLabel>
            <Select
              value={mintForm.projectId}
              label="Project"
              onChange={(e) => setMintForm({ ...mintForm, projectId: e.target.value })}
            >
              {projects.filter(p => p.status === 'APPROVED').map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label="Number of Credits"
            type="number"
            value={mintForm.creditsAmount}
            onChange={(e) => setMintForm({ ...mintForm, creditsAmount: e.target.value })}
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Price per Credit (₹)"
            type="number"
            inputProps={{ step: "0.01" }}
            value={mintForm.pricePerCredit}
            onChange={(e) => setMintForm({ ...mintForm, pricePerCredit: e.target.value })}
            sx={{ mb: 2 }}
          />
          
          {mintForm.creditsAmount && mintForm.pricePerCredit && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Total Value: ₹{(parseInt(mintForm.creditsAmount || '0') * parseFloat(mintForm.pricePerCredit || '0')).toLocaleString()}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMintDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleMintCredits}
            variant="contained"
            disabled={!mintForm.projectId || !mintForm.creditsAmount || !mintForm.pricePerCredit}
          >
            Mint Credits
          </Button>
        </DialogActions>
      </Dialog>

      {/* Transfer Credits Dialog */}
      <Dialog open={transferDialogOpen} onClose={() => setTransferDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Transfer Carbon Credits</DialogTitle>
        <DialogContent>
          {selectedCredit && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Serial Number: {selectedCredit.serialNumber}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Credits: {selectedCredit.creditsAmount} • Value: ₹{(selectedCredit.creditsAmount * selectedCredit.pricePerCredit).toLocaleString()}
              </Typography>
            </Box>
          )}
          
          <TextField
            fullWidth
            label="Recipient Wallet Address"
            value={transferForm.toAddress}
            onChange={(e) => setTransferForm({ ...transferForm, toAddress: e.target.value })}
            placeholder="0x..."
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransferDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleTransferCredits}
            variant="contained"
            disabled={!transferForm.toAddress}
          >
            Transfer Credits
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CarbonCreditsPage;
