import React, { useState, FormEvent, ChangeEvent, useEffect } from 'react'
import { Modal, Form, Button } from 'react-bootstrap'
import axios from 'axios'
import { useParams } from 'react-router-dom'
import { FaFutbol, FaExchangeAlt, FaRegIdCard, FaHandPaper, FaStar } from 'react-icons/fa'
import styled from 'styled-components'

// Define the base URL for your backend fixture API
const API_BASE_URL = 'http://localhost:5000/fixture'
const PLAYERS_API_URL = 'http://localhost:5000/player'
const API_Match_EVENT_URL = 'http://localhost:5000/match-events'
interface Player {
  _id: string;
  name: string;
  team: {
    _id: string;
    name: string;
  };
  position: 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Attacker';
  number: number;
  age: number;
  nationality?: string;
  dateOfBirth?: Date;
  debut?: Date;
  logo?: string;
  value?: string;
  value_passionne?: number;
  height?: string;
}

interface Team {
  _id: string;
  name: string;
  logo?: string;
  code?: string;
}

interface Goals {
  halftime: number;
  fulltime: number;
}

interface Match {
  _id: string;
  teamshome: Team;
  teamsaway: Team;
  round: string;
  date: string;
  stadename: string;
  stadecity: string;
  referee: string;
  statuslong: string;
  statusshort: string;
  goalshome: Goals;
  goalsaway: Goals;
}

interface GoalData {
  match: string;
  team: string;
  round: string;
  player: string;
  assist: string;
  time: number;
  goalType: 'regular' | 'penalty' | 'own_goal';
}

interface SubstitutionData {
  match: string;
  team: string;
  round: string;
  playerOut: string;
  playerIn: string;
  time: number;
}

interface RedCardData {
  match: string;
  team: string;
  round: string;
  player: string;
  time: number;
  cardType: 'direct' | '2yellow';
}

interface PenaltySaveData {
  match: string;
  team: string;
  round: string;
  goalkeeper: string;
  time: number;
}

interface BonusPointData {
  match: string;
  team: string;
  round: string;
  player: string;
  points: number;
  reason: string;
}

interface MatchEvent {
  _id: string;
  eventType: 'goal' | 'sanction' | 'substitution' | 'penalty_save';
  time: number;
  player?: {
    _id: string;
    name: string;
  };
  assist?: {
    _id: string;
    name: string;
  };
  goalType?: 'regular' | 'penalty' | 'own_goal';
  card?: 'direct' | '2yellow';
  substitutionPlayerOut?: {
    _id: string;
    name: string;
  };
  substitutionPlayerIn?: {
    _id: string;
    name: string;
  };
}

const EventButton = styled(Button)`
  margin: 0.5rem;

  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-weight: 500;
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: translateY(-2px);
  }
`;

const GoalButton = styled(EventButton)`
  background-color: #28a745;
  border-color: #28a745;
  &:hover {
    background-color: #218838;
    border-color: #1e7e34;
  }
`;

const SubstitutionButton = styled(EventButton)`
  background-color: #17a2b8;
  border-color: #17a2b8;
  &:hover {
    background-color: #138496;
    border-color: #117a8b;
  }
`;

const RedCardButton = styled(EventButton)`
  background-color: #dc3545;
  border-color: #dc3545;
  &:hover {
    background-color: #c82333;
    border-color: #bd2130;
  }
`;

const PenaltySaveButton = styled(EventButton)`
  background-color: #6f42c1;
  border-color: #6f42c1;
  &:hover {
    background-color: #5a32a3;
    border-color: #563d7c;
  }
`;

const BonusPointButton = styled(EventButton)`
  background-color: #ffc107;
  border-color: #ffc107;
  color: #000;
  &:hover {
    background-color: #e0a800;
    border-color: #d39e00;
    color: #000;
  }
`;

const ScoreDisplay = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin: 1rem 0;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
`;

const TeamScore = styled.div`
  text-align: center;
  flex: 1;
`;

const TeamLogo = styled.img`
  width: 50px;
  height: 50px;
  object-fit: contain;
`;

const ScoreDivider = styled.div`
  font-size: 1.5rem;
  color: #6c757d;
`;

const TeamName = styled.h5`
  margin: 0.5rem 0;
  color: #343a40;
`;

const Score = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #28a745;
`;

const HalfTimeScore = styled.div`
  font-size: 0.9rem;
  color: #6c757d;
`;

const MatchInfoContainer = styled.div`
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
  border-radius: 16px;
  padding: 2rem;
  margin: 1.5rem 0;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #28a745, #17a2b8, #ffc107);
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  position: relative;
  z-index: 1;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 1px solid rgba(0,0,0,0.05);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.05);
  }
`;

const InfoLabel = styled.span`
  color: #6c757d;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '';
    display: inline-block;
    width: 4px;
    height: 4px;
    background-color: #28a745;
    border-radius: 50%;
  }
`;

const InfoValue = styled.span`
  color: #343a40;
  font-size: 1.2rem;
  font-weight: 600;
  line-height: 1.4;
`;

const StatusBadge = styled.span<{ status: string }>`
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 30px;
  font-size: 0.9rem;
  font-weight: 600;
  background: ${props => {
    switch (props.status.toLowerCase()) {
      case 'not started':
        return 'linear-gradient(45deg, #ffc107, #ffb300)';
      case 'in progress':
        return 'linear-gradient(45deg, #28a745, #20c997)';
      case 'finished':
        return 'linear-gradient(45deg, #6c757d, #495057)';
      default:
        return 'linear-gradient(45deg, #17a2b8, #0dcaf0)';
    }
  }};
  color: ${props => props.status.toLowerCase() === 'not started' ? '#000' : '#fff'};
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const StadiumInfo = styled(InfoValue)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &::before {
    content: '🏟️';
    font-size: 1.2em;
  }
`;

const RefereeInfo = styled(InfoValue)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &::before {
    content: '👨‍⚖️';
    font-size: 1.2em;
  }
`;

const DateInfo = styled(InfoValue)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &::before {
    content: '📅';
    font-size: 1.2em;
  }
`;

const RoundInfo = styled(InfoValue)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &::before {
    content: '🏆';
    font-size: 1.2em;
  }
`;

const TableContainer = styled.div`
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
  border-radius: 16px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  overflow: hidden;
`;

const TableTitle = styled.h3`
  color: #343a40;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  &::before {
    content: '';
    display: inline-block;
    width: 4px;
    height: 24px;
    background: linear-gradient(to bottom, #28a745, #17a2b8);
    border-radius: 2px;
  }
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin: 1rem 0;
`;

const TableHeader = styled.thead`
  background: rgba(0, 0, 0, 0.02);
`;

const TableRow = styled.tr`
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(40, 167, 69, 0.05);
  }
`;

const TableHeaderCell = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #e9ecef;
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TableCell = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
  color: #343a40;
  font-size: 0.95rem;
`;

const TableFooter = styled.tfoot`
  background: rgba(0, 0, 0, 0.02);
  font-weight: 600;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #6c757d;
  font-style: italic;
`;

const EventContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const EventTime = styled.span`
  background: #e9ecef;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.85rem;
  color: #495057;
`;

const EventType = styled.span`
  font-size: 1.2rem;
`;

const EventPlayer = styled.span`
  font-weight: 500;
  color: #343a40;
`;

const EventAssist = styled.span`
  color: #6c757d;
  font-size: 0.9rem;
`;

const EventTypeBadge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
  background: ${props => {
    switch (props.type) {
      case 'penalty':
        return '#ffc107';
      case 'own_goal':
        return '#dc3545';
      case 'direct':
        return '#dc3545';
      case '2yellow':
        return '#ffc107';
      default:
        return '#e9ecef';
    }
  }};
  color: ${props => props.type === 'penalty' || props.type === '2yellow' ? '#000' : '#fff'};
`;

const DetailsMatch = () => {
  const { id } = useParams<{ id: string }>();
  
  // State for modals
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [showSubstitutionModal, setShowSubstitutionModal] = useState(false)
  const [showRedCardModal, setShowRedCardModal] = useState(false)
  const [showPenaltySaveModal, setShowPenaltySaveModal] = useState(false)
  const [showBonusPointModal, setShowBonusPointModal] = useState(false)

  // State for match data
  const [match, setMatch] = useState<Match | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // State for form data
  const [goalData, setGoalData] = useState<GoalData>({
    match: id || '',
    team: '',
    round: '',
    player: '',
    assist: '',
    time: 0,
    goalType: 'regular'
  })

  const [substitutionData, setSubstitutionData] = useState<SubstitutionData>({
    match: id || '',
    team: '',
    round: '',
    playerOut: '',
    playerIn: '',
    time: 0
  })

  const [redCardData, setRedCardData] = useState<RedCardData>({
    match: id || '',
    team: '',
    round: '',
    player: '',
    time: 0,
    cardType: 'direct'
  })

  const [penaltySaveData, setPenaltySaveData] = useState<PenaltySaveData>({
    match: id || '',
    team: '',
    round: '',
    goalkeeper: '',
    time: 0
  })

  const [bonusPointData, setBonusPointData] = useState<BonusPointData>({
    match: id || '',
    team: '',
    round: '',
    player: '',
    points: 0,
    reason: ''
  })

  // Add state for match events
  const [matchEvents, setMatchEvents] = useState<MatchEvent[]>([])

  // Fetch match details and players
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log('Fetching match details for ID:', id)

        // Fetch match details
        const matchResponse = await axios.get(`${API_BASE_URL}/${id}`)
        console.log('Raw match response:', matchResponse)
        console.log('Match response data:', matchResponse.data)
        
        // Check if data is nested in a data property
        const matchData = matchResponse.data.data || matchResponse.data
        console.log('Processed match data:', matchData)
        
        // Log team data specifically
        console.log('Home team data:', matchData.teamshome)
        console.log('Away team data:', matchData.teamsaway)
        
        // Validate match data structure
        if (!matchData) {
          console.error('No match data received')
          throw new Error('No match data received')
        }

        if (!matchData.teamshome || !matchData.teamsaway) {
          console.error('Invalid match data structure:', {
            hasTeamshome: !!matchData.teamshome,
            hasTeamsaway: !!matchData.teamsaway,
            fullData: matchData
          })
          throw new Error('Match data missing team information')
        }

        console.log('Setting match data:', {
          homeTeam: matchData.teamshome,
          awayTeam: matchData.teamsaway
        })
        
        setMatch(matchData)

        // Initialize form data with match round
        setGoalData(prev => ({
          ...prev,
          match: id || '',
          round: matchData.round
        }))

        // Fetch players
        const playersResponse = await axios.get(PLAYERS_API_URL)
        console.log('Players response:', playersResponse.data)
        const playersData = playersResponse.data.data || []
        console.log('Processed players data:', playersData)
        setPlayers(playersData)
      } catch (error: unknown) {
        console.error('Error fetching data:', error)
        if (error instanceof Error) {
          setError(error.message)
        } else if (axios.isAxiosError(error)) {
          console.error('Axios error details:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data
          })
          setError(error.response?.data?.message || 'Failed to load match details and players')
        } else {
          setError('An unexpected error occurred')
        }
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchData()
    } else {
      setError('No match ID provided')
      setLoading(false)
    }
  }, [id])

  // Fetch match events
  const fetchMatchEvents = async () => {
    try {
      const response = await axios.get(`${API_Match_EVENT_URL}/match/${id}`)
      setMatchEvents(response.data)
    } catch (error) {
      console.error('Error fetching match events:', error)
    }
  }

  useEffect(() => {
    if (id) {
      fetchMatchEvents()
    }
  }, [id])

  // Get players for selected team
  const getTeamPlayers = (teamId: string) => {
    console.log('Filtering players for team:', teamId);
    console.log('All players:', players);
    const teamPlayers = players.filter(player => {
      console.log('playerName', player.name, 'Player team ID:', player.team._id, 'Selected team ID:', teamId);
      return player.team._id === teamId;
    });
    console.log('Filtered players:', teamPlayers);
    return teamPlayers;
  }

  // Handle goal submission
  const handleGoalSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const formData = {
        ...goalData,
        round: match?.round || ''
      }
      await axios.post(`${API_Match_EVENT_URL}/createGoal`, formData)
      setShowGoalModal(false)
      // Reset form
      setGoalData({
        match: id || '',
        team: '',
        round: match?.round || '',
        player: '',
        assist: '',
        time: 0,
        goalType: 'regular'
      })
      // Refetch match events
      await fetchMatchEvents()
    } catch (error) {
      console.error('Error creating goal:', error)
    }
  }

  // Handle substitution submission
  const handleSubstitutionSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await axios.post(`${API_Match_EVENT_URL}/createSubstitution`, substitutionData)
      setShowSubstitutionModal(false)
      // Reset form
      setSubstitutionData({
        match: id || '',
        team: '',
        round: '',
        playerOut: '',
        playerIn: '',
        time: 0
      })
      // Refetch match events
      await fetchMatchEvents()
    } catch (error) {
      console.error('Error creating substitution:', error)
    }
  }

  // Handle red card submission
  const handleRedCardSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await axios.post(`${API_Match_EVENT_URL}/createRedCard`, redCardData)
      setShowRedCardModal(false)
      // Reset form
      setRedCardData({
        match: id || '',
        team: '',
        round: '',
        player: '',
        time: 0,
        cardType: 'direct'
      })
      // Refetch match events
      await fetchMatchEvents()
    } catch (error) {
      console.error('Error creating red card:', error)
    }
  }

  // Handle penalty save submission
  const handlePenaltySaveSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await axios.post(`${API_Match_EVENT_URL}/createPenaltySave`, penaltySaveData)
      setShowPenaltySaveModal(false)
      // Reset form
      setPenaltySaveData({
        match: id || '',
        team: '',
        round: '',
        goalkeeper: '',
        time: 0
      })
      // Refetch match events
      await fetchMatchEvents()
    } catch (error) {
      console.error('Error creating penalty save:', error)
    }
  }

  // Handle bonus point submission
  const handleBonusPointSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await axios.post(`${API_Match_EVENT_URL}/createBonusPoint`, bonusPointData)
      setShowBonusPointModal(false)
      // Reset form
      setBonusPointData({
        match: id || '',
        team: '',
        round: '',
        player: '',
        points: 0,
        reason: ''
      })
      // Refetch match events
      await fetchMatchEvents()
    } catch (error) {
      console.error('Error creating bonus point:', error)
    }
  }

  // Handle input changes with type checking
  const handleGoalInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    console.log('Goal input change:', { name, value, currentMatch: match });
    
    setGoalData(prev => {
      const newData = {
        ...prev,
        [name]: name === 'time' ? Number(value) : value,
        ...(name === 'team' && { 
          player: '', 
          assist: '',
          round: match?.round || ''
        })
      };
      console.log('New goal data:', newData);
      return newData;
    });
  };

  const handleSubstitutionInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSubstitutionData(prev => ({
      ...prev,
      [name]: name === 'time' ? Number(value) : value,
      // Reset players when team changes
      ...(name === 'team' && { playerOut: '', playerIn: '' })
    }));
  };

  const handleRedCardInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRedCardData(prev => ({
      ...prev,
      [name]: name === 'time' ? Number(value) : value,
      // Reset player when team changes
      ...(name === 'team' && { player: '' })
    }));
  };

  const handlePenaltySaveInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPenaltySaveData(prev => ({
      ...prev,
      [name]: name === 'time' ? Number(value) : value,
      ...(name === 'team' && { goalkeeper: '' })
    }));
  };

  const handleBonusPointInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBonusPointData(prev => ({
      ...prev,
      [name]: name === 'points' ? Number(value) : value,
      ...(name === 'team' && { player: '' })
    }));
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          Error: {error}
        </div>
      </div>
    )
  }

  if (!match) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning" role="alert">
          Match not found
        </div>
      </div>
    )
  }

  return (
    <div className="container mt-4">
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : match ? (
        <div>
          <h2>Match Details</h2>
          
          {/* Score Display */}
          <ScoreDisplay>
            <TeamScore>
              {match.teamshome.logo ? (
                <TeamLogo 
                  src={match.teamshome.logo} 
                  alt={`${match.teamshome.name} logo`}
                />
              ) : (
                <TeamLogo 
                  src={`https://via.placeholder.com/50?text=${match.teamshome.name.charAt(0)}`}
                  alt={`${match.teamshome.name} logo`}
                />
              )}
              <TeamName>{match.teamshome.name}</TeamName>
              <Score>{match.goalshome?.fulltime || 0}</Score>
              <HalfTimeScore>HT: {match.goalshome?.halftime || 0}</HalfTimeScore>
            </TeamScore>
            
            <ScoreDivider>vs</ScoreDivider>
            
            <TeamScore>
              {match.teamsaway.logo ? (
                <TeamLogo 
                  src={match.teamsaway.logo} 
                  alt={`${match.teamsaway.name} logo`}
                />
              ) : (
                <TeamLogo 
                  src={`https://via.placeholder.com/50?text=${match.teamsaway.name.charAt(0)}`}
                  alt={`${match.teamsaway.name} logo`}
                />
              )}
              <TeamName>{match.teamsaway.name}</TeamName>
              <Score>{match.goalsaway?.fulltime || 0}</Score>
              <HalfTimeScore>HT: {match.goalsaway?.halftime || 0}</HalfTimeScore>
            </TeamScore>
          </ScoreDisplay>

          {/* Match Info */}
          <MatchInfoContainer>
            <InfoGrid>
              <InfoItem>
                <InfoLabel>Round</InfoLabel>
                <RoundInfo>{match.round}</RoundInfo>
              </InfoItem>
              
              <InfoItem>
                <InfoLabel>Date</InfoLabel>
                <DateInfo>{new Date(match.date).toLocaleDateString()}</DateInfo>
              </InfoItem>
              
              <InfoItem>
                <InfoLabel>Stadium</InfoLabel>
                <StadiumInfo>{match.stadename}, {match.stadecity}</StadiumInfo>
              </InfoItem>
              
              <InfoItem>
                <InfoLabel>Referee</InfoLabel>
                <RefereeInfo>{match.referee}</RefereeInfo>
              </InfoItem>
              
              <InfoItem>
                <InfoLabel>Status</InfoLabel>
                <StatusBadge status={match.statuslong}>
                  {match.statuslong}
                </StatusBadge>
              </InfoItem>
            </InfoGrid>
          </MatchInfoContainer>

          <div className="event-buttons mt-4">
            <GoalButton onClick={() => setShowGoalModal(true)}>
              <FaFutbol /> Add Goal
            </GoalButton>

            <SubstitutionButton onClick={() => setShowSubstitutionModal(true)}>
              <FaExchangeAlt /> Add Substitution
            </SubstitutionButton>

            <RedCardButton onClick={() => setShowRedCardModal(true)}>
              <FaRegIdCard /> Add Red Card
            </RedCardButton>

            <PenaltySaveButton onClick={() => setShowPenaltySaveModal(true)}>
              <FaHandPaper /> Add Penalty Save
            </PenaltySaveButton>

            <BonusPointButton onClick={() => setShowBonusPointModal(true)}>
              <FaStar /> Add Bonus Point
            </BonusPointButton>
          </div>

          {/* Match Events Table */}
          <TableContainer>
            <TableTitle>Match Events</TableTitle>
            {matchEvents.length === 0 ? (
              <EmptyState>No events recorded for this match</EmptyState>
            ) : (
              <StyledTable>
                <TableHeader>
                  <TableRow>
                    <TableHeaderCell>Time</TableHeaderCell>
                    <TableHeaderCell>Event</TableHeaderCell>
                    <TableHeaderCell>Player</TableHeaderCell>
                    <TableHeaderCell>Details</TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <tbody>
                  {matchEvents
                    .sort((a, b) => a.time - b.time)
                    .map((event, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <EventTime>{event.time}'</EventTime>
                        </TableCell>
                        <TableCell>
                          <EventContainer>
                            <EventType>
                              {event.eventType === 'goal' && '⚽'}
                              {event.eventType === 'sanction' && '🟥'}
                              {event.eventType === 'substitution' && '🔄'}
                              {event.eventType === 'penalty_save' && '🧤'}
                            </EventType>
                            {event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)}
                          </EventContainer>
                        </TableCell>
                        <TableCell>
                          <EventPlayer>
                            {event.player?.name || 
                             event.substitutionPlayerOut?.name || 
                             event.substitutionPlayerIn?.name}
                          </EventPlayer>
                        </TableCell>
                        <TableCell>
                          {event.assist && (
                            <EventAssist>Assist: {event.assist.name}</EventAssist>
                          )}
                          {event.goalType && (
                            <EventTypeBadge type={event.goalType}>
                              {event.goalType === 'penalty' ? 'Penalty' : 
                               event.goalType === 'own_goal' ? 'Own Goal' : 'Regular'}
                            </EventTypeBadge>
                          )}
                          {event.card && (
                            <EventTypeBadge type={event.card}>
                              {event.card === 'direct' ? 'Direct Red' : 'Second Yellow'}
                            </EventTypeBadge>
                          )}
                          {event.substitutionPlayerIn && (
                            <EventAssist>→ {event.substitutionPlayerIn.name}</EventAssist>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </tbody>
              </StyledTable>
            )}
          </TableContainer>

          {/* Goal Modal */}
          <Modal show={showGoalModal} onHide={() => setShowGoalModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Ajouter un But</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleGoalSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Équipe</Form.Label>
                  <Form.Select
                    name="team"
                    value={goalData.team}
                    onChange={handleGoalInputChange}
                    required
                  >
                    <option value="">Sélectionner une équipe</option>
                    {match && match.teamshome && (
                      <option value={match.teamshome._id}>
                        {match.teamshome.name}
                      </option>
                    )}
                    {match && match.teamsaway && (
                      <option value={match.teamsaway._id}>
                        {match.teamsaway.name}
                      </option>
                    )}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Round</Form.Label>
                  <Form.Control
                    type="text"
                    name="round"
                    value={match?.round || ''}
                    readOnly
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Buteur</Form.Label>
                  <Form.Select
                    name="player"
                    value={goalData.player}
                    onChange={handleGoalInputChange}
                    required
                    disabled={!goalData.team}
                  >
                    <option value="">Sélectionner un joueur</option>
                    {goalData.team && getTeamPlayers(goalData.team).map(player => (
                      <option key={player._id} value={player._id}>
                        {player.name} ({player.position})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Passeur Décisif</Form.Label>
                  <Form.Select
                    name="assist"
                    value={goalData.assist}
                    onChange={handleGoalInputChange}
                    disabled={!goalData.team}
                  >
                    <option value="">Sélectionner un joueur</option>
                    {goalData.team && getTeamPlayers(goalData.team).map(player => (
                      <option key={player._id} value={player._id}>
                        {player.name} ({player.position})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Temps (minutes)</Form.Label>
                  <Form.Control
                    type="number"
                    name="time"
                    min="1"
                    max="90"
                    value={goalData.time}
                    onChange={handleGoalInputChange}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Type de But</Form.Label>
                  <Form.Select
                    name="goalType"
                    value={goalData.goalType}
                    onChange={handleGoalInputChange}
                  >
                    <option value="regular">Normal</option>
                    <option value="penalty">Penalty</option>
                    <option value="own_goal">But contre son camp</option>
                  </Form.Select>
                </Form.Group>
                <Button variant="success" type="submit">
                  Ajouter
                </Button>
              </Form>
            </Modal.Body>
          </Modal>

          {/* Substitution Modal */}
          <Modal show={showSubstitutionModal} onHide={() => setShowSubstitutionModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Ajouter un Remplacement</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleSubstitutionSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Équipe</Form.Label>
                  <Form.Select
                    name="team"
                    value={substitutionData.team}
                    onChange={handleSubstitutionInputChange}
                    required
                  >
                    <option value="">Sélectionner une équipe</option>
                    {match && match.teamshome && (
                      <option value={match.teamshome._id}>
                        {match.teamshome.name}
                      </option>
                    )}
                    {match && match.teamsaway && (
                      <option value={match.teamsaway._id}>
                        {match.teamsaway.name}
                      </option>
                    )}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Round</Form.Label>
                  <Form.Control
                    type="text"
                    name="round"
                    value={substitutionData.round}
                    onChange={handleSubstitutionInputChange}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Joueur Sortant</Form.Label>
                  <Form.Select
                    name="playerOut"
                    value={substitutionData.playerOut}
                    onChange={handleSubstitutionInputChange}
                    required
                    disabled={!substitutionData.team}
                  >
                    <option value="">Sélectionner un joueur</option>
                    {substitutionData.team && getTeamPlayers(substitutionData.team).map(player => (
                      <option key={player._id} value={player._id}>
                        {player.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Joueur Entrant</Form.Label>
                  <Form.Select
                    name="playerIn"
                    value={substitutionData.playerIn}
                    onChange={handleSubstitutionInputChange}
                    required
                    disabled={!substitutionData.team}
                  >
                    <option value="">Sélectionner un joueur</option>
                    {substitutionData.team && getTeamPlayers(substitutionData.team).map(player => (
                      <option key={player._id} value={player._id}>
                        {player.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Temps (minutes)</Form.Label>
                  <Form.Control
                    type="number"
                    name="time"
                    min="1"
                    max="90"
                    value={substitutionData.time}
                    onChange={handleSubstitutionInputChange}
                    required
                  />
                </Form.Group>
                <Button variant="primary" type="submit">
                  Ajouter
                </Button>
              </Form>
            </Modal.Body>
          </Modal>

          {/* Red Card Modal */}
          <Modal show={showRedCardModal} onHide={() => setShowRedCardModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Ajouter une Carte Rouge</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleRedCardSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Équipe</Form.Label>
                  <Form.Select
                    name="team"
                    value={redCardData.team}
                    onChange={handleRedCardInputChange}
                    required
                  >
                    <option value="">Sélectionner une équipe</option>
                    {match && match.teamshome && (
                      <option value={match.teamshome._id}>
                        {match.teamshome.name}
                      </option>
                    )}
                    {match && match.teamsaway && (
                      <option value={match.teamsaway._id}>
                        {match.teamsaway.name}
                      </option>
                    )}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Round</Form.Label>
                  <Form.Control
                    type="text"
                    name="round"
                    value={redCardData.round}
                    onChange={handleRedCardInputChange}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Joueur</Form.Label>
                  <Form.Select
                    name="player"
                    value={redCardData.player}
                    onChange={handleRedCardInputChange}
                    required
                    disabled={!redCardData.team}
                  >
                    <option value="">Sélectionner un joueur</option>
                    {redCardData.team && getTeamPlayers(redCardData.team).map(player => (
                      <option key={player._id} value={player._id}>
                        {player.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Temps (minutes)</Form.Label>
                  <Form.Control
                    type="number"
                    name="time"
                    min="1"
                    max="90"
                    value={redCardData.time}
                    onChange={handleRedCardInputChange}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Type de Carte</Form.Label>
                  <Form.Select
                    name="cardType"
                    value={redCardData.cardType}
                    onChange={handleRedCardInputChange}
                  >
                    <option value="direct">Direct</option>
                    <option value="2yellow">2 Jaunes</option>
                  </Form.Select>
                </Form.Group>
                <Button variant="danger" type="submit">
                  Ajouter
                </Button>
              </Form>
            </Modal.Body>
          </Modal>

          {/* Penalty Save Modal */}
          <Modal show={showPenaltySaveModal} onHide={() => setShowPenaltySaveModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Ajouter un Arrêt de Pénalité</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handlePenaltySaveSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Équipe</Form.Label>
                  <Form.Select
                    name="team"
                    value={penaltySaveData.team}
                    onChange={handlePenaltySaveInputChange}
                    required
                  >
                    <option value="">Sélectionner une équipe</option>
                    {match && match.teamshome && (
                      <option value={match.teamshome._id}>
                        {match.teamshome.name}
                      </option>
                    )}
                    {match && match.teamsaway && (
                      <option value={match.teamsaway._id}>
                        {match.teamsaway.name}
                      </option>
                    )}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Round</Form.Label>
                  <Form.Control
                    type="text"
                    name="round"
                    value={penaltySaveData.round}
                    onChange={handlePenaltySaveInputChange}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Gardien</Form.Label>
                  <Form.Select
                    name="goalkeeper"
                    value={penaltySaveData.goalkeeper}
                    onChange={handlePenaltySaveInputChange}
                    required
                    disabled={!penaltySaveData.team}
                  >
                    <option value="">Sélectionner un gardien</option>
                    {penaltySaveData.team && getTeamPlayers(penaltySaveData.team)
                      .filter(player => player.position === 'Goalkeeper')
                      .map(player => (
                        <option key={player._id} value={player._id}>
                          {player.name}
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Temps (minutes)</Form.Label>
                  <Form.Control
                    type="number"
                    name="time"
                    min="1"
                    max="90"
                    value={penaltySaveData.time}
                    onChange={handlePenaltySaveInputChange}
                    required
                  />
                </Form.Group>
                <Button variant="warning" type="submit">
                  Ajouter
                </Button>
              </Form>
            </Modal.Body>
          </Modal>

          {/* Bonus Point Modal */}
          <Modal show={showBonusPointModal} onHide={() => setShowBonusPointModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Ajouter un Point Bonus</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleBonusPointSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Équipe</Form.Label>
                  <Form.Select
                    name="team"
                    value={bonusPointData.team}
                    onChange={handleBonusPointInputChange}
                    required
                  >
                    <option value="">Sélectionner une équipe</option>
                    {match && match.teamshome && (
                      <option value={match.teamshome._id}>
                        {match.teamshome.name}
                      </option>
                    )}
                    {match && match.teamsaway && (
                      <option value={match.teamsaway._id}>
                        {match.teamsaway.name}
                      </option>
                    )}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Round</Form.Label>
                  <Form.Control
                    type="text"
                    name="round"
                    value={bonusPointData.round}
                    onChange={handleBonusPointInputChange}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Joueur</Form.Label>
                  <Form.Select
                    name="player"
                    value={bonusPointData.player}
                    onChange={handleBonusPointInputChange}
                    required
                    disabled={!bonusPointData.team}
                  >
                    <option value="">Sélectionner un joueur</option>
                    {bonusPointData.team && getTeamPlayers(bonusPointData.team).map(player => (
                      <option key={player._id} value={player._id}>
                        {player.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Points Bonus</Form.Label>
                  <Form.Control
                    type="number"
                    name="points"
                    min="1"
                    max="10"
                    value={bonusPointData.points}
                    onChange={handleBonusPointInputChange}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Raison</Form.Label>
                  <Form.Control
                    type="text"
                    name="reason"
                    value={bonusPointData.reason}
                    onChange={handleBonusPointInputChange}
                    required
                    placeholder="Ex: Meilleur joueur du match"
                  />
                </Form.Group>
                <Button variant="info" type="submit">
                  Ajouter
                </Button>
              </Form>
            </Modal.Body>
          </Modal>
        </div>
      ) : (
        <div>No match data available</div>
      )}
    </div>
  )
}

export default DetailsMatch
