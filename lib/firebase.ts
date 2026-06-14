import {
  initializeApp,
  getApps,
  type FirebaseApp,
  type FirebaseOptions,
} from "firebase/app";
import {
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type Auth,
  type User,
} from "firebase/auth";
import {
  doc,
  getDoc,
  getFirestore,
  setDoc,
  type Firestore,
} from "firebase/firestore";
import type { Character } from "@/lib/types";

// ---------------------------------------------------------------------------
// Optional Google sign-in + cloud save via Firebase. Configuration is read at
// runtime from window.__FIREBASE_CONFIG__ (see public/firebase-config.js), so
// the static build works out of the box in guest mode and lights up the moment
// valid keys are dropped in — no rebuild required.
// ---------------------------------------------------------------------------

export interface AuthUser {
  uid: string;
  name: string;
  email: string | null;
  photo: string | null;
}

let app: FirebaseApp | null = null;
let authInst: Auth | null = null;
let dbInst: Firestore | null = null;

function readConfig(): FirebaseOptions | null {
  if (typeof window === "undefined") return null;
  const c = (window as unknown as { __FIREBASE_CONFIG__?: FirebaseOptions })
    .__FIREBASE_CONFIG__;
  if (c && c.apiKey && c.projectId && c.appId && c.authDomain) return c;
  return null;
}

/** True when valid Firebase keys are present (cloud features enabled). */
export function firebaseAvailable(): boolean {
  return readConfig() !== null;
}

function ensureInit(): boolean {
  if (app) return true;
  const cfg = readConfig();
  if (!cfg) return false;
  app = getApps()[0] ?? initializeApp(cfg);
  authInst = getAuth(app);
  dbInst = getFirestore(app);
  return true;
}

function toAuthUser(u: User): AuthUser {
  return {
    uid: u.uid,
    name: u.displayName ?? "Adventurer",
    email: u.email,
    photo: u.photoURL,
  };
}

/** Subscribe to sign-in state. Returns an unsubscribe function. */
export function subscribeAuth(cb: (u: AuthUser | null) => void): () => void {
  if (!ensureInit() || !authInst) {
    cb(null);
    return () => {};
  }
  return onAuthStateChanged(authInst, (u) => cb(u ? toAuthUser(u) : null));
}

export async function signInWithGoogle(): Promise<void> {
  if (!ensureInit() || !authInst) throw new Error("Firebase is not configured.");
  await signInWithPopup(authInst, new GoogleAuthProvider());
}

export async function signOutUser(): Promise<void> {
  if (!authInst) return;
  await signOut(authInst);
}

export async function loadCloudSave(uid: string): Promise<Character | null> {
  if (!ensureInit() || !dbInst) return null;
  const snap = await getDoc(doc(dbInst, "saves", uid));
  if (!snap.exists()) return null;
  const data = snap.data() as { character?: Character | null };
  return data?.character ?? null;
}

export async function saveCloudSave(
  uid: string,
  character: Character | null,
): Promise<void> {
  if (!ensureInit() || !dbInst) return;
  await setDoc(doc(dbInst, "saves", uid), {
    character,
    updatedAt: Date.now(),
  });
}
