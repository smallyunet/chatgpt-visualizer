import React, { useMemo } from 'react';
import { Virtuoso } from 'react-virtuoso';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import 'highlight.js/styles/github.css'; // Light code theme
import 'katex/dist/katex.min.css';
import clsx from 'clsx';
import type { Conversation, Message } from '../types';
import { getThread, formatDate } from '../utils/chatUtils';
import { User, Sparkles, Clock, Calendar } from 'lucide-react';

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
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-white">
                <Sparkles className="w-12 h-12 mb-4 text-gray-300" />
                <p className="font-medium text-gray-400">Select a conversation to start exploring</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-white text-gray-800 font-sans text-sm">
            {/* Header */}
            <header className="px-6 py-4 border-b border-gray-100 bg-white/80 backdrop-blur-sm flex justify-between items-center flex-shrink-0 z-10 sticky top-0">
                <div className="flex flex-col gap-0.5 overflow-hidden">
                    <h1 className="font-semibold text-gray-900 truncate text-base tracking-tight">
                        {conversation.title}
                    </h1>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(conversation.create_time)}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {messages.length} messages
                        </span>
                    </div>
                </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-hidden relative">
                <Virtuoso
                    style={{ height: '100%' }}
                    data={messages}
                    className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
                    // Increase overscan for smoother scrolling of heavy markdown
                    overscan={500}
                    defaultItemHeight={100}
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

    // Skip empty messages usually
    if (!textContent.trim() && message.content.parts?.length === 0) return null;

    return (
        <div className={clsx(
            "w-full px-6 py-8 border-b border-gray-100/50 hover:bg-gray-50/50 transition-colors",
            isUser ? "bg-white" : "bg-gray-50/80"
        )}>
            <div className="max-w-4xl mx-auto flex gap-6">
                {/* Avatar Column */}
                <div className="flex-shrink-0 flex flex-col items-center pt-1">
                    <div className={clsx(
                        "w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ring-1",
                        isUser
                            ? "bg-white text-gray-600 ring-gray-200"
                            : "bg-teal-50 text-teal-600 ring-teal-100" // Mint/Teal accent for ChatGPT like official UI
                    )}>
                        {isUser ? <User className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                    </div>
                </div>

                {/* Content Column */}
                <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="flex items-center gap-2 mb-2 select-none">
                        <span className={clsx(
                            "font-semibold text-sm",
                            isUser ? "text-gray-900" : "text-teal-700"
                        )}>
                            {isUser ? 'You' : 'ChatGPT'}
                        </span>
                    </div>

                    <div className="prose prose-neutral max-w-none 
                        prose-p:leading-7 prose-p:mb-4 prose-p:text-gray-800
                        prose-headings:text-gray-900 prose-headings:font-semibold
                        prose-strong:text-gray-900
                        prose-pre:bg-gray-900 prose-pre:text-gray-50 prose-pre:border prose-pre:border-gray-800 prose-pre:rounded-lg
                        prose-code:text-teal-700 prose-code:bg-teal-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:font-medium prose-code:before:content-none prose-code:after:content-none
                        prose-ul:my-2 prose-li:my-0.5"
                    >
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
                                    <div className="my-4">
                                        <img {...props} className="max-w-full max-h-[500px] rounded-lg border border-gray-200 shadow-sm" loading="lazy" />
                                        {props.alt && <span className="text-xs text-gray-500 mt-1 block text-center">{props.alt}</span>}
                                    </div>
                                ),
                            }}
                        >
                            {textContent}
                        </ReactMarkdown>
                    </div>
                </div>
            </div>
        </div>
    );
};
