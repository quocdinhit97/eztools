// Google Analytics tracking utilities
declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string,
      config?: Record<string, any>
    ) => void;
  }
}

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-TNXXTD33WN';

// Generic event tracker
export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, any>
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams);
  }
};

// Track page view
export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
};

// Track tool usage
export const trackToolUsage = (toolName: string, action?: string) => {
  trackEvent('tool_used', {
    tool_name: toolName,
    action: action || 'view',
  });
};

// Track button click
export const trackButtonClick = (
  buttonName: string,
  location?: string,
  additionalData?: Record<string, any>
) => {
  trackEvent('button_click', {
    button_name: buttonName,
    location,
    ...additionalData,
  });
};

// Track form submission
export const trackFormSubmit = (
  formName: string,
  success: boolean,
  errorMessage?: string
) => {
  trackEvent('form_submit', {
    form_name: formName,
    success,
    error_message: errorMessage,
  });
};

// Track search
export const trackSearch = (
  searchTerm: string,
  resultCount?: number,
  location?: string
) => {
  trackEvent('search', {
    search_term: searchTerm,
    result_count: resultCount,
    location,
  });
};

// Track copy action
export const trackCopy = (
  contentType: string,
  location?: string,
  contentLength?: number
) => {
  trackEvent('copy', {
    content_type: contentType,
    location,
    content_length: contentLength,
  });
};

// Track download
export const trackDownload = (
  fileType: string,
  fileName?: string,
  fileSize?: number
) => {
  trackEvent('download', {
    file_type: fileType,
    file_name: fileName,
    file_size: fileSize,
  });
};

// Track navigation
export const trackNavigation = (
  destination: string,
  source?: string,
  method?: string
) => {
  trackEvent('navigation', {
    destination,
    source,
    method,
  });
};

// Track error
export const trackError = (
  errorType: string,
  errorMessage: string,
  location?: string
) => {
  trackEvent('error', {
    error_type: errorType,
    error_message: errorMessage,
    location,
  });
};

// Track feature usage
export const trackFeatureUsage = (
  featureName: string,
  action: string,
  value?: any
) => {
  trackEvent('feature_usage', {
    feature_name: featureName,
    action,
    value,
  });
};
