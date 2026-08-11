import React, { useEffect, useState } from 'react';

/**
 * A simple UI element to show connected participants.
 * Could be rendered in a panel or injected into a custom toolbar slot (if supported).
 */
export const PresenceIndicators = ({ pluginApi }) => {
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    return pluginApi.subscribeEvent('collaboration.presence.updated', (pList) => {
      setParticipants(pList);
    });
  }, [pluginApi]);

  return (
    <div style={{ display: 'flex', gap: '8px', padding: '10px' }}>
      <div style={{ color: '#ccc', marginRight: '10px' }}>Collaborators:</div>
      {participants.map(p => (
        <div key={p.id} title={p.name} style={{
          width: '24px', height: '24px', borderRadius: '50%',
          background: '#007acc', color: '#fff', 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '12px', fontWeight: 'bold'
        }}>
          {p.name.charAt(0).toUpperCase()}
        </div>
      ))}
      {participants.length === 0 && <span style={{color: '#888'}}>None</span>}
    </div>
  );
};
