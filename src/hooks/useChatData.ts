import { useState, useEffect, useCallback } from 'react';
import type { Conversation } from '../types';
import { getConversationStableId } from '../utils/chatUtils';

interface UseChatDataResult {
    conversations: Conversation[];
    loading: boolean;
    error: string | null;
    loadFromFile: (file: File) => Promise<void>;
}

export function useChatData(): UseChatDataResult {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const processData = useCallback((data: any) => {
        if (!Array.isArray(data)) {
            throw new Error('Invalid data: expected an array of conversations');
        }

        // Prefer stable IDs from the export (id/conversation_id). Only synthesize if missing.
        const dataWithIds = data.map((c: Conversation, index: number) => {
            const stableId = getConversationStableId(c);
            const fallback = crypto.randomUUID ? crypto.randomUUID() : `conv-${index}-${Date.now()}`;
            return {
                ...c,
                uuid: stableId || fallback,
            };
        });

        setConversations(dataWithIds);
        setLoading(false);
        setError(null);
    }, []);

    const loadFromFile = useCallback(async (file: File) => {
        setLoading(true);
        setError(null);
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            processData(data);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Failed to parse JSON file');
            setLoading(false);
        }
    }, [processData]);

    useEffect(() => {
        let mounted = true;

        async function loadDefaultData() {
            try {
                const response = await fetch('/data/conversations.json');
                if (!response.ok) {
                    // Start in empty state if no default data found
                    if (mounted) setLoading(false);
                    return;
                }
                const data = await response.json();
                if (mounted) {
                    processData(data);
                }
            } catch (err) {
                if (mounted) {
                    // If fetch fails (e.g. 404 or network), just stop loading so WelcomeView shows
                    console.warn("Could not load default data:", err);
                    setLoading(false);
                }
            }
        }

        loadDefaultData();

        return () => {
            mounted = false;
        };
    }, [processData]);

    return { conversations, loading, error, loadFromFile };
}
