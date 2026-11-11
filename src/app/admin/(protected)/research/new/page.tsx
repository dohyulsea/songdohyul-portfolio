"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function NewResearchPage() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [titleKo, setTitleKo] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [contentKo, setContentKo] = useState("");
  const [contentEn, setContentEn] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData.user) {
        router.replace("/admin/login");
        return;
      }

      const { data: isAdmin, error: adminError } =
        await supabase.rpc("is_portfolio_admin");

      if (adminError || isAdmin !== true) {
        router.replace("/admin");
        return;
      }

      setChecking(false);
    }

    checkAdmin();
  }, [router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("research_records")
      .insert({
        title_ko: titleKo,
        title_en: titleEn || null,
        content_ko: contentKo,
        content_en: contentEn || null,
        category: "research",
        is_published: isPublished,
      });

    if (error) {
      setMessage(`저장 실패: ${error.message}`);
      setSaving(false);
      return;
    }

    setMessage("연구 기록이 성공적으로 저장됐습니다.");
    setSaving(false);

    setTitleKo("");
    setTitleEn("");
    setContentKo("");
    setContentEn("");
    setIsPublished(false);
  }

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#071426] text-white">
        관리자 권한 확인 중...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#071426] px-6 py-12 text-white">
      <div className="mx-auto max-w-3xl">
        <button
          onClick={() => router.push("/admin")}
          className="mb-8 text-sm text-cyan-400 hover:text-cyan-300"
        >
          ← 관리자 대시보드
        </button>

        <h1 className="text-3xl font-bold">연구 기록 등록</h1>

        <p className="mt-3 text-slate-400">
          새로운 연구 활동을 작성하고 공개 여부를 설정할 수 있습니다.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <div>
            <label className="mb-2 block text-sm">제목 (한국어)</label>
            <input
              required
              value={titleKo}
              onChange={(e) => setTitleKo(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#10233B] p-4 outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">제목 (영어)</label>
            <input
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#10233B] p-4 outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">연구 내용 (한국어)</label>
            <textarea
              required
              rows={8}
              value={contentKo}
              onChange={(e) => setContentKo(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#10233B] p-4 outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">연구 내용 (영어)</label>
            <textarea
              rows={8}
              value={contentEn}
              onChange={(e) => setContentEn(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#10233B] p-4 outline-none focus:border-cyan-400"
            />
          </div>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
            />
            <span>홈페이지에 공개하기</span>
          </label>

          {message && (
            <p role="status" className="text-sm text-cyan-300">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-blue-600 py-4 font-semibold hover:bg-blue-500 disabled:opacity-50"
          >
            {saving ? "저장 중..." : "연구 기록 저장"}
          </button>
        </form>
      </div>
    </main>
  );
}