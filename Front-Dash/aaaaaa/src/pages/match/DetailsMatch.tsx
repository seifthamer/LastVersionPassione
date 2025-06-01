import React, { useState, FormEvent, ChangeEvent, useEffect } from 'react'
import { Modal, Form, Button } from 'react-bootstrap'
import axios from 'axios'
import { useParams } from 'react-router-dom'

// Define the base URL for your backend fixture API
const API_BASE_URL = 'http://localhost:5000/fixture'
const PLAYERS_API_URL = 'http://localhost:5000/player'
const API_Match_EVENT_URL = 'http://localhost:5000/match-events'
interface Player {
  _id: string;
  name: string;
  team: {
    _id: string;
    id?: number;
    code: string;
    name: string;
    logo: string;
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
  useEffect(() => {
    const fetchMatchEvents = async () => {
      try {
        const response = await axios.get(`${API_Match_EVENT_URL}/match/${id}`)
        setMatchEvents(response.data)
      } catch (error) {
        console.error('Error fetching match events:', error)
      }
    }

    if (id) {
      fetchMatchEvents()
    }
  }, [id])

  // Get players for selected team
  const getTeamPlayers = (teamId: string) => {
    console.log('Filtering players for team:', teamId);
    console.log('All players:', players);
    const teamPlayers = players.filter(player => {
      console.log('Player team ID:', player.team._id, 'Selected team ID:', teamId);
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

  // Function to render event details based on event type
  const renderEventDetails = (event: MatchEvent) => {
    switch (event.eventType) {
      case 'goal':
        return (
          <div className="event-item">
            <span className="time">{event.time}'</span>
            <span className="event-type">⚽</span>
            <span className="player">{event.player?.name}</span>
            {event.assist && <span className="assist">(Assist: {event.assist?.name})</span>}
            {event.goalType === 'penalty' && <span className="goal-type">(Penalty)</span>}
            {event.goalType === 'own_goal' && <span className="goal-type">(Own Goal)</span>}
          </div>
        )
      case 'sanction':
        return (
          <div className="event-item">
            <span className="time">{event.time}'</span>
            <span className="event-type">🟥</span>
            <span className="player">{event.player?.name}</span>
            <span className="card-type">({event.card})</span>
          </div>
        )
      case 'substitution':
        return (
          <div className="event-item">
            <span className="time">{event.time}'</span>
            <span className="event-type">🔄</span>
            <span className="player-out">{event.substitutionPlayerOut?.name}</span>
            <span className="arrow">→</span>
            <span className="player-in">{event.substitutionPlayerIn?.name}</span>
          </div>
        )
      case 'penalty_save':
        return (
          <div className="event-item">
            <span className="time">{event.time}'</span>
            <span className="event-type">🧤</span>
            <span className="player">{event.player?.name}</span>
            <span className="save-type">(Penalty Save)</span>
          </div>
        )
      default:
        return null
    }
  }

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
    <div >
      <h1>Match Details</h1>
      {match && (
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title">Match Information</h5>
            <p><strong>Round:</strong> {match.round}</p>
            <p><strong>Date:</strong> {new Date(match.date).toLocaleString()}</p>
            <p><strong>Stadium:</strong> {match.stadename}, {match.stadecity}</p>
            <p><strong>Referee:</strong> {match.referee}</p>
            <p><strong>Status:</strong> {match.statuslong}</p>
          </div>
        </div>
      )}
      <div className="row mt-4">
        <div className="col-md-3">
          <button 
            className="btn w-100 mb-2"
            onClick={() => setShowGoalModal(true)}
            style={{ backgroundColor: '#6C757D', color: 'white' }}
          >
            Ajouter But
          </button>
        </div>
        <div className="col-md-3">
          <button 
            className="btn w-100 mb-2"
            onClick={() => setShowSubstitutionModal(true)}
            style={{ backgroundColor: '#6C757D', color: 'white' }}
          >
            Ajouter Remplacement
          </button>
        </div>
        <div className="col-md-3">
          <button 
            className="btn w-100 mb-2"
            onClick={() => setShowRedCardModal(true)}
            style={{ backgroundColor: '#6C757D', color: 'white' }}
          >
            Ajouter Carte Rouge
          </button>
        </div>
        <div className="col-md-3">
          <button 
            className="btn w-100 mb-2"
            onClick={() => setShowPenaltySaveModal(true)}
            style={{ backgroundColor: '#6C757D', color: 'white' }}
          >
            Ajouter Arrêt de Pénalité
          </button>
        </div>
      </div>
      <div className="row mt-2">
        <div className="col-md-3">
          <button 
            className="btn w-100 mb-2"
            onClick={() => setShowBonusPointModal(true)}
            style={{ backgroundColor: '#6C757D', color: 'white' }}
          >
            Ajouter Point Bonus
          </button>
        </div>
      </div>

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

      {/* Match Events Display */}
      <div className="mt-4">
        <h3>Match Events</h3>
        <div className="match-events">
          {matchEvents.length === 0 ? (
            <p>No events recorded for this match</p>
          ) : (
            matchEvents
              .sort((a, b) => a.time - b.time)
              .map((event, index) => (
                <div key={index} className="event-container">
                  {renderEventDetails(event)}
                </div>
              ))
          )}
        </div>
      </div>

      {/* Add some CSS for the events display */}
      <style>
        {`
          .match-events {
            margin-top: 20px;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 8px;
          }
          .event-container {
            padding: 10px;
            border-bottom: 1px solid #dee2e6;
          }
          .event-item {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .time {
            font-weight: bold;
            min-width: 40px;
          }
          .event-type {
            font-size: 1.2em;
          }
          .player, .player-out, .player-in {
            font-weight: 500;
          }
          .assist, .goal-type, .card-type, .save-type {
            color: #6c757d;
            font-size: 0.9em;
          }
          .arrow {
            color: #6c757d;
          }
        `}
      </style>
    </div>
  )
}

export default DetailsMatch
