import { Project, CreateProjectRequest, UpdateProjectRequest, DashboardStats, ApiResponse, ProjectStats, RealtimeEvent, EventTypeStats, CountryStats, PageStats } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1';

class ApiService {
  private async fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Project Management
  async getProjects(limit = 50, offset = 0): Promise<ApiResponse<Project[]>> {
    return this.fetchApi(`/admin/projects?limit=${limit}&offset=${offset}`);
  }

  async getProject(id: string): Promise<ApiResponse<Project>> {
    return this.fetchApi(`/admin/projects/${id}`);
  }

  async createProject(data: CreateProjectRequest): Promise<ApiResponse<Project>> {
    return this.fetchApi('/admin/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProject(id: string, data: UpdateProjectRequest): Promise<ApiResponse<Project>> {
    return this.fetchApi(`/admin/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProject(id: string): Promise<ApiResponse<any>> {
    return this.fetchApi(`/admin/projects/${id}`, {
      method: 'DELETE',
    });
  }

  async regenerateApiKey(id: string): Promise<ApiResponse<Project>> {
    return this.fetchApi(`/admin/projects/${id}/regenerate-key`, {
      method: 'POST',
    });
  }

  async getTrackingScript(id: string): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/admin/projects/${id}/script`);
    if (!response.ok) {
      throw new Error('Failed to fetch tracking script');
    }
    return response.text();
  }

  async downloadTrackingScript(id: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/admin/projects/${id}/script/download`);
    if (!response.ok) {
      throw new Error('Failed to download tracking script');
    }
    return response.blob();
  }

  // Analytics
  async getDashboardStats(): Promise<DashboardStats> {
    return this.fetchApi('/dashboard');
  }

  async getEventsByDay(days = 7): Promise<{ data: Array<{ date: string; event_count: number }>; days: number }> {
    return this.fetchApi(`/analytics/events-by-day?days=${days}`);
  }

  async getTopPages(limit = 10): Promise<Array<{ page_url: string; page_title: string; event_count: number }>> {
    return this.fetchApi(`/analytics/top-pages?limit=${limit}`);
  }

  async getTopCountries(limit = 10): Promise<Array<{ country: string; event_count: number }>> {
    return this.fetchApi(`/analytics/top-countries?limit=${limit}`);
  }

  async getTopEventTypes(limit = 10): Promise<Array<{ event_type: string; event_count: number }>> {
    const response = await this.fetchApi<{ data: Array<{ event_type: string; event_count: number }> }>(`/analytics/top-event-types?limit=${limit}`);
    return response.data || [];
  }

  // Real-time analytics methods
  async getProjectStats(projectId: string): Promise<ProjectStats> {
    const response = await this.fetchApi<{ stats: ProjectStats }>(`/admin/projects/${projectId}/realtime/stats`);
    return response.stats;
  }

  async getRecentEvents(projectId: string, limit = 50): Promise<RealtimeEvent[]> {
    const response = await this.fetchApi<{ events: RealtimeEvent[] }>(`/admin/projects/${projectId}/realtime/events?limit=${limit}`);
    return response.events || [];
  }

  async getProjectEventTypes(projectId: string, limit = 10): Promise<EventTypeStats[]> {
    const response = await this.fetchApi<{ stats: EventTypeStats[] }>(`/admin/projects/${projectId}/realtime/event-types?limit=${limit}`);
    return response.stats || [];
  }

  async getProjectCountries(projectId: string, limit = 10): Promise<CountryStats[]> {
    const response = await this.fetchApi<{ stats: CountryStats[] }>(`/admin/projects/${projectId}/realtime/countries?limit=${limit}`);
    return response.stats || [];
  }

  async getProjectPages(projectId: string, limit = 10): Promise<PageStats[]> {
    const response = await this.fetchApi<{ stats: PageStats[] }>(`/admin/projects/${projectId}/realtime/pages?limit=${limit}`);
    return response.stats || [];
  }

  // WebSocket connection helper
  createWebSocket(projectId: string): WebSocket {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsURL = `${wsProtocol}//${window.location.host}/api/v1/admin/projects/${projectId}/ws`;
    return new WebSocket(wsURL);
  }
}

export const apiService = new ApiService();
