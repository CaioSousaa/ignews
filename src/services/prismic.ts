import * as prismic from "@prismicio/client";

export function getPrismicClient() {
  const client = prismic.createClient(process.env.PRISMIC_REPOSITORY_NAME, {
    accessToken: process.env.PRISMICS_ACCESS_TOKEN,
  });

  return client;
}
