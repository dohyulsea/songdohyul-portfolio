"use client";

import { useState } from "react";

export default function Home() {
  const [language, setLanguage] = useState<"KR" | "EN">("KR");

  const isKorean = language === "KR";

  const content = {
    title: isKorean
      ? "수산생명의학과 인공지능의 융합"
      : "Connecting Aquatic Medicine and AI",

    description: isKorean
      ? "수산생명의학과 인공지능 기술을 연결하여 생물학적 데이터 분석과 수산질병 연구의 새로운 가능성을 탐구합니다."
      : "Exploring new possibilities in aquatic disease research through artificial intelligence and biological data analysis.",

    about: isKorean ? "소개" : "About",
    research: isKorean ? "연구 분야" : "Research",
    projects: isKorean ? "프로젝트" : "Projects",
    activities: isKorean ? "연구 활동" : "Activities",
    archive: isKorean ? "자료실" : "Archive",
    contact: isKorean ? "연락처" : "Contact",
  };

  const sections = [
    {
      id: "about",
      title: content.about,
      description: isKorean
        ? "전남대학교 수산생명의학과에서 수산생명의학을 공부하며 AI 기술과의 융합 가능성을 탐구하고 있습니다."
        : "Studying Aquatic Biomedical Science at Chonnam National University and exploring applications of artificial intelligence.",
    },
    {
      id: "research",
      title: content.research,
      description: isKorean
        ? "수산질병 AI 진단, 어류 행동 분석, 컴퓨터비전 및 스마트양식 기술에 관심이 있습니다."
        : "Research interests include AI-assisted aquatic disease diagnosis, fish behavior analysis, computer vision, and smart aquaculture.",
    },
    {
      id: "projects",
      title: content.projects,
      description: isKorean
        ? "TRAI — IMU 센서와 컴퓨터비전을 활용한 AI 운동 자세 분석 및 코칭 프로젝트"
        : "TRAI — An AI-powered exercise coaching project using IMU sensors and computer vision.",
    },
    {
      id: "activities",
      title: content.activities,
      description: isKorean
        ? "AI 개발 교육, 프로젝트 수행 및 연구 관련 활동을 기록합니다."
        : "A record of AI development training, projects, and research activities.",
    },
    {
      id: "archive",
      title: content.archive,
      description: isKorean
        ? "연구자료, 발표자료 및 공개 가능한 프로젝트 결과물을 공유합니다."
        : "Sharing research materials, presentations, and publicly available project outcomes.",
    },
  ];

  return (
    <main className="min-h-screen bg-[#071426] text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#071426]/95 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <a href="#" className="text-xl font-bold tracking-wider">
            SONG DOYUL<span className="text-cyan-400">.</span>
          </a>

          <div className="flex items-center gap-5">
            <a href="#about" className="hidden text-sm text-slate-300 hover:text-white md:block">
              {content.about}
            </a>
            <a href="/research" className="hidden text-sm text-slate-300 hover:text-white md:block">
              {content.research}
            </a>
            <a href="/projects" className="hidden text-sm text-slate-300 hover:text-white md:block">
              {content.projects}
            </a>

            <button
              onClick={() => setLanguage(isKorean ? "EN" : "KR")}
              className="rounded-lg border border-cyan-500/40 px-4 py-2 text-sm text-cyan-300 hover:bg-cyan-500/10"
            >
              {language} ⇄
            </button>
          </div>
        </nav>
      </header>

      <section className="mx-auto flex min-h-[75vh] max-w-6xl flex-col justify-center px-6 py-24">
        <p className="mb-6 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
          Research Portfolio
        </p>

        <h1 className="max-w-4xl text-5xl font-bold leading-tight md:text-7xl">
          SONG DOYUL
        </h1>

        <p className="mt-6 text-xl font-medium text-cyan-300 md:text-2xl">
          Aquatic Biomedical Science × Artificial Intelligence
        </p>

        <h2 className="mt-10 text-2xl font-semibold md:text-3xl">
          {content.title}
        </h2>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
          {content.description}
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <a
            href="/research"
            className="rounded-xl bg-blue-600 px-7 py-4 font-semibold transition hover:bg-blue-500"
          >
            {content.research} →
          </a>

          <a
            href="/projects"
            className="rounded-xl border border-white/20 px-7 py-4 font-semibold transition hover:bg-white/10"
          >
            {content.projects}
          </a>
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#0B1D33] py-24">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 md:grid-cols-2">
          {sections.map((section) => (
            <article
              key={section.id}
              id={section.id}
              className="scroll-mt-28 rounded-2xl border border-white/10 bg-white/5 p-8 transition hover:border-cyan-400/40"
            >
              <h2 className="mb-5 text-2xl font-bold">
                {section.title}
              </h2>

              <p className="leading-8 text-slate-300">
                {section.description}
              </p>
                {section.id === "archive" && (
                 <a
                   href="/archive"
                   className="mt-6 inline-block font-semibold text-cyan-400 hover:text-cyan-300"
                 >
                   {isKorean ? "자료실 바로가기 →" : "View Archive →"}
                  </a>
                )}
            </article>
          ))}
        </div>
      </section>

      <footer
        id="contact"
        className="border-t border-white/10 px-6 py-12 text-center text-sm text-slate-400"
      >
        <p>SONG DOYUL | Chonnam National University</p>
        <p className="mt-2">
          Aquatic Biomedical Science × Artificial Intelligence
        </p>
      </footer>
    </main>
  );
}