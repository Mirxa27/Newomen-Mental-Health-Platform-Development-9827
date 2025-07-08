import { useState, useEffect } from 'react';

export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') {
      return;
    }

    const media = window.matchMedia(query);
    
    // Update the state initially
    setMatches(media.matches);
    
    // Define callback for media query changes
    const listener = (event) => {
      setMatches(event.matches);
    };
    
    // Add listener for changes
    if (media && typeof media.addEventListener === 'function') {
      media.addEventListener('change', listener);
      
      // Clean up
      return () => {
        if (media && typeof media.removeEventListener === 'function') {
          media.removeEventListener('change', listener);
        }
      };
    }
  }, [query]);

  return matches;
};