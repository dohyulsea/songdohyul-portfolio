"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");

  // 관리자 로그인 및 권한 확인
  useEffect(() => {
    async function checkLogin() {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        router.replace("/admin/login");
        return;
      }

      // 데이터베이스에서 관리자 권한 확인
      const { data: isAdmin, error: adminError } =
        await supabase.rpc("is_portfolio_admin");

      if (adminError || isAdmin !== true) {
        await supabase.auth.signOut();
        router.replace("/admin/login");
        return;
      }

      // 관리자 인증 성공
      setEmail(data.user.email ?? "");
      setLoading(false);
    }

    checkLogin();
  }, [router]);

  // 로그아웃
  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  // 로그인 확인 중
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#071426] text-white">
        로그인 확인 중...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#071426] p-8 text-white">
      <div className="mx-auto max-w-5xl">

        {/* 상단 관리자 헤더 */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            SONG DOYUL{" "}
            <span className="text-cyan-400">ADMIN</span>
          </h1>

          <button
            onClick={handleLogout}
            className="rounded-lg border border-white/20 px-5 py-3 hover:bg-white/10"
          >
            로그아웃
          </button>
        </div>

        {/* 로그인 계정 표시 */}
        <p className="mt-6 text-slate-300">
          로그인 계정: {email}
        </p>

        {/* 관리자 대시보드 */}
        <section className="mt-12 rounded-2xl border border-white/10 bg-[#10233B] p-8">

          <h2 className="text-2xl font-bold">
            연구 포트폴리오 관리
          </h2>

          <p className="mt-4 text-slate-300">
            관리자 대시보드에 오신 것을 환영합니다.
          </p>

          {/* 관리 기능 버튼 */}
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                title: "연구 기록 관리",
                path: "/admin/research",
              },
              {
                title: "프로젝트 관리",
                path: "/admin/projects",
              },
              {
                title: "자료실 관리",
                path: "/admin/archive",
              },
            ].map((item) => (
              <button
                key={item.title}
                onClick={() => {
                  if (item.path) {
                    router.push(item.path);
                  }
                }}
                disabled={!item.path}
                className="rounded-xl border border-white/10 bg-white/5 p-6 text-left transition hover:border-cyan-400/40 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <h3 className="font-semibold">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm text-slate-400">
                  {item.path
                    ? "관리 페이지 열기 →"
                    : "준비 중"}
                </p>
              </button>
            ))}
          </div>

        </section>
      </div>
    </main>
  );
}