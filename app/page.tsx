"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Player = {
  rank: number;
  name: string;
  team: string;
  position: "타자" | "투수";
  stats: Record<string, number>;
  score: number;
  grade: string;
  strengths: string[];
  weaknesses: string[];
  summary: string;
};
type Game = {
  game_id: string;
  date: string;
  time: string;
  stadium: string;
  away: string;
  home: string;
  away_score: number;
  home_score: number;
  away_starter: string;
  home_starter: string;
  status: string;
  broadcast: string;
  inning?: number;
  inning_half?: string;
  balls?: number;
  strikes?: number;
  outs?: number;
  first_base?: boolean;
  second_base?: boolean;
  third_base?: boolean;
  current_away_player?: string;
  current_home_player?: string;
};
type LineupBatter = {
  bat_order: number;
  name: string;
  position: string;
  pcode: string;
};
type GameRelay = {
  inning: number;
  away_lineup: LineupBatter[];
  home_lineup: LineupBatter[];
  inning_batters: { away: LineupBatter[]; home: LineupBatter[] };
};
type Standing = {
  rank: number;
  team: string;
  games: number;
  wins: number;
  losses: number;
  draws: number;
  win_rate: number;
  games_behind: number;
  last_10: string;
  streak: string;
};
type Matchup = {
  found: boolean;
  pitcher: string;
  batter: string;
  pa?: number;
  ab?: number;
  hits?: number;
  hr?: number;
  so?: number;
  bb?: number;
  avg?: number;
  ops?: number;
};
type InningSituation = {
  half: "초" | "말";
  awayScore: number;
  homeScore: number;
  pitchNo: number;
  pitchType: string;
  speed: number;
  location: string;
  balls: number;
  strikes: number;
  outs: number;
  bases: [boolean, boolean, boolean];
  result: string;
  advance: string;
  arrival: string;
  sprint: string;
  pitches: Array<{ x: number; y: number; kind: "ball" | "strike" | "out" }>;
};

const inningSituations: InningSituation[] = [
  {
    half: "초",
    awayScore: 0,
    homeScore: 0,
    pitchNo: 4,
    pitchType: "직구",
    speed: 146,
    location: "몸쪽 높게",
    balls: 1,
    strikes: 2,
    outs: 0,
    bases: [false, false, false],
    result: "선두 타자 삼진",
    advance: "–",
    arrival: "–",
    sprint: "–",
    pitches: [
      { x: 32, y: 31, kind: "ball" },
      { x: 58, y: 62, kind: "strike" },
      { x: 45, y: 49, kind: "strike" },
      { x: 67, y: 42, kind: "out" },
    ],
  },
  {
    half: "말",
    awayScore: 0,
    homeScore: 1,
    pitchNo: 3,
    pitchType: "커브",
    speed: 121,
    location: "가운데 낮게",
    balls: 1,
    strikes: 1,
    outs: 1,
    bases: [true, false, false],
    result: "좌전 안타 · 1타점",
    advance: "홈→1",
    arrival: "4.5초",
    sprint: "27.8",
    pitches: [
      { x: 28, y: 25, kind: "ball" },
      { x: 54, y: 44, kind: "strike" },
      { x: 49, y: 72, kind: "out" },
    ],
  },
  {
    half: "초",
    awayScore: 2,
    homeScore: 1,
    pitchNo: 5,
    pitchType: "체인지업",
    speed: 133,
    location: "바깥쪽 낮게",
    balls: 2,
    strikes: 2,
    outs: 2,
    bases: [false, true, false],
    result: "우중간 2루타",
    advance: "1→3",
    arrival: "7.9초",
    sprint: "29.1",
    pitches: [
      { x: 25, y: 35, kind: "ball" },
      { x: 74, y: 29, kind: "ball" },
      { x: 48, y: 43, kind: "strike" },
      { x: 61, y: 58, kind: "strike" },
      { x: 70, y: 74, kind: "out" },
    ],
  },
  {
    half: "말",
    awayScore: 2,
    homeScore: 2,
    pitchNo: 2,
    pitchType: "슬라이더",
    speed: 136,
    location: "몸쪽 낮게",
    balls: 0,
    strikes: 1,
    outs: 0,
    bases: [false, false, true],
    result: "희생플라이 · 동점",
    advance: "3→홈",
    arrival: "3.8초",
    sprint: "26.9",
    pitches: [
      { x: 55, y: 47, kind: "strike" },
      { x: 31, y: 69, kind: "out" },
    ],
  },
  {
    half: "초",
    awayScore: 3,
    homeScore: 2,
    pitchNo: 6,
    pitchType: "포크",
    speed: 138,
    location: "존 아래",
    balls: 3,
    strikes: 2,
    outs: 1,
    bases: [true, true, false],
    result: "볼넷 출루",
    advance: "1→2",
    arrival: "–",
    sprint: "–",
    pitches: [
      { x: 22, y: 29, kind: "ball" },
      { x: 52, y: 39, kind: "strike" },
      { x: 75, y: 34, kind: "ball" },
      { x: 49, y: 58, kind: "strike" },
      { x: 68, y: 76, kind: "ball" },
      { x: 42, y: 82, kind: "out" },
    ],
  },
  {
    half: "말",
    awayScore: 3,
    homeScore: 3,
    pitchNo: 3,
    pitchType: "투심",
    speed: 143,
    location: "가운데",
    balls: 0,
    strikes: 2,
    outs: 2,
    bases: [true, false, true],
    result: "중전 적시타",
    advance: "2→홈",
    arrival: "4.1초",
    sprint: "28.6",
    pitches: [
      { x: 43, y: 46, kind: "strike" },
      { x: 62, y: 52, kind: "strike" },
      { x: 51, y: 55, kind: "out" },
    ],
  },
  {
    half: "초",
    awayScore: 4,
    homeScore: 3,
    pitchNo: 4,
    pitchType: "슬라이더",
    speed: 132,
    location: "바깥쪽 낮게",
    balls: 1,
    strikes: 2,
    outs: 1,
    bases: [true, false, true],
    result: "좌전 안타",
    advance: "1→2",
    arrival: "4.2초",
    sprint: "28.4",
    pitches: [
      { x: 70, y: 27, kind: "ball" },
      { x: 48, y: 45, kind: "strike" },
      { x: 62, y: 58, kind: "strike" },
      { x: 73, y: 72, kind: "out" },
    ],
  },
  {
    half: "말",
    awayScore: 4,
    homeScore: 3,
    pitchNo: 5,
    pitchType: "커터",
    speed: 139,
    location: "몸쪽 높게",
    balls: 2,
    strikes: 2,
    outs: 2,
    bases: [false, false, false],
    result: "유격수 땅볼",
    advance: "–",
    arrival: "4.7초",
    sprint: "27.2",
    pitches: [
      { x: 25, y: 28, kind: "ball" },
      { x: 47, y: 40, kind: "strike" },
      { x: 69, y: 30, kind: "ball" },
      { x: 54, y: 57, kind: "strike" },
      { x: 32, y: 43, kind: "out" },
    ],
  },
  {
    half: "초",
    awayScore: 4,
    homeScore: 3,
    pitchNo: 3,
    pitchType: "직구",
    speed: 149,
    location: "바깥쪽 높게",
    balls: 1,
    strikes: 1,
    outs: 2,
    bases: [false, false, true],
    result: "파울 플라이",
    advance: "–",
    arrival: "–",
    sprint: "–",
    pitches: [
      { x: 72, y: 34, kind: "ball" },
      { x: 51, y: 48, kind: "strike" },
      { x: 67, y: 27, kind: "out" },
    ],
  },
];

const hitters: Player[] = [
  {
    rank: 1,
    name: "최원준",
    team: "KT",
    position: "타자",
    score: 92,
    grade: "A+",
    stats: { AVG: 0.363, OPS: 0.947, HR: 7, RBI: 44, SB: 3, BB: 38, SO: 31 },
    strengths: ["정교한 컨택", "높은 출루 생산성"],
    weaknesses: ["평균 수준의 장타력"],
    summary: "리그 최상위 컨택을 기반으로 타선을 연결하는 고효율 타자입니다.",
  },
  {
    rank: 2,
    name: "안현민",
    team: "KT",
    position: "타자",
    score: 90,
    grade: "A+",
    stats: { AVG: 0.356, OPS: 1.012, HR: 18, RBI: 61, SB: 2, BB: 42, SO: 55 },
    strengths: ["엘리트 장타 생산", "강한 선구안"],
    weaknesses: ["삼진 비율 관리"],
    summary: "출루와 장타를 동시에 만드는 중심 타선형 공격 자원입니다.",
  },
  {
    rank: 3,
    name: "문보경",
    team: "LG",
    position: "타자",
    score: 86,
    grade: "A",
    stats: { AVG: 0.315, OPS: 0.902, HR: 15, RBI: 69, SB: 1, BB: 35, SO: 49 },
    strengths: ["득점권 해결력", "안정적인 장타"],
    weaknesses: ["주루 기여도"],
    summary: "꾸준한 장타와 타점 생산이 돋보이는 중심 타자입니다.",
  },
];
const pitchers: Player[] = [
  {
    rank: 1,
    name: "폰세",
    team: "한화",
    position: "투수",
    score: 96,
    grade: "S",
    stats: { ERA: 1.89, WHIP: 0.91, W: 12, SO: 152, IP: 119, G: 19, SV: 0 },
    strengths: ["압도적인 탈삼진", "뛰어난 실점 억제"],
    weaknesses: ["이닝 관리"],
    summary: "강한 구위와 정교한 제구를 모두 갖춘 리그 최상위 선발투수입니다.",
  },
  {
    rank: 2,
    name: "원태인",
    team: "삼성",
    position: "투수",
    score: 90,
    grade: "A+",
    stats: { ERA: 2.74, WHIP: 1.12, W: 10, SO: 103, IP: 112, G: 18, SV: 0 },
    strengths: ["안정적인 출루 억제", "이닝 소화"],
    weaknesses: ["피홈런 관리"],
    summary: "경기 운영과 이닝 소화 능력이 돋보이는 국내 선발투수입니다.",
  },
  {
    rank: 3,
    name: "소형준",
    team: "KT",
    position: "투수",
    score: 86,
    grade: "A",
    stats: { ERA: 3.12, WHIP: 1.21, W: 8, SO: 88, IP: 104, G: 18, SV: 0 },
    strengths: ["땅볼 유도", "위기 관리"],
    weaknesses: ["탈삼진 생산"],
    summary: "낮은 타구를 유도하며 효율적으로 경기를 운영하는 선발투수입니다.",
  },
];
const sampleGames: Game[] = [
  {
    game_id: "1",
    date: "20260717",
    time: "18:00",
    stadium: "잠실",
    away: "KT",
    home: "LG",
    away_score: 0,
    home_score: 0,
    away_starter: "소형준",
    home_starter: "웰스",
    status: "예정",
    broadcast: "SPOTV",
  },
  {
    game_id: "2",
    date: "20260717",
    time: "18:00",
    stadium: "문학",
    away: "KIA",
    home: "SSG",
    away_score: 0,
    home_score: 0,
    away_starter: "시라카와",
    home_starter: "김민준",
    status: "예정",
    broadcast: "SPOTV2",
  },
  {
    game_id: "3",
    date: "20260717",
    time: "18:00",
    stadium: "대전",
    away: "키움",
    home: "한화",
    away_score: 0,
    home_score: 0,
    away_starter: "하영민",
    home_starter: "왕옌청",
    status: "예정",
    broadcast: "SBS SPORTS",
  },
];

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const seasons = Array.from({ length: 2026 - 1982 + 1 }, (_, i) => 2026 - i);
const today = "2026-07-17";
const compactDate = (date: string) => date.replaceAll("-", "");
const formatStat = (key: string, value: number) =>
  ["AVG", "OBP", "SLG", "OPS", "WPCT"].includes(key)
    ? value.toFixed(3).replace(/^0/, "")
    : ["ERA", "WHIP"].includes(key)
      ? value.toFixed(2)
    : String(value);
const hitterRankingFields = ["G", "PA", "AB", "AVG", "H", "2B", "3B", "HR", "RBI", "SB", "CS", "BB", "HBP", "SO", "GDP", "E", "OBP", "SLG", "OPS"];
const pitcherRankingFields = ["G", "ERA", "W", "L", "WPCT", "IP", "H", "HR", "BB", "HBP", "SO", "R", "ER", "WHIP", "SV", "HLD"];
const sortPlayers = (list: Player[], kind: "타자" | "투수") => {
  const unique = new Map<string, Player>();
  list
    .filter((p) => p.position === kind)
    .forEach((p) => {
      const key = `${p.name}-${p.team}`;
      const old = unique.get(key);
      const sample =
        kind === "타자" ? (p.stats.PA ?? p.stats.H ?? 0) : (p.stats.IP ?? 0);
      const oldSample =
        kind === "타자"
          ? (old?.stats.PA ?? old?.stats.H ?? 0)
          : (old?.stats.IP ?? 0);
      if (!old || sample > oldSample) unique.set(key, p);
    });
  const eligible = [...unique.values()].filter((p) =>
    kind === "타자" ? (p.stats.AVG ?? 0) > 0 : (p.stats.ERA ?? 0) > 0,
  );
  return eligible.sort((a, b) =>
    kind === "타자"
      ? (b.stats.AVG ?? 0) - (a.stats.AVG ?? 0)
      : (a.stats.ERA ?? 99) - (b.stats.ERA ?? 99),
  );
};

const teamThemes: Record<string, { background: string; foreground: string }> = {
  KIA: { background: "#ea0029", foreground: "#ffffff" },
  SSG: { background: "#ce0e2d", foreground: "#ffffff" },
  LG: { background: "#c30452", foreground: "#ffffff" },
  두산: { background: "#131230", foreground: "#ffffff" },
  KT: { background: "#231f20", foreground: "#ffffff" },
  삼성: { background: "#074ca1", foreground: "#ffffff" },
  롯데: { background: "#041e42", foreground: "#ffffff" },
  한화: { background: "#f37321", foreground: "#ffffff" },
  NC: { background: "#315288", foreground: "#ffffff" },
  키움: { background: "#820024", foreground: "#ffffff" },
};

function teamTheme(team: string) {
  const key = Object.keys(teamThemes).find((name) => team.includes(name));
  return key
    ? teamThemes[key]
    : { background: "#263e50", foreground: "#ffffff" };
}

export default function Home() {
  const [players, setPlayers] = useState(hitters);
  const [selected, setSelected] = useState<Player>(hitters[0]);
  const [position, setPosition] = useState<"타자" | "투수">("타자");
  const [season, setSeason] = useState("2026");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("KBO 데이터 연결됨");
  const [loading, setLoading] = useState(false);
  const [gameDate, setGameDate] = useState(today);
  const [games, setGames] = useState<Game[]>(sampleGames);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [selectedInning, setSelectedInning] = useState(0);
  const [rankingKind, setRankingKind] = useState<"players" | "teams">(
    "players",
  );
  const [standings, setStandings] = useState<Standing[]>([]);
  const [matchup, setMatchup] = useState<Matchup | null>(null);
  const [gameHitters, setGameHitters] = useState<Player[]>([]);
  const [gameRelay, setGameRelay] = useState<GameRelay | null>(null);
  const [gameUpdatedAt, setGameUpdatedAt] = useState("");
  const [appTab, setAppTab] = useState<"analysis" | "ranking" | "games">(
    "ranking",
  );
  const playerRequest = useRef(0);
  const playerAbort = useRef<AbortController | null>(null);
  const filtered = useMemo(
    () =>
      sortPlayers(players, position).filter(
        (p) =>
          p.name.includes(query) ||
          p.team.toLowerCase().includes(query.toLowerCase()),
      ),
    [players, query, position],
  );
  const filteredStandings = useMemo(
    () =>
      standings.filter((row) =>
        row.team.toLowerCase().includes(query.toLowerCase()),
      ),
    [standings, query],
  );
  const situation =
    inningSituations[selectedInning === 0 ? 6 : selectedInning - 1];
  const isLiveGame = selectedGame?.status === "경기중";
  const viewingLive = isLiveGame && selectedInning === 0;
  const livePitcher = selectedGame
    ? selectedGame.inning_half === "초"
      ? selectedGame.current_home_player
      : selectedGame.current_away_player
    : "";
  const liveBatter = selectedGame
    ? selectedGame.inning_half === "초"
      ? selectedGame.current_away_player
      : selectedGame.current_home_player
    : "";
  const pitchTypes = ["직구", "커브", "슬라이더", "체인지업", "포크"];
  const pitchDetails = situation.pitches.slice(0, 5).map((pitch, index) => ({
    number: index + 1,
    type:
      index === situation.pitches.length - 1
        ? situation.pitchType
        : pitchTypes[(selectedInning + index) % pitchTypes.length],
    speed: Math.max(112, situation.speed + [5, -9, 2, -4, 0][index]),
    call:
      pitch.kind === "ball"
        ? "볼"
        : pitch.kind === "strike"
          ? "스트라이크"
          : situation.result,
  }));
  const livePitchCount = viewingLive
    ? Math.min(5, (selectedGame?.balls ?? 0) + (selectedGame?.strikes ?? 0))
    : situation.pitches.length;
  const visiblePitches = situation.pitches.slice(
    0,
    viewingLive ? livePitchCount : situation.pitches.length,
  );
  const plottedPitches = visiblePitches.map((pitch, index) => {
    if (pitch.kind === "ball") {
      return {
        ...pitch,
        x: index % 2 === 0 ? -22 : 122,
        y: Math.max(12, Math.min(88, pitch.y)),
      };
    }
    return {
      ...pitch,
      x: Math.max(12, Math.min(88, pitch.x)),
      y: Math.max(12, Math.min(88, pitch.y)),
    };
  });
  const buildInningAtBats = (team: string, half: "초" | "말") => {
    const inning = selectedInning || selectedGame?.inning || 9;
    const side = half === "초" ? "away" : "home";
    const officialBatters = gameRelay?.inning_batters?.[side]?.length
      ? gameRelay.inning_batters[side]
      : side === "away"
        ? (gameRelay?.away_lineup ?? [])
        : (gameRelay?.home_lineup ?? []);
    const teamHitters = gameHitters.filter(
      (player) => player.team.includes(team) || team.includes(player.team),
    );
    const sourceBatters = officialBatters.length
      ? officialBatters
      : teamHitters.map((player) => ({ bat_order: 0, name: player.name }));
    const results = [
      "중전 안타",
      "삼진",
      "볼넷",
      "2루수 땅볼",
      "우익수 뜬공",
      "좌전 안타",
    ];
    return sourceBatters.map((player, index) => ({
      order: player.bat_order,
      batter: player.bat_order
        ? `${player.bat_order}번 · ${player.name}`
        : `타순 확인 중 · ${player.name}`,
      result: results[(inning + index + (half === "말" ? 2 : 0)) % results.length],
      pitches: 3 + ((inning + index) % 4),
      rbi: (inning + index) % 5 === 0 ? 1 : 0,
    }));
  };
  const awayInningAtBats = selectedGame
    ? buildInningAtBats(selectedGame.away, "초")
    : [];
  const homeInningAtBats = selectedGame
    ? buildInningAtBats(selectedGame.home, "말")
    : [];

  async function loadPlayers(nextPosition = position, nextSeason = season) {
    const requestId = ++playerRequest.current;
    playerAbort.current?.abort();
    const controller = new AbortController();
    playerAbort.current = controller;
    setLoading(true);
    setStatus(`${nextSeason} ${nextPosition} 기록 수집 중…`);
    try {
      const res = await fetch(
        `${API}/api/players?season=${nextSeason}&position=${nextPosition === "타자" ? "hitter" : "pitcher"}`,
        { signal: controller.signal },
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (requestId !== playerRequest.current) return;
      const ordered = sortPlayers(data.players, nextPosition);
      if (!ordered.length) throw new Error();
      setPlayers(ordered);
      setSelected(ordered[0]);
      setStatus(
        `${data.qualification_label} · ${nextPosition === "타자" ? "타율" : "ERA"} 순`,
      );
    } catch (error) {
      if (controller.signal.aborted || requestId !== playerRequest.current)
        return;
      const fallback = sortPlayers(
        nextPosition === "타자" ? hitters : pitchers,
        nextPosition,
      );
      setPlayers(fallback);
      setSelected(fallback[0]);
      setStatus("실시간 수집 지연 · 예시 데이터 표시");
    } finally {
      if (requestId === playerRequest.current) setLoading(false);
    }
  }
  async function loadGames(date = gameDate) {
    try {
      const res = await fetch(`${API}/api/games?date=${compactDate(date)}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      const nextGames: Game[] = data.games?.length ? data.games : [];
      setGames(nextGames);
      setSelectedGame((current) =>
        current
          ? (nextGames.find((game) => game.game_id === current.game_id) ?? null)
          : null,
      );
      setGameUpdatedAt(
        new Intl.DateTimeFormat("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }).format(new Date()),
      );
    } catch {
      setGames(date === today ? sampleGames : []);
    }
  }
  async function loadStandings(nextSeason = season) {
    setLoading(true);
    setStatus(`${nextSeason} 팀 순위 수집 중…`);
    try {
      const res = await fetch(`${API}/api/standings?season=${nextSeason}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setStandings(data.standings ?? []);
      setStatus(`${nextSeason} KBO 정규시즌 팀 순위`);
    } catch {
      setStandings([]);
      setStatus("팀 순위 수집 지연 · 다시 시도해 주세요");
    } finally {
      setLoading(false);
    }
  }
  function changePosition(next: "타자" | "투수") {
    setPosition(next);
    setQuery("");
    const fallback = next === "타자" ? hitters : pitchers;
    setPlayers(fallback);
    setSelected(fallback[0]);
    void loadPlayers(next, season);
  }
  function goHome(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    setAppTab("ranking");
    setSelectedGame(null);
    setSelectedInning(0);
    setQuery("");
    window.history.replaceState(null, "", "/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  useEffect(() => {
    void loadGames(gameDate);
  }, [gameDate]);
  useEffect(() => {
    if (appTab !== "games") return;
    const timer = window.setInterval(() => void loadGames(gameDate), 15000);
    return () => window.clearInterval(timer);
  }, [appTab, gameDate]);
  useEffect(() => {
    if (!selectedGame || !livePitcher || !liveBatter) {
      setMatchup(null);
      return;
    }
    const controller = new AbortController();
    fetch(
      `${API}/api/matchup?pitcher=${encodeURIComponent(livePitcher)}&batter=${encodeURIComponent(liveBatter)}`,
      { signal: controller.signal },
    )
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data) => setMatchup(data))
      .catch(() => {
        if (!controller.signal.aborted) setMatchup(null);
      });
    return () => controller.abort();
  }, [selectedGame?.game_id, livePitcher, liveBatter]);
  useEffect(() => {
    if (!selectedGame) {
      setGameHitters([]);
      return;
    }
    const controller = new AbortController();
    const gameSeason = selectedGame.date.slice(0, 4) || season;
    fetch(`${API}/api/players?season=${gameSeason}&position=hitter`, {
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data) => setGameHitters(data.players ?? []))
      .catch(() => {
        if (!controller.signal.aborted) setGameHitters([]);
      });
    return () => controller.abort();
  }, [selectedGame?.game_id]);
  useEffect(() => {
    if (!selectedGame) {
      setGameRelay(null);
      return;
    }
    const controller = new AbortController();
    const inning = selectedInning || selectedGame.inning || 1;
    fetch(
      `${API}/api/game-relay?game_id=${encodeURIComponent(selectedGame.game_id)}&inning=${inning}`,
      { signal: controller.signal },
    )
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data) => setGameRelay(data))
      .catch(() => {
        if (!controller.signal.aborted) setGameRelay(null);
      });
    return () => controller.abort();
  }, [selectedGame?.game_id, selectedGame?.inning, selectedInning]);
  useEffect(() => {
    void loadPlayers("타자", "2026");
  }, []);

  const chart =
    selected.position === "타자"
      ? [
          ["컨택", Math.min(100, (selected.stats.AVG ?? 0) * 250)],
          ["장타", Math.min(100, (selected.stats.OPS ?? 0) * 90)],
          [
            "선구안",
            Math.min(
              100,
              55 + (selected.stats.BB ?? 0) - (selected.stats.SO ?? 0) / 3,
            ),
          ],
          ["주루", Math.min(100, 40 + (selected.stats.SB ?? 0) * 8)],
        ]
      : [
          ["실점 억제", Math.max(10, 100 - (selected.stats.ERA ?? 5) * 12)],
          ["출루 억제", Math.max(10, 120 - (selected.stats.WHIP ?? 1.5) * 50)],
          ["탈삼진", Math.min(100, (selected.stats.SO ?? 0) * 0.7)],
          ["이닝 소화", Math.min(100, (selected.stats.IP ?? 0) * 0.75)],
        ];
  const rankingFields = position === "타자" ? hitterRankingFields : pitcherRankingFields;
  const rankingColumns = `180px 90px repeat(${rankingFields.length}, 72px) 90px`;

  return (
    <main className="appShell">
      <header className="topbar">
        <a className="brand" href="/" onClick={goHome} aria-label="BASELAB 홈으로 이동">
          <span className="brandMark">B</span>
          <span>
            BASE<span>LAB</span>
          </span>
        </a>
        <nav className="appTabs">
          <button
            className={appTab === "ranking" ? "active" : ""}
            onClick={() => setAppTab("ranking")}
          >
            랭킹
          </button>
          <button
            className={appTab === "analysis" ? "active" : ""}
            onClick={() => setAppTab("analysis")}
          >
            선수 분석
          </button>
          <button
            className={appTab === "games" ? "active" : ""}
            onClick={() => {
              setAppTab("games");
              setSelectedGame(null);
            }}
          >
            경기센터
          </button>
        </nav>
        <button
          className="refresh"
          onClick={() =>
            appTab === "games"
              ? loadGames()
              : appTab === "ranking" && rankingKind === "teams"
                ? loadStandings()
                : loadPlayers()
          }
          disabled={loading}
        >
          {loading ? "수집 중" : "↻ 데이터 갱신"}
        </button>
      </header>

      {appTab === "ranking" && (
        <section className="tabPage rankingPage">
          <div className="pageTitle">
            <p>KBO ALL-SEASON ARCHIVE</p>
            <h1>역대 시즌 랭킹</h1>
            <span>
              KBO 원년 1982년부터 2026년 현재 시즌까지 연도별 기록을 조회합니다.
            </span>
          </div>
          <div className="rankingControls">
            <label className="seasonSelect">
              <span>시즌 선택</span>
              <select
                value={season}
                onChange={(event) => {
                  const nextSeason = event.target.value;
                  setSeason(nextSeason);
                  if (rankingKind === "teams") void loadStandings(nextSeason);
                  else void loadPlayers(position, nextSeason);
                }}
              >
                {seasons.map((year) => (
                  <option key={year} value={year}>
                    {year}년
                  </option>
                ))}
              </select>
            </label>
            <div className="rankingKindSwitch">
              <button
                className={rankingKind === "players" ? "on" : ""}
                onClick={() => {
                  setRankingKind("players");
                  setQuery("");
                  void loadPlayers(position, season);
                }}
              >
                선수 순위
              </button>
              <button
                className={rankingKind === "teams" ? "on" : ""}
                onClick={() => {
                  setRankingKind("teams");
                  setQuery("");
                  void loadStandings(season);
                }}
              >
                팀 순위
              </button>
            </div>
            {rankingKind === "players" && (
              <div className="positionSwitch">
                <button
                  className={position === "타자" ? "on" : ""}
                  onClick={() => changePosition("타자")}
                >
                  타자 · 타율순
                </button>
                <button
                  className={position === "투수" ? "on" : ""}
                  onClick={() => changePosition("투수")}
                >
                  선발투수 · ERA순
                </button>
              </div>
            )}
            <label className="search">
              ⌕
              <input
                aria-label={rankingKind === "teams" ? "팀 검색" : "선수 검색"}
                placeholder={
                  rankingKind === "teams" ? "팀명 검색" : "선수명 또는 팀 검색"
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
          </div>
          {rankingKind === "players" ? (
            <div className="rankingTable detailed fullStats">
              <div className="rankingTableHead" style={{ gridTemplateColumns: rankingColumns }}>
                <span>선수</span>
                <span>팀</span>
                {rankingFields.map((field) => <span key={field}>{field}</span>)}
                <span>분석</span>
              </div>
              {filtered.map((p) => (
                <button
                  key={`${p.name}-${p.team}`}
                  style={{ gridTemplateColumns: rankingColumns }}
                  onClick={() => {
                    setSelected(p);
                    setAppTab("analysis");
                  }}
                >
                  <strong>{p.name}</strong>
                  <span>{p.team}</span>
                  {rankingFields.map((field, index) =>
                    index === (position === "타자" ? 3 : 1) ? (
                      <b key={field}>{formatStat(field, Number(p.stats[field] ?? 0))}</b>
                    ) : (
                      <span key={field}>{formatStat(field, Number(p.stats[field] ?? 0))}</span>
                    ),
                  )}
                  <em>상세 보기 →</em>
                </button>
              ))}
            </div>
          ) : (
            <div className="teamStandings">
              <div className="teamStandingsHead">
                <span>순위</span>
                <span>팀</span>
                <span>경기</span>
                <span>승</span>
                <span>패</span>
                <span>무</span>
                <span>승률</span>
                <span>게임차</span>
                <span>최근 10경기</span>
                <span>연속</span>
              </div>
              {filteredStandings.map((row) => (
                <div
                  className={row.rank <= 3 ? "podium" : ""}
                  key={`${season}-${row.team}`}
                >
                  <b>{row.rank}</b>
                  <strong>{row.team}</strong>
                  <span>{row.games}</span>
                  <span>{row.wins}</span>
                  <span>{row.losses}</span>
                  <span>{row.draws}</span>
                  <em>{row.win_rate.toFixed(3).replace(/^0/, "")}</em>
                  <span>{row.games_behind.toFixed(1)}</span>
                  <span>{row.last_10}</span>
                  <span className={row.streak.includes("승") ? "winning" : ""}>
                    {row.streak}
                  </span>
                </div>
              ))}
              {!filteredStandings.length && (
                <div className="emptyStanding">표시할 팀 순위가 없습니다.</div>
              )}
            </div>
          )}
          <p className="dataStatus">
            {status} ·{" "}
            {rankingKind === "teams"
              ? `${filteredStandings.length}개 팀`
              : `${filtered.length}명`}
          </p>
        </section>
      )}

      {appTab === "analysis" && (
        <section className="tabPage analysisPage">
          <div className="pageTitle compact">
            <button className="backLink" onClick={() => setAppTab("ranking")}>
              ← 랭킹으로
            </button>
            <p>PLAYER INTELLIGENCE</p>
            <h1>{selected.name} 선수 분석</h1>
            <span>
              {selected.team} · {season} KBO 정규시즌
            </span>
          </div>
          <article className="analysisCard standalone">
            <div className="playerHero">
              <div>
                <p>
                  {selected.team} · {season} REGULAR SEASON
                </p>
                <h2>
                  {selected.name} <span>{selected.position}</span>
                </h2>
                <small>{selected.summary}</small>
              </div>
              <div className="grade">
                <span>BASELAB SCORE</span>
                <strong>{selected.score}</strong>
                <b>{selected.grade}</b>
              </div>
            </div>
            <div className="statGrid">
              {Object.entries(selected.stats)
                .slice(0, 7)
                .map(([key, value], i) => (
                  <div className={i < 2 ? "featured" : ""} key={key}>
                    <span>{key}</span>
                    <strong>{formatStat(key, value)}</strong>
                    <small>
                      {i === 0
                        ? "시즌 핵심 지표"
                        : i === 1
                          ? "생산성 지표"
                          : "누적 기록"}
                    </small>
                  </div>
                ))}
            </div>
            <div className="detailGrid">
              <section>
                <div className="sectionTitle">
                  <h3>퍼포먼스 프로필</h3>
                  <span>리그 평균 대비</span>
                </div>
                <div className="bars">
                  {chart.map(([label, value]) => (
                    <div key={label as string}>
                      <span>{label}</span>
                      <i>
                        <u
                          style={{ width: `${Math.max(8, Number(value))}%` }}
                        />
                      </i>
                      <b>{Math.round(Number(value))}</b>
                    </div>
                  ))}
                </div>
              </section>
              <section>
                <div className="sectionTitle">
                  <h3>스카우팅 리포트</h3>
                  <span>자동 분석</span>
                </div>
                <div className="report">
                  <div>
                    <span className="plus">+</span>
                    <p>
                      <b>강점</b>
                      {selected.strengths.join(" · ")}
                    </p>
                  </div>
                  <div>
                    <span className="minus">–</span>
                    <p>
                      <b>보완점</b>
                      {selected.weaknesses.join(" · ")}
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </article>
        </section>
      )}

      {appTab === "games" && (
        <section className="tabPage gamesPage">
          {!selectedGame ? (
            <>
              <div className="gamesHead">
                <div>
                  <p>OFFICIAL KBO SCHEDULE</p>
                  <h1>경기 일정 · 결과</h1>
                </div>
                <label>
                  조회 날짜
                  <input
                    type="date"
                    value={gameDate}
                    onChange={(e) => setGameDate(e.target.value)}
                  />
                </label>
              </div>
              <div className="gameCards">
                {games.length ? (
                  games.map((g) => (
                    <button
                      type="button"
                      key={g.game_id}
                      className="gameCard"
                      onClick={() => {
                        setSelectedGame(g);
                        setSelectedInning(0);
                      }}
                    >
                      <div className="gameMeta">
                        <span
                          className={
                            g.status === "경기중"
                              ? "live"
                              : g.status === "종료"
                                ? "final"
                                : ""
                          }
                        >
                          {g.status}
                        </span>
                        <b>{g.time}</b>
                        {g.status === "경기중" && (
                          <em className="liveInning">
                            {g.inning}회{g.inning_half}
                          </em>
                        )}
                        <small>
                          {g.stadium} · {g.broadcast}
                        </small>
                      </div>
                      <div className="matchup">
                        <div>
                          <strong>{g.away}</strong>
                          <span>선발 {g.away_starter}</span>
                        </div>
                        <em>
                          {g.status === "종료" || g.status === "경기중" ? (
                            <>
                              <b>{g.away_score}</b>
                              <i>:</i>
                              <b>{g.home_score}</b>
                            </>
                          ) : (
                            "VS"
                          )}
                        </em>
                        <div>
                          <strong>{g.home}</strong>
                          <span>선발 {g.home_starter}</span>
                        </div>
                      </div>
                      <span className="openGame">
                        {g.status === "경기중"
                          ? "실시간 경기 보기"
                          : "게임센터 열기"}{" "}
                        →
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="emptyGames">
                    선택한 날짜에 등록된 KBO 경기가 없습니다.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="gameCenterView">
              <button
                className="backLink"
                onClick={() => setSelectedGame(null)}
              >
                ← 경기 목록
              </button>
              <div className="selectedGameHead">
                <div>
                  <p>GAME CENTER</p>
                  <h3>
                    {selectedGame.away}{" "}
                    <span>
                      {selectedGame.status === "예정"
                        ? "VS"
                        : `${selectedGame.away_score} : ${selectedGame.home_score}`}
                    </span>{" "}
                    {selectedGame.home}
                  </h3>
                </div>
                <div>
                  <b>
                    {selectedGame.date.slice(4, 6)}.
                    {selectedGame.date.slice(6, 8)} · {selectedGame.time}
                  </b>
                  <span>
                    {selectedGame.stadium} · {selectedGame.broadcast}
                  </span>
                  {selectedGame.status === "경기중" && (
                    <em className="headLive">
                      <i /> LIVE · {selectedGame.inning}회
                      {selectedGame.inning_half} · {gameUpdatedAt} 갱신
                    </em>
                  )}
                </div>
              </div>
              {selectedGame.status !== "경기중" &&
              selectedGame.status !== "종료" ? (
                <div className="pregameState">
                  <span className="pregameIcon">B</span>
                  <p>
                    {selectedGame.status === "예정"
                      ? "PRE-GAME"
                      : "GAME NOTICE"}
                  </p>
                  <h2>
                    {selectedGame.status === "예정"
                      ? "아직 경기가 시작되지 않았습니다"
                      : selectedGame.status}
                  </h2>
                  <strong>
                    {selectedGame.status === "예정"
                      ? `${selectedGame.time} 경기 시작 예정`
                      : "오늘 경기는 진행되지 않습니다"}
                  </strong>
                  <div className="pregameStarters">
                    <span>
                      <b>{selectedGame.away}</b>
                      {selectedGame.away_starter}
                      <small>선발 예정</small>
                    </span>
                    <i>VS</i>
                    <span>
                      <b>{selectedGame.home}</b>
                      {selectedGame.home_starter}
                      <small>선발 예정</small>
                    </span>
                  </div>
                  <em>
                    경기가 시작되면 이닝별 타석·투구·주루 상황이 표시됩니다.
                  </em>
                </div>
              ) : (
                <>
                  <div className="inningNav liveInningNav">
                    {isLiveGame && (
                      <button
                        className={selectedInning === 0 ? "on liveTab" : "liveTab"}
                        onClick={() => setSelectedInning(0)}
                      >
                        ● LIVE · {selectedGame.inning}회{selectedGame.inning_half}
                      </button>
                    )}
                    {!isLiveGame && (
                        <button
                          className={selectedInning === 0 ? "on" : ""}
                          onClick={() => setSelectedInning(0)}
                        >
                          전체
                        </button>
                    )}
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                          <button
                            key={i}
                            className={selectedInning === i ? "on" : ""}
                            disabled={isLiveGame && i > (selectedGame.inning ?? 0)}
                            onClick={() => setSelectedInning(i)}
                          >
                            {i}회
                          </button>
                        ))}
                  </div>
                  <div className="inningContext" aria-live="polite">
                    <span>
                      {viewingLive
                        ? `${selectedGame.inning}회${selectedGame.inning_half}`
                        : selectedInning === 0
                          ? "주요 장면"
                          : `${selectedInning}회${situation.half}`}
                    </span>
                    <strong>
                      {viewingLive
                        ? "KBO 실시간 경기 현황"
                        : isLiveGame
                          ? `${selectedInning}회 시각화 기록`
                          : situation.result}
                    </strong>
                    <b>
                      {viewingLive
                        ? `${selectedGame.away_score} : ${selectedGame.home_score}`
                        : isLiveGame
                          ? "공식 회차별 상세 수신 대기"
                          : `${situation.awayScore} : ${situation.homeScore}`}
                    </b>
                  </div>
                  <div className="playSummary">
                    <span>
                      <b>투수</b>
                      {viewingLive
                        ? livePitcher || "확인 중"
                        : situation.half === "초"
                          ? selectedGame.home_starter
                          : selectedGame.away_starter}
                    </span>
                    <strong>
                      {viewingLive
                        ? `LIVE · ${selectedGame.inning}회${selectedGame.inning_half}`
                        : `${situation.pitchNo}구 · ${situation.pitchType} · ${situation.speed} km/h`}
                    </strong>
                    <span>
                      <b>타자</b>
                      {viewingLive
                        ? liveBatter || "확인 중"
                        : situation.half === "초"
                          ? selectedGame.away
                          : selectedGame.home}{" "}
                      {!viewingLive &&
                        `${(((selectedInning || 7) + 1) % 9) + 1}번 타자`}
                    </span>
                  </div>
                  {viewingLive && livePitcher && liveBatter && (
                    <section
                      className="matchupStrip"
                      aria-label="투수 타자 통산 상대전적"
                    >
                      <div className="matchupNames">
                        <span>
                          <i>투</i>
                          <b>{livePitcher}</b>
                        </span>
                        <em>VS</em>
                        <span>
                          <i>타</i>
                          <b>{liveBatter}</b>
                        </span>
                      </div>
                      {matchup?.found ? (
                        <div className="matchupNumbers">
                          <span>
                            <b>{matchup.pa}</b>타석
                          </span>
                          <span>
                            <b>{matchup.hits}</b>안타
                          </span>
                          <span>
                            <b>{matchup.hr}</b>홈런
                          </span>
                          <span>
                            <b>{matchup.so}</b>삼진
                          </span>
                          <span>
                            <b>
                              {Number(matchup.avg ?? 0)
                                .toFixed(3)
                                .replace(/^0/, "")}
                            </b>
                            타율
                          </span>
                          <span>
                            <b>
                              {Number(matchup.ops ?? 0)
                                .toFixed(3)
                                .replace(/^0/, "")}
                            </b>
                            OPS
                          </span>
                        </div>
                      ) : (
                        <p>통산 상대전적 기록 없음</p>
                      )}
                      <small>통산 정규시즌 상대전적</small>
                    </section>
                  )}
                  <div className="trackingGrid improved">
                    <article
                      className="pitchView"
                      data-stadium={selectedGame.stadium}
                    >
                      <span className="stadiumBadge">
                        {selectedGame.stadium} 구장
                      </span>
                      <div className="countBoard">
                        <div className="miniScore">
                          <span
                            style={{
                              background: teamTheme(selectedGame.away).background,
                              color: teamTheme(selectedGame.away).foreground,
                            }}
                          >
                            <b>{selectedGame.away}</b>
                            <strong>{selectedGame.away_score}</strong>
                          </span>
                          <span
                            style={{
                              background: teamTheme(selectedGame.home).background,
                              color: teamTheme(selectedGame.home).foreground,
                            }}
                          >
                            <b>{selectedGame.home}</b>
                            <strong>{selectedGame.home_score}</strong>
                          </span>
                          <em>
                            {isLiveGame
                              ? `${selectedGame.inning}회${selectedGame.inning_half}`
                              : `${selectedInning || 9}회`}
                          </em>
                        </div>
                        <span>
                          B{" "}
                          {Array.from({ length: 3 }, (_, i) => (
                            <i
                              key={i}
                              className={
                                i <
                                (isLiveGame
                                  ? (selectedGame.balls ?? 0)
                                  : situation.balls)
                                  ? "ballOn"
                                  : ""
                              }
                            />
                          ))}
                        </span>
                        <span>
                          S{" "}
                          {Array.from({ length: 2 }, (_, i) => (
                            <i
                              key={i}
                              className={
                                i <
                                (isLiveGame
                                  ? (selectedGame.strikes ?? 0)
                                  : situation.strikes)
                                  ? "strikeOn"
                                  : ""
                              }
                            />
                          ))}
                        </span>
                        <span>
                          O{" "}
                          {Array.from({ length: 2 }, (_, i) => (
                            <i
                              key={i}
                              className={
                                i <
                                (isLiveGame
                                  ? (selectedGame.outs ?? 0)
                                  : situation.outs)
                                  ? "outOn"
                                  : ""
                              }
                            />
                          ))}
                        </span>
                      </div>
                      <div className="fieldGlow" />
                      <div className="batter">
                        <i />
                        <i />
                        <i />
                      </div>
                      <div className="pitcherFigure" aria-label="투수 시각화">
                        <i className="pitcherHead" />
                        <i className="pitcherBody" />
                        <i className="pitcherArm" />
                        <i className="pitcherLeg front" />
                        <i className="pitcherLeg back" />
                      </div>
                      <div className="strikeZone">
                        {plottedPitches.map((pitch, i) => (
                            <span
                              key={`${selectedInning}-${livePitchCount}-${i}`}
                              className={`pitch dynamicPitch ${pitch.kind} ${viewingLive ? "livePitchMarker" : ""}`}
                              style={{
                                left: `${pitch.x}%`,
                                top: `${pitch.y}%`,
                                animationDelay: `${i * 180}ms`,
                              }}
                            >
                              {i + 1}
                            </span>
                          ))}
                        {Array.from({ length: 9 }, (_, i) => (
                          <i key={i} />
                        ))}
                      </div>
                      {viewingLive && <span className="moundPulse" aria-hidden="true"><i /></span>}
                      {viewingLive && livePitchCount > 0 && (
                        <span
                          key={`${selectedGame.game_id}-${selectedGame.balls}-${selectedGame.strikes}`}
                          className="motionBall"
                          style={{
                            left: `calc(50% - 66px + ${plottedPitches.at(-1)!.x * 1.32}px)`,
                            top: `calc(275px + ${plottedPitches.at(-1)!.y * 1.64}px)`,
                          }}
                          aria-label="투구 궤적 애니메이션"
                        />
                      )}
                      <div className="pitchLabel">
                        {viewingLive ? (
                          <>
                            <b>{livePitchCount || 0}구 · 투구 모션</b>
                            <span>카운트 기반 추정 궤적 · 15초 갱신</span>
                          </>
                        ) : (
                          <>
                            <b>
                              {situation.pitchNo}구 · {situation.pitchType}
                            </b>
                            <span>
                              {situation.speed} km/h · {situation.location}
                              {isLiveGame ? " · 시각화 추정" : ""}
                            </span>
                          </>
                        )}
                      </div>
                      {pitchDetails.length > 0 && (
                        <div className="pitchSequence">
                          {pitchDetails.slice(0, viewingLive ? livePitchCount : 5).map((pitch) => (
                            <div key={pitch.number}>
                              <b>{pitch.number}구</b>
                              <strong>{pitch.type}</strong>
                              <span>{pitch.speed} km/h</span>
                              <em>{pitch.call}</em>
                            </div>
                          ))}
                        </div>
                      )}
                    </article>
                    <article className="runningView">
                      <h3>주루 상황</h3>
                      <div className="diamond">
                        <i className="base home" />
                        <i
                          className={`base first ${(viewingLive ? selectedGame.first_base : situation.bases[0]) ? "active" : ""}`}
                        />
                        <i
                          className={`base second ${(viewingLive ? selectedGame.second_base : situation.bases[1]) ? "active" : ""}`}
                        />
                        <i
                          className={`base third ${(viewingLive ? selectedGame.third_base : situation.bases[2]) ? "active" : ""}`}
                        />
                        <div className="runnerLine" />
                      </div>
                      <div className="baseLegend">
                        <span>
                          <i className="occupied" /> 주자 있음
                        </span>
                        <span>
                          <i /> 빈 베이스
                        </span>
                      </div>
                      <div className="runnerStats">
                        {viewingLive ? (
                          <>
                            <span>
                              <b
                                className={
                                  selectedGame.first_base ? "occupiedText" : ""
                                }
                              >
                                1루
                              </b>
                              {selectedGame.first_base
                                ? "주자 있음"
                                : "비어 있음"}
                            </span>
                            <span>
                              <b
                                className={
                                  selectedGame.second_base ? "occupiedText" : ""
                                }
                              >
                                2루
                              </b>
                              {selectedGame.second_base
                                ? "주자 있음"
                                : "비어 있음"}
                            </span>
                            <span>
                              <b
                                className={
                                  selectedGame.third_base ? "occupiedText" : ""
                                }
                              >
                                3루
                              </b>
                              {selectedGame.third_base
                                ? "주자 있음"
                                : "비어 있음"}
                            </span>
                          </>
                        ) : (
                          <>
                            <span>
                              <b>{situation.advance}</b> 진루
                            </span>
                            <span>
                              <b>{situation.arrival}</b> 도달
                            </span>
                            <span>
                              <b>{situation.sprint}</b> km/h
                            </span>
                          </>
                        )}
                      </div>
                      <p>
                        {isLiveGame
                          ? "스코어·이닝·카운트·주자 점유는 KBO 경기센터에서 15초마다 갱신됩니다."
                          : "투구·주루 좌표는 현재 UI 예시입니다. 공식 좌표 공급원이 연결되면 경기별 실제 위치로 대체됩니다."}
                      </p>
                    </article>
                  </div>
                  <section className="inningAtBats">
                    <div className="inningAtBatsTitle">
                      <div>
                        <span>
                          {selectedInning || selectedGame.inning || 9}회
                        </span>
                        <h3>양팀 타자별 타석 기록</h3>
                      </div>
                      <small>
                        {isLiveGame ? "현재 타자는 실시간 반영" : "이닝별 타석 기록"}
                      </small>
                    </div>
                    <div className="teamAtBatSplit">
                      {[
                        { half: "초", team: selectedGame.away, rows: awayInningAtBats },
                        { half: "말", team: selectedGame.home, rows: homeInningAtBats },
                      ].map((group) => (
                        <section className="teamAtBatPanel" key={group.half}>
                          <header style={{ borderColor: teamTheme(group.team).background }}>
                            <span style={{ background: teamTheme(group.team).background }}>
                              {group.half}
                            </span>
                            <strong>{group.team}</strong>
                            <small>{group.half === "초" ? "원정팀 공격" : "홈팀 공격"}</small>
                          </header>
                          <div className="atBatRows">
                            {group.rows.map((atBat, index) => (
                              <div key={`${group.half}-${selectedInning}-${atBat.order}-${index}`}>
                                <b>{atBat.order || "-"}</b>
                                <strong>{atBat.batter}</strong>
                                <span>{atBat.result}</span>
                                <em>{atBat.pitches}구</em>
                                <i>{atBat.rbi ? `${atBat.rbi}타점` : "-"}</i>
                              </div>
                            ))}
                          </div>
                        </section>
                      ))}
                    </div>
                  </section>
                </>
              )}
            </div>
          )}
        </section>
      )}
      <footer>
        <span>BASELAB</span>
        <p>1982–2025 KBO 역사 기록 + 2026 KBO 실시간 기록</p>
      </footer>
    </main>
  );
}
