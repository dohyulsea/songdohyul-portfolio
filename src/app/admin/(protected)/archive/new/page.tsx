"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function NewArchivePage() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [titleKo, setTitleKo] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [descriptionKo, setDescriptionKo] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [file, setFile] = useState<File | null>(null);

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

    if (!file || saving) return;

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      setMessage("PDF, PPTX, DOCX 파일만 업로드할 수 있습니다.");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setMessage("파일 크기는 20MB 이하여야 합니다.");
      return;
    }

    setSaving(true);
    setMessage("");

    // 파일 이름 충돌을 방지하기 위한 고유 경로
    const extension = file.name.split(".").pop()?.toLowerCase();

    const filePath = `${crypto.randomUUID()}.${extension}`;

    // 1. Supabase Storage에 파일 업로드
    const { error: uploadError } = await supabase.storage
      .from("portfolio-archive")
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      setMessage(`파일 업로드 실패: ${uploadError.message}`);
      setSaving(false);
      return;
    }

    // 2. 데이터베이스에 자료 정보 저장
    const { error: databaseError } = await supabase
      .from("archive_files")
      .insert({
        title_ko: titleKo.trim(),
        title_en: titleEn.trim() || null,
        description_ko: descriptionKo.trim() || null,
        description_en: descriptionEn.trim() || null,
        file_path: filePath,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        is_published: false,
      });

    if (databaseError) {
      // DB 저장 실패 시 업로드한 파일 정리
      const { error: cleanupError } = await supabase.storage
        .from("portfolio-archive")
        .remove([filePath]);

      setMessage(
        cleanupError
          ? `DB 저장 실패: ${databaseError.message}. 파일 정리도 실패했습니다: ${cleanupError.message}`
          : `DB 저장 실패: ${databaseError.message}`
      );

      setSaving(false);
      return;
    }

    setMessage("자료가 성공적으로 저장되었습니다.");

    setTitleKo("");
    setTitleEn("");
    setDescriptionKo("");
    setDescriptionEn("");
    setFile(null);

    // 파일 선택창 초기화
    const fileInput = document.getElementById(
      "archive-file"
    ) as HTMLInputElement | null;

    if (fileInput) fileInput.value = "";

    setSaving(false);
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
          className="mb-8 text-cyan-400"
        >
          ← 관리자 대시보드
        </button>

        <h1 className="text-3xl font-bold">
          자료실 파일 등록
        </h1>

        <p className="mt-3 text-slate-400">
          PDF, PPTX, DOCX 파일을 업로드할 수 있습니다.
          등록한 자료는 기본적으로 비공개 상태로 저장됩니다.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <div>
            <label htmlFor="titleKo" className="mb-2 block text-sm">
              자료 제목 (한국어) *
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
              자료 제목 (영어)
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
              자료 설명 (한국어)
            </label>
            <textarea
              id="descriptionKo"
              rows={4}
              value={descriptionKo}
              onChange={(e) => setDescriptionKo(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#10233B] p-4 outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label htmlFor="descriptionEn" className="mb-2 block text-sm">
              자료 설명 (영어)
            </label>
            <textarea
              id="descriptionEn"
              rows={4}
              value={descriptionEn}
              onChange={(e) => setDescriptionEn(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#10233B] p-4 outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label htmlFor="archive-file" className="mb-2 block text-sm">
              파일 선택 *
            </label>

            <input
              id="archive-file"
              type="file"
              required
              accept=".pdf,.pptx,.docx"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full rounded-lg border border-white/10 bg-[#10233B] p-4 text-sm"
            />

            <p className="mt-2 text-xs text-slate-400">
              PDF, PPTX, DOCX / 최대 20MB
            </p>
          </div>

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
            {saving ? "업로드 중..." : "자료 저장"}
          </button>
        </form>
      </div>
    </main>
  );
}