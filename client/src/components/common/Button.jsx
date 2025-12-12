export default function Button({ children, onClick, type = 'button' }) {
  return (
    <button type={type} onClick={onClick} style={{ padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid #111827', background: '#111827', color: '#fff' }}>
      {children}
    </button>
  );
}
