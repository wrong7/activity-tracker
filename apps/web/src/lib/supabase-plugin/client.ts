import { createClient } from "@supabase/supabase-js";
import type { BetterAuthClientPlugin } from "better-auth";
import type { supabase, SupabaseToken } from "./index"; // make sure to import the server plugin as a type

type SupabasePlugin = typeof supabase;

type SupabaseClientPlugin = {
  supabaseUrl: string;
  supabaseAnonKey: string;
};

export const supabaseClient = ({
  supabaseUrl,
  supabaseAnonKey
}: SupabaseClientPlugin) => {
  return {
    id: "supabase",
    $InferServerPlugin: {} as ReturnType<SupabasePlugin>,
    getActions: ($fetch) => ({
      supabase: () =>
        createClient(supabaseUrl, supabaseAnonKey, {
          async accessToken() {
            const { data, error } = await $fetch<SupabaseToken>(
              `/supabase/token`,
              { method: "GET" }
            );

            if (error) {
              throw error;
            }

            if (!data.token) {
              throw new Error("No token found");
            }

            return data.token;
          }
        })
    })
  } satisfies BetterAuthClientPlugin;
};