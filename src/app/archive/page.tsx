"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type ArchiveFile = {
  id: string;
  title_ko: string;
  title_en: string | null;
  description_ko: string | null;
  description_en: string | null;
  file_name: string;
  file_path: string;
  file_size: number | null;
  created_at: string;
};

export default function ArchivePage() {
  const [files, setFiles] = useState<ArchiveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [language, setLanguage] = useState<"KR" | "EN">("KR");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const isKorean = language === "KR";

  useEffect(() => {
    async function loadFiles() {
      const { data, error } = await supabase
        .from("archive_files")
        .select(
          "id,title_ko,title_en,description_ko,description_en,file_name,file_path,file_size,created_at"
        )
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (error) {
        setMessage(`자료 조회 실패: ${error.message}`);
      } else {
        setFiles(data ?? []);
      }

      setLoading(false);
    }

    loadFiles();
  }, []);

  async function handleDownload(file: ArchiveFile) {
    setDownloadingId(file.id);
    setMessage("");

    const { data, error } = await supabase.storage
      .from("portfolio-archive")
      .download(file.file_path);

    if (error || !data) {
      setMessage(`다운로드 실패: ${error?.message ?? "파일 없음"}`);
      setDownloadingId(null);
      return;
    }

    const url = URL.createObjectURL(data);
    const link = document.createElement("a");

    link.href = url;
    link.download = file.file_name;

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setDownloadingId(null);
  }

  return (
    <main className="min-h-screen bg-[#071426] text-white">
      <header className="border-b border-white/10">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-xl font-bold">
            SONG DOYUL<span className="text-cyan-400">.</span>
          </Link>

          <button
            onClick={() => setLanguage(isKorean ? "EN" : "KR")}
            className="rounded-lg border border-cyan-500/40 px-4 py-2 text-sm text-cyan-300"
          >
            {language} ⇄
          </button>
        </nav>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-20">
        <p className="mb-4 text-sm tracking-[0.3em] text-cyan-400">
          RESEARCH ARCHIVE
        </p>

        <h1 className="text-4xl font-bold">
          {isKorean ? "자료실" : "Archive"}
        </h1>

        <p className="mt-5 text-slate-400">
          {isKorean
            ? "공개 가능한 연구자료와 발표자료를 공유합니다."
            : "Research materials and presentations available for public access."}
        </p>

        {loading && (
          <p className="mt-12 text-slate-400">
            {isKorean ? "불러오는 중..." : "Loading..."}
          </p>
        )}

        {message && (
          <p role="alert" className="mt-8 text-red-400">
            {message}
          </p>
        )}

        {!loading && !message && files.length === 0 && (
          <p className="mt-12 rounded-xl border border-white/10 p-8 text-slate-400">
            {isKorean
              ? "아직 공개된 자료가 없습니다."
              : "No published files yet."}
          </p>
        )}

        <div className="mt-12 space-y-5">
          {files.map((file) => (
            <article
              key={file.id}
              className="rounded-2xl border border-white/10 bg-[#10233B] p-8"
            >
              <h2 className="text-xl font-bold">
                {isKorean
                  ? file.title_ko
                  : file.title_en || file.title_ko}
              </h2>

              <p className="mt-4 whitespace-pre-wrap text-slate-300">
                {isKorean
                  ? file.description_ko
                  : file.description_en || file.description_ko}
              </p>

              <p className="mt-4 break-all text-sm text-slate-400">
                {file.file_name}
              </p>

              <button
                onClick={() => handleDownload(file)}
                disabled={downloadingId !== null}
                className="mt-6 rounded-lg bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500 disabled:opacity-50"
              >
                {downloadingId === file.id
                  ? "다운로드 중..."
                  : isKorean
                  ? "자료 다운로드"
                  : "Download"}
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}