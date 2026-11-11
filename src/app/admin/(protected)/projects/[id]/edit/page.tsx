"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

function EditResearchContent() {
  const router = useRouter();

  const [id, setId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [recordFound, setRecordFound] = useState(false);

  const [titleKo, setTitleKo] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [contentKo, setContentKo] = useState("");
  const [contentEn, setContentEn] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  // URL에서 연구 기록 ID 가져오기
  useEffect(() => {
    const segments = window.location.pathname.split("/");

    // /admin/research/[id]/edit
    const researchId = segments[3];

    if (researchId) {
      setId(researchId);
    } else {
      setMessage("연구 기록 ID를 찾을 수 없습니다.");
      setLoading(false);
    }
  }, []);

  // 관리자 권한 확인 및 연구 기록 불러오기
  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function loadResearch() {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (cancelled) return;

      if (userError || !userData.user) {
        router.replace("/admin/login");
        return;
      }

      const { data: isAdmin, error: adminError } =
        await supabase.rpc("is_portfolio_admin");

      if (cancelled) return;

      if (adminError || isAdmin !== true) {
        router.replace("/admin");
        return;
      }

      const { data, error } = await supabase
        .from("research_records")
        .select(
          "title_ko, title_en, content_ko, content_en, is_published"
        )
        .eq("id", id)
        .single();

      if (cancelled) return;

      if (error || !data) {
        setMessage(
          `연구 기록 조회 실패: ${error?.message ?? "기록 없음"}`
        );
        setLoading(false);
        return;
      }

      setTitleKo(data.title_ko);
      setTitleEn(data.title_en ?? "");
      setContentKo(data.content_ko);
      setContentEn(data.content_en ?? "");
      setIsPublished(data.is_published ?? false);

      setRecordFound(true);
      setLoading(false);
    }

    loadResearch();

    return () => {
      cancelled = true;
    };
  }, [id, router]);

  // 연구 기록 수정
  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!id || saving) return;

    setSaving(true);
    setMessage("");

    const { data, error } = await supabase
      .from("research_records")
      .update({
        title_ko: titleKo.trim(),
        title_en: titleEn.trim() || null,
        content_ko: contentKo.trim(),
        content_en: contentEn.trim() || null,
        is_published: isPublished,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("id")
      .single();

    if (error || !data) {
      setMessage(
        `수정 실패: ${error?.message ?? "수정된 기록 없음"}`
      );
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

        {/* 목록으로 돌아가기 */}
        <button
          onClick={() => router.push("/admin/research")}
          className="mb-8 text-cyan-400 hover:text-cyan-300"
        >
          ← 연구 기록 목록
        </button>

        <h1 className="text-3xl font-bold">
          연구 기록 수정
        </h1>

        <p className="mt-3 text-slate-400">
          등록된 연구 기록의 내용과 공개 여부를 수정합니다.
        </p>

        {/* 오류 메시지 */}
        {message && (
          <p
            role="alert"
            className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400"
          >
            {message}
          </p>
        )}

        {recordFound && (
          <form
            onSubmit={handleSubmit}
            className="mt-10 space-y-6"
          >

            {/* 한국어 제목 */}
            <div>
              <label
                htmlFor="titleKo"
                className="mb-2 block text-sm"
              >
                연구 제목 (한국어) *
              </label>

              <input
                id="titleKo"
                required
                value={titleKo}
                onChange={(e) => setTitleKo(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#10233B] p-4 outline-none focus:border-cyan-400"
              />
            </div>

            {/* 영어 제목 */}
            <div>
              <label
                htmlFor="titleEn"
                className="mb-2 block text-sm"
              >
                연구 제목 (영어)
              </label>

              <input
                id="titleEn"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#10233B] p-4 outline-none focus:border-cyan-400"
              />
            </div>

            {/* 한국어 내용 */}
            <div>
              <label
                htmlFor="contentKo"
                className="mb-2 block text-sm"
              >
                연구 내용 (한국어) *
              </label>

              <textarea
                id="contentKo"
                required
                rows={8}
                value={contentKo}
                onChange={(e) => setContentKo(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#10233B] p-4 outline-none focus:border-cyan-400"
              />
            </div>

            {/* 영어 내용 */}
            <div>
              <label
                htmlFor="contentEn"
                className="mb-2 block text-sm"
              >
                연구 내용 (영어)
              </label>

              <textarea
                id="contentEn"
                rows={8}
                value={contentEn}
                onChange={(e) => setContentEn(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#10233B] p-4 outline-none focus:border-cyan-400"
              />
            </div>

            {/* 공개 여부 */}
            <label className="flex items-center gap-3 rounded-lg border border-white/10 bg-[#10233B] p-4">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) =>
                  setIsPublished(e.target.checked)
                }
                className="h-5 w-5"
              />

              <span>
                홈페이지에 공개하기
              </span>
            </label>

            {/* 저장 버튼 */}
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-blue-600 py-4 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "수정 중..."
                : "변경사항 저장"}
            </button>

          </form>
        )}
      </div>
    </main>
  );
}

// Next.js 빌드 시 클라이언트 컴포넌트 처리
export default function EditResearchPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#071426] text-white">
          연구 기록 불러오는 중...
        </main>
      }
    >
      <EditResearchContent />
    </Suspense>
  );
}