"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type ArchiveFile = {
  id: string;
  title_ko: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  is_published: boolean;
  created_at: string;
};

export default function ArchiveManagementPage() {
  const router = useRouter();

  const [files, setFiles] = useState<ArchiveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    async function loadFiles() {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData.user) {
        router.replace("/admin/login");
        return;
      }

      const { data: isAdmin, error: adminError } =
        await supabase.rpc("is_portfolio_admin");

      if (adminError || isAdmin !== true) {
        router.replace("/admin/login");
        return;
      }

      const { data, error } = await supabase
        .from("archive_files")
        .select(
          "id, title_ko, file_name, file_path, file_size, is_published, created_at"
        )
        .order("created_at", { ascending: false });

      if (error) {
        setMessage(`조회 실패: ${error.message}`);
      } else {
        setFiles(data ?? []);
      }

      setLoading(false);
    }

    loadFiles();
  }, [router]);

  async function handleDownload(file: ArchiveFile) {
    setMessage("");

    const { data, error } = await supabase.storage
      .from("portfolio-archive")
      .download(file.file_path);

    if (error || !data) {
      setMessage(`다운로드 실패: ${error?.message ?? "파일 없음"}`);
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
  }

  async function handlePublish(file: ArchiveFile) {
    setBusyId(file.id);
    setMessage("");

    const { data, error } = await supabase
      .from("archive_files")
      .update({ is_published: !file.is_published })
      .eq("id", file.id)
      .select("id, is_published")
      .single();

    if (error || !data) {
      setMessage(`변경 실패: ${error?.message ?? "변경된 자료 없음"}`);
    } else {
      setFiles((previous) =>
        previous.map((item) =>
          item.id === file.id
            ? { ...item, is_published: data.is_published }
            : item
        )
      );

      setMessage("공개 상태가 변경되었습니다.");
    }

    setBusyId(null);
  }

  function formatSize(bytes: number | null) {
    if (bytes === null) return "크기 정보 없음";
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#071426] text-white">
        자료실 불러오는 중...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#071426] px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={() => router.push("/admin")}
          className="mb-8 text-cyan-400 hover:text-cyan-300"
        >
          ← 관리자 대시보드
        </button>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">자료실 관리</h1>
            <p className="mt-3 text-slate-400">
              업로드한 자료를 확인하고 공개 여부를 관리합니다.
            </p>
          </div>

          <button
            onClick={() => router.push("/admin/archive/new")}
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500"
          >
            + 새 자료 등록
          </button>
        </div>

        {message && (
          <p role="status" className="mt-6 text-cyan-300">
            {message}
          </p>
        )}

        <div className="mt-10 space-y-4">
          {files.length === 0 ? (
            <p className="rounded-xl border border-white/10 p-8 text-slate-400">
              등록된 자료가 없습니다.
            </p>
          ) : (
            files.map((file) => (
              <article
                key={file.id}
                className="rounded-xl border border-white/10 bg-[#10233B] p-6"
              >
                <h2 className="text-lg font-bold">
                  {file.title_ko}
                </h2>

                <p className="mt-3 break-all text-sm text-slate-400">
                  {file.file_name}
                </p>

                <p className="mt-2 text-sm text-slate-400">
                  {formatSize(file.file_size)}
                </p>

                <span
                  className={`mt-4 inline-block rounded-full px-3 py-1 text-xs ${
                    file.is_published
                      ? "bg-green-500/20 text-green-300"
                      : "bg-slate-500/20 text-slate-300"
                  }`}
                >
                  {file.is_published ? "공개" : "비공개"}
                </span>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={() => handleDownload(file)}
                    className="rounded-lg border border-white/20 px-4 py-2 hover:bg-white/10"
                  >
                    다운로드
                  </button>

                  <button
                    onClick={() => handlePublish(file)}
                    disabled={busyId !== null}
                    className="rounded-lg bg-blue-600 px-4 py-2 hover:bg-blue-500 disabled:opacity-50"
                  >
                    {busyId === file.id
                      ? "처리 중..."
                      : file.is_published
                      ? "비공개로 변경"
                      : "공개로 변경"}
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </main>
  );
}