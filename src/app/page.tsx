"use client";

import { useState, useEffect } from "react";
import type { CheckResult, Stats, BusCheckConfig } from "@/lib/types";
import Header from "@/components/Header";
import StatsCards from "@/components/StatsCards";
import SearchForm from "@/components/SearchForm";
import HistoryList from "@/components/HistoryList";

export default function Home() {
  const [history, setHistory] = useState<CheckResult[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [loading, setLoading] = useState(true);

  // 페이지 로드 시 데이터 가져오기
  useEffect(() => {
    fetchHistory();
    fetchStats();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch("/api/history?limit=10");
      const data = await response.json();
      if (data.success) {
        setHistory(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/stats");
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const handleCheck = async (config: BusCheckConfig) => {
    setIsChecking(true);
    try {
      const response = await fetch("/api/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      });
      const result = await response.json();

      // 결과를 히스토리에 추가
      setHistory((prev) => [result, ...prev.slice(0, 9)]);

      // 통계 갱신
      await fetchStats();

      if (result.foundSeats) {
        alert("🎉 좌석을 찾았습니다!");
      } else if (result.success) {
        alert("빈 좌석이 없습니다.");
      } else {
        alert(`오류가 발생했습니다: ${result.error || "알 수 없는 오류"}`);
      }
    } catch (error) {
      console.error("Failed to check seats:", error);
      alert("좌석 확인 중 오류가 발생했습니다.");
    } finally {
      setIsChecking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <Header />
        <SearchForm onSearch={handleCheck} isSearching={isChecking} />
        {stats && <StatsCards stats={stats} />}
        <HistoryList history={history} />
      </div>
    </div>
  );
}
