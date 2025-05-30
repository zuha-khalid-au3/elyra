import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for implementing infinite scroll functionality
 * @param {Object} options - Configuration options
 * @param {Function} options.fetchMore - Function to fetch more items
 * @param {boolean} options.hasMore - Whether there are more items to load
 * @param {number} options.threshold - Distance from bottom of page to trigger fetch (in pixels)
 * @param {boolean} options.initialLoad - Whether to load initial data (default: true)
 * @param {number} options.initialPage - Initial page number (default: 1)
 * @returns {Object} Infinite scroll state and handlers
 */
const useInfiniteScroll = ({
  fetchMore,
  hasMore,
  threshold = 200,
  initialLoad = true,
  initialPage = 1,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(initialPage);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const observer = useRef(null);
  const loadingRef = useRef(false);
  const lastItemRef = useRef(null);

  // Reset state when dependencies change
  const reset = useCallback(() => {
    setPage(initialPage);
    setItems([]);
    setError(null);
    loadingRef.current = false;
  }, [initialPage]);

  // Load more items
  const loadMore = useCallback(async () => {
    // Prevent multiple simultaneous loads
    if (loadingRef.current || !hasMore) return;

    try {
      loadingRef.current = true;
      setIsLoading(true);
      setError(null);

      const newItems = await fetchMore(page);
      
      setItems(prevItems => [...prevItems, ...newItems]);
      setPage(prevPage => prevPage + 1);
    } catch (err) {
      console.error('Error loading more items:', err);
      setError(err.message || 'Failed to load more items');
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, [fetchMore, hasMore, page]);

  // Initial load
  useEffect(() => {
    if (initialLoad) {
      loadMore();
    }
    
    return () => {
      // Cleanup observer on unmount
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [initialLoad, loadMore]);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (!hasMore || isLoading) return;

    const handleObserver = (entries) => {
      const target = entries[0];
      if (target.isIntersecting) {
        loadMore();
      }
    };

    // Create observer
    const observerOptions = {
      root: null, // viewport
      rootMargin: `0px 0px ${threshold}px 0px`,
      threshold: 0.1,
    };

    observer.current = new IntersectionObserver(handleObserver, observerOptions);

    // Observe the last item
    if (lastItemRef.current) {
      observer.current.observe(lastItemRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [hasMore, isLoading, loadMore, threshold]);

  /**
   * Get props for the last item in the list (to be observed for infinite scroll)
   */
  const getLastItemProps = useCallback((props = {}) => ({
    ref: lastItemRef,
    ...props,
  }), []);

  /**
   * Manually trigger a refresh of the list
   */
  const refresh = useCallback(async () => {
    reset();
    await loadMore();
  }, [loadMore, reset]);

  return {
    // State
    items,
    isLoading,
    error,
    page,
    hasMore,
    
    // Refs
    lastItemRef,
    
    // Actions
    loadMore,
    refresh,
    reset,
    
    // Prop getters
    getLastItemProps,
  };
};

export default useInfiniteScroll;
