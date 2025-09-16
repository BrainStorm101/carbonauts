import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Nature,
  VerifiedUser,
  AccountBalanceWallet,
  People,
  TrendingUp,
  Warning,
  CheckCircle,
  Schedule,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useBlockchain } from '../contexts/BlockchainContext';
import { useAuth } from '../contexts/AuthContext';

const DashboardPage: React.FC = () => {
  const { projects, submissions, carbonCredits, users, loading } = useBlockchain();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProjects: 0,
    pendingProjects: 0,
    approvedProjects: 0,
    rejectedProjects: 0,
    totalSubmissions: 0,
    pendingSubmissions: 0,
    totalCredits: 0,
    totalCreditValue: 0,
    totalUsers: 0,
    verifiedUsers: 0,
  });

  useEffect(() => {
    calculateStats();
  }, [projects, submissions, carbonCredits, users]);

  const calculateStats = () => {
    const projectStats = projects.reduce(
      (acc, project) => {
        acc.totalProjects++;
        switch (project.status) {
          case 'PENDING':
            acc.pendingProjects++;
            break;
          case 'APPROVED':
            acc.approvedProjects++;
            break;
          case 'REJECTED':
            acc.rejectedProjects++;
            break;
        }
        return acc;
      },
      { totalProjects: 0, pendingProjects: 0, approvedProjects: 0, rejectedProjects: 0 }
    );

    const submissionStats = submissions.reduce(
      (acc, submission) => {
        acc.totalSubmissions++;
        if (submission.status === 'PENDING' || submission.status === 'UNDER_REVIEW') {
          acc.pendingSubmissions++;
        }
        return acc;
      },
      { totalSubmissions: 0, pendingSubmissions: 0 }
    );

    const creditStats = carbonCredits.reduce(
      (acc, credit) => {
        acc.totalCredits += credit.creditsAmount;
        acc.totalCreditValue += credit.creditsAmount * credit.pricePerCredit;
        return acc;
      },
      { totalCredits: 0, totalCreditValue: 0 }
    );

    const userStats = users.reduce(
      (acc, user) => {
        acc.totalUsers++;
        if (user.kycStatus === 'VERIFIED') {
          acc.verifiedUsers++;
        }
        return acc;
      },
      { totalUsers: 0, verifiedUsers: 0 }
    );

    setStats({
      ...projectStats,
      ...submissionStats,
      ...creditStats,
      ...userStats,
    });
  };

  const projectStatusData = [
    { name: 'Approved', value: stats.approvedProjects, color: '#4caf50' },
    { name: 'Pending', value: stats.pendingProjects, color: '#ff9800' },
    { name: 'Rejected', value: stats.rejectedProjects, color: '#f44336' },
  ];

  const monthlyData = [
    { month: 'Jan', projects: 5, credits: 120 },
    { month: 'Feb', projects: 8, credits: 180 },
    { month: 'Mar', projects: 12, credits: 250 },
    { month: 'Apr', projects: 15, credits: 320 },
    { month: 'May', projects: 18, credits: 410 },
    { month: 'Jun', projects: 22, credits: 520 },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'project_approved',
      title: 'Kerala Backwater Seagrass Conservation approved',
      time: '2 hours ago',
      icon: <CheckCircle color="success" />,
    },
    {
      id: 2,
      type: 'submission_pending',
      title: 'New monitoring data submitted for review',
      time: '4 hours ago',
      icon: <Schedule color="warning" />,
    },
    {
      id: 3,
      type: 'credits_minted',
      title: '78 carbon credits minted and issued',
      time: '6 hours ago',
      icon: <AccountBalanceWallet color="primary" />,
    },
    {
      id: 4,
      type: 'user_verified',
      title: 'New user KYC verification completed',
      time: '1 day ago',
      icon: <VerifiedUser color="info" />,
    },
  ];

  const StatCard = ({ title, value, subtitle, icon, color }: any) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="overline">
              {title}
            </Typography>
            <Typography variant="h4" component="div" color={color}>
              {value}
            </Typography>
            <Typography color="textSecondary" variant="body2">
              {subtitle}
            </Typography>
          </Box>
          <Box sx={{ color }}>{icon}</Box>
        </Box>
      </CardContent>
    </Card>
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
        Dashboard
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        Welcome back, {user?.name}. Here's what's happening with the Blue Carbon Registry.
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Projects"
            value={stats.totalProjects}
            subtitle={`${stats.pendingProjects} pending review`}
            icon={<Nature fontSize="large" />}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Submissions"
            value={stats.totalSubmissions}
            subtitle={`${stats.pendingSubmissions} awaiting review`}
            icon={<VerifiedUser fontSize="large" />}
            color="warning.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Carbon Credits"
            value={stats.totalCredits.toLocaleString()}
            subtitle={`₹${stats.totalCreditValue.toLocaleString()} total value`}
            icon={<AccountBalanceWallet fontSize="large" />}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Registered Users"
            value={stats.totalUsers}
            subtitle={`${stats.verifiedUsers} verified`}
            icon={<People fontSize="large" />}
            color="info.main"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Project Status Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Project Status Distribution
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={projectStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {projectStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                {projectStatusData.map((entry, index) => (
                  <Chip
                    key={index}
                    label={`${entry.name}: ${entry.value}`}
                    sx={{ backgroundColor: entry.color, color: 'white' }}
                    size="small"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Monthly Trends */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Monthly Trends
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
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

        {/* Recent Activities */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activities
              </Typography>
              <List>
                {recentActivities.map((activity) => (
                  <ListItem key={activity.id} divider>
                    <ListItemIcon>{activity.icon}</ListItemIcon>
                    <ListItemText
                      primary={activity.title}
                      secondary={activity.time}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pending Actions
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Warning color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${stats.pendingProjects} projects awaiting review`}
                    secondary="Review and approve/reject pending projects"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Schedule color="info" />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${stats.pendingSubmissions} submissions to verify`}
                    secondary="Verify monitoring data and award credits"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <People color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${stats.totalUsers - stats.verifiedUsers} users pending KYC`}
                    secondary="Complete user verification process"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
