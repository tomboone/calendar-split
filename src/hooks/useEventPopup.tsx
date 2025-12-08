/**
 * Event Popup Context and Hook
 */

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CalendarEvent } from '../types/calendar';
import { EventPopup } from '../components/EventPopup';

interface EventPopupState {
  event: CalendarEvent | null;
  anchorRect: DOMRect | null;
}

interface EventPopupContextValue {
  openPopup: (event: CalendarEvent, anchorRect: DOMRect) => void;
  closePopup: () => void;
}

const EventPopupContext = createContext<EventPopupContextValue | null>(null);

export function EventPopupProvider({ children }: { children: ReactNode }) {
  const [popupState, setPopupState] = useState<EventPopupState>({
    event: null,
    anchorRect: null,
  });

  const openPopup = useCallback((event: CalendarEvent, anchorRect: DOMRect) => {
    setPopupState({ event, anchorRect });
  }, []);

  const closePopup = useCallback(() => {
    setPopupState({ event: null, anchorRect: null });
  }, []);

  return (
    <EventPopupContext.Provider value={{ openPopup, closePopup }}>
      {children}
      {popupState.event && popupState.anchorRect && (
        <EventPopup
          event={popupState.event}
          anchorRect={popupState.anchorRect}
          onClose={closePopup}
        />
      )}
    </EventPopupContext.Provider>
  );
}

export function useEventPopup(): EventPopupContextValue {
  const context = useContext(EventPopupContext);
  if (!context) {
    throw new Error('useEventPopup must be used within an EventPopupProvider');
  }
  return context;
}
