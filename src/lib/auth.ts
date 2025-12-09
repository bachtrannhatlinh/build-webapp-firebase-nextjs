import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithPhoneNumber,
  GoogleAuthProvider,
  FacebookAuthProvider,
  RecaptchaVerifier,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  User,
  ConfirmationResult,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";

// Providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

// Types
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  provider: string;
  createdAt?: any;
}

// ============ EMAIL/PASSWORD ============

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string
) {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  // Update display name
  await updateProfile(userCredential.user, { displayName });

  // Create user profile in Firestore
  await createUserProfile(userCredential.user, "email");

  return userCredential.user;
}

export async function signInWithEmail(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  return userCredential.user;
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}

// ============ GOOGLE ============

export async function signInWithGoogle() {
  const userCredential = await signInWithPopup(auth, googleProvider);

  // Create/update user profile in Firestore
  await createUserProfile(userCredential.user, "google");

  return userCredential.user;
}

// ============ FACEBOOK ============

export async function signInWithFacebook() {
  const userCredential = await signInWithPopup(auth, facebookProvider);

  // Create/update user profile in Firestore
  await createUserProfile(userCredential.user, "facebook");

  return userCredential.user;
}

// ============ PHONE OTP ============

let confirmationResult: ConfirmationResult | null = null;

export function setupRecaptcha(containerId: string) {
  if (typeof window !== "undefined") {
    const recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: "invisible",
      callback: () => {
        console.log("reCAPTCHA solved");
      },
    });
    return recaptchaVerifier;
  }
  return null;
}

export async function sendOTP(phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) {
  confirmationResult = await signInWithPhoneNumber(
    auth,
    phoneNumber,
    recaptchaVerifier
  );
  return confirmationResult;
}

export async function verifyOTP(otp: string) {
  if (!confirmationResult) {
    throw new Error("Please request OTP first");
  }

  const userCredential = await confirmationResult.confirm(otp);

  // Create/update user profile in Firestore
  await createUserProfile(userCredential.user, "phone");

  return userCredential.user;
}

// ============ COMMON ============

export async function logout() {
  await signOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser() {
  return auth.currentUser;
}

// ============ USER PROFILE ============

async function createUserProfile(user: User, provider: string) {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const profile: UserProfile = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      phoneNumber: user.phoneNumber,
      provider,
      createdAt: serverTimestamp(),
    };

    await setDoc(userRef, profile);
  }

  return userRef;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data() as UserProfile;
  }

  return null;
}
