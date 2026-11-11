"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
     setError(`로그인 오류: ${error.message}`);
     setLoading(false);
     return;
}

    setLoading(false);
    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#071426] px-6 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#10233B] p-10 shadow-2xl">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold">
            SONG DOYUL<span className="text-cyan-400">.</span>
          </h1>

          <p className="mt-3 text-sm text-slate-400">
            Research Portfolio Administration
          </p>
        </div>

        <h2 className="mb-8 text-xl font-semibold">
          관리자 로그인
        </h2>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm text-slate-300">
              이메일
            </label>

            <input
              id="email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일 입력"
              className="w-full rounded-lg border border-white/10 bg-[#071426] px-4 py-3 text-white outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm text-slate-300">
              비밀번호
            </label>

            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 입력"
              className="w-full rounded-lg border border-white/10 bg-[#071426] px-4 py-3 text-white outline-none focus:border-cyan-400"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold transition hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-slate-500">
          Authorized Access Only
        </p>
      </div>
    </main>
  );
}