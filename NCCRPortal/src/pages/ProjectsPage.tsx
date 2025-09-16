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
} from '@mui/material';
import {
  Search,
  Visibility,
  CheckCircle,
  Cancel,
  Map,
  Download,
  FilterList,
} from '@mui/icons-material';
import { useBlockchain } from '../contexts/BlockchainContext';

const ProjectsPage: React.FC = () => {
  const { projects, approveProject, rejectProject } = useBlockchain();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [vegetationFilter, setVegetationFilter] = useState('ALL');
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.location.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || project.status === statusFilter;
    const matchesVegetation = vegetationFilter === 'ALL' || project.vegetationType === vegetationFilter;
    
    return matchesSearch && matchesStatus && matchesVegetation;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'error';
      case 'PENDING': return 'warning';
      default: return 'default';
    }
  };

  const getVegetationIcon = (type: string) => {
    switch (type) {
      case 'MANGROVE': return '🌿';
      case 'SEAGRASS': return '🌱';
      case 'SALTMARSHES': return '🌾';
      case 'OTHERS': return '🌳';
      default: return '🌿';
    }
  };

  const openDetailsDialog = (project: any) => {
    setSelectedProject(project);
    setDetailsDialogOpen(true);
  };

  const closeDetailsDialog = () => {
    setDetailsDialogOpen(false);
    setSelectedProject(null);
  };

  const ProjectDetailsDialog = () => (
    <Dialog open={detailsDialogOpen} onClose={closeDetailsDialog} maxWidth="md" fullWidth>
      <DialogTitle>Project Details</DialogTitle>
      <DialogContent>
        {selectedProject && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                {selectedProject.name}
              </Typography>
              <Chip 
                label={selectedProject.status} 
                color={getStatusColor(selectedProject.status) as any}
                sx={{ mb: 2 }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>Location</Typography>
              <Typography variant="body2" gutterBottom>
                📍 {selectedProject.location.address}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Coordinates: {selectedProject.location.latitude.toFixed(6)}, {selectedProject.location.longitude.toFixed(6)}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>Project Details</Typography>
              <Typography variant="body2" gutterBottom>
                {getVegetationIcon(selectedProject.vegetationType)} Vegetation: {selectedProject.vegetationType}
              </Typography>
              <Typography variant="body2" gutterBottom>
                📏 Area: {selectedProject.area} {selectedProject.areaUnit}
              </Typography>
              <Typography variant="body2" gutterBottom>
                🌱 Saplings: {selectedProject.saplingsPlanted.toLocaleString()}
              </Typography>
              <Typography variant="body2" gutterBottom>
                📅 Plantation Date: {new Date(selectedProject.plantationDate).toLocaleDateString()}
              </Typography>
              <Typography variant="body2" gutterBottom>
                📈 Expected Survival Rate: {selectedProject.expectedSurvivalRate}%
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>Submission Details</Typography>
              <Typography variant="body2" gutterBottom>
                👤 Created by: {selectedProject.createdBy}
              </Typography>
              <Typography variant="body2" gutterBottom>
                📅 Submitted: {new Date(selectedProject.createdAt).toLocaleDateString()}
              </Typography>
              {selectedProject.reviewedBy && (
                <>
                  <Typography variant="body2" gutterBottom>
                    ✅ Reviewed by: {selectedProject.reviewedBy}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    📅 Review Date: {new Date(selectedProject.reviewedAt).toLocaleDateString()}
                  </Typography>
                </>
              )}
            </Grid>
            
            {selectedProject.reviewNotes && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Review Notes</Typography>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="body2">{selectedProject.reviewNotes}</Typography>
                </Paper>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>Evidence</Typography>
              <Typography variant="body2" gutterBottom>
                📸 Photos: {selectedProject.photoHashes.length} uploaded
              </Typography>
              {selectedProject.droneDataHash && (
                <Typography variant="body2" gutterBottom>
                  🚁 Drone Data: Available
                </Typography>
              )}
              {selectedProject.carbonCreditsEarned > 0 && (
                <Typography variant="body2" gutterBottom>
                  💰 Carbon Credits Earned: {selectedProject.carbonCreditsEarned}
                </Typography>
              )}
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDetailsDialog}>Close</Button>
        {selectedProject?.photoHashes.length > 0 && (
          <Button startIcon={<Download />}>Download Evidence</Button>
        )}
        <Button startIcon={<Map />}>View on Map</Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Projects Management
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        Review and manage all Blue Carbon restoration projects
      </Typography>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search projects..."
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
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="ALL">All Status</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="APPROVED">Approved</MenuItem>
                  <MenuItem value="REJECTED">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Vegetation Type</InputLabel>
                <Select
                  value={vegetationFilter}
                  label="Vegetation Type"
                  onChange={(e) => setVegetationFilter(e.target.value)}
                >
                  <MenuItem value="ALL">All Types</MenuItem>
                  <MenuItem value="MANGROVE">Mangrove</MenuItem>
                  <MenuItem value="SEAGRASS">Seagrass</MenuItem>
                  <MenuItem value="SALTMARSHES">Salt Marshes</MenuItem>
                  <MenuItem value="OTHERS">Others</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="body2" color="textSecondary">
                {filteredProjects.length} of {projects.length} projects
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Projects Table */}
      <Card>
        <CardContent>
          {filteredProjects.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Project Name</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Vegetation</TableCell>
                    <TableCell>Area</TableCell>
                    <TableCell>Saplings</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Credits</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProjects.map((project) => (
                    <TableRow key={project.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2">{project.name}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          by {project.createdBy}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {project.location.address}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {project.location.latitude.toFixed(4)}, {project.location.longitude.toFixed(4)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={`${getVegetationIcon(project.vegetationType)} ${project.vegetationType}`}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {project.area} {project.areaUnit}
                      </TableCell>
                      <TableCell>
                        {project.saplingsPlanted.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={project.status} 
                          color={getStatusColor(project.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {project.carbonCreditsEarned > 0 ? (
                          <Typography variant="body2" color="success.main">
                            {project.carbonCreditsEarned}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="textSecondary">
                            -
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => openDetailsDialog(project)}
                          title="View Details"
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton
                          size="small"
                          title="View on Map"
                        >
                          <Map />
                        </IconButton>
                        <IconButton
                          size="small"
                          title="Download Data"
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
              No projects found matching your search criteria.
            </Alert>
          )}
        </CardContent>
      </Card>

      <ProjectDetailsDialog />
    </Box>
  );
};

export default ProjectsPage;
