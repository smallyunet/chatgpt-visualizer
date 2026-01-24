import type { Conversation, Message, Node } from '../types';

export function getThread(conversation: Conversation, leafId?: string | null): Message[] {
    const { mapping } = conversation;
    let currentNodeId = leafId || conversation.current_node;

    // Fallback: some exports omit current_node.
    // In that case, pick the latest leaf node (no children) that has a message.
    if (!currentNodeId) {
        const nodes = Object.values(mapping);
        const leafCandidates = nodes
            .filter((n) => (n.children?.length ?? 0) === 0)
            .filter((n) => n.message);

        if (leafCandidates.length === 0) return [];

        leafCandidates.sort((a, b) => {
            const ta = a.message?.create_time ?? 0;
            const tb = b.message?.create_time ?? 0;
            return tb - ta;
        });

        currentNodeId = leafCandidates[0].id;
    }

    const thread: Message[] = [];
    let safety = 0;

    while (currentNodeId && safety < 10000) {
        const node: Node | undefined = mapping[currentNodeId];
        if (!node) break;

        if (node.message) {
            // Don't include system messages? Or hidden ones?
            // ChatGPT export includes 'system' messages which might be instructions.
            // Usually user wants to see user/assistant.
            // We can filter visually.
            if (node.message.author.role !== 'system') {
                thread.push(node.message);
            }
        }

        currentNodeId = node.parent;
        safety++;
    }

    return thread.reverse();
}

export function truncate(str: string, length: number): string {
    if (str.length <= length) return str;
    return str.slice(0, length) + '...';
}

export function formatDate(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleDateString();
}

export function getConversationStableId(conversation: Conversation): string | undefined {
    return conversation.id || conversation.conversation_id || conversation.uuid;
}
