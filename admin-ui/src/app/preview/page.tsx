'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Users, 
  Globe, 
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export default function ColorPreview() {
  const colors = [
    { name: 'Primary', value: '#2563eb', description: 'Trust, Technology, Data' },
    { name: 'Secondary', value: '#7c3aed', description: 'Analytics, Insights' },
    { name: 'Success', value: '#059669', description: 'Growth, Positive Metrics' },
    { name: 'Warning', value: '#d97706', description: 'Attention, Alerts' },
    { name: 'Error', value: '#dc2626', description: 'Errors, Decline' },
    { name: 'Chart 6', value: '#0891b2', description: 'Data Visualization' },
    { name: 'Chart 7', value: '#be185d', description: 'Data Visualization' },
    { name: 'Chart 8', value: '#65a30d', description: 'Data Visualization' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="analytics-heading-1">Analytics Hub Color System</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A professional color palette designed for analytics and data visualization applications
          </p>
        </div>

        {/* Color Palette */}
        <Card className="analytics-card">
          <CardHeader>
            <CardTitle className="analytics-heading-2">Color Palette</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {colors.map((color) => (
                <div key={color.name} className="text-center space-y-2">
                  <div 
                    className="w-full h-20 rounded-lg shadow-analytics"
                    style={{ backgroundColor: color.value }}
                  />
                  <div>
                    <div className="font-semibold text-sm">{color.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">{color.value}</div>
                    <div className="text-xs text-muted-foreground">{color.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sample Dashboard Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="metric-card border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">12,543</div>
              <div className="flex items-center text-xs text-success metric-positive font-medium mt-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +12.5% from last month
              </div>
            </CardContent>
          </Card>

          <Card className="metric-card border-l-4 border-l-secondary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Page Views</CardTitle>
              <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-secondary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">89,234</div>
              <div className="flex items-center text-xs text-success metric-positive font-medium mt-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +8.2% from last month
              </div>
            </CardContent>
          </Card>

          <Card className="metric-card border-l-4 border-l-success">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
              <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">3.24%</div>
              <div className="flex items-center text-xs text-success metric-positive font-medium mt-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +0.3% from last month
              </div>
            </CardContent>
          </Card>

          <Card className="metric-card border-l-4 border-l-warning">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Bounce Rate</CardTitle>
              <div className="w-8 h-8 bg-warning/10 rounded-lg flex items-center justify-center">
                <Activity className="h-4 w-4 text-warning" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">45.6%</div>
              <div className="flex items-center text-xs text-error metric-negative font-medium mt-1">
                <ArrowDownRight className="h-3 w-3 mr-1" />
                +2.1% from last month
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Indicators */}
        <Card className="analytics-card">
          <CardHeader>
            <CardTitle>Status Indicators</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Badge className="status-online">Online</Badge>
              <Badge className="status-warning">Warning</Badge>
              <Badge className="status-error">Error</Badge>
              <Badge variant="secondary">Inactive</Badge>
              <Badge className="bg-primary text-primary-foreground">Active</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Buttons */}
        <Card className="analytics-card">
          <CardHeader>
            <CardTitle>Button Styles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button className="analytics-gradient">Primary Action</Button>
              <Button variant="outline">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button className="btn-analytics">Analytics Style</Button>
            </div>
          </CardContent>
        </Card>

        {/* Sample Chart Containers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="chart-container">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5 text-primary" />
                Analytics Chart
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Chart visualization area</p>
              </div>
            </CardContent>
          </Card>

          <Card className="chart-container">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-secondary" />
                Data Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-gradient-to-r from-secondary/5 to-success/5 rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Pie chart visualization</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
