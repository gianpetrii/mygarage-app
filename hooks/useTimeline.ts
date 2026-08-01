import * as React from 'react';
import { useMaintenanceStore } from '@/store/useMaintenanceStore';
import { buildTimeline, filterTimeline } from '@/lib/timeline';
import type { TimelineEntry, TimelineEntryType } from '@/types';

interface UseTimelineOptions {
  vehicleId?: string | null;
  type?: TimelineEntryType | 'all';
  limit?: number;
}

export function useTimeline(options?: UseTimelineOptions) {
  const { records } = useMaintenanceStore();

  const timeline = React.useMemo(() => {
    const all = buildTimeline(records);
    const filtered = filterTimeline(all, {
      vehicleId: options?.vehicleId,
      type: options?.type,
    });
    if (options?.limit) {
      return filtered.slice(0, options.limit);
    }
    return filtered;
  }, [records, options?.vehicleId, options?.type, options?.limit]);

  return { timeline, total: timeline.length } satisfies { timeline: TimelineEntry[]; total: number };
}
