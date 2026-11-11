"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Project = {
  id: string;
  title_ko: string;
  title_en: string | null;
  description_ko: string;
  description_en: string | null;
  technologies: string[] | null;
  status: string;
  created_at: string;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [language, setLanguage] = useState<"KR" | "EN">("KR");

  const isKorean = language === "KR";

  useEffect(() => {
    async function loadProjects() {
      const { data, error } = await supabase
        .from("projects")
        .select(
          "id, title_ko, title_en, description_ko, description_en, technologies, status, created_at"
        )
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setProjects(data ?? []);
      }

      setLoading(false);
    }

    loadProjects();
  }, []);

  function getStatus(status: string) {
    const labels: Record<string, string> = isKorean
      ? {
          ongoing: "진행 중",
          completed: "완료",
          planned: "계획 중",
        }
      : {
          ongoing: "Ongoing",
          completed: "Completed",
          planned: "Planned",
        };

    return labels[status] ?? status;
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
          PROJECT PORTFOLIO
        </p>

        <h1 className="text-4xl font-bold">
          {isKorean ? "프로젝트" : "Projects"}
        </h1>

        <p className="mt-5 text-slate-400">
          {isKorean
            ? "인공지능과 데이터 분석을 활용한 프로젝트를 소개합니다."
            : "Exploring projects in artificial intelligence and data analysis."}
        </p>

        {loading && (
          <p className="mt-12 text-slate-400">
            {isKorean ? "불러오는 중..." : "Loading..."}
          </p>
        )}

        {error && (
          <p className="mt-12 text-red-400">
            프로젝트 조회 실패: {error}
          </p>
        )}

        {!loading && !error && projects.length === 0 && (
          <p className="mt-12 rounded-xl border border-white/10 p-8 text-slate-400">
            {isKorean
              ? "아직 공개된 프로젝트가 없습니다."
              : "No published projects yet."}
          </p>
        )}

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {projects.map((project) => (
            <article
              key={project.id}
              className="rounded-2xl border border-white/10 bg-[#10233B] p-8 transition hover:border-cyan-400/40"
            >
              <div className="mb-6 flex items-center justify-between">
                <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs text-blue-300">
                  {getStatus(project.status)}
                </span>

                <span className="text-xs text-slate-400">
                  {new Date(project.created_at).toLocaleDateString(
                    isKorean ? "ko-KR" : "en-US"
                  )}
                </span>
              </div>

              <h2 className="text-2xl font-bold">
                {isKorean
                  ? project.title_ko
                  : project.title_en || project.title_ko}
              </h2>

              <p className="mt-5 whitespace-pre-wrap leading-8 text-slate-300">
                {isKorean
                  ? project.description_ko
                  : project.description_en || project.description_ko}
              </p>

              {project.technologies &&
                project.technologies.length > 0 && (
                  <div className="mt-8 flex flex-wrap gap-2 border-t border-white/10 pt-5">
                    {project.technologies.map((technology) => (
                      <span
                        key={technology}
                        className="rounded-lg bg-white/5 px-3 py-2 text-xs text-slate-300"
                      >
                        {technology}
                      </span>
                    ))}
                  </div>
                )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}