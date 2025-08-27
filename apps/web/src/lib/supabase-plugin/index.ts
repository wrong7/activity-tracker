import { signJWT } from "better-auth/crypto";
import {
  APIError,
  createAuthEndpoint,
  sessionMiddleware
} from "better-auth/api";
import type { BetterAuthPlugin } from "better-auth";

type SupabasePluginOptions = {
  jwtSecret: string;
  claims?: Record<string, unknown>;
};

export type SupabaseToken = {
  token: string;
};

function parseClaimValue(value: string, session: any): string {
  return value.replace(/{{(.*?)}}/g, (_, match) => {
    const path = match.trim().split(".");
    let result = session[path[0]];

    for (let i = 1; i < path.length; i++) {
      result = result?.[path[i]];
    }

    return result ?? "";
  });
}

function parseNestedClaims(
  claims: Record<string, unknown> | undefined,
  session: any
): Record<string, unknown> {
  const parsed: Record<string, unknown> = {};

  if (!claims) return parsed;

  for (const [key, value] of Object.entries(claims)) {
    if (typeof value === "string" && value.includes("{{")) {
      parsed[key] = parseClaimValue(value, session);
    } else if (Array.isArray(value)) {
      parsed[key] = value.map((item) => {
        if (typeof item === "string" && item.includes("{{")) {
          return parseClaimValue(item, session);
        } else if (typeof item === "object" && item !== null) {
          return parseNestedClaims(item as Record<string, unknown>, session);
        }
        return item;
      });
    } else if (typeof value === "object" && value !== null) {
      parsed[key] = parseNestedClaims(
        value as Record<string, unknown>,
        session
      );
    } else {
      parsed[key] = value;
    }
  }

  return parsed;
}

export const supabase = ({ jwtSecret, claims }: SupabasePluginOptions) =>
  ({
    id: "supabase",
    endpoints: {
      getSupabaseToken: createAuthEndpoint(
        "/supabase/token",
        {
          method: "GET",
          use: [sessionMiddleware]
        },
        async (ctx) => {
          const session = ctx.context.session;

          if (!session) {
            throw new APIError("UNAUTHORIZED", {
              message: "No session found"
            });
          }

          const parsedClaims = parseNestedClaims(claims, session);

          const issuedAt = Math.floor(new Date().getTime() / 1000);

          const jwtClaims = {
            aud: "authenticated",
            role: "authenticated",
            email: session.user.email,
            app_metadata: {},
            user_metadata: {},
            ...parsedClaims,
            sub: session.user.id,
            sid: session.session.id,
            exp: session.session.expiresAt.getTime(),
            azp: ctx.context.baseURL,
            iss: ctx.context.baseURL,
            iat: issuedAt,
            nbf: issuedAt - 5
          };

          const expiresIn =
            session.session.expiresAt.getTime() - new Date().getTime();

          const token = await signJWT(jwtClaims, jwtSecret, expiresIn);

          if (!token) {
            throw new APIError("UNAUTHORIZED", {
              message: "No token found"
            });
          }

          ctx.context.secret;

          return ctx.json({
            token
          } satisfies SupabaseToken);
        }
      )
    }
  }) satisfies BetterAuthPlugin;