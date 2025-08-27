import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as schema from "./db/schema/auth";
import { supabase } from "./supabase-plugin";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: schema,
	}),
	telemetry: { enabled: false },
	// trustedOrigins: process.env.CORS_ORIGIN?.split(",") || [],
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false
	},
	plugins: [supabase({ jwtSecret: process.env.SUPABASE_JWT_SECRET! })],
	advanced: {
		defaultCookieAttributes: {
			sameSite: "none",
			secure: true,
			httpOnly: true,
		},
	},
});