import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useBlockchain } from '../contexts/BlockchainContext';
import 'leaflet/dist/leaflet.css';

const AnalyticsPage: React.FC = () => {
  const { projects, submissions, carbonCredits, users } = useBlockchain();
  const [timeRange, setTimeRange] = useState('6months');
  const [regionFilter, setRegionFilter] = useState('ALL');

  // Generate analytics data
  const generateMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, index) => ({
      month,
      projects: Math.floor(Math.random() * 10) + index * 2,
      submissions: Math.floor(Math.random() * 15) + index * 3,
      credits: Math.floor(Math.random() * 100) + index * 20,
      value: Math.floor(Math.random() * 5000) + index * 1000,
    }));
  };

  const generateRegionalData = () => [
    { region: 'West Bengal', projects: 8, credits: 420, value: 10500 },
    { region: 'Kerala', projects: 6, credits: 320, value: 8000 },
    { region: 'Tamil Nadu', projects: 4, credits: 180, value: 4500 },
    { region: 'Odisha', projects: 3, credits: 150, value: 3750 },
    { region: 'Gujarat', projects: 2, credits: 80, value: 2000 },
  ];

  const generateVegetationData = () => [
    { name: 'Mangrove', value: 45, color: '#4caf50' },
    { name: 'Seagrass', value: 30, color: '#2196f3' },
    { name: 'Salt Marshes', value: 20, color: '#ff9800' },
    { name: 'Others', value: 5, color: '#9c27b0' },
  ];

  const generateCarbonSequestrationData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, index) => ({
      month,
      sequestered: Math.floor(Math.random() * 50) + index * 10,
      projected: Math.floor(Math.random() * 30) + index * 15,
    }));
  };

  const monthlyData = generateMonthlyData();
  const regionalData = generateRegionalData();
  const vegetationData = generateVegetationData();
  const carbonData = generateCarbonSequestrationData();

  // Calculate key metrics
  const totalProjects = projects.length;
  const totalCredits = carbonCredits.reduce((sum, c) => sum + c.creditsAmount, 0);
  const totalValue = carbonCredits.reduce((sum, c) => sum + (c.creditsAmount * c.pricePerCredit), 0);
  const avgProjectSize = projects.reduce((sum, p) => sum + p.area, 0) / projects.length || 0;

  const projectLocations = projects.map(project => ({
    id: project.id,
    name: project.name,
    lat: project.location.latitude,
    lng: project.location.longitude,
    status: project.status,
    vegetationType: project.vegetationType,
  }));

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Analytics & Reporting
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        Comprehensive insights into Blue Carbon Registry performance and impact
      </Typography>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="3months">Last 3 Months</MenuItem>
              <MenuItem value="6months">Last 6 Months</MenuItem>
              <MenuItem value="1year">Last Year</MenuItem>
              <MenuItem value="all">All Time</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Region</InputLabel>
            <Select
              value={regionFilter}
              label="Region"
              onChange={(e) => setRegionFilter(e.target.value)}
            >
              <MenuItem value="ALL">All Regions</MenuItem>
              <MenuItem value="WB">West Bengal</MenuItem>
              <MenuItem value="KL">Kerala</MenuItem>
              <MenuItem value="TN">Tamil Nadu</MenuItem>
              <MenuItem value="OD">Odisha</MenuItem>
              <MenuItem value="GJ">Gujarat</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="overline">
                Total Projects
              </Typography>
              <Typography variant="h4" color="primary.main">
                {totalProjects}
              </Typography>
              <Typography variant="body2" color="success.main">
                +12% from last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="overline">
                Carbon Credits
              </Typography>
              <Typography variant="h4" color="success.main">
                {totalCredits.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="success.main">
                +18% from last month
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
              <Typography variant="body2" color="success.main">
                +25% from last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="overline">
                Avg Project Size
              </Typography>
              <Typography variant="h4" color="warning.main">
                {avgProjectSize.toFixed(1)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                hectares
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Monthly Trends */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Monthly Performance Trends
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="projects" stroke="#1976d2" name="Projects" />
                    <Line type="monotone" dataKey="submissions" stroke="#4caf50" name="Submissions" />
                    <Line type="monotone" dataKey="credits" stroke="#ff9800" name="Credits" />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Vegetation Distribution */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Vegetation Type Distribution
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={vegetationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {vegetationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Carbon Sequestration */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Carbon Sequestration (tCO2/month)
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={carbonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="sequestered" stackId="1" stroke="#4caf50" fill="#4caf50" name="Actual" />
                    <Area type="monotone" dataKey="projected" stackId="1" stroke="#2196f3" fill="#2196f3" name="Projected" />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Regional Performance */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Regional Performance
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={regionalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="region" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="projects" fill="#1976d2" name="Projects" />
                    <Bar dataKey="credits" fill="#4caf50" name="Credits" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Project Map */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Project Locations Map
              </Typography>
              <Box sx={{ height: 400, width: '100%' }}>
                <MapContainer
                  center={[20.5937, 78.9629]}
                  zoom={5}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {projectLocations.map((location) => (
                    <Marker key={location.id} position={[location.lat, location.lng]}>
                      <Popup>
                        <div>
                          <strong>{location.name}</strong><br />
                          Type: {location.vegetationType}<br />
                          Status: {location.status}
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Performing Projects */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Performing Projects
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Project</TableCell>
                      <TableCell>Credits</TableCell>
                      <TableCell>Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {projects
                      .filter(p => p.carbonCreditsEarned > 0)
                      .sort((a, b) => b.carbonCreditsEarned - a.carbonCreditsEarned)
                      .slice(0, 5)
                      .map((project) => (
                        <TableRow key={project.id}>
                          <TableCell>{project.name}</TableCell>
                          <TableCell>{project.carbonCreditsEarned}</TableCell>
                          <TableCell>₹{(project.carbonCreditsEarned * 25.5).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* User Statistics */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                User Statistics
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Role</TableCell>
                      <TableCell>Count</TableCell>
                      <TableCell>Verified</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>NGO Officers</TableCell>
                      <TableCell>{users.filter(u => u.role === 'NGO_OFFICER').length}</TableCell>
                      <TableCell>{users.filter(u => u.role === 'NGO_OFFICER' && u.kycStatus === 'VERIFIED').length}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Community Heads</TableCell>
                      <TableCell>{users.filter(u => u.role === 'COMMUNITY_HEAD').length}</TableCell>
                      <TableCell>{users.filter(u => u.role === 'COMMUNITY_HEAD' && u.kycStatus === 'VERIFIED').length}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Coastal Panchayats</TableCell>
                      <TableCell>{users.filter(u => u.role === 'COASTAL_PANCHAYAT').length}</TableCell>
                      <TableCell>{users.filter(u => u.role === 'COASTAL_PANCHAYAT' && u.kycStatus === 'VERIFIED').length}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsPage;
