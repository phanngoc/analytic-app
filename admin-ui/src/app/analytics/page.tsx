'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Globe, 
  Activity, 
  Eye, 
  MousePointer,
  Calendar,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { DashboardStats } from '@/types';
import { apiService } from '@/lib/api';

interface AnalyticsData {
  visitOverview: Array<{ date: string; visits: number; uniqueVisitors: number }>;
  visitorMap: Array<{ country: string; visitors: number; percentage: number }>;
  visitorSummary: {
    totalVisitors: number;
    uniqueVisitors: number;
    pageViews: number;
    bounceRate: number;
    avgSessionDuration: string;
    newVisitors: number;
    returningVisitors: number;
  };
  referrerSources: Array<{ source: string; visitors: number; percentage: number }>;
}

const CHART_COLORS = [
  '#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', 
  '#0891b2', '#be185d', '#65a30d', '#7c2d12', '#1e40af'
];

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      
      const [
        dashboardStats,
        eventsByDay,
        topCountries,
        topEventTypes,
        topPages
      ] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getEventsByDay(days),
        apiService.getTopCountries(10),
        apiService.getTopEventTypes(10),
        apiService.getTopPages(10)
      ]);

      setStats(dashboardStats);

      // Transform data for charts
      const visitOverview = eventsByDay.data.map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        visits: item.event_count,
        uniqueVisitors: Math.floor(item.event_count * 0.7) // Simulated unique visitors
      }));

      const totalCountryVisitors = topCountries.reduce((sum, country) => sum + (country.event_count || 0), 0);
      const visitorMap = topCountries.map(country => ({
        country: country.country || 'Unknown',
        visitors: country.event_count || 0,
        percentage: totalCountryVisitors > 0 ? ((country.event_count || 0) / totalCountryVisitors * 100) : 0
      }));

      // Simulate referrer data based on event types and pages
      const referrerSources = [
        { source: 'Google Search', visitors: Math.floor((dashboardStats.total_events || 0) * 0.35), percentage: 35 },
        { source: 'Direct', visitors: Math.floor((dashboardStats.total_events || 0) * 0.25), percentage: 25 },
        { source: 'Social Media', visitors: Math.floor((dashboardStats.total_events || 0) * 0.15), percentage: 15 },
        { source: 'Bing Search', visitors: Math.floor((dashboardStats.total_events || 0) * 0.10), percentage: 10 },
        { source: 'Referral Sites', visitors: Math.floor((dashboardStats.total_events || 0) * 0.08), percentage: 8 },
        { source: 'Email', visitors: Math.floor((dashboardStats.total_events || 0) * 0.07), percentage: 7 }
      ];

      const visitorSummary = {
        totalVisitors: dashboardStats.total_users || 0,
        uniqueVisitors: dashboardStats.unique_users_today || 0,
        pageViews: dashboardStats.total_events || 0,
        bounceRate: 42.5, // Simulated
        avgSessionDuration: '2m 34s', // Simulated
        newVisitors: Math.floor((dashboardStats.total_users || 0) * 0.65),
        returningVisitors: Math.floor((dashboardStats.total_users || 0) * 0.35)
      };

      setAnalyticsData({
        visitOverview,
        visitorMap,
        visitorSummary,
        referrerSources
      });

    } catch (err) {
      console.error('Failed to load analytics data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics data');
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading analytics data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2 text-error">Error Loading Analytics</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={loadAnalyticsData} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Analytics Overview
            </h1>
            <p className="text-muted-foreground">
              Comprehensive insights into your website performance
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex rounded-lg border p-1">
              {(['7d', '30d', '90d'] as const).map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTimeRange(range)}
                  className="px-3 py-1 text-xs"
                >
                  {range === '7d' ? '7 days' : range === '30d' ? '30 days' : '90 days'}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Visitor Summary Cards */}
        {analyticsData && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card className="analytics-card border-l-4 border-l-primary">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(analyticsData.visitorSummary.totalVisitors)}</div>
                <p className="text-xs text-muted-foreground">
                  {formatNumber(analyticsData.visitorSummary.newVisitors)} new visitors
                </p>
              </CardContent>
            </Card>

            <Card className="analytics-card border-l-4 border-l-success">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Page Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(analyticsData.visitorSummary.pageViews)}</div>
                <p className="text-xs text-muted-foreground">
                  {formatNumber(analyticsData.visitorSummary.uniqueVisitors)} unique today
                </p>
              </CardContent>
            </Card>

            <Card className="analytics-card border-l-4 border-l-warning">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
                <MousePointer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.visitorSummary.bounceRate}%</div>
                <p className="text-xs text-muted-foreground">
                  {analyticsData.visitorSummary.avgSessionDuration} avg session
                </p>
              </CardContent>
            </Card>

            <Card className="analytics-card border-l-4 border-l-secondary">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Returning Visitors</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(analyticsData.visitorSummary.returningVisitors)}</div>
                <p className="text-xs text-muted-foreground">
                  {((analyticsData.visitorSummary.returningVisitors / analyticsData.visitorSummary.totalVisitors) * 100).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-2 mb-8">
          {/* Visit Overview Chart */}
          <Card className="analytics-card lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Visit Overview
              </CardTitle>
              <CardDescription>
                Website traffic trends over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analyticsData && (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData.visitOverview}>
                    <defs>
                      <linearGradient id="visits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="unique" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#059669" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#64748b"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#64748b"
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="visits"
                      stroke="#2563eb"
                      fillOpacity={1}
                      fill="url(#visits)"
                      name="Total Visits"
                    />
                    <Area
                      type="monotone"
                      dataKey="uniqueVisitors"
                      stroke="#059669"
                      fillOpacity={1}
                      fill="url(#unique)"
                      name="Unique Visitors"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Visitor Map */}
          <Card className="analytics-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Visitor Map
              </CardTitle>
              <CardDescription>
                Geographic distribution of visitors
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analyticsData && (
                <div className="space-y-4">
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={analyticsData.visitorMap.slice(0, 8)} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" stroke="#64748b" fontSize={12} />
                      <YAxis 
                        type="category" 
                        dataKey="country" 
                        stroke="#64748b"
                        fontSize={12}
                        width={60}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value, name) => [formatNumber(value as number), 'Visitors']}
                      />
                      <Bar 
                        dataKey="visitors" 
                        fill="#2563eb"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                  
                  <div className="space-y-2">
                    {analyticsData.visitorMap.slice(0, 5).map((country, index) => (
                      <div key={country.country} className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                          ></div>
                          <span className="font-medium">{country.country}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-muted-foreground">{formatNumber(country.visitors)}</span>
                          <Badge variant="outline" className="text-xs">
                            {country.percentage.toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Referrer Search Engine */}
          <Card className="analytics-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ExternalLink className="h-5 w-5 mr-2" />
                Traffic Sources
              </CardTitle>
              <CardDescription>
                How visitors find your website
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analyticsData && (
                <div className="space-y-4">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={analyticsData.referrerSources}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="visitors"
                        label={({ percentage }) => `${percentage}%`}
                      >
                        {analyticsData.referrerSources.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={CHART_COLORS[index % CHART_COLORS.length]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value, name) => [formatNumber(value as number), 'Visitors']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  <div className="space-y-2">
                    {analyticsData.referrerSources.map((source, index) => (
                      <div key={source.source} className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                          ></div>
                          <span className="font-medium">{source.source}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-muted-foreground">{formatNumber(source.visitors)}</span>
                          <Badge variant="outline" className="text-xs">
                            {source.percentage}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
