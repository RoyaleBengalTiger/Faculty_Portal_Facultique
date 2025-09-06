import React, { useMemo, useState } from 'react';
import { FacultyPerformanceDto } from '@/types/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { format } from 'date-fns';

interface PerformanceTableProps {
  data: FacultyPerformanceDto[];
}

type SortKey = keyof FacultyPerformanceDto;
type SortOrder = 'asc' | 'desc';

export const PerformanceTable: React.FC<PerformanceTableProps> = ({ data }) => {
  const [sortKey, setSortKey] = useState<SortKey>('performanceScore');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  // Normalize once to keep the JSX simple & safe
  const normalized = useMemo(() => {
    const arr = Array.isArray(data) ? data : [];
    return arr.map((f) => ({
      facultyId: f?.facultyId ?? `${f?.facultyEmail ?? Math.random()}`,
      facultyName: f?.facultyName ?? 'Unknown',
      facultyEmail: f?.facultyEmail ?? '',
      department: f?.department ?? '—',
      tasksAssigned: Number.isFinite(f?.tasksAssigned as any) ? Number(f!.tasksAssigned) : 0,
      tasksCompleted: Number.isFinite(f?.tasksCompleted as any) ? Number(f!.tasksCompleted) : 0,
      averageCompletionTime: Number.isFinite(f?.averageCompletionTime as any)
        ? Number(f!.averageCompletionTime)
        : 0,
      performanceScore: Number.isFinite(f?.performanceScore as any) ? Number(f!.performanceScore) : 0,
      lastActiveDate: f?.lastActiveDate ?? null,
    }));
  }, [data]);

  // Tolerant sorting for strings/numbers/undefined
  const sortedData = useMemo(() => {
    const getVal = (row: any, key: SortKey) => row?.[key];
    const cmp = (a: any, b: any) => {
      if (typeof a === 'string' && typeof b === 'string') return a.localeCompare(b);
      if (typeof a === 'number' && typeof b === 'number') return a - b;
      if (a == null && b != null) return 1;
      if (a != null && b == null) return -1;
      return 0;
    };
    const copy = [...normalized];
    copy.sort((a, b) => {
      const base = cmp(getVal(a, sortKey), getVal(b, sortKey));
      return sortOrder === 'asc' ? base : -base;
    });
    return copy;
  }, [normalized, sortKey, sortOrder]);

  const getPerformanceBadge = (scoreRaw: number) => {
    const score = Number.isFinite(scoreRaw) ? scoreRaw : 0;
    if (score >= 90) return <Badge className="bg-green-500">Excellent</Badge>;
    if (score >= 75) return <Badge className="bg-blue-500">Good</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-500">Average</Badge>;
    return <Badge className="bg-red-500">Needs Improvement</Badge>;
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <ArrowUpDown className="w-4 h-4" />;
    return sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  const safeFormatDate = (isoLike: any) => {
    if (!isoLike) return '—';
    const d = new Date(isoLike);
    try {
      if (Number.isNaN(d.getTime())) return '—';
      return format(d, 'MMM dd, yyyy');
    } catch {
      return '—';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Faculty Performance Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">
                  <Button variant="ghost" onClick={() => handleSort('facultyName')} className="h-auto p-0 font-semibold">
                    Name <SortIcon column="facultyName" />
                  </Button>
                </th>
                <th className="text-left p-2">Department</th>
                <th className="text-center p-2">
                  <Button variant="ghost" onClick={() => handleSort('tasksAssigned')} className="h-auto p-0 font-semibold">
                    Assigned <SortIcon column="tasksAssigned" />
                  </Button>
                </th>
                <th className="text-center p-2">
                  <Button variant="ghost" onClick={() => handleSort('tasksCompleted')} className="h-auto p-0 font-semibold">
                    Completed <SortIcon column="tasksCompleted" />
                  </Button>
                </th>
                <th className="text-center p-2">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('averageCompletionTime')}
                    className="h-auto p-0 font-semibold"
                  >
                    Avg Time <SortIcon column="averageCompletionTime" />
                  </Button>
                </th>
                <th className="text-center p-2">
                  <Button variant="ghost" onClick={() => handleSort('performanceScore')} className="h-auto p-0 font-semibold">
                    Performance <SortIcon column="performanceScore" />
                  </Button>
                </th>
                <th className="text-center p-2">Last Active</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((faculty) => (
                <tr key={faculty.facultyId} className="border-b hover:bg-muted/50">
                  <td className="p-2">
                    <div>
                      <div className="font-medium">{faculty.facultyName}</div>
                      <div className="text-xs text-muted-foreground">{faculty.facultyEmail || '—'}</div>
                    </div>
                  </td>
                  <td className="p-2">{faculty.department}</td>
                  <td className="text-center p-2">{faculty.tasksAssigned}</td>
                  <td className="text-center p-2">{faculty.tasksCompleted}</td>
                  <td className="text-center p-2">{Number(faculty.averageCompletionTime).toFixed(1)} days</td>
                  <td className="text-center p-2">
                    <div className="flex flex-col items-center gap-1">
                      {/* ✅ Two-decimal precision */}
                      <span className="font-medium">
                        {Number.isFinite(faculty.performanceScore)
                          ? Number(faculty.performanceScore).toFixed(2)
                          : '0.00'}
                        %
                      </span>
                      {getPerformanceBadge(faculty.performanceScore)}
                    </div>
                  </td>
                  <td className="text-center p-2 text-xs">{safeFormatDate(faculty.lastActiveDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
