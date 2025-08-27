import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "./apps/web/src/lib/db/schema",
	out: "./apps/web/src/lib/db/migrations",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL || "",
	},
});
