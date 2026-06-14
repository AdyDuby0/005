# Enabling Google sign-in & cloud saves (optional)

The game works out of the box in **guest mode** (saves stay in the browser).
To let players sign in with Google and sync their hero across devices, do this
one-time setup. No rebuilding is needed — you only edit one file.

## 1. Create a Firebase project
- Go to <https://console.firebase.google.com> and click **Add project**.

## 2. Enable Google sign-in
- **Build → Authentication → Get started → Sign-in method**.
- Enable **Google**, pick a support email, save.

## 3. Create the database
- **Build → Firestore Database → Create database** (production mode is fine).

## 4. Get your web config
- **Project settings (gear) → Your apps → Web app (`</>`)**, register the app.
- Copy the `firebaseConfig` values into **`firebase-config.js`** (next to
  `index.html` in the build). Fill in at least `apiKey`, `authDomain`,
  `projectId`, and `appId`.

## 5. Authorize your domain
- **Authentication → Settings → Authorized domains → Add domain**, and add the
  domain where the game is hosted (e.g. `your-site.netlify.app`).
- Sign-in uses a popup and requires **https** (it won't work from `file://`).

## 6. Lock down the data (recommended)
In **Firestore → Rules**, paste this so each player can only touch their own
save, then **Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /saves/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

That's it. Re-upload `firebase-config.js` and the **Sign in with Google** button
will start working. Until then, players simply use **Continue as guest**.

### Notes
- A guest's existing hero is automatically migrated to their account the first
  time they sign in.
- Saves are stored in Firestore under `saves/{your-google-uid}` and mirrored to
  the browser for instant/offline loading.
