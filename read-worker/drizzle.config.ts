import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: '../shared/read-model/src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
