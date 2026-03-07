import { useEffect, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useTransactionStore } from '../stores/useTransactionStore';
import { useCategoryStore } from '../stores/useCategoryStore';
import { useAccountStore } from '../stores/useAccountStore';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';

export default function Analytics() {
    const { transactions, loadTransactions } = useTransactionStore();
    const { categories, loadCategories, getCategory } = useCategoryStore();
    const { accounts, loadAccounts, getAccount } = useAccountStore();

    useEffect(() => {
        loadTransactions();
        loadCategories();
        loadAccounts();
    }, []);

    const hasData = transactions.length > 0;

    // Monthly spending trend (last 6 months)
    const monthlyTrend = useMemo(() => {
        const months: string[] = [];
        const expenses: number[] = [];
        const incomes: number[] = [];

        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const label = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
            months.push(label);

            const monthTxs = transactions.filter((t) => {
                const td = new Date(t.date);
                return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear();
            });

            expenses.push(monthTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0));
            incomes.push(monthTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0));
        }

        return { months, expenses, incomes };
    }, [transactions]);

    // Spending by category
    const categorySpending = useMemo(() => {
        const map = new Map<string, number>();
        transactions
            .filter((t) => t.type === 'expense')
            .forEach((t) => {
                map.set(t.categoryId, (map.get(t.categoryId) || 0) + t.amount);
            });

        return Array.from(map.entries())
            .map(([id, value]) => {
                const cat = getCategory(id);
                return { name: cat?.name || 'Other', value, color: cat?.color || '#636e72' };
            })
            .sort((a, b) => b.value - a.value);
    }, [transactions, categories]);

    // Spending by account
    const accountSpending = useMemo(() => {
        const map = new Map<string, number>();
        transactions
            .filter((t) => t.type === 'expense')
            .forEach((t) => {
                map.set(t.accountId, (map.get(t.accountId) || 0) + t.amount);
            });

        return Array.from(map.entries())
            .map(([id, value]) => {
                const acc = getAccount(id);
                return { name: acc?.name || 'Unknown', value, color: acc?.color || '#636e72' };
            })
            .sort((a, b) => b.value - a.value);
    }, [transactions, accounts]);

    const chartTextColor = '#9090a8';
    const chartGridColor = '#2a2a40';

    const trendOption = {
        tooltip: {
            trigger: 'axis',
            backgroundColor: '#1a1a2e',
            borderColor: '#2a2a40',
            textStyle: { color: '#e8e8f0', fontSize: 12 },
        },
        legend: {
            data: ['Income', 'Expense'],
            textStyle: { color: chartTextColor, fontSize: 11 },
            bottom: 0,
        },
        grid: { left: '3%', right: '3%', bottom: '15%', top: '10%', containLabel: true },
        xAxis: {
            type: 'category' as const,
            data: monthlyTrend.months,
            axisLine: { lineStyle: { color: chartGridColor } },
            axisLabel: { color: chartTextColor, fontSize: 10 },
        },
        yAxis: {
            type: 'value' as const,
            splitLine: { lineStyle: { color: chartGridColor, type: 'dashed' as const } },
            axisLabel: { color: chartTextColor, fontSize: 10, formatter: (v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v },
        },
        series: [
            {
                name: 'Income',
                type: 'bar' as const,
                data: monthlyTrend.incomes,
                itemStyle: { color: '#00cec9', borderRadius: [4, 4, 0, 0] },
                barWidth: '30%',
            },
            {
                name: 'Expense',
                type: 'bar' as const,
                data: monthlyTrend.expenses,
                itemStyle: { color: '#ff6b81', borderRadius: [4, 4, 0, 0] },
                barWidth: '30%',
            },
        ],
    };

    const categoryOption = {
        tooltip: {
            trigger: 'item',
            backgroundColor: '#1a1a2e',
            borderColor: '#2a2a40',
            textStyle: { color: '#e8e8f0', fontSize: 12 },
        },
        series: [
            {
                type: 'pie' as const,
                radius: ['45%', '70%'],
                center: ['50%', '50%'],
                avoidLabelOverlap: true,
                itemStyle: { borderRadius: 6, borderColor: '#12121a', borderWidth: 2 },
                label: { show: false },
                emphasis: {
                    label: { show: true, fontSize: 13, fontWeight: 'bold', color: '#e8e8f0' },
                },
                data: categorySpending.map((c) => ({
                    name: c.name,
                    value: c.value,
                    itemStyle: { color: c.color },
                })),
            },
        ],
    };

    const accountOption = {
        tooltip: {
            trigger: 'axis',
            backgroundColor: '#1a1a2e',
            borderColor: '#2a2a40',
            textStyle: { color: '#e8e8f0', fontSize: 12 },
        },
        grid: { left: '3%', right: '5%', bottom: '3%', top: '10%', containLabel: true },
        xAxis: {
            type: 'value' as const,
            splitLine: { lineStyle: { color: chartGridColor, type: 'dashed' as const } },
            axisLabel: { color: chartTextColor, fontSize: 10, formatter: (v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v },
        },
        yAxis: {
            type: 'category' as const,
            data: accountSpending.map((a) => a.name),
            axisLine: { lineStyle: { color: chartGridColor } },
            axisLabel: { color: chartTextColor, fontSize: 10 },
        },
        series: [
            {
                type: 'bar' as const,
                data: accountSpending.map((a) => ({
                    value: a.value,
                    itemStyle: { color: a.color, borderRadius: [0, 4, 4, 0] },
                })),
                barWidth: '50%',
            },
        ],
    };

    // Income vs Expense line chart
    const incomeVsExpenseOption = {
        tooltip: {
            trigger: 'axis',
            backgroundColor: '#1a1a2e',
            borderColor: '#2a2a40',
            textStyle: { color: '#e8e8f0', fontSize: 12 },
        },
        legend: {
            data: ['Income', 'Expense'],
            textStyle: { color: chartTextColor, fontSize: 11 },
            bottom: 0,
        },
        grid: { left: '3%', right: '3%', bottom: '15%', top: '10%', containLabel: true },
        xAxis: {
            type: 'category' as const,
            data: monthlyTrend.months,
            axisLine: { lineStyle: { color: chartGridColor } },
            axisLabel: { color: chartTextColor, fontSize: 10 },
        },
        yAxis: {
            type: 'value' as const,
            splitLine: { lineStyle: { color: chartGridColor, type: 'dashed' as const } },
            axisLabel: { color: chartTextColor, fontSize: 10, formatter: (v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v },
        },
        series: [
            {
                name: 'Income',
                type: 'line' as const,
                data: monthlyTrend.incomes,
                smooth: true,
                lineStyle: { width: 3, color: '#00cec9' },
                itemStyle: { color: '#00cec9' },
                areaStyle: { color: { type: 'linear' as const, x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(0,206,201,0.3)' }, { offset: 1, color: 'rgba(0,206,201,0.02)' }] } },
            },
            {
                name: 'Expense',
                type: 'line' as const,
                data: monthlyTrend.expenses,
                smooth: true,
                lineStyle: { width: 3, color: '#ff6b81' },
                itemStyle: { color: '#ff6b81' },
                areaStyle: { color: { type: 'linear' as const, x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(255,107,129,0.3)' }, { offset: 1, color: 'rgba(255,107,129,0.02)' }] } },
            },
        ],
    };

    return (
        <div className="animate-fade-in">
            <PageHeader title="Analytics" />

            <div className="px-4 py-4 space-y-5">
                {!hasData ? (
                    <EmptyState
                        icon="📈"
                        title="No data yet"
                        description="Add some transactions to see your spending analytics"
                    />
                ) : (
                    <>
                        {/* Monthly Trend */}
                        <ChartCard title="Monthly Overview">
                            <ReactECharts option={trendOption} style={{ height: 250 }} />
                        </ChartCard>

                        {/* Income vs Expense */}
                        <ChartCard title="Income vs Expense">
                            <ReactECharts option={incomeVsExpenseOption} style={{ height: 250 }} />
                        </ChartCard>

                        {/* Category Breakdown */}
                        {categorySpending.length > 0 && (
                            <ChartCard title="Spending by Category">
                                <ReactECharts option={categoryOption} style={{ height: 250 }} />
                                <div className="grid grid-cols-2 gap-2 mt-3">
                                    {categorySpending.slice(0, 6).map((c) => (
                                        <div key={c.name} className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ background: c.color }} />
                                            <span className="text-xs text-[var(--color-text-secondary)] truncate">{c.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </ChartCard>
                        )}

                        {/* Account Breakdown */}
                        {accountSpending.length > 0 && (
                            <ChartCard title="Spending by Account">
                                <ReactECharts option={accountOption} style={{ height: Math.max(150, accountSpending.length * 50) }} />
                            </ChartCard>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div
            className="rounded-xl p-4"
            style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
            }}
        >
            <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-3">{title}</h3>
            {children}
        </div>
    );
}
