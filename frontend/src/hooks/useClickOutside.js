import { useEffect, useRef } from 'react';

/**
 * Custom hook that triggers a callback when a click occurs outside of the specified element
 * @param {Function} handler - Callback function to execute when a click outside occurs
 * @param {boolean} [listenWhen=true] - Whether the event listener should be active
 * @returns {Object} Ref to attach to the target element
 */
const useClickOutside = (handler, listenWhen = true) => {
  const ref = useRef(null);

  useEffect(() => {
    // Only set up the event listener if listenWhen is true
    if (!listenWhen) return;

    const handleClickOutside = (event) => {
      // If the ref is not set or the click was inside the ref element, do nothing
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }

      // Execute the handler if click is outside
      handler(event);
    };

    // Add event listeners for both mouse and touch events
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    // Clean up event listeners
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [handler, listenWhen]);

  return ref;
};

export default useClickOutside;
