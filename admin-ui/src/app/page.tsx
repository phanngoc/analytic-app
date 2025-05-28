'use client';

import { useState, useEffect } from 'react';
import { Plus, TrendingUp, Users, Globe, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectCard } from '@/components/project-card';
import { ProjectFormDialog } from '@/components/project-form-dialog';
import { ScriptViewerDialog } from '@/components/script-viewer-dialog';
import { apiService } from '@/lib/api';
import { Project, DashboardStats } from '@/types';

export default function AdminDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showScriptDialog, setShowScriptDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [projectsResponse, dashboardStats] = await Promise.all([
        apiService.getProjects(),
        apiService.getDashboardStats()
      ]);
      
      setProjects(projectsResponse.projects || []);
      setStats(dashboardStats);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleProjectCreated = (project: Project) => {
    setProjects(prev => [project, ...prev]);
    setShowCreateDialog(false);
  };

  const handleProjectDeleted = async (project: Project) => {
    if (!confirm(`Are you sure you want to delete "${project.name}"?`)) return;
    
    try {
      await apiService.deleteProject(project.id);
      setProjects(prev => prev.filter(p => p.id !== project.id));
      toast.success('Project deleted successfully');
    } catch (error) {
      console.error('Failed to delete project:', error);
      toast.error('Failed to delete project');
    }
  };

  const handleRegenerateKey = async (project: Project) => {
    if (!confirm(`Are you sure you want to regenerate the API key for "${project.name}"? This will invalidate the current tracking script.`)) return;
    
    try {
      const response = await apiService.regenerateApiKey(project.id);
      const updatedProject = response.project || response.data;
      if (updatedProject) {
        setProjects(prev => 
          prev.map(p => p.id === updatedProject.id ? updatedProject : p)
        );
        toast.success('API key regenerated successfully');
      }
    } catch (error) {
      console.error('Failed to regenerate API key:', error);
      toast.error('Failed to regenerate API key');
    }
  };

  const handleDownloadScript = async (project: Project) => {
    try {
      const blob = await apiService.downloadTrackingScript(project.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${project.domain}.js`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Script downloaded successfully');
    } catch (error) {
      console.error('Failed to download script:', error);
      toast.error('Failed to download script');
    }
  };

  const handleViewScript = (project: Project) => {
    setSelectedProject(project);
    setShowScriptDialog(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5">
        <div className="text-center">
          <div className="w-16 h-16 analytics-gradient rounded-full flex items-center justify-center mb-4 mx-auto">
            <Activity className="h-8 w-8 text-white animate-pulse-analytics" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Loading Analytics Hub</h3>
          <p className="text-muted-foreground">Preparing your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mb-4 mx-auto">
            <Activity className="h-8 w-8 text-error" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-error">Error Loading Dashboard</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button 
            onClick={loadData} 
            variant="outline"
            className="border-error text-error hover:bg-error hover:text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5">
      {/* Header */}
      <div className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 analytics-gradient rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                  Analytics Hub
                </h1>
                <p className="text-muted-foreground">
                  Professional analytics platform for data-driven insights
                </p>
              </div>
            </div>
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="analytics-gradient hover:shadow-analytics-hover transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        {stats && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card className="metric-card border-l-4 border-l-primary hover:shadow-analytics-hover transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Projects</CardTitle>
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Globe className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stats.total_projects || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Active tracking projects
                </p>
              </CardContent>
            </Card>

            <Card className="metric-card border-l-4 border-l-secondary hover:shadow-analytics-hover transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Events</CardTitle>
                <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <Activity className="h-4 w-4 text-secondary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{(stats.total_events || 0).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  All time events tracked
                </p>
              </CardContent>
            </Card>

            <Card className="metric-card border-l-4 border-l-success hover:shadow-analytics-hover transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Today's Events</CardTitle>
                <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-success" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{(stats.events_today || 0).toLocaleString()}</div>
                <p className="text-xs text-success metric-positive font-medium mt-1">
                  {stats.events_today && stats.events_today > 0 ? '+' : ''}Events tracked today
                </p>
              </CardContent>
            </Card>

            <Card className="metric-card border-l-4 border-l-chart-6 hover:shadow-analytics-hover transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
                <div className="w-8 h-8 bg-chart-6/10 rounded-lg flex items-center justify-center">
                  <Users className="h-4 w-4 text-chart-6" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stats.unique_users_today || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Unique users today
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Projects Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Projects
              </h2>
              <p className="text-muted-foreground">
                Manage your analytics tracking projects
              </p>
            </div>
          </div>

          {projects.length === 0 ? (
            <Card className="analytics-card">
              <CardContent className="flex flex-col items-center justify-center py-16 px-8">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center mb-6">
                  <Globe className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">No projects yet</h3>
                <p className="text-muted-foreground text-center mb-6 max-w-md leading-relaxed">
                  Create your first analytics project to start tracking user events and gaining valuable insights into your application's performance.
                </p>
                <Button 
                  onClick={() => setShowCreateDialog(true)}
                  className="analytics-gradient hover:shadow-analytics-hover transition-all duration-200"
                  size="lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Project
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onDelete={handleProjectDeleted}
                  onRegenerateKey={handleRegenerateKey}
                  onDownloadScript={handleDownloadScript}
                  onViewScript={handleViewScript}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Project Dialog */}
      <ProjectFormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleProjectCreated}
      />

      {/* Script Viewer Dialog */}
      <ScriptViewerDialog
        isOpen={showScriptDialog}
        onClose={() => {
          setShowScriptDialog(false);
          setSelectedProject(null);
        }}
        project={selectedProject}
      />
    </div>
  );
}
