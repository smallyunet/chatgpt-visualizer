import React, { useState, useMemo } from 'react';
import { Virtuoso } from 'react-virtuoso';
import type { Conversation } from '../types';
import { MessageSquare, Search, Archive } from 'lucide-react';
import clsx from 'clsx';

interface ConversationListProps {
    conversations: Conversation[];
    selectedId: string | null;
    onSelect: (id: string) => void;
}

type ListItem =
    | { type: 'header'; title: string }
    | { type: 'item'; data: Conversation };

export const ConversationList: React.FC<ConversationListProps> = ({
    conversations,
    selectedId,
    onSelect,
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = useMemo(() => {
        if (!searchTerm) return conversations;
        const lower = searchTerm.toLowerCase();
        return conversations.filter((c) => c.title.toLowerCase().includes(lower));
    }, [conversations, searchTerm]);

    const displayItems = useMemo<ListItem[]>(() => {
        const groups: Record<string, Conversation[]> = {};
        const groupOrder: string[] = [];

        // Helper to get key
        const getKey = (c: Conversation) => {
            if (c.workspace_id) return 'Workspace Chats';
            if (c.gizmo_id) return `Custom GPT (${c.gizmo_id.slice(0, 8)}...)`;
            return 'Standard Chats';
        };

        filtered.forEach(c => {
            const key = getKey(c);
            if (!groups[key]) {
                groups[key] = [];
                groupOrder.push(key);
            }
            groups[key].push(c);
        });

        // Ensure "Standard Chats" is first, others filtered alphabetically or by order found
        // If we want "Standard" top, then "Workspace", then "Custom GPTs"
        const specificOrder = ['Standard Chats', 'Workspace Chats'];

        groupOrder.sort((a, b) => {
            const idxA = specificOrder.indexOf(a);
            const idxB = specificOrder.indexOf(b);
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
            return a.localeCompare(b);
        });

        const results: ListItem[] = [];
        groupOrder.forEach(key => {
            results.push({ type: 'header', title: key });
            results.push(...groups[key].map(c => ({ type: 'item' as const, data: c })));
        });

        return results;
    }, [filtered]);

    return (
        <div className="flex flex-col h-full bg-gray-50 border-r border-gray-200 w-[280px] flex-shrink-0">
            {/* Header / Search */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-sm text-gray-900 tracking-tight flex items-center gap-2">
                        <Archive className="w-4 h-4 text-gray-500" />
                        History
                    </h2>
                    <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                        {conversations.length}
                    </span>
                </div>
                <div className="relative group">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        className="w-full bg-white text-gray-900 pl-9 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-all placeholder-gray-400 shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-hidden">
                <Virtuoso
                    style={{ height: '100%' }}
                    data={displayItems}
                    className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
                    itemContent={(_, item) => {
                        if (item.type === 'header') {
                            return (
                                <div className="px-4 py-2 bg-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider sticky top-0 z-10 border-y border-gray-200">
                                    {item.title}
                                </div>
                            );
                        }

                        const conversation = item.data;
                        const isSelected = selectedId === conversation.uuid;

                        return (
                            <div className="px-2 py-1">
                                <button
                                    className={clsx(
                                        "w-full text-left px-3 py-3 rounded-md text-sm transition-all duration-200 group relative flex items-start gap-3",
                                        isSelected
                                            ? "bg-white text-gray-900 border border-gray-200"
                                            : "border border-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                    )}
                                    onClick={() => conversation.uuid && onSelect(conversation.uuid)}
                                >
                                    <MessageSquare className={clsx(
                                        "w-4 h-4 mt-0.5 flex-shrink-0 transition-colors",
                                        isSelected ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"
                                    )} />
                                    <div className="min-w-0 flex-1">
                                        <div className={clsx(
                                            "font-medium truncate",
                                            isSelected ? "text-gray-900" : "text-gray-700 group-hover:text-gray-900"
                                        )}>
                                            {conversation.title || 'Untitled Chat'}
                                        </div>
                                    </div>
                                </button>
                            </div>
                        );
                    }}
                />
            </div>
        </div>
    );
};
