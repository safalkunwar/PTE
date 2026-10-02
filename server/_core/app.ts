import express, { type Request, type Response } from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { handleSubscriptionRenewal } from "../scheduled/subscriptionRenewal";

export function createApp(): express.Express {
  const app = express();

  app.disable("x-powered-by");
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  registerStorageProxy(app);
  registerOAuthRoutes(app);

  app.post(
    "/api/upload-audio",
    express.raw({ type: "audio/*", limit: "20mb" }),
    async (req: Request, res: Response) => {
      try {
        const { sdk } = await import("./sdk");
        let user: import("./sdk").AuthenticatedUser | null = null;
        try {
          user = await sdk.authenticateRequest(req);
        } catch {
          user = null;
        }
        if (!user || user.isCron) {
          res.status(401).json({ error: "Unauthorized" });
          return;
        }
        const { storagePut } = await import("../storage");
        const { nanoid } = await import("nanoid");
        const key = `audio/user-${user.id}/${nanoid()}.webm`;
        const buffer = req.body as Buffer;
        const { url } = await storagePut(key, buffer, "audio/webm");
        res.json({ url, key });
      } catch (err) {
        console.error("Audio upload error:", err);
        res.status(500).json({ error: "Upload failed" });
      }
    }
  );

  app.post("/api/scheduled/subscription-renewal", handleSubscriptionRenewal);

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  return app;
}