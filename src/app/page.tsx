"use client";

import { JobHistoryList, JobHistoryProvider } from "@/entities/job-history";
import { Header } from "@/shared/ui";
import { SearchPanel } from "@/widgets";

export default function Home() {
  return (
    <JobHistoryProvider limit={20}>
      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row gap-8 p-4 md:p-8">
          {/* 검색 패널 */}
          <section className="lg:flex-1" aria-label="검색">
            <SearchPanel />
          </section>

          {/* History */}
          <aside className="lg:flex-1 rounded-xl" aria-label="조회 기록">
            <JobHistoryList />
          </aside>
        </main>
      </div>
    </JobHistoryProvider>
  );
}
