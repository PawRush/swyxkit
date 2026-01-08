import { defineData, type ClientSchema } from "@aws-amplify/backend";
import { a } from "@aws-amplify/data-schema";

const schema = a.schema({
  BlogContent: a
    .model({
      id: a.id(),
      slug: a.string().required(),
      title: a.string().required(),
      description: a.string(),
      content: a.string().required(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  ContentList: a
    .model({
      id: a.id(),
      title: a.string().required(),
      description: a.string(),
      slug: a.string().required(),
      date: a.string(),
    })
    .authorization((allow) => [allow.publicApiKey()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
