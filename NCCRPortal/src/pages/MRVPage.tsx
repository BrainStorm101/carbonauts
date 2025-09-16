import React, { useState, useEffect } from 'react';
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
  Tabs,
  Tab,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  Visibility,
  CheckCircle,
  Cancel,
  RequestPage,
  Download,
  Map,
} from '@mui/icons-material';
import { useBlockchain } from '../contexts/BlockchainContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`mrv-tabpanel-${index}`}
      aria-labelledby={`mrv-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const MRVPage: React.FC = () => {
  const {
    projects,
    submissions,
    approveProject,
    rejectProject,
    approveSubmission,
    rejectSubmission,
    requestAdditionalData,
    loading,
  } = useBlockchain();

  const [tabValue, setTabValue] = useState(0);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'approve' | 'reject' | 'request'>('approve');
  const [reviewNotes, setReviewNotes] = useState('');
  const [creditsAmount, setCreditsAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  const pendingProjects = projects.filter(p => p.status === 'PENDING');
  const pendingSubmissions = submissions.filter(s => s.status === 'PENDING' || s.status === 'UNDER_REVIEW');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const openDialog = (item: any, type: 'approve' | 'reject' | 'request') => {
    setSelectedItem(item);
    setDialogType(type);
    setReviewNotes('');
    setCreditsAmount('');
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedItem(null);
    setReviewNotes('');
    setCreditsAmount('');
  };

  const handleAction = async () => {
    if (!selectedItem) return;

    setProcessing(true);
    try {
      if (tabValue === 0) { // Projects
        if (dialogType === 'approve') {
          await approveProject(selectedItem.id, reviewNotes);
        } else if (dialogType === 'reject') {
          await rejectProject(selectedItem.id, reviewNotes);
        }
      } else { // Submissions
        if (dialogType === 'approve') {
          const credits = parseInt(creditsAmount) || 0;
          await approveSubmission(selectedItem.id, credits, reviewNotes);
        } else if (dialogType === 'reject') {
          await rejectSubmission(selectedItem.id, reviewNotes);
        } else if (dialogType === 'request') {
          await requestAdditionalData(selectedItem.id, reviewNotes);
        }
      }
      closeDialog();
    } catch (error) {
      console.error('Error processing action:', error);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'error';
      case 'UNDER_REVIEW': return 'info';
      case 'PENDING': return 'warning';
      default: return 'default';
    }
  };

  const ProjectsTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Project Name</TableCell>
            <TableCell>Location</TableCell>
            <TableCell>Vegetation Type</TableCell>
            <TableCell>Area</TableCell>
            <TableCell>Submitted By</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pendingProjects.map((project) => (
            <TableRow key={project.id}>
              <TableCell>{project.name}</TableCell>
              <TableCell>
                {project.location.latitude.toFixed(4)}, {project.location.longitude.toFixed(4)}
              </TableCell>
              <TableCell>
                <Chip label={project.vegetationType} size="small" />
              </TableCell>
              <TableCell>
                {project.area} {project.areaUnit}
              </TableCell>
              <TableCell>{project.createdBy}</TableCell>
              <TableCell>
                <Chip 
                  label={project.status} 
                  color={getStatusColor(project.status) as any}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <IconButton
                  size="small"
                  onClick={() => openDialog(project, 'approve')}
                  color="success"
                  title="Approve"
                >
                  <CheckCircle />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => openDialog(project, 'reject')}
                  color="error"
                  title="Reject"
                >
                  <Cancel />
                </IconButton>
                <IconButton
                  size="small"
                  title="View Details"
                >
                  <Visibility />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const SubmissionsTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Project ID</TableCell>
            <TableCell>Plant Type</TableCell>
            <TableCell>Samples</TableCell>
            <TableCell>Growth Rate</TableCell>
            <TableCell>Health Score</TableCell>
            <TableCell>Carbon Seq.</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pendingSubmissions.map((submission) => (
            <TableRow key={submission.id}>
              <TableCell>{submission.projectId}</TableCell>
              <TableCell>
                <Chip label={submission.plantType} size="small" />
              </TableCell>
              <TableCell>{submission.numberOfSamples}</TableCell>
              <TableCell>{submission.growthRate}%</TableCell>
              <TableCell>{submission.healthScore}/100</TableCell>
              <TableCell>{submission.carbonSequestration} tCO2</TableCell>
              <TableCell>
                <Chip 
                  label={submission.status} 
                  color={getStatusColor(submission.status) as any}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <IconButton
                  size="small"
                  onClick={() => openDialog(submission, 'approve')}
                  color="success"
                  title="Approve & Award Credits"
                >
                  <CheckCircle />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => openDialog(submission, 'reject')}
                  color="error"
                  title="Reject"
                >
                  <Cancel />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => openDialog(submission, 'request')}
                  color="info"
                  title="Request Additional Data"
                >
                  <RequestPage />
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
  );

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        MRV Panel
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        Monitoring, Reporting, and Verification of Blue Carbon Projects
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="overline">
                Pending Projects
              </Typography>
              <Typography variant="h4" color="warning.main">
                {pendingProjects.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Awaiting review
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="overline">
                Pending Submissions
              </Typography>
              <Typography variant="h4" color="info.main">
                {pendingSubmissions.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Need verification
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="overline">
                Total Projects
              </Typography>
              <Typography variant="h4" color="primary.main">
                {projects.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                All time
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="overline">
                Total Submissions
              </Typography>
              <Typography variant="h4" color="success.main">
                {submissions.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                All time
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label={`Projects (${pendingProjects.length})`} />
            <Tab label={`Submissions (${pendingSubmissions.length})`} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {pendingProjects.length > 0 ? (
            <ProjectsTable />
          ) : (
            <Alert severity="info">
              No pending projects to review at this time.
            </Alert>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {pendingSubmissions.length > 0 ? (
            <SubmissionsTable />
          ) : (
            <Alert severity="info">
              No pending submissions to verify at this time.
            </Alert>
          )}
        </TabPanel>
      </Card>

      {/* Action Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogType === 'approve' && 'Approve '}
          {dialogType === 'reject' && 'Reject '}
          {dialogType === 'request' && 'Request Additional Data for '}
          {tabValue === 0 ? 'Project' : 'Submission'}
        </DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                {tabValue === 0 ? selectedItem.name : `Project: ${selectedItem.projectId}`}
              </Typography>
            </Box>
          )}

          {dialogType === 'approve' && tabValue === 1 && (
            <TextField
              fullWidth
              label="Carbon Credits to Award"
              type="number"
              value={creditsAmount}
              onChange={(e) => setCreditsAmount(e.target.value)}
              sx={{ mb: 2 }}
              helperText="Enter the number of carbon credits to award for this submission"
            />
          )}

          <TextField
            fullWidth
            multiline
            rows={4}
            label={
              dialogType === 'approve' ? 'Review Notes (Optional)' :
              dialogType === 'reject' ? 'Rejection Reason (Required)' :
              'Additional Data Request (Required)'
            }
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            required={dialogType !== 'approve'}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button
            onClick={handleAction}
            variant="contained"
            disabled={processing || (dialogType !== 'approve' && !reviewNotes.trim())}
            color={
              dialogType === 'approve' ? 'success' :
              dialogType === 'reject' ? 'error' : 'primary'
            }
          >
            {processing ? 'Processing...' : 
             dialogType === 'approve' ? 'Approve' :
             dialogType === 'reject' ? 'Reject' : 'Send Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MRVPage;
