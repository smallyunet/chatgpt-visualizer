import { useState } from 'react';
import { useChatData } from './hooks/useChatData';
import { ConversationList } from './components/ConversationList';
import { ChatView } from './components/ChatView';
import { Loader2 } from 'lucide-react';
import './App.css';

function App() {
  const { conversations, loading, error } = useChatData();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedConversation = conversations.find(c => c.uuid === selectedId) || null;

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-900 text-gray-100">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
          <p>Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-900 text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-900">
      <ConversationList
        conversations={conversations}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
      <ChatView conversation={selectedConversation} />
    </div>
  );
}

export default App;
