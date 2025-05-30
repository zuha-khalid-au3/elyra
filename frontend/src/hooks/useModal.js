import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Custom hook for managing modal state and behavior
 * @param {Object} options - Configuration options
 * @param {boolean} options.initialOpen - Whether the modal is initially open
 * @param {Function} options.onOpen - Callback when modal opens
 * @param {Function} options.onClose - Callback when modal closes
 * @param {boolean} options.closeOnEsc - Whether to close the modal on ESC key press (default: true)
 * @param {boolean} options.closeOnOutsideClick - Whether to close the modal when clicking outside (default: true)
 * @param {boolean} options.preventScroll - Whether to prevent body scroll when modal is open (default: true)
 * @returns {Object} Modal state and handlers
 */
const useModal = (options = {}) => {
  const {
    initialOpen = false,
    onOpen: onOpenCallback,
    onClose: onCloseCallback,
    closeOnEsc = true,
    closeOnOutsideClick = true,
    preventScroll = true,
  } = options;

  const [isOpen, setIsOpen] = useState(initialOpen);
  const modalRef = useRef(null);
  const lastFocusedElement = useRef(null);

  // Handle body scroll when modal is open
  useEffect(() => {
    if (preventScroll) {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }

    return () => {
      if (preventScroll) {
        document.body.style.overflow = '';
      }
    };
  }, [isOpen, preventScroll]);

  // Handle ESC key press to close modal
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeOnEsc]);

  // Handle outside click to close modal
  useEffect(() => {
    if (!isOpen || !closeOnOutsideClick) return;

    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        closeModal();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, closeOnOutsideClick]);

  // Focus management for accessibility
  useEffect(() => {
    if (isOpen) {
      // Save the element that had focus before opening the modal
      lastFocusedElement.current = document.activeElement;
      
      // Focus the modal when it opens
      if (modalRef.current) {
        modalRef.current.focus();
      }
      
      // Call onOpen callback if provided
      if (onOpenCallback) {
        onOpenCallback();
      }
    } else {
      // Restore focus to the previously focused element when modal closes
      if (lastFocusedElement.current) {
        lastFocusedElement.current.focus();
      }
      
      // Call onClose callback if provided
      if (onCloseCallback) {
        onCloseCallback();
      }
    }
  }, [isOpen, onOpenCallback, onCloseCallback]);

  /**
   * Open the modal
   */
  const openModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  /**
   * Close the modal
   */
  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  /**
   * Toggle the modal open/close state
   */
  const toggleModal = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  /**
   * Get props to spread on the modal container
   */
  const getModalProps = useCallback((props = {}) => ({
    role: 'dialog',
    'aria-modal': true,
    tabIndex: -1,
    ref: modalRef,
    ...props,
  }), []);

  /**
   * Get props for the modal overlay/backdrop
   */
  const getBackdropProps = useCallback((props = {}) => ({
    role: 'presentation',
    'aria-hidden': true,
    ...props,
  }), []);

  /**
   * Get props for the close button
   */
  const getCloseButtonProps = useCallback((props = {}) => ({
    'aria-label': 'Close modal',
    onClick: closeModal,
    type: 'button',
    ...props,
  }), [closeModal]);

  return {
    // State
    isOpen,
    
    // Actions
    openModal,
    closeModal,
    toggleModal,
    
    // Refs
    modalRef,
    
    // Prop getters
    getModalProps,
    getBackdropProps,
    getCloseButtonProps,
  };
};

export default useModal;
