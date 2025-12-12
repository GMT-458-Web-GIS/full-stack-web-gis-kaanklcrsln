export default function ChatMessage({ author, content }) {
  return (
    <div style={{ padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb' }}>
      <div style={{ fontWeight: 600 }}>{author}</div>
      <div>{content}</div>
    </div>
  );
}
