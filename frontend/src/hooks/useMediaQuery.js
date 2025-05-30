import { useState, useEffect, useCallback } from 'react';

// Common breakpoints in pixels (Tailwind CSS default breakpoints)
const breakpoints = {
  sm: 640,    // Small screens, phones
  md: 768,    // Medium screens, tablets
  lg: 1024,   // Large screens, small laptops
  xl: 1280,   // Extra large screens, desktops
  '2xl': 1536, // 2x extra large screens, large desktops
};

/**
 * Custom hook for handling media queries in React
 * @param {string|number} query - The media query string or breakpoint key
 * @returns {boolean} Whether the media query matches
 */
const useMediaQuery = (query) => {
  // Convert breakpoint key to media query if needed
  const getMediaQuery = useCallback((queryInput) => {
    // If it's a number, assume it's a pixel value
    if (typeof queryInput === 'number') {
      return `(min-width: ${queryInput}px)`;
    }
    
    // If it's a breakpoint key, use the corresponding pixel value
    if (breakpoints[queryInput]) {
      return `(min-width: ${breakpoints[queryInput]}px)`;
    }
    
    // Otherwise, assume it's a custom media query
    return queryInput;
  }, []);

  // Create media query string
  const mediaQuery = getMediaQuery(query);
  
  // State for whether the media query matches
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(mediaQuery).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Create media query list
    const mediaQueryList = window.matchMedia(mediaQuery);
    
    // Update state when media query changes
    const handleChange = (event) => {
      setMatches(event.matches);
    };
    
    // Initial check
    setMatches(mediaQueryList.matches);
    
    // Add listener for changes
    mediaQueryList.addListener(handleChange);
    
    // Clean up
    return () => {
      mediaQueryList.removeListener(handleChange);
    };
  }, [mediaQuery]);

  return matches;
};

/**
 * Hook to check if the current viewport is mobile-sized
 * @returns {boolean} True if the viewport is mobile-sized
 */
const useIsMobile = () => {
  return !useMediaQuery('md');
};

/**
 * Hook to check if the current viewport is tablet-sized
 * @returns {boolean} True if the viewport is tablet-sized
 */
const useIsTablet = () => {
  const isTablet = useMediaQuery('md');
  const isLaptop = useMediaQuery('lg');
  return isTablet && !isLaptop;
};

/**
 * Hook to check if the current viewport is desktop-sized
 * @returns {boolean} True if the viewport is desktop-sized
 */
const useIsDesktop = () => {
  return useMediaQuery('lg');
};

export default useMediaQuery;
export { useIsMobile, useIsTablet, useIsDesktop };

// Example usage:
// const isMobile = useIsMobile();
// const isTablet = useIsTablet();
// const isDesktop = useIsDesktop();
// const isLargeScreen = useMediaQuery(1200);
// const isCustomBreakpoint = useMediaQuery('(min-width: 1200px) and (max-width: 1400px)');
