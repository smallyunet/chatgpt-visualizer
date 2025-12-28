import { useState, useEffect } from 'react';
import type { Conversation } from '../types';

interface UseChatDataResult {
    conversations: Conversation[];
    loading: boolean;
    error: string | null;
}

export function useChatData(): UseChatDataResult {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        async function loadData() {
            try {
                const response = await fetch('/data/conversations.json');
                if (!response.ok) {
                    throw new Error(`Failed to load data: ${response.statusText}`);
                }
                const data = await response.json();
                // Generate UUIDs for conversations that don't have them (export doesn't have top level ID usually)
                const dataWithIds = data.map((c: Conversation, index: number) => ({
                    ...c,
                    uuid: crypto.randomUUID ? crypto.randomUUID() : `conv-${index}-${Date.now()}`
                }));

                if (mounted) {
                    setConversations(dataWithIds);
                    setLoading(false);
                }
            } catch (err) {
                if (mounted) {
                    console.error(err);
                    setError(err instanceof Error ? err.message : 'Unknown error');
                    setLoading(false);
                }
            }
        }

        loadData();

        return () => {
            mounted = false;
        };
    }, []);

    return { conversations, loading, error };
}
