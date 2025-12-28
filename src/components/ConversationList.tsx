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
                    data={filtered}
                    className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
                    itemContent={(_, conversation) => {
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
