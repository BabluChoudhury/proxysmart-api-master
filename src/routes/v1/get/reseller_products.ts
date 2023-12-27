import { Request, Response } from "express";
import { own_db } from "../../../lib/custom";
import { typesAdminProducts } from "../../../lib/utils/validations/form";

export async function reseller_products(_req: Request, res: Response) {
  try {
    const conn = own_db();
    const productsQuery = conn?.prepare("SELECT * FROM products");
    const products = productsQuery?.all() as typesAdminProducts[];

    console.log(products);

    if (!products.length) {
      return res.status(404).json({ error: "No products were found." });
    }

    const products_list = products.map((product: typesAdminProducts) => {
      return {
        id: product?.id,
        name: product?.name,
        description: product?.description,
        duration: product?.duration,
        price: product?.price,
      };
    });

    return res.status(200).json(products_list);
  } catch (_e) {
    console.warn(_e);
    return res.status(500).json({ error: "Server Error." });
  }
}
