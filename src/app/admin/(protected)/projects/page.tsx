"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Project = {
  id: string;
  title_ko: string;
  title_en: string | null;
  technologies: string[] | null;
  status: string;
  is_published: boolean;
  created_at: string;
};

export default function ProjectManagementPage() {
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadProjects() {
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
        router.replace("/admin/login");
        return;
      }

      // 프로젝트 목록 불러오기
      const { data, error } = await supabase
        .from("projects")
        .select(
          "id, title_ko, title_en, technologies, status, is_published, created_at"
        )
        .order("created_at", { ascending: false });

      if (error) {
        setMessage(`조회 실패: ${error.message}`);
      } else {
        setProjects(data ?? []);
      }

      setLoading(false);
    }

    loadProjects();
  }, [router]);

  // 프로젝트 삭제
  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "이 프로젝트를 정말 삭제하시겠습니까? 삭제 후 복구할 수 없습니다."
    );

    if (!confirmed) return;

    setDeletingId(id);
    setMessage("");

    const { data, error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id)
      .select("id");

    if (error) {
      setMessage(`삭제 실패: ${error.message}`);
    } else if (!data || data.length === 0) {
      setMessage("삭제된 프로젝트가 없습니다. 권한을 확인해 주세요.");
    } else {
      setProjects((previous) =>
        previous.filter((project) => project.id !== id)
      );
      setMessage("프로젝트가 삭제되었습니다.");
    }

    setDeletingId(null);
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case "ongoing":
        return "진행 중";
      case "completed":
        return "완료";
      case "planned":
        return "계획 중";
      default:
        return status;
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#071426] text-white">
        프로젝트 불러오는 중...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#071426] px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">

        {/* 관리자 대시보드 이동 */}
        <button
          onClick={() => router.push("/admin")}
          className="mb-8 text-cyan-400 hover:text-cyan-300"
        >
          ← 관리자 대시보드
        </button>

        {/* 페이지 제목 */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              프로젝트 관리
            </h1>

            <p className="mt-3 text-slate-400">
              등록한 프로젝트를 확인하고 관리할 수 있습니다.
            </p>
          </div>

          <button
            onClick={() => router.push("/admin/projects/new")}
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500"
          >
            + 새 프로젝트 등록
          </button>
        </div>

        {/* 알림 메시지 */}
        {message && (
          <p role="status" className="mt-6 text-cyan-300">
            {message}
          </p>
        )}

        {/* 프로젝트 목록 */}
        <div className="mt-10 space-y-5">
          {projects.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-[#10233B] p-8">
              <p className="text-slate-400">
                등록된 프로젝트가 없습니다.
              </p>
            </div>
          ) : (
            projects.map((project) => (
              <article
                key={project.id}
                className="rounded-2xl border border-white/10 bg-[#10233B] p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-5">

                  {/* 프로젝트 정보 */}
                  <div>
                    <h2 className="text-xl font-bold">
                      {project.title_ko}
                    </h2>

                    {project.title_en && (
                      <p className="mt-2 text-sm text-slate-400">
                        {project.title_en}
                      </p>
                    )}

                    <p className="mt-3 text-sm text-slate-400">
                      등록일:{" "}
                      {new Date(
                        project.created_at
                      ).toLocaleDateString("ko-KR")}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs text-blue-300">
                        {getStatusLabel(project.status)}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs ${
                          project.is_published
                            ? "bg-green-500/20 text-green-300"
                            : "bg-slate-500/20 text-slate-300"
                        }`}
                      >
                        {project.is_published
                          ? "공개"
                          : "비공개"}
                      </span>
                    </div>
                  </div>

                  {/* 관리 버튼 */}
                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        router.push(
                          `/admin/projects/${project.id}/edit`
                        )
                      }
                      className="rounded-lg border border-white/20 px-4 py-2 hover:bg-white/10"
                    >
                      수정
                    </button>

                    <button
                      onClick={() => handleDelete(project.id)}
                      disabled={deletingId !== null}
                      className="rounded-lg border border-red-500/30 px-4 py-2 text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                    >
                      {deletingId === project.id
                        ? "삭제 중..."
                        : "삭제"}
                    </button>
                  </div>
                </div>

                {/* 사용 기술 */}
                {project.technologies &&
                  project.technologies.length > 0 && (
                    <div className="mt-6 flex flex-wrap gap-2 border-t border-white/10 pt-5">
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
            ))
          )}
        </div>
      </div>
    </main>
  );
}