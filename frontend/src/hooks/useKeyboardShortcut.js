import { useEffect, useCallback } from 'react';

/**
 * Custom hook for handling keyboard shortcuts
 * @param {Object} shortcuts - Object mapping key combinations to handler functions
 * @param {Array} dependencies - Dependencies for the effect
 * @param {HTMLElement|Document} [target=document] - The target element to attach event listeners to
 * @param {Object} [options] - Additional options
 * @param {boolean} [options.enabled=true] - Whether the keyboard shortcuts are enabled
 * @param {boolean} [options.preventDefault=false] - Whether to prevent default behavior for the keys
 * @param {boolean} [options.stopPropagation=false] - Whether to stop event propagation
 */
const useKeyboardShortcut = (
  shortcuts,
  dependencies = [],
  target = document,
  options = {}
) => {
  const {
    enabled = true,
    preventDefault = false,
    stopPropagation = false,
  } = options;

  // Memoize the handler to avoid unnecessary re-renders
  const handleKeyPress = useCallback(
    (event) => {
      if (!enabled) return;

      // Get the key combination
      const keys = [];
      if (event.ctrlKey || event.metaKey) keys.push('mod');
      if (event.altKey) keys.push('alt');
      if (event.shiftKey) keys.push('shift');
      
      // Handle both ' ' and 'Space' for the spacebar
      const key = event.key === ' ' ? 'space' : event.key.toLowerCase();
      keys.push(key);
      
      const keyCombination = keys.join('+');

      // Find and execute the matching handler
      const handler = shortcuts[keyCombination];
      if (handler) {
        if (preventDefault) {
          event.preventDefault();
        }
        if (stopPropagation) {
          event.stopPropagation();
        }
        
        // Pass the event to the handler
        handler(event);
      }
    },
    [enabled, preventDefault, shortcuts, stopPropagation]
  );

  // Set up event listeners
  useEffect(() => {
    if (!target) return;
    
    const eventType = 'keydown';
    target.addEventListener(eventType, handleKeyPress);
    
    // Clean up
    return () => {
      target.removeEventListener(eventType, handleKeyPress);
    };
  }, [handleKeyPress, target, ...dependencies]);
};

export default useKeyboardShortcut;

// Example usage:
/*
useKeyboardShortcut(
  {
    // Format: 'mod+s': handler
    'mod+s': (e) => {
      e.preventDefault();
      handleSave();
    },
    'escape': () => {
      closeModal();
    },
    'arrowup': () => {
      // Handle up arrow
    },
    'arrowdown': () => {
      // Handle down arrow
    },
  },
  [handleSave, closeModal], // Dependencies
  document, // Target element (defaults to document)
  {
    enabled: isModalOpen, // Only active when modal is open
    preventDefault: true, // Prevent default browser behavior
    stopPropagation: false, // Whether to stop event propagation
  }
);
*/
