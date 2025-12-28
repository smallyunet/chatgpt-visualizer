import React, { useMemo } from 'react';
import { Virtuoso } from 'react-virtuoso';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import 'highlight.js/styles/github-dark.css';
import 'katex/dist/katex.min.css';
import clsx from 'clsx';
import type { Conversation, Message } from '../types';
import { getThread, formatDate } from '../utils/chatUtils';

interface ChatViewProps {
    conversation: Conversation | null;
}

export const ChatView: React.FC<ChatViewProps> = ({ conversation }) => {
    const messages = useMemo(() => {
        if (!conversation) return [];
        return getThread(conversation);
    }, [conversation]);

    if (!conversation) {
        return (
            <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-900">
                Select a conversation to start
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-[#1e1e1e] text-gray-300 font-mono text-sm">
            <header className="px-4 py-2 border-b border-[#333] flex justify-between items-center bg-[#252526] h-10 flex-shrink-0">
                <div className="flex items-center gap-2 overflow-hidden">
                    <span className="font-bold text-gray-100 truncate">{conversation.title}</span>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                        {formatDate(conversation.create_time)} · {messages.length} msgs
                    </span>
                </div>
            </header>

            <div className="flex-1 overflow-hidden relative">
                <Virtuoso
                    style={{ height: '100%' }}
                    data={messages}
                    defaultItemHeight={60}
                    itemContent={(_, message) => (
                        <MessageItem message={message} />
                    )}
                />
            </div>
        </div>
    );
};

const MessageItem: React.FC<{ message: Message }> = ({ message }) => {
    const isUser = message.author.role === 'user';

    const textContent = message.content.parts
        ? message.content.parts.filter(p => typeof p === 'string').join('')
        : '';

    return (
        <div className={clsx(
            "w-full border-b border-[#2d2d2d] flex",
            isUser ? "bg-[#1e1e1e]" : "bg-[#222]"
        )}>
            {/* Gutter / Sidebar for role */}
            <div className={clsx(
                "w-16 flex-shrink-0 p-2 text-xs text-right border-r border-[#2d2d2d] select-none",
                isUser ? "text-blue-400" : "text-green-500"
            )}>
                {isUser ? 'USER' : 'BOT'}
            </div>

            {/* Content */}
            <div className="flex-1 p-2 min-w-0 overflow-x-auto">
                <div className="prose prose-invert max-w-none prose-sm prose-pre:bg-[#111] prose-pre:border prose-pre:border-[#333]">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight, rehypeKatex]}
                        urlTransform={(url) => {
                            if (url.startsWith('file-')) {
                                return `/data/${url}`;
                            }
                            return url;
                        }}
                        components={{
                            img: (props) => (
                                <img {...props} className="max-w-md max-h-96 rounded border border-[#333] my-1" loading="lazy" />
                            ),
                            p: ({ children }) => <p className="mb-1 last:mb-0 leading-relaxed">{children}</p>,
                            code: ({ children, className }) => <code className={clsx(className, "text-xs bg-[#333] px-1 rounded")}>{children}</code>
                        }}
                    >
                        {textContent}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
};
