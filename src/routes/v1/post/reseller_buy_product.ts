import { Request, Response } from "express";

import { get_db, own_db } from "../../../lib/custom";
import {
  typesModemSales,
  typesResellerData,
  typesAdminProducts,
} from "../../../lib/utils/types";
import { shuffleArray } from "../../../lib/utils/custom";

export async function reseller_buy_product(req: Request, res: Response) {
  try {
    const auth_header = req.headers.authorization as string;
    const productId = req.params?.product_id;
    const api_key = auth_header.split(" ")[1];
    const conn = own_db();

    if (!conn) {
      return res.status(503).json({ error: "Server Busy!" });
    }
    const product = conn
      .prepare("SELECT * FROM products WHERE id=? LIMIT 1")
      .get(productId) as typesAdminProducts;

    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    let product_duration = product?.duration;
    console.log({ product_duration });

    const reseller = conn
      .prepare("SELECT * FROM resellers WHERE api_key=? LIMIT 1")
      .get(api_key) as typesResellerData;

    if (!reseller) {
      return res.status(401).json({ error: "Invalid API key." });
    }

    if (reseller?.balance < product?.price) {
      return res.status(400).json({ error: "Not enough balance." });
    }

    const modemsQuery = conn.prepare("SELECT * FROM modems");
    const modems = modemsQuery.all() as typesModemSales[];
    console.log(modems);
    if (!modems) {
      return res.status(404).json({ error: "No modems found." });
    }

    // const filter_modems = modems?.filter(
    //   (modemz) =>
    //     modemz.expiration_date && new Date(modemz.expiration_date) < new Date()
    // );

    const filter_modems = modems?.filter((modemz) => !modemz.expiration_date);
    if (!filter_modems.length) {
      return res.status(404).json({ error: "No modems available for now." });
    }

    const modem =
      shuffleArray(filter_modems)[
        Math.floor(Math.random() * filter_modems.length)
      ];

    const expiration_date = new Date(
      new Date().getTime() + product_duration * 24 * 60 * 60 * 1000
    );

    conn
      ?.prepare("UPDATE modems SET sold_to=?, expiration_date=? WHERE id=?")
      .run(
        reseller?.telegram,
        new Date().toISOString().slice(0, 16),
        reseller?.id
      );

    conn
      ?.prepare("UPDATE resellers SET balance=? WHERE api_key=?")
      .run(reseller?.balance - product?.price, api_key);
    const time = expiration_date.toISOString().slice(0, 16);
    const mongo = await get_db();
    const col = mongo?.db.collection("modems");
    await col?.updateOne(
      { IMEI: modem?.IMEI },
      { $set: { PROXY_VALID_BEFORE: time } }
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
        return res
          .status(200)
          .json({ success: "Product bought.", modem: modem?.id });
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
