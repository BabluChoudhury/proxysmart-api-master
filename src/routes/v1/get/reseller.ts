import { Request, Response } from "express";
import { own_db } from "../../../lib/custom";
import { typesCount, typesResellerData } from "../../../lib/utils/types";

export async function reseller(req: Request, res: Response) {
  try {
    const auth_header = req.headers.authorization as string;

    const api_key = auth_header.split(" ")[1];
    const conn = own_db();
    const c = conn?.prepare("SELECT * FROM resellers WHERE api_key= ? LIMIT 1");

    const reseller = c?.get(api_key) as typesResellerData;

    if (reseller) {
      const resellerData = {
        id: reseller.id,
        telegram: reseller.telegram,
        api_key: reseller.api_key,
        balance: reseller.balance,
        created_at: reseller.created_at,
        updated_at: reseller.updated_at,
        sold_modems: reseller?.sold_modems ? reseller.sold_modems : 0,
      };

      const modemsCount = conn?.prepare(
        "SELECT COUNT(*) FROM modems WHERE sold_to=?"
      );
      const soldModems = modemsCount?.get(resellerData.telegram) as typesCount;

      const soldModemsCount: number = soldModems ? soldModems["COUNT(*)"] : 0;
      resellerData.sold_modems = soldModemsCount;
      conn?.close();
      return res.status(200).json(resellerData);
    } else {
      return res.status(400).json({ error: "Invalid API key." });
    }
  } catch (_e) {
    console.warn(_e);
    return res.status(500).json({ error: "Server Error." });
  }
}
