import { useParams } from 'react-router-dom';

export default function EventDetailPage() {
  const { id } = useParams();

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Event Detail</h2>
      <p>Event id: {id}</p>
    </div>
  );
}
