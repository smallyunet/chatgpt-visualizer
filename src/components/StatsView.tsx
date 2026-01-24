import React, { useMemo } from 'react';
import type { Conversation } from '../types';
import { getThread, formatDate } from '../utils/chatUtils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { MessageSquare, Calendar, Bot, Zap, TrendingUp } from 'lucide-react';

interface StatsViewProps {
    conversations: Conversation[];
}

export const StatsView: React.FC<StatsViewProps> = ({ conversations }) => {
    const stats = useMemo(() => {
        let totalMessages = 0;
        let totalUserMessages = 0;
        let totalModelMessages = 0;
        let firstChatTime = Number.POSITIVE_INFINITY;
        const messagesByDate: Record<string, number> = {};
        const messagesByMonth: Record<string, number> = {};
        const botUsage: Record<string, number> = {};

        // Process all conversations
        conversations.forEach(conv => {
            if (typeof conv.create_time === 'number') {
                firstChatTime = Math.min(firstChatTime, conv.create_time);
            }
            const msgs = getThread(conv);
            totalMessages += msgs.length;

            // Sort logic to determine range? 
            // Actually just processing all messages for stats
            msgs.forEach(m => {
                if (m.author.role === 'user') totalUserMessages++;
                if (m.author.role === 'assistant') totalModelMessages++;

                const date = new Date((m.create_time || 0) * 1000);
                const dateKey = date.toISOString().split('T')[0];
                const monthKey = date.toISOString().slice(0, 7); // YYYY-MM

                messagesByDate[dateKey] = (messagesByDate[dateKey] || 0) + 1;
                messagesByMonth[monthKey] = (messagesByMonth[monthKey] || 0) + 1;
            });

            // Track Custom GPT usage
            if (conv.gizmo_id) {
                // Group by "Type"
                const type = conv.gizmo_id ? 'Custom GPTs' : 'Standard Chat';
                botUsage[type] = (botUsage[type] || 0) + 1;
            } else {
                botUsage['Standard Chat'] = (botUsage['Standard Chat'] || 0) + 1;
            }
        });

        // Format data for charts
        const monthlyActivity = Object.entries(messagesByMonth)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .slice(-12) // Last 12 months
            .map(([date, count]) => ({
                date,
                count,
                label: new Date(date + '-01').toLocaleDateString(undefined, { month: 'short', year: '2-digit' })
            }));

        const conversationTypes = Object.entries(botUsage).map(([name, value]) => ({ name, value }));

        return {
            totalMessages,
            totalUserMessages,
            totalModelMessages,
            monthlyActivity,
            conversationTypes,
            avgMessagesPerConv: conversations.length > 0 ? Math.round(totalMessages / conversations.length) : 0,
            firstChatTime: Number.isFinite(firstChatTime) ? firstChatTime : null,
        };
    }, [conversations]);

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

    return (
        <div className="flex-1 overflow-y-auto bg-gray-50/50 p-8 h-full">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header */}
                <div className="text-center space-y-2 mb-12">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Your Chat History</h1>
                    <p className="text-gray-500">Overview of your interactions and activity trends</p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <StatCard
                        title="Total Conversations"
                        value={conversations.length.toLocaleString()}
                        icon={<MessageSquare className="w-5 h-5 text-indigo-500" />}
                    />
                    <StatCard
                        title="Total Messages"
                        value={stats.totalMessages.toLocaleString()}
                        icon={<Zap className="w-5 h-5 text-amber-500" />}
                    />
                    <StatCard
                        title="Avg Msgs / Chat"
                        value={stats.avgMessagesPerConv.toString()}
                        icon={<TrendingUp className="w-5 h-5 text-emerald-500" />}
                    />
                    <StatCard
                        title="First Chat"
                        value={stats.firstChatTime ? formatDate(stats.firstChatTime).split(',')[0] : '—'}
                        icon={<Calendar className="w-5 h-5 text-blue-500" />}
                    />
                </div>

                {/* Charts Row 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Monthly Activity */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-gray-400" />
                            Monthly Activity (Last 12 Months)
                        </h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.monthlyActivity}>
                                    <XAxis
                                        dataKey="label"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        hide
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f3f4f6', radius: 4 }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Chat Types */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                            <Bot className="w-4 h-4 text-gray-400" />
                            Chat Types
                        </h3>
                        <div className="flex-1 flex flex-col">
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats.conversationTypes}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            startAngle={90}
                                            endAngle={-270}
                                        >
                                            {stats.conversationTypes.map((_entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex justify-center flex-wrap gap-x-6 gap-y-2 mt-4">
                                {stats.conversationTypes.map((entry, index) => (
                                    <div key={entry.name} className="flex items-center gap-2 text-sm text-gray-600">
                                        <div className="w-2.5 h-2.5 rounded-full ring-2 ring-white" style={{ backgroundColor: COLORS[index % COLORS.length] }
                                        } />
                                        <span className="font-medium">{entry.name}</span>
                                        <span className="text-gray-400">({entry.value})</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) => (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-1">
        <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">{title}</span>
            <div className="p-2 bg-gray-50 rounded-lg">
                {icon}
            </div>
        </div>
        <div className="text-2xl font-bold text-gray-900 mt-2">
            {value}
        </div>
    </div>
);
