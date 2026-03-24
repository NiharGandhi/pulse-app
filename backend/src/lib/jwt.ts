import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env["JWT_SECRET"] ?? "pulse-dev-secret-change-in-production"
);

export async function signToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(token: string): Promise<{ userId: string }> {
  const { payload } = await jwtVerify(token, secret);
  if (!payload.sub) throw new Error("Invalid token payload");
  return { userId: payload.sub };
}
