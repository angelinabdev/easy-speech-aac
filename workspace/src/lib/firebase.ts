
// This file is deprecated and will be removed in a future update.
// Please use the exports from /src/lib/firebase/config.ts instead.

import { getClientFirebaseApp, getClientAuth, getClientFirestore } from './firebase/config';

const app = getClientFirebaseApp();
const auth = getClientAuth();
const db = getClientFirestore();

export { app, auth, db };
