import { useParams } from 'react-router-dom';
import ChatMessage from '../components/chat/ChatMessage';
import { useRealtimeChat } from '../hooks/useRealtimeChat';

export default function ChatRoomPage() {
  const { id } = useParams();
  const { messages } = useRealtimeChat(id);

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Chat Room</h2>
      <div style={{ display: 'grid', gap: '0.5rem' }}>
        {messages.map((msg) => (
          <ChatMessage key={msg.id} author={msg.user_id} content={msg.content} />
        ))}
        {messages.length === 0 && <p>No messages yet.</p>}
      </div>
    </div>
  );
}
