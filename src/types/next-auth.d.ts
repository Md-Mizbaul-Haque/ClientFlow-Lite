import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: "admin" | "client";
      clientId?: string;
    };
  }

  interface User {
    role: "admin" | "client";
    clientId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "admin" | "client";
    clientId?: string;
  }
}