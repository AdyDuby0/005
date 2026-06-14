// ===========================================================================
//  Realms of Valor — Google sign-in / cloud-save configuration  (OPTIONAL)
// ===========================================================================
//
//  Leave this file as-is to play in local "guest" mode (saves stay in this
//  browser). To enable "Sign in with Google" and cloud saves that follow you
//  across devices, do the free one-time setup below and paste your keys here.
//
//  ONE-TIME SETUP (about 5 minutes):
//   1. Go to https://console.firebase.google.com and create a project.
//   2. In Build > Authentication > Sign-in method, enable "Google".
//   3. In Build > Firestore Database, click "Create database" (start in
//      production mode is fine).
//   4. In Project settings (gear icon) > "Your apps", add a Web app (</>),
//      and copy the firebaseConfig values into the object below.
//   5. In Authentication > Settings > Authorized domains, add the domain
//      where you host this game (e.g. your-site.netlify.app).
//   6. (Recommended) In Firestore > Rules, paste the rules from FIREBASE.md
//      so each player can only read/write their own save.
//
//  That's it — no rebuilding needed. Just edit and re-upload this file.
// ===========================================================================

window.__FIREBASE_CONFIG__ = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  appId: "",
  // optional (safe to leave blank if not shown in your config):
  storageBucket: "",
  messagingSenderId: "",
};
