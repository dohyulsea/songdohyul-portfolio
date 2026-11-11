"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type ResearchRecord = {
  id: string;
  title_ko: string;
  title_en: string | null;
  content_ko: string;
  content_en: string | null;
  created_at: string;
};

export default function ResearchPage() {
  const [records, setRecords] = useState<ResearchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [language, setLanguage] = useState<"KR" | "EN">("KR");

  useEffect(() => {
    async function loadRecords() {
      const { data, error } = await supabase
        .from("research_records")
        .select(
          "id, title_ko, title_en, content_ko, content_en, created_at"
        )
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (error) {
        setError("연구 기록을 불러오지 못했습니다.");
      } else {
        setRecords(data ?? []);
      }

      setLoading(false);
    }

    loadRecords();
  }, []);

  const isKorean = language === "KR";

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
          {isKorean ? "연구 기록" : "Research Records"}
        </h1>

        <p className="mt-5 text-slate-400">
          {isKorean
            ? "수산생명의학과 인공지능 융합 연구 활동을 기록합니다."
            : "Research activities in aquatic biomedical science and artificial intelligence."}
        </p>

        {loading && (
          <p className="mt-12 text-slate-400">
            {isKorean ? "불러오는 중..." : "Loading..."}
          </p>
        )}

        {error && (
          <p className="mt-12 text-red-400">{error}</p>
        )}

        {!loading && !error && records.length === 0 && (
          <p className="mt-12 rounded-xl border border-white/10 p-8 text-slate-400">
            {isKorean
              ? "아직 공개된 연구 기록이 없습니다."
              : "No published research records yet."}
          </p>
        )}

        <div className="mt-12 space-y-6">
          {records.map((record) => (
            <article
              key={record.id}
              className="rounded-2xl border border-white/10 bg-[#10233B] p-8"
            >
              <p className="mb-4 text-sm text-cyan-400">
                {new Date(record.created_at).toLocaleDateString(
                  isKorean ? "ko-KR" : "en-US"
                )}
              </p>

              <h2 className="text-2xl font-bold">
                {isKorean
                  ? record.title_ko
                  : record.title_en || record.title_ko}
              </h2>

              <p className="mt-5 whitespace-pre-wrap leading-8 text-slate-300">
                {isKorean
                  ? record.content_ko
                  : record.content_en || record.content_ko}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}