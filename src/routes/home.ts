import { Request, Response } from "express";

export async function home(_req: Request, res: Response) {
  try {
    return res.status(200).json({ success: "API is Live." });
  } catch (_e) {
    console.warn(_e);
    return res.status(500).json({ error: "Server Error." });
  }
}
