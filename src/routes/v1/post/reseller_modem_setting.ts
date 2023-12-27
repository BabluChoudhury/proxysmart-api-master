import { Request, Response } from "express";

import { get_db, own_db } from "../../../lib/custom";
import { typesModemSales, typesResellerData } from "../../../lib/utils/types";

export async function reseller_modem_setting(req: Request, res: Response) {
  try {
    const auth_header = req.headers.authorization as string;
    const modemId = req.params.modem_id;
    const api_key = auth_header.split(" ")[1];
    const conn = own_db();
    const reseller = conn
      ?.prepare("SELECT * FROM resellers WHERE api_key=?")
      .get(api_key) as typesResellerData;
    if (!reseller) {
      return res.status(401).json({ error: "Invalid API key." });
    }
    const modem = conn
      ?.prepare(
        "SELECT * FROM modems WHERE (id=? OR IMEI=?) AND sold_to=? LIMIT 1"
      )
      .get(modemId, modemId, reseller?.telegram) as typesModemSales;
    if (!modem || !modem?.sold_to) {
      return res.status(404).json({
        error: "Modem not found or not associated with this reseller.",
      });
    }

    const currentDate = new Date();
    const modemDate = new Date(modem?.expiration_date);

    if (modem?.expiration_date !== null && modemDate < currentDate) {
      return res.json({ error: "Modem expired." });
    }
    const user = req.body.user;
    const password = req.body.password;
    conn
      ?.prepare("UPDATE modems SET user=?, password=? WHERE id=?")
      .run(user, password, modem?.id);
    const client = await get_db();
    const collection_modems = client?.db?.collection("modems");
    collection_modems?.updateOne(
      { IMEI: modem?.IMEI },
      { $set: { PROXY_USER: user, PROXY_PASSWORD: password } }
    );

    const r = await fetch("http://138.197.15.103:7002/modem/settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa("proxy:Viri123"),
      },
      body: JSON.stringify({ imei: modem?.IMEI }),
    });

    const r_json = await r.json();

    if (r.ok) {
      if (r_json["SUCCESS"]) {
        return res.status(200).json({ success: "Settings applied." });
      } else {
        return res
          .status(400)
          .json({ error: "Error applying settings to modem." });
      }
    } else {
      return res.status(400).json({ error: "Something went wrong." });
    }
  } catch (_e) {
    console.warn(_e);
    return res.status(500).json({ error: "Server Error." });
  }
}
