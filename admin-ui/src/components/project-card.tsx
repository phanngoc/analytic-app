'use client';

import { Project } from '@/types';
import { formatNumber, formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MoreHorizontal, 
  Eye, 
  Users, 
  MousePointer, 
  Globe, 
  Calendar,
  Key,
  Download,
  Edit,
  Trash2,
  RefreshCw
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onRegenerateKey: (project: Project) => void;
  onDownloadScript: (project: Project) => void;
  onViewScript: (project: Project) => void;
}

export function ProjectCard({ 
  project, 
  onEdit, 
  onDelete, 
  onRegenerateKey, 
  onDownloadScript,
  onViewScript 
}: ProjectCardProps) {
  return (
    <Card className="analytics-card group hover:scale-[1.02] transition-all duration-200">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 analytics-gradient rounded-lg flex items-center justify-center flex-shrink-0">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-lg font-semibold text-foreground truncate">{project.name}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{project.domain}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge 
            variant={project.is_active ? "default" : "secondary"}
            className={project.is_active ? "bg-success text-success-foreground" : ""}
          >
            {project.is_active ? "Active" : "Inactive"}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(project)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Project
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewScript(project)}>
                <Eye className="h-4 w-4 mr-2" />
                View Script
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDownloadScript(project)}>
                <Download className="h-4 w-4 mr-2" />
                Download Script
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onRegenerateKey(project)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate API Key
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(project)}
                className="text-error hover:bg-error/10 focus:bg-error/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-primary/5 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Eye className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground">{formatNumber(project.total_events)}</div>
            <div className="text-xs text-muted-foreground font-medium">Events</div>
          </div>
          <div className="text-center p-3 bg-secondary/5 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
                <MousePointer className="h-4 w-4 text-secondary" />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground">{formatNumber(project.total_sessions)}</div>
            <div className="text-xs text-muted-foreground font-medium">Sessions</div>
          </div>
          <div className="text-center p-3 bg-chart-6/5 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 bg-chart-6/10 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-chart-6" />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground">{formatNumber(project.total_users)}</div>
            <div className="text-xs text-muted-foreground font-medium">Users</div>
          </div>
        </div>
        
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-medium">Owner:</span>
            <span className="text-foreground">{project.owner_name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-medium">API Key:</span>
            <code className="bg-muted px-2 py-1 rounded text-xs font-mono border">
              {project.api_key.substring(0, 12)}...
            </code>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-medium">Created:</span>
            <span className="flex items-center text-foreground">
              <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
              {formatDate(project.created_at)}
            </span>
          </div>
          {project.last_event_time && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium">Last Event:</span>
              <span className="text-success font-medium">{formatDate(project.last_event_time)}</span>
            </div>
          )}
        </div>
        
        {project.description && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
