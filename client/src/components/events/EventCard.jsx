export default function EventCard({ title, description }) {
  return (
    <article style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: 12, background: '#fff' }}>
      <h3 style={{ margin: '0 0 0.5rem 0' }}>{title}</h3>
      <p style={{ margin: 0 }}>{description}</p>
    </article>
  );
}
