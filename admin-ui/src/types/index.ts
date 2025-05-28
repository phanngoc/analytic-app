export interface Project {
  id: string;
  name: string;
  domain: string;
  api_key: string;
  description?: string;
  owner_name: string;
  owner_email: string;
  total_events: number;
  total_sessions: number;
  total_users: number;
  last_event_time?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectRequest {
  name: string;
  domain: string;
  description?: string;
  owner_name: string;
  owner_email: string;
}

export interface UpdateProjectRequest {
  name?: string;
  domain?: string;
  description?: string;
  owner_name?: string;
  owner_email?: string;
  is_active?: boolean;
}

export interface DashboardStats {
  total_events: number;
  total_sessions: number;
  total_users: number;
  total_projects: number;
  events_today: number;
  sessions_today: number;
  unique_users_today: number;
  unique_visitors_today: number;
  top_pages: Array<{
    page_url: string;
    page_title: string;
    event_count: number;
  }>;
  top_countries: Array<{
    country: string;
    event_count: number;
  }>;
  events_by_day: Array<{
    date: string;
    event_count: number;
  }>;
}

export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  project?: Project;
  projects?: Project[];
  total?: number;
  limit?: number;
  offset?: number;
  message?: string;
  error?: string;
}
