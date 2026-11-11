"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type ResearchRecord = {
  id: string;
  title_ko: string;
  category: string;
  is_published: boolean;
  created_at: string;
};

export default function ResearchManagementPage() {
  const router = useRouter();

  const [records, setRecords] = useState<ResearchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadRecords() {
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

      const { data, error } = await supabase
        .from("research_records")
        .select("id, title_ko, category, is_published, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        setMessage(`조회 실패: ${error.message}`);
      } else {
        setRecords(data ?? []);
      }

      setLoading(false);
    }

    loadRecords();
  }, [router]);

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "이 연구 기록을 정말 삭제하시겠습니까?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("research_records")
      .delete()
      .eq("id", id);

    if (error) {
      setMessage(`삭제 실패: ${error.message}`);
      return;
    }

    setRecords((previous) =>
      previous.filter((record) => record.id !== id)
    );

    setMessage("연구 기록이 삭제되었습니다.");
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
      <div className="mx-auto max-w-5xl">
        <button
          onClick={() => router.push("/admin")}
          className="mb-8 text-cyan-400"
        >
          ← 관리자 대시보드
        </button>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">연구 기록 관리</h1>
            <p className="mt-3 text-slate-400">
              등록된 연구 기록을 확인하고 관리할 수 있습니다.
            </p>
          </div>

          <button
            onClick={() => router.push("/admin/research/new")}
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500"
          >
            + 새 연구 기록
          </button>
        </div>

        {message && (
          <p role="status" className="mt-6 text-cyan-300">
            {message}
          </p>
        )}

        <div className="mt-10 space-y-4">
          {records.length === 0 ? (
            <p className="rounded-xl border border-white/10 p-8 text-slate-400">
              등록된 연구 기록이 없습니다.
            </p>
          ) : (
            records.map((record) => (
              <article
                key={record.id}
                className="flex flex-wrap items-center justify-between gap-5 rounded-xl border border-white/10 bg-[#10233B] p-6"
              >
                <div>
                  <h2 className="text-lg font-semibold">
                    {record.title_ko}
                  </h2>

                  <p className="mt-2 text-sm text-slate-400">
                    {new Date(record.created_at).toLocaleDateString("ko-KR")}
                  </p>

                  <span
                    className={`mt-3 inline-block rounded-full px-3 py-1 text-xs ${
                      record.is_published
                        ? "bg-green-500/20 text-green-300"
                        : "bg-slate-500/20 text-slate-300"
                    }`}
                  >
                    {record.is_published ? "공개" : "비공개"}
                  </span>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      router.push(`/admin/research/${record.id}/edit`)
                    }
                    className="rounded-lg border border-white/20 px-4 py-2 hover:bg-white/10"
                  >
                    수정
                  </button>

                  <button
                    onClick={() => handleDelete(record.id)}
                    className="rounded-lg border border-red-500/30 px-4 py-2 text-red-400 hover:bg-red-500/10"
                  >
                    삭제
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