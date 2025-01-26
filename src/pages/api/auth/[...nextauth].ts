import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";

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
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session }) {
      const email = session.user?.email;
      if (!email) return session;

      try {
        const subscriptionsRef = collection(db, "subscriptions");

        const q = query(
          subscriptionsRef,
          where("userEmail", "==", email),
          where("status", "==", "active")
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          return {
            ...session,
            activeSubscription: true,
          };
        }
      } catch (error) {
        console.error("Erro ao buscar assinatura:", error);
      }

      return {
        ...session,
        activeSubscription: false,
      };
    },

    async signIn({ user }) {
      const { email } = user;

      if (!email) return false;

      try {
        const subscriptionsRef = collection(db, "subscriptions");
        const q = query(subscriptionsRef, where("userEmail", "==", email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          console.log("Usuário já possui uma assinatura");
          return true;
        }

        console.log("Usuário não tem assinatura, mas pode logar");
        return true;
      } catch (error) {
        console.error("Erro ao verificar assinatura:", error);
        return false;
      }
    },
  },
});
