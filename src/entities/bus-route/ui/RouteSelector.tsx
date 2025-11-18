"use client";

import { useEffect, useState } from "react";
import type { Area, TerminalData } from "../model/types";
import { fetchAreas, fetchTerminals, fetchDestinations } from "../api";

interface RouteSelectorProps {
  departureAreaCd: string;
  departureTerminalCd: string;
  arrivalTerminalCd: string;
  onDepartureAreaChange: (areaCd: string) => void;
  onDepartureTerminalChange: (terminalCd: string, terminalNm: string) => void;
  onArrivalTerminalChange: (terminalCd: string, terminalNm: string) => void;
}

export function RouteSelector({
  departureAreaCd,
  departureTerminalCd,
  arrivalTerminalCd,
  onDepartureAreaChange,
  onDepartureTerminalChange,
  onArrivalTerminalChange,
}: RouteSelectorProps) {
  const [areas, setAreas] = useState<Area[]>([]);
  const [departureTerminals, setDepartureTerminals] = useState<TerminalData[]>(
    []
  );
  const [arrivalTerminals, setArrivalTerminals] = useState<TerminalData[]>([]);
  const [loading, setLoading] = useState({
    areas: false,
    departureTerminals: false,
    arrivalTerminals: false,
  });

  // 지역 정보 가져오기
  useEffect(() => {
    async function loadAreas() {
      setLoading((prev) => ({ ...prev, areas: true }));
      try {
        const data = await fetchAreas();
        setAreas(data);
      } catch (error) {
        console.error("Failed to load areas:", error);
      } finally {
        setLoading((prev) => ({ ...prev, areas: false }));
      }
    }
    loadAreas();
  }, []);

  // 출발 터미널 정보 가져오기
  useEffect(() => {
    if (!departureAreaCd) {
      setDepartureTerminals([]);
      return;
    }

    async function loadDepartureTerminals() {
      setLoading((prev) => ({ ...prev, departureTerminals: true }));
      try {
        const data = await fetchTerminals(departureAreaCd);
        setDepartureTerminals(data);
      } catch (error) {
        console.error("Failed to load departure terminals:", error);
      } finally {
        setLoading((prev) => ({ ...prev, departureTerminals: false }));
      }
    }
    loadDepartureTerminals();
  }, [departureAreaCd]);

  // 출발 터미널에 맞는 도착 터미널 정보 가져오기
  useEffect(() => {
    if (!departureTerminalCd) {
      setArrivalTerminals([]);
      return;
    }

    async function loadArrivalTerminals() {
      setLoading((prev) => ({ ...prev, arrivalTerminals: true }));
      try {
        const data = await fetchDestinations(departureTerminalCd);
        setArrivalTerminals(data);
      } catch (error) {
        console.error("Failed to load arrival terminals:", error);
      } finally {
        setLoading((prev) => ({ ...prev, arrivalTerminals: false }));
      }
    }
    loadArrivalTerminals();
  }, [departureTerminalCd]);

  const handleAreaChange = (areaCd: string) => {
    onDepartureAreaChange(areaCd);
    onDepartureTerminalChange("", "");
    onArrivalTerminalChange("", "");
  };

  const handleDepartureTerminalChange = (terminalCd: string) => {
    const terminal = departureTerminals.find(
      (t) => t.terminalCd === terminalCd
    );
    onDepartureTerminalChange(terminalCd, terminal?.terminalNm || "");
    onArrivalTerminalChange("", "");
  };

  const handleArrivalTerminalChange = (terminalCd: string) => {
    const terminal = arrivalTerminals.find((t) => t.terminalCd === terminalCd);
    onArrivalTerminalChange(terminalCd, terminal?.terminalNm || "");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 지역 선택 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          1️⃣ 출발 지역
        </label>
        <select
          value={departureAreaCd}
          onChange={(e) => handleAreaChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading.areas}
          required
        >
          <option value="">지역을 선택하세요</option>
          {areas.map((area) => (
            <option key={area.areaCd} value={area.areaCd}>
              {area.areaNm}
            </option>
          ))}
        </select>
      </div>

      {/* 출발 터미널 선택 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          2️⃣ 출발 터미널
        </label>
        <select
          value={departureTerminalCd}
          onChange={(e) => handleDepartureTerminalChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          disabled={!departureAreaCd || loading.departureTerminals}
          required
        >
          <option value="">
            {!departureAreaCd
              ? "먼저 지역을 선택하세요"
              : loading.departureTerminals
              ? "로딩 중..."
              : "터미널을 선택하세요"}
          </option>
          {departureTerminals.map((terminal) => (
            <option key={terminal.terminalCd} value={terminal.terminalCd}>
              {terminal.terminalNm}
            </option>
          ))}
        </select>
        {departureAreaCd &&
          departureTerminals.length === 0 &&
          !loading.departureTerminals && (
            <p className="mt-1 text-xs text-gray-500">
              이 지역에는 출발 가능한 터미널이 없습니다
            </p>
          )}
      </div>

      {/* 도착 터미널 선택 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          3️⃣ 도착 터미널
        </label>
        <select
          value={arrivalTerminalCd}
          onChange={(e) => handleArrivalTerminalChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          disabled={!departureTerminalCd || loading.arrivalTerminals}
          required
        >
          <option value="">
            {!departureTerminalCd
              ? "먼저 출발 터미널을 선택하세요"
              : loading.arrivalTerminals
              ? "로딩 중..."
              : "도착지를 선택하세요"}
          </option>
          {arrivalTerminals.map((terminal) => (
            <option key={terminal.terminalCd} value={terminal.terminalCd}>
              {terminal.terminalNm}
            </option>
          ))}
        </select>
        {departureTerminalCd &&
          arrivalTerminals.length === 0 &&
          !loading.arrivalTerminals && (
            <p className="mt-1 text-xs text-gray-500">
              이 출발지에서 갈 수 있는 목적지가 없습니다
            </p>
          )}
      </div>
    </div>
  );
}
