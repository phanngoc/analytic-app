'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Globe, Save, Plus, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateProjectRequest } from '@/types';
import { apiService } from '@/lib/api';

export default function CreateProjectPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<CreateProjectRequest>({
    name: '',
    domain: '',
    description: '',
    owner_name: '',
    owner_email: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.domain || !formData.owner_name || !formData.owner_email) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      const response = await apiService.createProject(formData);
      
      if (response.data) {
        toast.success('Project created successfully!');
        router.push('/');
      }
    } catch (error) {
      console.error('Failed to create project:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Failed to create project'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof CreateProjectRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
                Create New Project
              </h1>
              <p className="text-muted-foreground">
                Set up a new analytics project to start tracking user events
              </p>
            </div>
          </div>
          <div className="w-10 h-10 analytics-gradient rounded-lg flex items-center justify-center">
            <Plus className="h-6 w-6 text-white" />
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Main Form */}
          <Card className="analytics-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Project Information
              </CardTitle>
              <CardDescription>
                Enter the details for your new analytics tracking project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Project Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="My Website"
                      required
                      className="text-base"
                    />
                    <p className="text-sm text-muted-foreground">
                      A descriptive name for your project
                    </p>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="domain">Domain *</Label>
                    <Input
                      id="domain"
                      value={formData.domain}
                      onChange={(e) => handleChange('domain', e.target.value)}
                      placeholder="example.com"
                      required
                      className="text-base"
                    />
                    <p className="text-sm text-muted-foreground">
                      The primary domain where tracking will be enabled
                    </p>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description || ''}
                      onChange={(e) => handleChange('description', e.target.value)}
                      placeholder="Optional project description"
                      rows={3}
                      className="text-base"
                    />
                    <p className="text-sm text-muted-foreground">
                      Optional description to help identify this project
                    </p>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Project Owner</h3>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="owner_name">Owner Name *</Label>
                      <Input
                        id="owner_name"
                        value={formData.owner_name}
                        onChange={(e) => handleChange('owner_name', e.target.value)}
                        placeholder="John Doe"
                        required
                        className="text-base"
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
                        className="text-base"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/')}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={saving}
                    className="flex-1 analytics-gradient"
                  >
                    {saving ? (
                      <>
                        <Save className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Create Project
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="analytics-card mt-6">
            <CardHeader>
              <CardTitle className="text-lg">What happens next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">1</span>
                  </div>
                  <div>
                    <p className="font-medium">Project Creation</p>
                    <p className="text-muted-foreground">Your project will be created with a unique API key</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">2</span>
                  </div>
                  <div>
                    <p className="font-medium">Get Tracking Script</p>
                    <p className="text-muted-foreground">Generate and download the tracking script for your website</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">3</span>
                  </div>
                  <div>
                    <p className="font-medium">Start Tracking</p>
                    <p className="text-muted-foreground">Install the script and begin collecting valuable analytics data</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
