import { Header } from "@/shared/ui";
import { SearchPanel } from "@/widgets/search-panel";
import { StatsDashboard } from "@/widgets/stats-dashboard";
import { HistoryFeed } from "@/widgets/history-feed";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* 헤더 */}
      <Header />

      {/* 메인 컨텐츠 */}
      <main className="flex-1 flex gap-6 px-4 md:p-8">
        <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-6">
          {/* SearchPanel + StatsDashboard */}
          <section
            className="flex-1 flex flex-col gap-6"
            aria-label="검색 및 통계"
          >
            <SearchPanel />
            <StatsDashboard />
          </section>

          {/* History */}
          <aside className="flex-1" aria-label="조회 기록">
            <HistoryFeed limit={10} />
          </aside>
        </div>
      </main>
    </div>
  );
}
