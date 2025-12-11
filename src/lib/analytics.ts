import { getAnalytics, logEvent, setUserId, setUserProperties, isSupported } from "firebase/analytics";
import type { Analytics } from "firebase/analytics";
import app from "./firebase";

let analytics: Analytics | null = null;

export const initAnalytics = async (): Promise<Analytics | null> => {
  if (typeof window === "undefined") return null;
  
  if (analytics) return analytics;
  
  const supported = await isSupported();
  if (supported) {
    analytics = getAnalytics(app);
  }
  
  return analytics;
};

export const trackPageView = async (pagePath: string, pageTitle?: string) => {
  const analyticsInstance = await initAnalytics();
  if (!analyticsInstance) return;
  
  logEvent(analyticsInstance, "page_view", {
    page_path: pagePath,
    page_title: pageTitle || document.title,
    page_location: window.location.href,
  });
};

export const trackEvent = async (
  eventName: string,
  eventParams?: Record<string, string | number | boolean>
) => {
  const analyticsInstance = await initAnalytics();
  if (!analyticsInstance) return;
  
  logEvent(analyticsInstance, eventName, eventParams);
};

export const trackUserAction = async (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  await trackEvent("user_action", {
    action,
    category,
    ...(label && { label }),
    ...(value !== undefined && { value }),
  });
};

export const trackButtonClick = async (buttonName: string, location?: string) => {
  await trackEvent("button_click", {
    button_name: buttonName,
    ...(location && { location }),
  });
};

export const trackFormSubmit = async (formName: string, success: boolean) => {
  await trackEvent("form_submit", {
    form_name: formName,
    success,
  });
};

export const trackSearch = async (searchTerm: string, resultsCount?: number) => {
  await trackEvent("search", {
    search_term: searchTerm,
    ...(resultsCount !== undefined && { results_count: resultsCount }),
  });
};

export const trackError = async (errorMessage: string, errorCode?: string) => {
  await trackEvent("error", {
    error_message: errorMessage,
    ...(errorCode && { error_code: errorCode }),
  });
};

export const setAnalyticsUserId = async (userId: string | null) => {
  const analyticsInstance = await initAnalytics();
  if (!analyticsInstance) return;
  
  setUserId(analyticsInstance, userId);
};

export const setAnalyticsUserProperties = async (
  properties: Record<string, string>
) => {
  const analyticsInstance = await initAnalytics();
  if (!analyticsInstance) return;
  
  setUserProperties(analyticsInstance, properties);
};

export const trackBlogView = async (blogId: string, blogTitle: string, authorId?: string) => {
  await trackEvent("blog_view", {
    blog_id: blogId,
    blog_title: blogTitle,
    ...(authorId && { author_id: authorId }),
  });
};

export const trackBlogCreate = async (blogId: string, blogTitle: string) => {
  await trackEvent("blog_create", {
    blog_id: blogId,
    blog_title: blogTitle,
  });
};

export const trackLogin = async (method: string) => {
  await trackEvent("login", { method });
};

export const trackSignUp = async (method: string) => {
  await trackEvent("sign_up", { method });
};

export const trackShare = async (contentType: string, itemId: string, method?: string) => {
  await trackEvent("share", {
    content_type: contentType,
    item_id: itemId,
    ...(method && { method }),
  });
};
