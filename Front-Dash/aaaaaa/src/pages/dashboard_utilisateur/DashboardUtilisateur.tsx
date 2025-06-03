import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Container } from 'react-bootstrap';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import styled from 'styled-components';
import { FaUsers, FaUserTie, FaFutbol } from 'react-icons/fa';
import axios from 'axios';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Styled components
const StatCard = styled(Card)`
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-5px);
  }
`;

const IconWrapper = styled.div`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #0d6efd;
`;

const StatValue = styled.h2`
  font-size: 2rem;
  font-weight: bold;
  margin: 0;
  color: #2c3e50;
`;

const StatLabel = styled.p`
  color: #6c757d;
  margin: 0;
`;

const ChartContainer = styled.div`
  background: white;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  height: 400px;
  display: flex;
  flex-direction: column;
  
  h3 {
    margin-bottom: 20px;
    color: #2c3e50;
    font-size: 1.25rem;
  }
  
  .chart-wrapper {
    flex: 1;
    position: relative;
    width: 100%;
    height: calc(100% - 50px);
  }
`;

const DashboardUtilisateur = () => {
  const [stats, setStats] = useState({
    totalPlayers: 0,
    totalTeams: 0,
    totalUsers: 0,
    playersByPosition: {},
    playersByTeam: {},
    recentActivity: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch players
        const playersResponse = await axios.get('http://localhost:5000/player');
        const players = playersResponse.data.data || [];

        // Fetch teams
        const teamsResponse = await axios.get('http://localhost:5000/team');
        const teams = teamsResponse.data.teams || [];

        // Calculate statistics
        const playersByPosition = players.reduce((acc, player) => {
          acc[player.position] = (acc[player.position] || 0) + 1;
          return acc;
        }, {});

        const playersByTeam = players.reduce((acc, player) => {
          const teamName = player.team?.name || 'Unknown';
          acc[teamName] = (acc[teamName] || 0) + 1;
          return acc;
        }, {});

        setStats({
          totalPlayers: players.length,
          totalTeams: teams.length,
          totalUsers: 100, // Replace with actual user count when available
          playersByPosition,
          playersByTeam,
          recentActivity: [] // Add recent activity data when available
        });
      } catch (error) {
        console.error('Error fetching statistics:', error);
      }
    };

    fetchStats();
  }, []);

  // Chart data
  const positionChartData = {
    labels: Object.keys(stats.playersByPosition),
    datasets: [
      {
        label: 'Players by Position',
        data: Object.values(stats.playersByPosition),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const teamChartData = {
    labels: Object.keys(stats.playersByTeam),
    datasets: [
      {
        label: 'Players by Team',
        data: Object.values(stats.playersByTeam),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <Container fluid className="py-4">
      <h1 className="mb-4">Dashboard</h1>
      
      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <StatCard className="text-center p-4">
            <IconWrapper>
              <FaUsers />
            </IconWrapper>
            <StatValue>{stats.totalPlayers}</StatValue>
            <StatLabel>Total Players</StatLabel>
          </StatCard>
        </Col>
        <Col md={4}>
          <StatCard className="text-center p-4">
            <IconWrapper>
              <FaUserTie />
            </IconWrapper>
            <StatValue>{stats.totalTeams}</StatValue>
            <StatLabel>Total Teams</StatLabel>
          </StatCard>
        </Col>
        <Col md={4}>
          <StatCard className="text-center p-4">
            <IconWrapper>
              <FaFutbol />
            </IconWrapper>
            <StatValue>{stats.totalUsers}</StatValue>
            <StatLabel>Total Users</StatLabel>
          </StatCard>
        </Col>
      </Row>

      {/* Charts */}
      <Row>
        <Col md={6}>
          <ChartContainer>
            <h3>Players by Position</h3>
            <div className="chart-wrapper">
              <Doughnut 
                data={positionChartData}
                options={{
                  maintainAspectRatio: false,
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'right',
                      labels: {
                        boxWidth: 15,
                        padding: 15
                      }
                    }
                  }
                }}
              />
            </div>
          </ChartContainer>
        </Col>
        <Col md={6}>
          <ChartContainer>
            <h3>Players by Team</h3>
            <div className="chart-wrapper">
              <Bar 
                data={teamChartData}
                options={{
                  maintainAspectRatio: false,
                  responsive: true,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1
                      }
                    }
                  }
                }}
              />
            </div>
          </ChartContainer>
        </Col>
      </Row>
    </Container>
  );
};

export default DashboardUtilisateur;
