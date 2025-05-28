'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Activity, 
  Users, 
  Eye, 
  Globe, 
  Clock, 
  Wifi, 
  WifiOff,
  BarChart3,
  MapPin,
  Monitor
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Project, 
  ProjectStats, 
  RealtimeEvent, 
  EventTypeStats, 
  CountryStats, 
  PageStats,
  WebSocketMessage 
} from '@/types';
import { apiService } from '@/lib/api';
import { formatDistance } from 'date-fns';

export default function RealtimePage() {
  const params = useParams();
  const router = useRouter();
  const wsRef = useRef<WebSocket | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [recentEvents, setRecentEvents] = useState<RealtimeEvent[]>([]);
  const [eventTypes, setEventTypes] = useState<EventTypeStats[]>([]);
  const [countries, setCountries] = useState<CountryStats[]>([]);
  const [pages, setPages] = useState<PageStats[]>([]);

  useEffect(() => {
    if (params.id) {
      loadProject();
      loadData();
      setupWebSocket();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [params.id]);

  const loadProject = async () => {
    try {
      const response = await apiService.getProject(params.id as string);
      if (response.project) {
        setProject(response.project);
      }
    } catch (error) {
      console.error('Error loading project:', error);
      toast.error('Failed to load project');
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const projectId = params.id as string;

      const [
        statsData,
        eventsData,
        eventTypesData,
        countriesData,
        pagesData
      ] = await Promise.all([
        apiService.getProjectStats(projectId),
        apiService.getRecentEvents(projectId, 20),
        apiService.getProjectEventTypes(projectId, 5),
        apiService.getProjectCountries(projectId, 5),
        apiService.getProjectPages(projectId, 5)
      ]);

      setStats(statsData);
      setRecentEvents(eventsData);
      setEventTypes(eventTypesData);
      setCountries(countriesData);
      setPages(pagesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load real-time data');
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocket = () => {
    try {
      const ws = apiService.createWebSocket(params.id as string);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        console.log('WebSocket connected');
      };

      ws.onclose = () => {
        setConnected(false);
        console.log('WebSocket disconnected');
        // Attempt to reconnect after 3 seconds
        setTimeout(() => {
          if (params.id) {
            setupWebSocket();
          }
        }, 3000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnected(false);
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          if (message.type === 'new_event' && message.event) {
            // Add new event to the top of the list
            setRecentEvents(prev => [message.event!, ...prev.slice(0, 19)]);
            
            // Refresh stats periodically (every 10 events or so)
            if (Math.random() < 0.1) {
              loadData();
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
    } catch (error) {
      console.error('Error setting up WebSocket:', error);
      setConnected(false);
    }
  };

  const formatEventTime = (timestamp: string) => {
    try {
      return formatDistance(new Date(timestamp), new Date(), { addSuffix: true });
    } catch {
      return 'Unknown time';
    }
  };

  const getEventTypeColor = (eventType: string) => {
    const colors: Record<string, string> = {
      'page_view': 'bg-blue-100 text-blue-800',
      'click': 'bg-green-100 text-green-800',
      'form_submit': 'bg-purple-100 text-purple-800',
      'download': 'bg-orange-100 text-orange-800',
      'custom': 'bg-gray-100 text-gray-800',
    };
    return colors[eventType] || 'bg-gray-100 text-gray-800';
  };

  if (loading && !project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading real-time data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Real-time Analytics</h1>
            <p className="text-muted-foreground">
              Live data for {project?.name || 'Project'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant={connected ? 'default' : 'destructive'} className="flex items-center space-x-1">
            {connected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            <span>{connected ? 'Connected' : 'Disconnected'}</span>
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.current_visitors || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active in last 5 minutes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.active_sessions || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Sessions with recent activity
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Events</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.events_today?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Events tracked today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.total_events?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              All time events
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Events */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Live Events</span>
              {connected && (
                <Badge variant="secondary" className="animate-pulse">
                  Live
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Real-time events as they happen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {recentEvents.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No recent events
                </p>
              ) : (
                recentEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Badge 
                        variant="secondary" 
                        className={getEventTypeColor(event.event_type)}
                      >
                        {event.event_type}
                      </Badge>
                      <div>
                        <p className="font-medium text-sm">{event.event_name}</p>
                        {event.page_url && (
                          <p className="text-xs text-muted-foreground truncate max-w-xs">
                            {event.page_url}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {formatEventTime(event.created_at)}
                      </p>
                      {event.country && (
                        <p className="text-xs text-muted-foreground">
                          {event.country}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Event Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Event Types</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {eventTypes.map((type) => (
                <div key={type.event_type} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{type.event_type}</span>
                  <Badge variant="outline">
                    {type.count.toLocaleString()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Countries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Countries</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {countries.map((country) => (
                <div key={country.country} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{country.country}</span>
                  <Badge variant="outline">
                    {country.count.toLocaleString()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Monitor className="h-5 w-5" />
              <span>Top Pages</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pages.map((page) => (
                <div key={page.page_url} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate max-w-[200px]">
                      {page.page_title || page.page_url}
                    </span>
                    <Badge variant="outline">
                      {page.count.toLocaleString()}
                    </Badge>
                  </div>
                  {page.page_title && (
                    <p className="text-xs text-muted-foreground truncate">
                      {page.page_url}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Last Update Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>Project Info</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">Domain</p>
                <p className="text-sm text-muted-foreground">{project?.domain}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Total Users</p>
                <p className="text-sm text-muted-foreground">
                  {stats?.total_users?.toLocaleString() || 0}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Total Sessions</p>
                <p className="text-sm text-muted-foreground">
                  {stats?.total_sessions?.toLocaleString() || 0}
                </p>
              </div>
              {stats?.last_event_time && (
                <div>
                  <p className="text-sm font-medium">Last Event</p>
                  <p className="text-sm text-muted-foreground">
                    {formatEventTime(stats.last_event_time)}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
