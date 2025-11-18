"use client";

import { useState } from "react";
import { useRouteSelector } from "../model/useRouteSelector";

interface RouteChangeData {
  departureTerminalCd: string;
  departureTerminalNm: string;
  arrivalTerminalCd: string;
  arrivalTerminalNm: string;
}

interface RouteSelectorProps {
  onRouteChange: (route: RouteChangeData) => void;
}

// 공통 스타일
const SELECT_BASE_CLASS =
  "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";
const SELECT_DISABLED_CLASS = "disabled:bg-gray-100 disabled:cursor-not-allowed";
const LABEL_CLASS = "block text-sm font-medium text-gray-700 mb-2";
const EMPTY_MESSAGE_CLASS = "mt-1 text-xs text-gray-500";

export function RouteSelector({ onRouteChange }: RouteSelectorProps) {
  const [departureAreaCd, setDepartureAreaCd] = useState("");
  const [departureTerminalCd, setDepartureTerminalCd] = useState("");
  const [departureTerminalNm, setDepartureTerminalNm] = useState("");
  const [arrivalTerminalCd, setArrivalTerminalCd] = useState("");

  const {
    areas,
    departureTerminals,
    arrivalTerminals,
    loading,
    handleAreaChange,
    handleDepartureTerminalChange,
    handleArrivalTerminalChange,
  } = useRouteSelector({
    departureAreaCd,
    departureTerminalCd,
    onDepartureAreaChange: setDepartureAreaCd,
    onDepartureTerminalChange: (terminalCd, terminalNm) => {
      setDepartureTerminalCd(terminalCd);
      setDepartureTerminalNm(terminalNm);
      onRouteChange({
        departureTerminalCd: terminalCd,
        departureTerminalNm: terminalNm,
        arrivalTerminalCd: "",
        arrivalTerminalNm: "",
      });
    },
    onArrivalTerminalChange: (terminalCd, terminalNm) => {
      setArrivalTerminalCd(terminalCd);
      onRouteChange({
        departureTerminalCd,
        departureTerminalNm,
        arrivalTerminalCd: terminalCd,
        arrivalTerminalNm: terminalNm,
      });
    },
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 지역 선택 */}
      <div>
        <label className={LABEL_CLASS}>1️⃣ 출발 지역</label>
        <select
          value={departureAreaCd}
          onChange={(e) => handleAreaChange(e.target.value)}
          className={SELECT_BASE_CLASS}
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
        <label className={LABEL_CLASS}>2️⃣ 출발 터미널</label>
        <select
          value={departureTerminalCd}
          onChange={(e) => handleDepartureTerminalChange(e.target.value)}
          className={`${SELECT_BASE_CLASS} ${SELECT_DISABLED_CLASS}`}
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
            <p className={EMPTY_MESSAGE_CLASS}>
              이 지역에는 출발 가능한 터미널이 없습니다
            </p>
          )}
      </div>

      {/* 도착 터미널 선택 */}
      <div>
        <label className={LABEL_CLASS}>3️⃣ 도착 터미널</label>
        <select
          value={arrivalTerminalCd}
          onChange={(e) => handleArrivalTerminalChange(e.target.value)}
          className={`${SELECT_BASE_CLASS} ${SELECT_DISABLED_CLASS}`}
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
            <p className={EMPTY_MESSAGE_CLASS}>
              이 출발지에서 갈 수 있는 목적지가 없습니다
            </p>
          )}
      </div>
    </div>
  );
}
