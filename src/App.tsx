import { useEffect, useMemo, useRef, useState } from 'react';
import { useChatData } from './hooks/useChatData';
import { ConversationList } from './components/ConversationList';
import { ChatView } from './components/ChatView';
import { StatsView } from './components/StatsView';
import { WelcomeView } from './components/WelcomeView';
import { Loader2 } from 'lucide-react';
import './App.css';

function App() {
  const { conversations, loading, error, loadFromFile } = useChatData();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const initialSelectedIdRef = useRef<string | null | undefined>(undefined);
  if (initialSelectedIdRef.current === undefined) {
    const params = new URLSearchParams(window.location.search);
    initialSelectedIdRef.current = params.get('c');
  }

  // Apply initial selection from URL once conversations are loaded.
  useEffect(() => {
    const urlSelected = initialSelectedIdRef.current;
    if (!urlSelected) return;
    if (selectedId !== null) return;

    const exists = conversations.some(c => c.uuid === urlSelected);
    if (exists) setSelectedId(urlSelected);
  }, [conversations, selectedId]);

  // Keep URL in sync with selection.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (selectedId) {
      url.searchParams.set('c', selectedId);
    } else {
      url.searchParams.delete('c');
    }
    window.history.replaceState({}, '', url);
  }, [selectedId]);

  const selectedConversation = useMemo(
    () => conversations.find(c => c.uuid === selectedId) || null,
    [conversations, selectedId]
  );

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white text-gray-900">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="animate-spin h-8 w-8 text-indigo-500" />
          <p className="text-gray-500 font-medium animate-pulse">Loading workspace...</p>
        </div>
      </div>
    );
  }

  // Show welcome view if no conversations are loaded (either initial load failed/empty or waiting for file)
  if (conversations.length === 0) {
    return (
      <WelcomeView onFileUpload={loadFromFile} error={error} />
    );
  }

  if (error) {
    // If we have conversations but an error occurring later (unlikely with current hook logic, but safety net)
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white">
      <ConversationList
        conversations={conversations}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
      {selectedConversation ? (
        <ChatView conversation={selectedConversation} />
      ) : (
        <StatsView conversations={conversations} />
      )}
    </div>
  );
}

export default App;
