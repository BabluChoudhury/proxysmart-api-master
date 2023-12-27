import { Request, Response } from "express";

import { SqliteError } from "better-sqlite3";

import { own_db } from "../../../lib/custom";
import { typesResellerData } from "../../../lib/utils/types";
import { admin_reseller_balance_schema } from "../../../lib/utils/validations/form";
import { ZodError } from "zod";

export async function admin_reseller_balance(req: Request, res: Response) {
  try {
    const conn = own_db();
    const reseller_id = req.params.reseller_id;
    const validate_data = admin_reseller_balance_schema.parse({
      action: req.body?.action,
      amount: req.body?.amount,
    });

    const reseller = conn
      ?.prepare("SELECT * FROM resellers WHERE id=?")
      .get(reseller_id) as typesResellerData;

    if (!reseller) {
      return res.status(404).json({ errer: "Reseller not found." });
    }
    switch (validate_data?.action) {
      case "add": {
        conn
          ?.prepare("UPDATE resellers SET balance=? WHERE id=?")
          .run(reseller?.balance + validate_data?.amount, reseller_id);
        return res.status(200).json({ success: "Balance updated." });
      }
      case "remove": {
        conn
          ?.prepare("UPDATE resellers SET balance=? WHERE id=?")
          .get(reseller?.balance - validate_data?.amount, reseller_id);
        return res.status(200).json({ success: "Balance updated." });
      }
      case "set": {
        conn
          ?.prepare("UPDATE resellers SET balance=? WHERE id=?")
          .get(validate_data?.amount, reseller_id);
        return res.status(200).json({ success: "Balance updated." });
      }
      default: {
        return res.status(401).json({ error: "Invalid action." });
      }
    }
  } catch (_e) {
    if (_e instanceof SqliteError) {
      return res.status(400).json({ error: "Unable to complete action." });
    }

    if (_e instanceof ZodError) {
      const e = _e.message;
      const ex = JSON.parse(e);
      return res.status(400).json({ error: ex[0]["message"] });
    }

    console.warn(_e);
    return res.status(500).json({ error: "Server Error." });
  }
}
