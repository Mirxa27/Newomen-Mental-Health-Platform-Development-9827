// Responsive design utilities and breakpoints
export const breakpoints = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

// Media query helpers
export const mediaQueries = {
  xs: `(min-width: ${breakpoints.xs})`,
  sm: `(min-width: ${breakpoints.sm})`,
  md: `(min-width: ${breakpoints.md})`,
  lg: `(min-width: ${breakpoints.lg})`,
  xl: `(min-width: ${breakpoints.xl})`,
  '2xl': `(min-width: ${breakpoints['2xl']})`,
  
  // Max width queries
  maxXs: `(max-width: ${breakpoints.xs})`,
  maxSm: `(max-width: ${breakpoints.sm})`,
  maxMd: `(max-width: ${breakpoints.md})`,
  maxLg: `(max-width: ${breakpoints.lg})`,
  maxXl: `(max-width: ${breakpoints.xl})`,
  
  // Common device-specific queries
  mobile: '(max-width: 768px)',
  tablet: '(min-width: 769px) and (max-width: 1024px)',
  desktop: '(min-width: 1025px)',
  
  // Orientation queries
  portrait: '(orientation: portrait)',
  landscape: '(orientation: landscape)',
  
  // High DPI displays
  retina: '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)',
  
  // Touch devices
  touch: '(hover: none) and (pointer: coarse)',
  noTouch: '(hover: hover) and (pointer: fine)',
  
  // Reduced motion preference
  reducedMotion: '(prefers-reduced-motion: reduce)',
  
  // Dark mode preference
  darkMode: '(prefers-color-scheme: dark)',
  lightMode: '(prefers-color-scheme: light)'
};

// Responsive spacing scale
export const spacing = {
  xs: {
    padding: 'p-2',
    margin: 'm-2',
    gap: 'gap-2'
  },
  sm: {
    padding: 'p-4',
    margin: 'm-4',
    gap: 'gap-4'
  },
  md: {
    padding: 'p-6',
    margin: 'm-6',
    gap: 'gap-6'
  },
  lg: {
    padding: 'p-8',
    margin: 'm-8',
    gap: 'gap-8'
  },
  xl: {
    padding: 'p-12',
    margin: 'm-12',
    gap: 'gap-12'
  }
};

// Responsive typography classes
export const typography = {
  mobile: {
    h1: 'text-2xl font-bold',
    h2: 'text-xl font-semibold',
    h3: 'text-lg font-medium',
    h4: 'text-base font-medium',
    body: 'text-sm',
    caption: 'text-xs'
  },
  tablet: {
    h1: 'text-3xl font-bold',
    h2: 'text-2xl font-semibold',
    h3: 'text-xl font-medium',
    h4: 'text-lg font-medium',
    body: 'text-base',
    caption: 'text-sm'
  },
  desktop: {
    h1: 'text-4xl font-bold',
    h2: 'text-3xl font-semibold',
    h3: 'text-2xl font-medium',
    h4: 'text-xl font-medium',
    body: 'text-base',
    caption: 'text-sm'
  }
};

// Grid system utilities
export const grid = {
  cols: {
    mobile: 'grid-cols-1',
    tablet: 'grid-cols-2',
    desktop: 'grid-cols-3'
  },
  responsive: {
    '1-2-3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    '1-2-4': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    '1-3': 'grid-cols-1 lg:grid-cols-3',
    '2-4': 'grid-cols-2 lg:grid-cols-4'
  }
};

// Container utilities
export const containers = {
  full: 'w-full',
  screen: 'w-screen',
  responsive: 'w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  narrow: 'w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8',
  wide: 'w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8'
};

// Navigation utilities
export const navigation = {
  mobile: {
    height: 'h-16',
    padding: 'px-4',
    zIndex: 'z-50'
  },
  desktop: {
    height: 'h-20',
    padding: 'px-6 lg:px-8',
    zIndex: 'z-50'
  },
  sidebar: {
    width: 'w-64',
    mobileWidth: 'w-80',
    zIndex: 'z-40'
  }
};

// Safe area utilities for mobile devices
export const safeArea = {
  top: 'pt-safe-top',
  bottom: 'pb-safe-bottom',
  left: 'pl-safe-left',
  right: 'pr-safe-right',
  all: 'p-safe'
};

// Device detection utilities
export const deviceDetection = {
  isMobile: () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  },
  
  isTablet: () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= 768 && window.innerWidth < 1024;
  },
  
  isDesktop: () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= 1024;
  },
  
  isTouchDevice: () => {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },
  
  isRetina: () => {
    if (typeof window === 'undefined') return false;
    return window.devicePixelRatio > 1;
  },
  
  getOrientation: () => {
    if (typeof window === 'undefined') return 'portrait';
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  }
};

// Responsive image utilities
export const images = {
  responsive: 'w-full h-auto',
  cover: 'w-full h-full object-cover',
  contain: 'w-full h-full object-contain',
  aspectRatio: {
    square: 'aspect-square',
    video: 'aspect-video',
    '4/3': 'aspect-4/3',
    '3/2': 'aspect-3/2'
  }
};

// Animation utilities for responsive design
export const animations = {
  mobile: {
    duration: 'duration-200',
    ease: 'ease-out'
  },
  desktop: {
    duration: 'duration-300',
    ease: 'ease-in-out'
  },
  reducedMotion: {
    duration: 'duration-0',
    ease: 'ease-linear'
  }
};

// Utility functions
export const utils = {
  // Get responsive class based on breakpoint
  getResponsiveClass: (mobileClass, tabletClass, desktopClass) => {
    return `${mobileClass} md:${tabletClass} lg:${desktopClass}`;
  },
  
  // Get padding based on screen size
  getResponsivePadding: (size = 'md') => {
    const paddingMap = {
      xs: 'p-2 md:p-4',
      sm: 'p-4 md:p-6',
      md: 'p-4 md:p-6 lg:p-8',
      lg: 'p-6 md:p-8 lg:p-12',
      xl: 'p-8 md:p-12 lg:p-16'
    };
    return paddingMap[size] || paddingMap.md;
  },
  
  // Get margin based on screen size
  getResponsiveMargin: (size = 'md') => {
    const marginMap = {
      xs: 'm-2 md:m-4',
      sm: 'm-4 md:m-6',
      md: 'm-4 md:m-6 lg:m-8',
      lg: 'm-6 md:m-8 lg:m-12',
      xl: 'm-8 md:m-12 lg:m-16'
    };
    return marginMap[size] || marginMap.md;
  },
  
  // Get gap based on screen size
  getResponsiveGap: (size = 'md') => {
    const gapMap = {
      xs: 'gap-2 md:gap-4',
      sm: 'gap-4 md:gap-6',
      md: 'gap-4 md:gap-6 lg:gap-8',
      lg: 'gap-6 md:gap-8 lg:gap-12',
      xl: 'gap-8 md:gap-12 lg:gap-16'
    };
    return gapMap[size] || gapMap.md;
  },
  
  // Get text size based on screen size
  getResponsiveText: (type = 'body') => {
    const textMap = {
      h1: 'text-2xl md:text-3xl lg:text-4xl',
      h2: 'text-xl md:text-2xl lg:text-3xl',
      h3: 'text-lg md:text-xl lg:text-2xl',
      h4: 'text-base md:text-lg lg:text-xl',
      body: 'text-sm md:text-base',
      caption: 'text-xs md:text-sm'
    };
    return textMap[type] || textMap.body;
  }
};

export default {
  breakpoints,
  mediaQueries,
  spacing,
  typography,
  grid,
  containers,
  navigation,
  safeArea,
  deviceDetection,
  images,
  animations,
  utils
};