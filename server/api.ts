import "dotenv/config";
import express from "express";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createApp } from "./_core/app";

const app = createApp();

export default function handler(req: VercelRequest, res: VercelResponse) {
  app(req, res);
}