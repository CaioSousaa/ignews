import { NextApiRequest, NextApiResponse } from "next";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";

import firebaseApp from "../../services/firebase";
import { getSession } from "next-auth/react";
import { stripe } from "../../services/stripe";

const db = getFirestore(firebaseApp);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  const session = await getSession({ req });

  if (!session || !session.user || !session.user.email) {
    return res.status(401).json({ error: "Usuário não autenticado" });
  }

  const userRef = doc(db, "users", session.user.email);
  const userSnap = await getDoc(userRef);

  let stripeCustomerId = null;

  if (userSnap.exists()) {
    const userData = userSnap.data();
    stripeCustomerId = userData?.stripe_customer_id;
  }

  if (!stripeCustomerId) {
    try {
      const stripeCustomer = await stripe.customers.create({
        email: session.user.email,
      });

      stripeCustomerId = stripeCustomer.id;

      await setDoc(
        userRef,
        { stripe_customer_id: stripeCustomerId },
        { merge: true }
      );
    } catch (error) {
      console.error("Erro ao criar cliente no Stripe:", error);
      return res.status(500).json({ error: "Erro ao criar cliente no Stripe" });
    }
  }

  try {
    const stripeCheckoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      billing_address_collection: "required",
      line_items: [{ price: "price_1QjQ3xI6jpUDM6bZ65YSQiiL", quantity: 1 }],
      mode: "subscription",
      allow_promotion_codes: true,
      success_url: process.env.STRIPE_SUCCESS_URL,
      cancel_url: process.env.STRIPE_ERROR_URL,
    });

    return res.status(200).json({ sessionId: stripeCheckoutSession.id });
  } catch (error) {
    console.error("Erro ao criar sessão do Stripe:", error);
    return res.status(500).json({ error: "Erro ao processar pagamento" });
  }
};
