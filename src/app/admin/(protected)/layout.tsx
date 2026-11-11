import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function AdminAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // 1. 서버에서 로그인 사용자 확인
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/admin/login");
  }

  // 2. 서버에서 관리자 권한 확인
  const { data: isAdmin, error: adminError } =
    await supabase.rpc("is_portfolio_admin");

  if (adminError || isAdmin !== true) {
    redirect("/");
  }

  // 3. 관리자만 페이지 표시
  return <>{children}</>;
}

export default function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#071426] text-white">
          관리자 권한 확인 중...
        </main>
      }
    >
      <AdminAuthGuard>{children}</AdminAuthGuard>
    </Suspense>
  );
}