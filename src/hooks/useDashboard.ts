'use client';

import { useState, useEffect, useCallback } from 'react';
import { dashboardApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

type Period = 'week' | 'month' | 'quarter' | 'year';
type GroupBy = 'day' | 'week' | 'month';

function getDateRangeForPeriod(period: Period): { startDate: string; endDate: string; groupBy: GroupBy } {
  const now = new Date();
  const endDate = now.toISOString().split('T')[0];
  let startDate: string;
  let groupBy: GroupBy;

  switch (period) {
    case 'week':
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      startDate = weekAgo.toISOString().split('T')[0];
      groupBy = 'day';
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      groupBy = 'week';
      break;
    case 'quarter':
      const quarterAgo = new Date(now);
      quarterAgo.setMonth(now.getMonth() - 3);
      startDate = quarterAgo.toISOString().split('T')[0];
      groupBy = 'week';
      break;
    case 'year':
      const yearAgo = new Date(now);
      yearAgo.setFullYear(now.getFullYear() - 1);
      startDate = yearAgo.toISOString().split('T')[0];
      groupBy = 'month';
      break;
  }

  return { startDate, endDate, groupBy };
}

export function useDashboard(period: Period) {
  const { startDate, endDate, groupBy } = getDateRangeForPeriod(period);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  const [overview, setOverview] = useState<any>(null);
  const [chartData, setChartData] = useState<Array<{ period: string; income: number; expenses: number }>>([]);
  const [clientRevenue, setClientRevenue] = useState<any>(null);
  const [cashFlow, setCashFlow] = useState<any>(null);
  const [healthMetrics, setHealthMetrics] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [
        overviewRes,
        incomeRes,
        expensesRes,
        clientRes,
        cashFlowRes,
        healthRes,
        activityRes,
      ] = await Promise.all([
        dashboardApi.getOverview({ startDate, endDate }),
        dashboardApi.getIncomeChart({ startDate, endDate, groupBy }),
        dashboardApi.getExpensesChart({ startDate, endDate, groupBy }),
        dashboardApi.getClientRevenue({ limit: 5 }),
        dashboardApi.getCashFlowForecast({ months: 6 }),
        dashboardApi.getHealthMetrics(),
        dashboardApi.getRecentActivity({ limit: 10 }),
      ]);

      setOverview(overviewRes.data.data.overview);

      // Merge income and expenses arrays by period key
      const incomeByPeriod = new Map(
        incomeRes.data.data.data.map((d) => [d.period, d.amount])
      );
      const expensesByPeriod = new Map(
        expensesRes.data.data.data.byPeriod.map((d: any) => [d.period, d.amount])
      );
      const allPeriods = Array.from(
        new Set([...incomeByPeriod.keys(), ...expensesByPeriod.keys()])
      ).sort();
      setChartData(
        allPeriods.map((p) => ({
          period: p,
          income: incomeByPeriod.get(p) ?? 0,
          expenses: expensesByPeriod.get(p) ?? 0,
        }))
      );

      setClientRevenue(clientRes.data.data);
      setCashFlow(cashFlowRes.data.data.forecast);
      setHealthMetrics(healthRes.data.data.metrics);
      setRecentActivity(activityRes.data.data.activity);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('[Dashboard] fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate, groupBy, isAuthenticated, isInitialized]);

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      fetchAll();
    }
  }, [fetchAll, isInitialized, isAuthenticated]);

  return {
    overview,
    chartData,
    clientRevenue,
    cashFlow,
    healthMetrics,
    recentActivity,
    isLoading,
    error,
    refetch: fetchAll,
  };
}
