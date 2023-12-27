import { Request, Response } from "express";

import { own_db } from "../../../lib/custom";

import { ZodError } from "zod";
import { admin_reseller_schema } from "../../../lib/utils/validations/form";
import { generateApiKey } from "../../../lib/utils/custom";

export async function admin_reseller(req: Request, res: Response) {
  try {
    const validate_body = admin_reseller_schema.parse({
      telegram: req.body?.telegram,
      balance: req.body?.balance,
    });

    const conn = own_db();
    const currentTime = new Date().toISOString();
    const api_key = generateApiKey();
    conn
      ?.prepare(
        "INSERT INTO resellers (telegram, api_key, balance, created_at, updated_at) VALUES (?, ?, ?, ?, ?)"
      )
      .run(
        validate_body?.telegram,
        api_key,
        validate_body.balance,
        currentTime,
        currentTime
      );
    conn?.close();
    return res
      .status(200)
      .json({ success: "Reseller created.", api_key: api_key });
  } catch (_e) {
    console.warn(_e);
    if (_e instanceof ZodError) {
      const e = _e.message;
      const ex = JSON.parse(e);
      return res.status(400).json({ error: ex[0]["message"] });
    }
    return res.status(500).end("Server error");
  }
}
