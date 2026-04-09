import admin from "firebase-admin";


const serviceAccount = require("../../service-account.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

export const auth = admin.auth();
export const db = admin.firestore();
export type Firestore = FirebaseFirestore.Firestore;