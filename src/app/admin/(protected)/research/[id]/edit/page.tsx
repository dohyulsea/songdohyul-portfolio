"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

function EditResearchContent() {
  const router = useRouter();
  const [id, setId] = useState("");
  useEffect(() => {
    const segments = window.location.pathname.split("/");
    setId(segments[3] ?? "");
  }, []);
  

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [titleKo, setTitleKo] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [contentKo, setContentKo] = useState("");
  const [contentEn, setContentEn] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    async function loadRecord() {
      // 로그인 확인
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData.user) {
        router.replace("/admin/login");
        return;
      }

      // 관리자 권한 확인
      const { data: isAdmin, error: adminError } =
        await supabase.rpc("is_portfolio_admin");

      if (adminError || isAdmin !== true) {
        router.replace("/admin");
        return;
      }

      // 기존 연구 기록 불러오기
      const { data, error } = await supabase
        .from("research_records")
        .select(
          "title_ko, title_en, content_ko, content_en, is_published"
        )
        .eq("id", id)
        .single();

      if (error || !data) {
        setMessage(`기록 조회 실패: ${error?.message ?? "기록 없음"}`);
        setLoading(false);
        return;
      }

      setTitleKo(data.title_ko);
      setTitleEn(data.title_en ?? "");
      setContentKo(data.content_ko);
      setContentEn(data.content_en ?? "");
      setIsPublished(data.is_published);

      setLoading(false);
    }

    loadRecord();
  }, [id, router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSaving(true);
    setMessage("");

    const { data, error } = await supabase
      .from("research_records")
      .update({
        title_ko: titleKo,
        title_en: titleEn || null,
        content_ko: contentKo,
        content_en: contentEn || null,
        is_published: isPublished,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("id")
      .single();

    if (error || !data) {
      setMessage(`수정 실패: ${error?.message ?? "수정된 기록 없음"}`);
      setSaving(false);
      return;
    }

    router.push("/admin/research");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#071426] text-white">
        연구 기록 불러오는 중...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#071426] px-6 py-12 text-white">
      <div className="mx-auto max-w-3xl">
        <button
          onClick={() => router.push("/admin/research")}
          className="mb-8 text-cyan-400"
        >
          ← 연구 기록 목록
        </button>

        <h1 className="text-3xl font-bold">연구 기록 수정</h1>

        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <div>
            <label className="mb-2 block text-sm">
              제목 (한국어)
            </label>
            <input
              required
              value={titleKo}
              onChange={(e) => setTitleKo(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#10233B] p-4 outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">
              제목 (영어)
            </label>
            <input
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#10233B] p-4 outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">
              연구 내용 (한국어)
            </label>
            <textarea
              required
              rows={8}
              value={contentKo}
              onChange={(e) => setContentKo(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#10233B] p-4 outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">
              연구 내용 (영어)
            </label>
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
            홈페이지에 공개하기
          </label>

          {message && (
            <p className="text-sm text-red-400">{message}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-blue-600 py-4 font-semibold hover:bg-blue-500 disabled:opacity-50"
          >
            {saving ? "수정 중..." : "변경사항 저장"}
          </button>
        </form>
      </div>
    </main>
  );
}
export default function EditResearchPage() {
  return (
    <Suspense fallback={<div>연구 기록 불러오는 중...</div>}>
      <EditResearchContent />
    </Suspense>
  );
}
