import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";

import GitHubProvider from "next-auth/providers/github";
import NextAuth from "next-auth";
import firebaseApp from "../../../services/firebase";

const db = getFirestore(firebaseApp);

export default NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          scope: "read:user",
        },
      },
    }),
  ],

  callbacks: {
    async signIn({ user }) {
      const { email } = user;

      if (!email) return false;

      try {
        const userRef = doc(db, "users", email);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          console.log("Usuário já existe no Firestore");
          return true;
        }

        await setDoc(userRef, { email }, { merge: true });

        return true;
      } catch {
        return false;
      }
    },
  },
});
