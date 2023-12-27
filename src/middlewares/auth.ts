import { Request, Response, NextFunction } from "express";

export async function adminAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const auth_header = req.headers.authorization;
    if (!auth_header) {
      return res.status(401).json({ error: "No credentials provided." });
    }

    if (!auth_header.startsWith("Basic ")) {
      return res.status(401).json({
        error: 'Invalid Authorization header format. Expected "Basic <TOKEN>".',
      });
    }

    const base64Credentials = auth_header.split(" ")[1];
    const credentials = Buffer.from(base64Credentials, "base64").toString(
      "ascii"
    );
    const [username, password] = credentials.split(":");
    if (username !== "proxy" || password !== "Viri123") {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    next();
  } catch (_e) {
    return res.status(500).json({ error: "Server Error!" });
  }
}

export async function simpleAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const auth_header = req.headers.authorization;
    if (!auth_header) {
      return res
        .status(401)
        .json({ error: "No Authorization header provided." });
    }

    if (!auth_header.includes("Bearer")) {
      return res.status(401).json({
        error:
          'Invalid Authorization header format. Expected "Bearer <TOKEN>".',
      });
    }
    next();
  } catch (_e) {
    return res.status(500).json({ error: "Server Error!" });
  }
}
