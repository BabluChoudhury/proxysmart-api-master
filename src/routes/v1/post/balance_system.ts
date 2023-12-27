import { Request, Response } from "express";

import {  own_db } from "../../../lib/custom";
import {  typesResellerData } from "../../../lib/utils/types";

export async function balance_system(req: Request, res: Response){
    try{
        const auth_header = req.headers.authorization as string;
        const api_key = auth_header.split(" ")[1];
        const refill_amount=req.body.refill_amount;
        const cripto= req.body.cripto;
        const conn=own_db();
        conn?.prepare("UPDATE RESELLERS SET balance=? where api_key=?")
        .get(refill_amount,api_key) as typesResellerData
        if(cripto === "BTC"){
            return res.status(201).json({message:"----your BTC address----"})
        }
        else if(cripto === "LTC"){
            return res.status(201).json({message:"----your LTC address----"})
        }
        else if(cripto === "XMR"){
            return res.status(201).json({message:"----your XMR address----"})
        }
        else{
            return res.status(401).json({error:"Invalid Cripto"})

        }
    }catch(_e){
        console.warn(_e);
    return res.status(500).json({ error: "Server Error." });
    }
}