import {
  addDoc,
  collection,
  doc,
  getDocs,
  getFirestore,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

import firebaseApp from "../../../services/firebase";
import { stripe } from "../../../services/stripe";

const db = getFirestore(firebaseApp);

export async function saveSubscription(
  subscriptionId: string,
  customerId: string,
  createdAction = false
) {
  const usersRef = collection(db, "users");
  const userQuery = query(
    usersRef,
    where("stripe_customer_id", "==", customerId)
  );
  const querySnapshot = await getDocs(userQuery);

  if (querySnapshot.empty) return;

  const userDoc = querySnapshot.docs[0];
  const userEmail = userDoc.data().email;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  const subscriptionData = {
    id: subscriptionId,
    userEmail,
    stripe_customer_id: customerId,
    status: subscription.status,
    price_id: subscription.items.data[0].price.id,
    createdAt: new Date(),
  };

  if (createdAction) {
    await addDoc(collection(db, "subscriptions"), subscriptionData);
  } else {
    const subscriptionsRef = collection(db, "subscriptions");
    const subscriptionQuery = query(
      subscriptionsRef,
      where("id", "==", subscriptionId)
    );
    const subscriptionSnapshot = await getDocs(subscriptionQuery);

    if (!subscriptionSnapshot.empty) {
      const subscriptionDocRef = doc(
        db,
        "subscriptions",
        subscriptionSnapshot.docs[0].id
      );
      await updateDoc(subscriptionDocRef, subscriptionData);
    }
  }
}
