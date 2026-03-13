import { defineConfig } from "drizzle-kit";
import {type Static, Type} from "@sinclair/typebox";
import envSchema from "env-schema";

const schema = Type.Object({
  POSTGRES_HOST: Type.String(),
  POSTGRES_USER: Type.String(),
  POSTGRES_PASSWORD: Type.String(),
  POSTGRES_DB: Type.String(),
  POSTGRES_PORT: Type.Number({ default: 5432 }),
});

const env = envSchema<Static<typeof schema>>({
  // dotenv: true, // load .env if it is there, default: false
  dotenv: {
    path: process.env.NODE_ENV === 'development' ? '.env.dev' : '.env'
  },
  schema,
});


export default defineConfig({
  schema: "./src/db/schema/**/*.{ts,js}",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: `postgresql://${env.POSTGRES_USER}:${env.POSTGRES_PASSWORD}@${env.POSTGRES_HOST}:${env.POSTGRES_PORT}/${env.POSTGRES_DB}`,
  },
});
