import React, { useState } from 'react';

interface Props {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export const CollapsibleSection: React.FC<Props> = ({ title, defaultOpen = false, children }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="section">
      <h2 className={open ? 'open' : ''} onClick={() => setOpen(!open)}>
        {title}
      </h2>
      <div className={`section-body ${open ? 'open' : ''}`}>
        {children}
      </div>
    </div>
  );
};
