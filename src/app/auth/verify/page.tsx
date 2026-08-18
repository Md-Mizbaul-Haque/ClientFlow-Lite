import { redirect } from "next/navigation";

export default async function VerifyPage({ searchParams }: PageProps<"/auth/verify">) {
  const { token } = await searchParams;
  if (!token) {
    redirect("/auth/magic-link?error=invalid");
  }
  redirect(`/api/auth/verify?token=${encodeURIComponent(String(token))}`);
}