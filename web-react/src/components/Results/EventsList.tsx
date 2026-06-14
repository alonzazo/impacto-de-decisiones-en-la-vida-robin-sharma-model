import React from 'react';
import type { SimulationEvent } from '../../types/simulation';

interface Props {
  events: SimulationEvent[];
}

export const EventsList: React.FC<Props> = ({ events }) => (
  <div className="events-list">
    <h2 style={{ cursor: 'default', fontSize: '.85em', margin: '6px 0' }}>Eventos</h2>
    {events.map((event, i) => (
      <div className="event-item" key={i}>
        <span className="event-icon">{event.icon}</span>
        <span className="event-age">{event.age.toFixed(1)}</span>
        <span>{event.text}</span>
      </div>
    ))}
  </div>
);
