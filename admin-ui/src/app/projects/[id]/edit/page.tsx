'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Globe, Key, Code, Download, Copy, Check, RefreshCw, Save, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Project, UpdateProjectRequest } from '@/types';
import { apiService } from '@/lib/api';
import { formatDate } from '@/lib/utils';

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [script, setScript] = useState('');
  const [scriptLoading, setScriptLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [regeneratingKey, setRegeneratingKey] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    description: '',
    owner_name: '',
    owner_email: '',
    is_active: true,
  });

  useEffect(() => {
    if (params.id) {
      loadProject();
    }
  }, [params.id]);

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        domain: project.domain,
        description: project.description || '',
        owner_name: project.owner_name,
        owner_email: project.owner_email,
        is_active: project.is_active,
      });
      loadScript();
    }
  }, [project]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProject(params.id as string);
      const projectData = response.project || response.data;
      if (projectData) {
        setProject(projectData);
      } else {
        throw new Error('Project not found');
      }
    } catch (error) {
      console.error('Failed to load project:', error);
      toast.error('Failed to load project');
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const loadScript = async () => {
    if (!project) return;
    
    try {
      setScriptLoading(true);
      const scriptContent = await apiService.getTrackingScript(project.id);
      setScript(scriptContent);
    } catch (error) {
      console.error('Failed to load script:', error);
      toast.error('Failed to load tracking script');
    } finally {
      setScriptLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.domain || !formData.owner_name || !formData.owner_email) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      const response = await apiService.updateProject(params.id as string, formData);
      const updatedProject = response.project || response.data;
      if (updatedProject) {
        setProject(updatedProject);
        toast.success('Project updated successfully');
      }
    } catch (error) {
      console.error('Failed to update project:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update project');
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerateAPIKey = async () => {
    if (!project) return;
    
    try {
      setRegeneratingKey(true);
      const response = await apiService.regenerateApiKey(project.id);
      const updatedProject = response.project || response.data;
      if (updatedProject) {
        setProject(updatedProject);
        await loadScript(); // Reload script with new API key
        toast.success('API key regenerated successfully');
      }
    } catch (error) {
      console.error('Failed to regenerate API key:', error);
      toast.error('Failed to regenerate API key');
    } finally {
      setRegeneratingKey(false);
    }
  };

  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(script);
      setCopied(true);
      toast.success('Script copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy script:', error);
      toast.error('Failed to copy script');
    }
  };

  const handleDownloadScript = async () => {
    if (!project) return;
    
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

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5">
        <div className="text-center">
          <div className="w-16 h-16 analytics-gradient rounded-full flex items-center justify-center mb-4 mx-auto">
            <Globe className="h-8 w-8 text-white animate-pulse" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Loading Project</h3>
          <p className="text-muted-foreground">Please wait...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Project not found</h3>
          <Button onClick={() => router.push('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => router.push('/')}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Edit Project
              </h1>
              <p className="text-muted-foreground">
                Update project settings and generate tracking scripts
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => router.push(`/projects/${project.id}/realtime`)}
              className="flex items-center"
            >
              <Activity className="h-4 w-4 mr-2" />
              Real-time Analytics
            </Button>
            <Badge 
              variant={project.is_active ? "default" : "secondary"}
              className={project.is_active ? "bg-success text-success-foreground" : ""}
            >
              {project.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Project Settings */}
          <Card className="analytics-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Project Settings
              </CardTitle>
              <CardDescription>
                Update your project information and configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Project Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="My Website"
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="domain">Domain *</Label>
                  <Input
                    id="domain"
                    value={formData.domain}
                    onChange={(e) => handleChange('domain', e.target.value)}
                    placeholder="example.com"
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Optional project description"
                    rows={3}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="owner_name">Owner Name *</Label>
                  <Input
                    id="owner_name"
                    value={formData.owner_name}
                    onChange={(e) => handleChange('owner_name', e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="owner_email">Owner Email *</Label>
                  <Input
                    id="owner_email"
                    type="email"
                    value={formData.owner_email}
                    onChange={(e) => handleChange('owner_email', e.target.value)}
                    placeholder="john@example.com"
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => handleChange('is_active', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="is_active">Project is active</Label>
                </div>

                <Button type="submit" disabled={saving} className="w-full analytics-gradient">
                  {saving ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </form>

              {/* Project Info */}
              <div className="mt-6 pt-6 border-t space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-medium">Project ID:</span>
                  <code className="bg-muted px-2 py-1 rounded text-xs">{project.id}</code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-medium">Created:</span>
                  <span>{formatDate(project.created_at)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-medium">Last Updated:</span>
                  <span>{formatDate(project.updated_at)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Key & Tracking Script */}
          <div className="space-y-8">
            {/* API Key Section */}
            <Card className="analytics-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="h-5 w-5 mr-2" />
                  API Key Management
                </CardTitle>
                <CardDescription>
                  Your unique API key for tracking events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Current API Key</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="bg-muted px-3 py-2 rounded flex-1 text-sm font-mono border">
                        {project.api_key}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigator.clipboard.writeText(project.api_key)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <Button 
                    variant="destructive" 
                    onClick={handleRegenerateAPIKey}
                    disabled={regeneratingKey}
                    className="w-full"
                  >
                    {regeneratingKey ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Regenerating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Regenerate API Key
                      </>
                    )}
                  </Button>
                  
                  <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                    <p className="font-medium mb-1">⚠️ Warning:</p>
                    <p>Regenerating the API key will invalidate the current tracking script. You'll need to update all websites using this project.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tracking Script */}
            <Card className="analytics-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Code className="h-5 w-5 mr-2" />
                  Tracking Script
                </CardTitle>
                <CardDescription>
                  Copy this script to your website to start tracking events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scriptLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-sm text-muted-foreground">Loading script...</div>
                    </div>
                  ) : (
                    <div className="relative">
                      <pre className="bg-muted p-4 rounded-md text-sm overflow-auto max-h-[300px] border">
                        <code>{script}</code>
                      </pre>
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute top-2 right-2"
                        onClick={handleCopyScript}
                      >
                        {copied ? (
                          <>
                            <Check className="h-3 w-3 mr-1" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button onClick={handleCopyScript} variant="outline" className="flex-1">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Script
                    </Button>
                    <Button onClick={handleDownloadScript} variant="outline" className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>

                  {/* Integration Instructions */}
                  <div className="bg-muted/50 p-4 rounded-md text-sm">
                    <p className="font-medium mb-2">📋 Integration Instructions:</p>
                    <ol className="text-muted-foreground space-y-1 text-xs ml-4">
                      <li>1. Copy the script above or download it as a file</li>
                      <li>2. Include it in your website's &lt;head&gt; section</li>
                      <li>3. The script will automatically start tracking page views</li>
                      <li>4. Use <code className="bg-muted px-1 rounded">analytics.track()</code> to send custom events</li>
                    </ol>
                  </div>

                  {/* Usage Example */}
                  <div className="bg-muted/50 p-4 rounded-md text-sm">
                    <p className="font-medium mb-2">💡 Usage Example:</p>
                    <pre className="text-xs text-muted-foreground bg-background p-2 rounded border">
{`<script src="analytics-${project.domain}.js"></script>
<script>
  // Track custom events
  analytics.track('button_click', 'Subscribe Button', {
    location: 'header',
    campaign: 'newsletter'
  });
</script>`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
