"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function NewProjectPage() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [titleKo, setTitleKo] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [descriptionKo, setDescriptionKo] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [status, setStatus] = useState("ongoing");
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

    const technologyList = technologies
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const { error } = await supabase.from("projects").insert({
      title_ko: titleKo.trim(),
      title_en: titleEn.trim() || null,
      description_ko: descriptionKo.trim(),
      description_en: descriptionEn.trim() || null,
      technologies: technologyList,
      status,
      is_published: isPublished,
    });

    if (error) {
      setMessage(`저장 실패: ${error.message}`);
      setSaving(false);
      return;
    }

    setMessage("프로젝트가 성공적으로 저장되었습니다.");
    setSaving(false);

    setTitleKo("");
    setTitleEn("");
    setDescriptionKo("");
    setDescriptionEn("");
    setTechnologies("");
    setStatus("ongoing");
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
          onClick={() => router.push("/admin/projects")}
          className="mb-8 text-sm text-cyan-400 hover:text-cyan-300"
        >
          ← 프로젝트 관리
        </button>

        <h1 className="text-3xl font-bold">새 프로젝트 등록</h1>

        <p className="mt-3 text-slate-400">
          프로젝트 정보를 작성하고 공개 여부를 설정할 수 있습니다.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <div>
            <label htmlFor="titleKo" className="mb-2 block text-sm">
              프로젝트명 (한국어) *
            </label>
            <input
              id="titleKo"
              required
              value={titleKo}
              onChange={(e) => setTitleKo(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#10233B] p-4 outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label htmlFor="titleEn" className="mb-2 block text-sm">
              프로젝트명 (영어)
            </label>
            <input
              id="titleEn"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#10233B] p-4 outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label htmlFor="descriptionKo" className="mb-2 block text-sm">
              프로젝트 설명 (한국어) *
            </label>
            <textarea
              id="descriptionKo"
              required
              rows={6}
              value={descriptionKo}
              onChange={(e) => setDescriptionKo(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#10233B] p-4 outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label htmlFor="descriptionEn" className="mb-2 block text-sm">
              프로젝트 설명 (영어)
            </label>
            <textarea
              id="descriptionEn"
              rows={6}
              value={descriptionEn}
              onChange={(e) => setDescriptionEn(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#10233B] p-4 outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label htmlFor="technologies" className="mb-2 block text-sm">
              사용 기술
            </label>
            <input
              id="technologies"
              value={technologies}
              onChange={(e) => setTechnologies(e.target.value)}
              placeholder="Python, Flutter, FastAPI, PostgreSQL"
              className="w-full rounded-lg border border-white/10 bg-[#10233B] p-4 outline-none focus:border-cyan-400"
            />
            <p className="mt-2 text-xs text-slate-400">
              기술 이름을 쉼표(,)로 구분해 입력하세요.
            </p>
          </div>

          <div>
            <label htmlFor="status" className="mb-2 block text-sm">
              진행 상태
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#10233B] p-4 outline-none focus:border-cyan-400"
            >
              <option value="ongoing">진행 중</option>
              <option value="completed">완료</option>
              <option value="planned">계획 중</option>
            </select>
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
            <p role="status" className="text-sm text-cyan-300">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-blue-600 py-4 font-semibold hover:bg-blue-500 disabled:opacity-50"
          >
            {saving ? "저장 중..." : "프로젝트 저장"}
          </button>
        </form>
      </div>
    </main>
  );
}