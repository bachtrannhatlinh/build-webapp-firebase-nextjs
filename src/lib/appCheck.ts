import { initializeAppCheck, ReCaptchaV3Provider, getToken } from "firebase/app-check";
import type { AppCheck } from "firebase/app-check";
import app from "./firebase";

let appCheck: AppCheck | null = null;

export const initializeAppCheckService = (): AppCheck | null => {
  if (typeof window === "undefined") {
    return null;
  }

  if (appCheck) {
    return appCheck;
  }

  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY;

  if (!recaptchaSiteKey) {
    console.warn("App Check: reCAPTCHA site key not configured");
    return null;
  }

  try {
    appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(recaptchaSiteKey),
      isTokenAutoRefreshEnabled: true,
    });

    console.log("App Check initialized successfully");
    return appCheck;
  } catch (error) {
    console.error("Failed to initialize App Check:", error);
    return null;
  }
};

export const getAppCheckToken = async (): Promise<string | null> => {
  if (!appCheck) {
    console.warn("App Check not initialized");
    return null;
  }

  try {
    const tokenResult = await getToken(appCheck, false);
    return tokenResult.token;
  } catch (error) {
    console.error("Failed to get App Check token:", error);
    return null;
  }
};

export const getAppCheckTokenForRequest = async (): Promise<Record<string, string>> => {
  const token = await getAppCheckToken();
  if (token) {
    return { "X-Firebase-AppCheck": token };
  }
  return {};
};

export const enableDebugMode = () => {
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    (window as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN: boolean }).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }
};

export { appCheck };
