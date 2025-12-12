import BaseMap from '../components/map/BaseMap';
import EventCard from '../components/events/EventCard';
import { useEvents } from '../hooks/useEvents';

export default function HomePage() {
  const { events } = useEvents();

  return (
    <div style={{ padding: '1rem', display: 'grid', gap: '1rem' }}>
      <BaseMap />
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {events.map((event) => (
          <EventCard key={event.id} title={event.title} description={event.description} />
        ))}
        {events.length === 0 && <p>No events yet.</p>}
      </div>
    </div>
  );
}
