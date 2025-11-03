/**
 * Custom event system for cross-widget communication
 */

const CHECK_COMPLETE_EVENT = 'bus-check-complete';

export const busCheckEvents = {
  /**
   * Emit check complete event
   */
  emitCheckComplete: () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(CHECK_COMPLETE_EVENT));
    }
  },

  /**
   * Subscribe to check complete event
   */
  onCheckComplete: (callback: () => void) => {
    if (typeof window !== 'undefined') {
      window.addEventListener(CHECK_COMPLETE_EVENT, callback);
      return () => window.removeEventListener(CHECK_COMPLETE_EVENT, callback);
    }
    return () => {};
  },
};
