import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PerformanceBarChart } from '@/components/analytics/PerformanceBarChart';
import { TrendsLineChart } from '@/components/analytics/TrendsLineChart';
import { PerformanceTable } from '@/components/analytics/PerformanceTable';
import { analyticsApi } from '@/services/api';
import { PerformanceSummary, TaskTrend, AnalyticsFilters } from '@/types/analytics';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, Users, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { format, subMonths } from 'date-fns';

const ALL_DEPTS = 'all';

export const Analytics: React.FC = () => {
  const { toast } = useToast();

  const [performanceData, setPerformanceData] = useState<PerformanceSummary | null>(null);
  const [trendsData, setTrendsData] = useState<TaskTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [filters, setFilters] = useState<AnalyticsFilters>({
    startDate: format(subMonths(new Date(), 6), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    department: '', // keep '' in state for "all" when calling the API
  });

  // Normalize helpers
  const normalizeSummary = (raw: any): PerformanceSummary => ({
    totalFaculty: Number(raw?.totalFaculty ?? 0),
    totalTasksAssigned: Number(raw?.totalTasksAssigned ?? 0),
    totalTasksCompleted: Number(raw?.totalTasksCompleted ?? 0),
    averagePerformanceScore: Number(raw?.averagePerformanceScore ?? 0),
    facultyPerformances: Array.isArray(raw?.facultyPerformances) ? raw.facultyPerformances : [],
  });

  const normalizeTrends = (raw: any): TaskTrend[] =>
    Array.isArray(raw)
      ? raw.map((r) => ({
          month: (r?.month ?? '').toString(),
          assigned: Number.isFinite(r?.assigned) ? Number(r.assigned) : 0,
          completed: Number.isFinite(r?.completed) ? Number(r.completed) : 0,
          overdue: Number.isFinite(r?.overdue) ? Number(r.overdue) : 0,
        }))
      : [];

  const fetchAnalyticsData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [performance, trends] = await Promise.all([
        analyticsApi.getFacultyPerformance(filters),
        analyticsApi.getTaskTrends(filters),
      ]);

      setPerformanceData(normalizeSummary(performance));
      setTrendsData(normalizeTrends(trends));
    } catch (err: any) {
      console.error('❌ Analytics fetch error:', err);
      const msg = err?.message || 'Failed to fetch analytics data';
      setError(msg);
      toast({
        title: 'Error',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalyticsData();
    setRefreshing(false);
  };

  const handleFilterChange = () => {
    fetchAnalyticsData();
  };

  // Derived, NaN-proof values for summary cards & rate
  const {
    totalFaculty = 0,
    totalTasksAssigned = 0,
    totalTasksCompleted = 0,
    averagePerformanceScore = 0,
    facultyPerformances = [],
  } = performanceData ?? {};

  const completionRate = useMemo(() => {
    if (!Number.isFinite(totalTasksAssigned) || totalTasksAssigned <= 0) return '0.0';
    const rate = (Number(totalTasksCompleted) / Number(totalTasksAssigned)) * 100;
    return Number.isFinite(rate) ? rate.toFixed(1) : '0.0';
  }, [totalTasksAssigned, totalTasksCompleted]);

  const avgPerfLabel = useMemo(() => {
    const val = Number(averagePerformanceScore);
    return Number.isFinite(val) ? val.toFixed(1) : '0.0';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [averagePerformanceScore]);

  // Loading / error / empty
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <p className="text-destructive mb-4">Error: {error}</p>
          <Button onClick={fetchAnalyticsData}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!performanceData) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No analytics data available</p>
          <Button onClick={fetchAnalyticsData}>Refresh</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Faculty Analytics</h1>
          <p className="text-muted-foreground">Monitor faculty performance and task completion metrics</p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select
                // map state '' -> 'all' for the UI
                value={filters.department || ALL_DEPTS}
                // map UI 'all' -> '' in state (API expects '' for all)
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, department: value === ALL_DEPTS ? '' : value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  {/* IMPORTANT: non-empty value for Radix Select items */}
                  <SelectItem value={ALL_DEPTS}>All Departments</SelectItem>
                  <SelectItem value="CSE">CSE</SelectItem>
                  <SelectItem value="EEE">EEE</SelectItem>
                  <SelectItem value="MPE">MPE</SelectItem>
                  <SelectItem value="CE">CE</SelectItem>
                  <SelectItem value="BTM">BTM</SelectItem>
                  <SelectItem value="TVE">TVE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleFilterChange} className="w-full">
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Faculty</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFaculty}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Assigned</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasksAssigned}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasksCompleted}</div>
            <p className="text-xs text-muted-foreground">{completionRate}% completion rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgPerfLabel}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {facultyPerformances.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PerformanceBarChart data={facultyPerformances} title="Faculty Task Performance" />
          {trendsData.length > 0 ? (
            <TrendsLineChart data={trendsData} title="Task Completion Trends" />
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">No trend data available</p>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">No faculty performance data to display charts</p>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      {facultyPerformances.length > 0 ? (
        <PerformanceTable data={facultyPerformances} />
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">No faculty performance data available for table</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
