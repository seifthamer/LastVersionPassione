import { create } from 'zustand';
import { AxiosError } from 'axios';
import axiosInstance from './axiosConfig';

interface EntAdjoints {
  entadj1: string;
  entadj2: string;
}

interface Staf {
  entprincipal: string;
  entadjoints: EntAdjoints;
  manager: string;
  entgardien: string;
  prepphysique: string;
  analystedonnes: string;
  kine: string;
  kineadjoint: string;
  medecins: { medc1: string; medc2: string };
  administration: { president: string; vicepresident: string };
  recruteurs: { recr1: string; recr2: string };
}

interface Team {
  id: string;
  _id?: string;
  name: string;
  code: string;
  country: string;
  city: string;
  founded: string;
  logo: string;
  group: string;
  createdAt: string;
  staf: Staf;
}

interface PaginationParams {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface SortParams {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface EquipeStore {
  teams: Team[];
  loading: boolean;
  error: string | null;
  pagination: PaginationParams;
  sort: SortParams;
  fetchTeams: (params?: { page?: number; limit?: number; sortBy?: string; sortOrder?: 'asc' | 'desc'; search?: string }) => Promise<void>;
  addTeam: (formData: FormData) => Promise<void>;
  updateTeam: (id: string, formData: FormData) => Promise<void>;
  deleteTeam: (id: string) => Promise<void>;
  searchTeams: (searchTerm: string) => Team[];
}

const API_BASE_URL = 'http://localhost:5000';

export const useEquipeStore = create<EquipeStore>((set, get) => ({
  teams: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  },
  sort: {
    sortBy: 'name',
    sortOrder: 'asc'
  },

  fetchTeams: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const { page = 1, limit = 10, sortBy = 'name', sortOrder = 'asc', search = '' } = params;
      
      // Build query string
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
        ...(search && { search })
      });

      console.log('Fetching teams...');
      const response = await axiosInstance.get(`${API_BASE_URL}/team?${queryParams}`);
      console.log('Teams response:', response.data);

      // Handle both old and new response formats
      const responseData = response.data;
      const teams = responseData.data || responseData.teams || [];
      const pagination = responseData.pagination || {
        page: responseData.meta?.currentPage || page,
        limit: responseData.meta?.limit || limit,
        total: responseData.meta?.total || teams.length,
        pages: responseData.meta?.totalPages || Math.ceil(teams.length / limit)
      };
      const sort = responseData.sort || {
        sortBy,
        sortOrder
      };

      set({ 
        teams,
        pagination,
        sort,
        loading: false 
      });
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Error fetching teams:', axiosError);
      set({ 
        error: axiosError.response?.data?.message || 'Failed to fetch teams', 
        loading: false,
        teams: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0
        },
        sort: {
          sortBy: 'name',
          sortOrder: 'asc'
        }
      });
    }
  },

  addTeam: async (formData: FormData) => {
    set({ loading: true, error: null });
    try {
      console.log('Adding team:', formData);
      const response = await axiosInstance.post(`${API_BASE_URL}/team`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Add team response:', response.data);
      set((state) => ({
        teams: [...state.teams, response.data.data],
        loading: false,
      }));
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Error adding team:', axiosError);
      set({ 
        error: axiosError.response?.data?.message || 'Failed to add team', 
        loading: false 
      });
      throw error;
    }
  },

  updateTeam: async (id: string, formData: FormData) => {
    set({ loading: true, error: null });
    try {
      console.log('Updating team:', { id, formData });
      const response = await axiosInstance.put(`${API_BASE_URL}/team/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Update team response:', response.data);
      
      const updatedTeam = response.data.data;
      
      set((state) => ({
        teams: state.teams.map((t) => (t._id === id ? updatedTeam : t)),
        loading: false,
      }));
      
      return updatedTeam;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Error updating team:', axiosError);
      set({ 
        error: axiosError.response?.data?.message || 'Failed to update team', 
        loading: false 
      });
      throw error;
    }
  },

  deleteTeam: async (id: string) => {
    set({ loading: true, error: null });
    try {
      console.log('Deleting team:', id);
      const response = await axiosInstance.delete(`${API_BASE_URL}/team/${id}`);
      console.log('Delete team response:', response.data);
      set((state) => ({
        teams: state.teams.filter((t) => t._id !== id),
        loading: false,
      }));
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Error deleting team:', axiosError);
      set({ 
        error: axiosError.response?.data?.message || 'Failed to delete team', 
        loading: false 
      });
      throw error;
    }
  },

  searchTeams: (searchTerm: string) => {
    const teams = get().teams;
    if (!searchTerm) return teams;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return teams.filter((team) =>
      Object.values(team).some((value) =>
        String(value).toLowerCase().includes(lowerSearchTerm)
      )
    );
  },
}));