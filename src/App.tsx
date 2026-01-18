import { useState } from 'react';
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

  const selectedConversation = conversations.find(c => c.uuid === selectedId) || null;

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
