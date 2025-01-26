import * as prismic from "@prismicio/client";

export function getPrismicClient(req?: unknown) {
  const client = prismic.createClient(process.env.PRISMIC_REPOSITORY_NAME, {
    accessToken: process.env.PRISMICS_ACCESS_TOKEN,
  });

  return client;
}
