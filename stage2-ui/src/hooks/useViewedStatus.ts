import { useState, useEffect } from 'react';

export function useViewedStatus() {
  const [viewedIds, setViewedIds] = useState<Set<string>>(() => {
    const stored = localStorage.getItem('viewed_notifications');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  const markAsViewed = (id: string) => {
    if (!viewedIds.has(id)) {
      const next = new Set(viewedIds);
      next.add(id);
      setViewedIds(next);
      localStorage.setItem('viewed_notifications', JSON.stringify(Array.from(next)));
    }
  };

  return { viewedIds, markAsViewed };
}
