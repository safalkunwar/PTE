import "dotenv/config";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import serverless from "serverless-http";
import { createApp } from "../server/_core/app";

const app = createApp();
export default serverless(app);