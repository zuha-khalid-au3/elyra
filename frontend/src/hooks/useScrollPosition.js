import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for tracking and controlling scroll position
 * @param {Object} options - Configuration options
 * @param {boolean} options.throttle - Throttle time in milliseconds (default: 100)
 * @param {boolean} options.autoUpdate - Whether to automatically update scroll position (default: true)
 * @param {HTMLElement|Window} options.target - The scrollable element (default: window)
 * @returns {Object} Scroll position and controls
 */
const useScrollPosition = (options = {}) => {
  const {
    throttle = 100,
    autoUpdate = true,
    target = typeof window !== 'undefined' ? window : null,
  } = options;

  const [position, setPosition] = useState({
    x: 0,
    y: 0,
    scrollX: 0,
    scrollY: 0,
    scrollHeight: 0,
    scrollWidth: 0,
    clientHeight: 0,
    clientWidth: 0,
    isScrollingDown: false,
    isScrollingUp: false,
    isAtTop: true,
    isAtBottom: false,
    isAtLeft: true,
    isAtRight: false,
    direction: null, // 'up', 'down', 'left', 'right', or null
  });

  const lastScrollY = useRef(0);
  const lastScrollX = useRef(0);
  const ticking = useRef(false);
  const rafId = useRef(null);
  const targetRef = useRef(target);

  // Update the target reference if it changes
  useEffect(() => {
    targetRef.current = target;
  }, [target]);

  // Get scroll position from the target element
  const getScrollPosition = useCallback(() => {
    if (!targetRef.current) {
      return {
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        scrollHeight: 0,
        scrollWidth: 0,
        clientHeight: 0,
        clientWidth: 0,
        isScrollingDown: false,
        isScrollingUp: false,
        isAtTop: true,
        isAtBottom: false,
        isAtLeft: true,
        isAtRight: false,
        direction: null,
      };
    }

    // For window
    if (targetRef.current === window) {
      const x = window.pageXOffset || document.documentElement.scrollLeft;
      const y = window.pageYOffset || document.documentElement.scrollTop;
      
      const scrollHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight,
        document.body.clientHeight,
        document.documentElement.clientHeight
      );
      
      const clientHeight = window.innerHeight || document.documentElement.clientHeight;
      const clientWidth = window.innerWidth || document.documentElement.clientWidth;
      
      const scrollWidth = Math.max(
        document.body.scrollWidth,
        document.documentElement.scrollWidth,
        document.body.offsetWidth,
        document.documentElement.offsetWidth,
        document.body.clientWidth,
        document.documentElement.clientWidth
      );
      
      const isScrollingDown = y > lastScrollY.current;
      const isScrollingUp = y < lastScrollY.current;
      const isAtTop = y <= 0;
      const isAtBottom = y + clientHeight >= scrollHeight - 1; // Add small buffer
      const isAtLeft = x <= 0;
      const isAtRight = x + clientWidth >= scrollWidth - 1; // Add small buffer
      
      let direction = null;
      if (y !== lastScrollY.current) {
        direction = y > lastScrollY.current ? 'down' : 'up';
      } else if (x !== lastScrollX.current) {
        direction = x > lastScrollX.current ? 'right' : 'left';
      }
      
      lastScrollY.current = y;
      lastScrollX.current = x;
      
      return {
        x,
        y,
        scrollX: x,
        scrollY: y,
        scrollHeight,
        scrollWidth,
        clientHeight,
        clientWidth,
        isScrollingDown,
        isScrollingUp,
        isAtTop,
        isAtBottom,
        isAtLeft,
        isAtRight,
        direction,
      };
    }
    
    // For other elements
    const {
      scrollLeft: x,
      scrollTop: y,
      scrollWidth,
      scrollHeight,
      clientWidth,
      clientHeight,
    } = targetRef.current;
    
    const isScrollingDown = y > lastScrollY.current;
    const isScrollingUp = y < lastScrollY.current;
    const isAtTop = y <= 0;
    const isAtBottom = y + clientHeight >= scrollHeight - 1; // Add small buffer
    const isAtLeft = x <= 0;
    const isAtRight = x + clientWidth >= scrollWidth - 1; // Add small buffer
    
    let direction = null;
    if (y !== lastScrollY.current) {
      direction = y > lastScrollY.current ? 'down' : 'up';
    } else if (x !== lastScrollX.current) {
      direction = x > lastScrollX.current ? 'right' : 'left';
    }
    
    lastScrollY.current = y;
    lastScrollX.current = x;
    
    return {
      x,
      y,
      scrollX: x,
      scrollY: y,
      scrollWidth,
      scrollHeight,
      clientWidth,
      clientHeight,
      isScrollingDown,
      isScrollingUp,
      isAtTop,
      isAtBottom,
      isAtLeft,
      isAtRight,
      direction,
    };
  }, []);

  // Update scroll position state
  const updatePosition = useCallback(() => {
    if (ticking.current) return;
    
    ticking.current = true;
    
    rafId.current = requestAnimationFrame(() => {
      setPosition(getScrollPosition());
      ticking.current = false;
    });
  }, [getScrollPosition]);

  // Throttled update scroll position
  const throttledUpdatePosition = useCallback(
    throttle
      ? (() => {
          let lastCall = 0;
          return () => {
            const now = Date.now();
            if (now - lastCall >= throttle) {
              lastCall = now;
              updatePosition();
            }
          };
        })()
      : updatePosition,
    [throttle, updatePosition]
  );

  // Set up scroll event listener
  useEffect(() => {
    if (!autoUpdate || !targetRef.current) return;

    const handleScroll = () => {
      throttledUpdatePosition();
    };

    targetRef.current.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial update
    updatePosition();
    
    // Clean up
    return () => {
      if (targetRef.current) {
        targetRef.current.removeEventListener('scroll', handleScroll);
      }
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [autoUpdate, throttledUpdatePosition, updatePosition]);

  /**
   * Scroll to a specific position
   * @param {Object|number} options - Options object or y-coordinate
   * @param {number} [options.x] - X position to scroll to
   * @param {number} [options.y] - Y position to scroll to
   * @param {string} [options.behavior='auto'] - Scroll behavior ('auto' or 'smooth')
   */
  const scrollTo = useCallback((options) => {
    if (!targetRef.current) return;
    
    const {
      x = 0,
      y = 0,
      behavior = 'auto',
    } = typeof options === 'number' ? { y: options } : options;
    
    if (targetRef.current === window) {
      window.scrollTo({
        left: x,
        top: y,
        behavior,
      });
    } else {
      targetRef.current.scrollTo({
        left: x,
        top: y,
        behavior,
      });
    }
    
    // Update position state
    updatePosition();
  }, [updatePosition]);

  /**
   * Scroll to the top of the target
   * @param {Object} [options] - Scroll options
   * @param {string} [options.behavior='smooth'] - Scroll behavior
   */
  const scrollToTop = useCallback((options = {}) => {
    scrollTo({
      x: 0,
      y: 0,
      behavior: 'smooth',
      ...options,
    });
  }, [scrollTo]);

  /**
   * Scroll to the bottom of the target
   * @param {Object} [options] - Scroll options
   * @param {string} [options.behavior='smooth'] - Scroll behavior
   */
  const scrollToBottom = useCallback((options = {}) => {
    if (!targetRef.current) return;
    
    const { scrollHeight, clientWidth } = getScrollPosition();
    
    scrollTo({
      x: 0,
      y: scrollHeight - clientWidth,
      behavior: 'smooth',
      ...options,
    });
  }, [getScrollPosition, scrollTo]);

  // Return the current position and controls
  return {
    ...position,
    scrollTo,
    scrollToTop,
    scrollToBottom,
    getScrollPosition,
    target: targetRef.current,
  };
};

export default useScrollPosition;
