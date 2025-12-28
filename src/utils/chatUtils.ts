import type { Conversation, Message, Node } from '../types';

export function getThread(conversation: Conversation, leafId?: string | null): Message[] {
    const { mapping } = conversation;
    let currentNodeId = leafId || conversation.current_node;

    // If no current node is specified, find the last leaf node created? 
    // Actually usually current_node is present. If not, just pick one leaf.
    if (!currentNodeId) {
        // simple fallback: find a node with no children? or just return empty
        // Ideally the export has current_node.
        // If we can't find it, we might just return empty or try to find a leaf.
        const keys = Object.keys(mapping);
        if (keys.length === 0) return [];
        // Just pick the last one added? No, that's unsafe. 
        // Let's assume current_node works for MVP.
        return [];
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
