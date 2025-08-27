import { createAuthClient } from "better-auth/react";
import { supabaseClient } from "./supabase-plugin/client";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const authClient = createAuthClient({
	baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
	plugins: [supabaseClient({ supabaseUrl, supabaseAnonKey: supabaseKey })]
});
