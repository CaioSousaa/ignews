import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_API_KEY, {
  apiVersion: "2024-12-18.acacia",
  appInfo: {
    name: "ignews",
    version: "0.1.0",
  },
});
