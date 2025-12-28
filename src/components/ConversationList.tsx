import React, { useState, useMemo } from 'react';
import { Virtuoso } from 'react-virtuoso';
import type { Conversation } from '../types';
import { formatDate } from '../utils/chatUtils';
import { Search } from 'lucide-react';
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

    // We need a unique ID for each conversation to select it. 
    // The export root list doesn't have an ID for the conversation itself, 
    // usually people identify it by the root node ID or just index.
    // Wait, the interface `Conversation` I defined doesn't have an `id`.
    // Let's verify the JSON structure again. 
    // Usually the list is objects with { ... }. 
    // Actually the export IS a list of Conversation objects which HAVE an `id` or `conversation_id`?
    // Checking `types.ts`: I defined it without ID. I should check the JSON.

    return (
        <div className="flex flex-col h-full bg-[#171717] w-[260px] flex-shrink-0">
            <div className="p-3">
                <div className="relative group">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 group-focus-within:text-gray-200 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search chats..."
                        className="w-full bg-[#2F2F2F] text-gray-100 pl-9 pr-4 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 text-sm transition-all placeholder-gray-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-hidden px-2 pb-2">
                <Virtuoso
                    style={{ height: '100%' }}
                    data={filtered}
                    itemContent={(_, conversation) => {
                        const isSelected = selectedId === conversation.uuid;

                        return (
                            <div
                                className={clsx(
                                    "p-3 mb-1 rounded-lg cursor-pointer transition-all duration-200 text-sm group relative",
                                    isSelected
                                        ? "bg-[#2F2F2F] text-gray-100"
                                        : "text-gray-300 hover:bg-[#212121] hover:text-gray-100"
                                )}
                                onClick={() => conversation.uuid && onSelect(conversation.uuid)}
                            >
                                <div className="font-medium truncate pr-4">{conversation.title || 'New Chat'}</div>
                                {/* Gradient fade for long titles? Or just truncate. Truncate is cleaner. */}
                            </div>
                        );
                    }}
                />
            </div>
        </div>
    );
};
