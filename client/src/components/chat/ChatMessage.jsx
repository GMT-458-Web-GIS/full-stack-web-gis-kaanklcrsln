export default function ChatMessage({ author, content, authorId, onAuthorClick }) {
  return (
    <div style={{ padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb' }}>
      <div
        style={{
          fontWeight: 600,
          color: '#4a7ab5',
          cursor: authorId && onAuthorClick ? 'pointer' : 'default',
          transition: 'color 0.2s'
        }}
        onMouseEnter={(e) => {
          if (authorId && onAuthorClick) {
            e.target.style.color = '#3d5f8d';
          }
        }}
        onMouseLeave={(e) => {
          if (authorId && onAuthorClick) {
            e.target.style.color = '#4a7ab5';
          }
        }}
        onClick={() => {
          if (authorId && onAuthorClick) {
            onAuthorClick(authorId);
          }
        }}
      >
        {author}
      </div>
      <div>{content}</div>
    </div>
  );
}
