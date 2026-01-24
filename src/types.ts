export interface Author {
    role: 'system' | 'user' | 'assistant' | 'tool';
    name?: string | null;
    metadata?: any;
}

export interface ContentPart {
    content_type: 'text' | 'image_asset_pointer' | 'code' | 'execution_output';
    parts?: string[]; // for text
    asset_pointer?: string; // for images
    text?: string;
    language?: string;
}

export interface MessageContent {
    content_type: string;
    parts: (string | any)[];
}

export interface Message {
    id: string;
    author: Author;
    create_time: number | null;
    update_time: number | null;
    content: MessageContent;
    status: string;
    end_turn: boolean | null;
    weight: number;
    metadata: any;
    recipient: string;
}

export interface Node {
    id: string;
    message: Message | null;
    parent: string | null;
    children: string[];
}

export interface Conversation {
    uuid?: string; // Synthetic ID for UI
    id?: string; // Stable conversation id from export
    conversation_id?: string; // Some exports duplicate id here
    title: string;
    create_time: number;
    update_time: number;
    mapping: Record<string, Node>;
    current_node?: string | null; // UUID of the current leaf node
    gizmo_id?: string | null;
    workspace_id?: string | null;
}
