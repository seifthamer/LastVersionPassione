import { AxiosError } from 'axios';
import axiosInstance from './axiosConfig';

// Define the base URL for your backend player API
// Ensure this matches where your backend is running
export const API_BASE_URL = 'http://localhost:5000/player'; // Check port and base path

// --- Interfaces based on Backend PlayerSchema ---

// Represents the nested 'team' object within the Player schema
// IMPORTANT: When creating/updating a player, you likely need to send at least the team's _id.
interface TeamRef {
  _id: string; // The Mongoose ObjectId of the Team document (Likely required)
  id?: number;  // The numeric team ID (if used)
  code?: string;
  name?: string;
  logo?: string;
}

// Represents the structure within the 'points' array (optional for basic CRUD)
interface PlayerPoint {
  round?: string;
  total?: number;
}

// Add interface for Team data
export interface Team {
  _id: string;
  name: string;
  code: string;
  logo?: string;
}

// Add interface for team response
interface TeamResponse {
  message: string;
  teams: Team[];
  meta: {
    currentPage: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Update getTeamById to fetch actual team data
export const getTeamById = async (id: string): Promise<Team | null> => {
  try {
    const response = await axiosInstance.get<{ data: Team; status: string }>(`http://localhost:5000/team/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching team:', error);
    return null;
  }
};

// Update getAllTeams function
export const getAllTeams = async (): Promise<Team[]> => {
  try {
    const response = await axiosInstance.get<TeamResponse>('http://localhost:5000/team');
    console.log('Teams API Response:', response.data);
    if (response.data && response.data.teams) {
      return response.data.teams;
    } else {
      console.error('Unexpected response format from GET /team:', response.data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching teams:', error);
    throw error;
  }
};

// Main Player interface - Should match your Mongoose PlayerSchema
export interface Player {
  _id?: string; // Mongoose document ID (from backend)
  team: TeamRef; // REQUIRED nested object
  name: string;
  age: number; // Should be number based on schema
  number: number; // Should be number based on schema
  position: string;
  logo?: string; // Player-specific photo/logo URL
  value?: string;
  value_passionne?: number; // Should be number
  height?: string;
  points?: PlayerPoint[];
  availabilityStatus?: 'available' | 'willNotPlay' | 'uncertain'; // Enum based on schema
  availabilityReason?: string; // Required if status is not 'available'
  mvp?: boolean;
  isInjured?: boolean;
  redCard?: boolean;
}

// Type for data used when CREATING a player
// MUST align with what the `POST /player` endpoint expects in req.body
// Note the 'team' object requires at least the team's _id.
export type CreatePlayerData = {
    team: { _id: string;
    teamname:string; /* Include other team fields if needed/sent */ }; // Team reference is crucial
    name: string;
    age: number;
    number: number;
    position: string;
    logo?: string;
    value?: string;
    value_passionne?: number;
    height?: string;
    availabilityStatus?: 'available' | 'willNotPlay' | 'uncertain';
    availabilityReason?: string;
    // mvp, isInjured, redCard typically default to false on backend
};

// Type for data used when UPDATING a player (usually partial)
// MUST align with what the `PUT /player/:id` endpoint expects in req.body
export type UpdatePlayerData = Partial<Omit<Player, '_id'>>; // Allow partial updates, _id is immutable

// --- API Service Functions ---

/**
 * Fetches all players from the backend.
 * Corresponds to: GET /player
 * @returns Promise<Player[]>
 */
export const getAllPlayers = async (): Promise<Player[]> => {
  try {
    // Backend wraps the array in a 'data' property
    const response = await axiosInstance.get<{ data: Player[]; status: string }>(API_BASE_URL);
    console.log("API Response (getAllPlayers):", response.data);
    if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
    } else {
        console.error("Unexpected response format from GET /player:", response.data);
        return [];
    }
  } catch (error) {
    console.error('Error fetching all players:', error);
    throw error; // Re-throw for component error handling
  }
};

/**
 * Fetches a single player by their Mongoose _id.
 * Corresponds to: GET /player/:id
 * @param id The Mongoose _id of the player.
 * @returns Promise<Player | null>
 */
export const getPlayerById = async (id: string): Promise<Player | null> => {
  if (!id) {
    console.error("getPlayerById requires a valid ID.");
    return null;
  }
  try {
    // Backend wraps the object in 'data'
    const response = await axiosInstance.get<{ data: Player; status: string }>(`${API_BASE_URL}/${id}`);
    console.log(`API Response (getPlayerById ${id}):`, response.data);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching player with id ${id}:`, error);
    if (axiosInstance.isAxiosError(error) && error.response?.status === 404) {
      return null; // Not found
    }
    throw error;
  }
};

/**
 * Fetches all players belonging to a specific team by the Team's Mongoose _id.
 * Corresponds to: GET /player/team/:id
 * @param teamId The Mongoose _id of the Team.
 * @returns Promise<Player[]>
 */
export const getPlayersByTeamId = async (teamId: string): Promise<Player[]> => {
    if (!teamId) {
        console.error("getPlayersByTeamId requires a valid team ID.");
        return [];
    }
    try {
        // Backend wraps the array in 'data'
        const response = await axiosInstance.get<{ data: Player[]; status: string; teamId: string }>(`${API_BASE_URL}/team/${teamId}`);
        console.log(`API Response (getPlayersByTeamId ${teamId}):`, response.data);
        if (response.data && Array.isArray(response.data.data)) {
            return response.data.data;
        } else {
            console.error(`Unexpected response format from GET /player/team/${teamId}:`, response.data);
            return [];
        }
    } catch (error) {
        console.error(`Error fetching players for team id ${teamId}:`, error);
        throw error;
    }
};


/**
 * Creates a new player.
 * Corresponds to: POST /player
 * @param playerData The data for the new player.
 * >>> IMPORTANT <<< : This data object MUST be correctly structured and mapped
 * >>> from your frontend form data (`PlayerForm`) BEFORE being passed here.
 * >>> It needs to match the backend `PlayerSchema`, especially the nested `team` object ({ _id: 'teamObjectId' }).
 * @returns Promise<Player> The newly created player object from the backend.
 */
export const createPlayer = async (playerData: CreatePlayerData): Promise<Player> => {
  console.log("Sending data to createPlayer:", playerData); // Log data being sent

  // --- MAPPING REQUIRED BEFORE CALLING ---
  // The `PlayerForm` in Joueur.tsx has flat team properties (team_id, team_code, etc.).
  // The backend `PlayerSchema` expects a nested `team` object, primarily needing `team._id`.
  // You MUST transform the flat form data into the nested structure required by CreatePlayerData.
  // Example conceptual mapping (implement this logic in Joueur.tsx before calling createPlayer):
  /*
  const backendReadyData: CreatePlayerData = {
      name: formData.name,
      age: parseInt(formData.age, 10), // Convert form string to number
      number: parseInt(formData.number, 10), // Convert form string to number
      position: formData.position,
      team: {
          _id: formData.team_id, // Assuming team_id in the form IS the Team's Mongoose _id
          // Potentially add code/name/logo if your backend uses them during player creation
          // code: formData.team_code,
          // name: formData.team_name,
          // logo: formData.team_logo,
      },
      logo: formData.logo, // Player photo URL
      value: formData.value,
      value_passionne: parseInt(formData.value_passionne, 10), // Convert
      height: formData.height,
      availabilityStatus: formData.availabilityStatus as Player['availabilityStatus'], // Cast type
      // availabilityReason: ??? // Need a field for this in the form if status is not 'available'
  };
  */
  // Assuming 'playerData' argument is ALREADY correctly mapped:
  try {
    // Backend returns the created object wrapped in 'data'
    const response = await axiosInstance.post<{ data: Player; status: string }>(API_BASE_URL, playerData);
    console.log("API Response (createPlayer):", response.data);
    return response.data.data;
  } catch (error) {
    console.error('Error creating player:', error);
    if (axiosInstance.isAxiosError(error) && error.response?.data) {
      console.error("Backend Error Data:", error.response.data); // Log validation errors etc.
    }
    throw error;
  }
};

/**
 * Updates an existing player by their Mongoose _id.
 * Corresponds to: PUT /player/:id
 * @param id The Mongoose _id of the player to update.
 * @param playerData An object containing the fields to update.
 * >>> IMPORTANT <<< : This data object MUST be correctly structured and mapped
 * >>> from your frontend form data. Keys should match backend `PlayerSchema`.
 * >>> Ensure nested `team` object is handled correctly if it's updatable.
 * @returns Promise<Player> The updated player object from the backend.
 */
export const updatePlayer = async (id: string, playerData: UpdatePlayerData): Promise<Player> => {
  if (!id) {
    console.error("updatePlayer requires a valid ID.");
    throw new Error("Update requires a valid player ID.");
  }
  console.log(`Sending data to updatePlayer ${id}:`, playerData);

  // --- MAPPING REQUIRED BEFORE CALLING ---
  // Similar to createPlayer, map flat form data (`PlayerForm`) to the potentially
  // nested structure of UpdatePlayerData (matching PlayerSchema) before sending.
  // Convert string numbers from form to actual numbers for fields like age, number, value_passionne.
  // Ensure the 'team._id' is correctly included if the team association is being updated.

  // Assuming 'playerData' argument is ALREADY correctly mapped:
  try {
    // Backend returns the updated object wrapped in 'data'
    const response = await axiosInstance.put<{ data: Player; status: string }>(`${API_BASE_URL}/${id}`, playerData);
    console.log("API Response (updatePlayer):", response.data);
    return response.data.data;
  } catch (error) {
    console.error(`Error updating player with id ${id}:`, error);
    if (axiosInstance.isAxiosError(error) && error.response?.data) {
      console.error("Backend Error Data:", error.response.data);
    }
    throw error;
  }
};

/**
 * Deletes a player by their Mongoose _id.
 * Corresponds to: DELETE /player/:id
 * @param id The Mongoose _id of the player to delete.
 * @returns Promise<void>
 */
export const deletePlayer = async (id: string): Promise<void> => {
  if (!id) {
    console.error("deletePlayer requires a valid ID.");
    throw new Error("Delete requires a valid player ID.");
  }
  try {
    // Backend might return the deleted object, but we don't necessarily need it.
    await axiosInstance.delete<{ data: Player; status: string }>(`${API_BASE_URL}/${id}`);
    console.log(`Player ${id} deleted successfully.`);
  } catch (error) {
    console.error(`Error deleting player with id ${id}:`, error);
    throw error;
  }
};