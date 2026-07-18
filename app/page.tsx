"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Player = {
  rank: number;
  name: string;
  team: string;
  position: "타자" | "투수";
  stats: Record<string, number | null>;
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
type AtBatPitch = {
  number: number;
  call: string;
  pitch_type: string | null;
  speed: number | null;
  x: number | null;
  y: number | null;
  count?: string;
  kind?: "ball" | "strike" | "inplay";
};
type RelayPlayer = { name: string; pcode: string; back_number: string; throws_bats: string };
type RelayAtBat = {
  bat_order: number;
  name: string;
  pcode: string;
  result: string;
  pitches: AtBatPitch[];
  pitcher?: RelayPlayer | null;
  batter_profile?: RelayPlayer | null;
};
type GameRelay = {
  inning: number;
  away_lineup: LineupBatter[];
  home_lineup: LineupBatter[];
  inning_batters: { away: LineupBatter[]; home: LineupBatter[] };
  at_bats?: { away: RelayAtBat[]; home: RelayAtBat[] };
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
  team_avg?: number;
  team_hits?: number;
  team_hr?: number;
  team_runs?: number;
  team_rbi?: number;
  team_ops?: number;
  team_sb?: number;
  team_era?: number;
  team_whip?: number;
  team_so?: number;
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
type PlayerSeason = Record<string, string | number | null> & {
  year: number;
  team_name: string;
};
type RecentGame = Record<string, string | number | null> & {
  game_date: string;
  opponent: string;
};
type PlayerProfileData = {
  found: boolean;
  profile?: {
    kbo_id: string;
    name: string;
    name_en: string;
    team: string;
    back_number: string;
    birth_date: string;
    position: string;
    primary_pos: string;
    throws: string;
    bats: string;
    height: number;
    weight: number;
    career_history: string;
    draft_info: string;
    debut_year: number;
    image_url: string | null;
  };
  seasons?: PlayerSeason[];
  career?: Record<string, string | number | null>;
  recent_games?: RecentGame[];
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

const API = process.env.NEXT_PUBLIC_API_URL
  ?? (process.env.NODE_ENV === "production"
    ? "https://baselab-backend.onrender.com"
    : "http://localhost:8001");
const seasons = Array.from({ length: 2026 - 1982 + 1 }, (_, i) => 2026 - i);
const today = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());
const compactDate = (date: string) => date.replaceAll("-", "");

function visualPitchPosition(
  pitch: { x?: number | null; y?: number | null; kind?: string; call?: string },
) {
  let x = pitch.x ?? 50;
  let y = pitch.y ?? 50;
  const isBall = pitch.kind === "ball" || pitch.call?.includes("볼");

  if (isBall && x >= 0 && x <= 100 && y >= 0 && y <= 100) {
    const nearestEdge = Math.min(x, 100 - x, y, 100 - y);
    if (nearestEdge === x) x = -16;
    else if (nearestEdge === 100 - x) x = 116;
    else if (nearestEdge === y) y = -16;
    else y = 116;
  }

  return { x, y };
}
const formatStat = (key: string, value: number | null | undefined) => {
  if (value == null) return "-";
  return ["AVG", "OBP", "SLG", "OPS", "WPCT", "ISO", "BABIP", "wOBA", "WPA"].includes(key)
    ? value.toFixed(3).replace(/^0/, "")
    : ["ERA", "WHIP"].includes(key)
      ? value.toFixed(2)
      : ["wRC+", "WAR"].includes(key)
        ? value.toFixed(1)
        : String(value);
};
const statLabels: Record<string, string> = {
  G: "경기", PA: "타석", AB: "타수", AVG: "타율", H: "안타", "2B": "2루타", "3B": "3루타",
  HR: "홈런", RBI: "타점", SB: "도루", CS: "도루실패", BB: "볼넷", HBP: "사구", SO: "삼진",
  GDP: "병살타", E: "실책", OBP: "출루율", SLG: "장타율", W: "승", L: "패", SV: "세이브",
  HLD: "홀드", WPCT: "승률", IP: "이닝", R: "실점", ER: "자책", ERA: "평균자책", WHIP: "WHIP",
  OPS: "OPS", ISO: "ISO", BABIP: "BABIP", wOBA: "wOBA", "wRC+": "wRC+", WPA: "WPA", WAR: "WAR",
};
const hitterRankingFields = ["G", "PA", "AB", "AVG", "H", "2B", "3B", "HR", "RBI", "SB", "CS", "BB", "HBP", "SO", "GDP", "E", "OBP", "SLG", "OPS", "ISO", "BABIP", "wOBA", "wRC+", "WPA", "WAR"];
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
  const [expandedAtBat, setExpandedAtBat] = useState("");
  const [focusedAtBat, setFocusedAtBat] = useState<RelayAtBat | null>(null);
  const [pitchLocationAtBat, setPitchLocationAtBat] = useState<RelayAtBat | null>(null);
  const [rankingKind, setRankingKind] = useState<"players" | "teams">(
    "players",
  );
  const [standings, setStandings] = useState<Standing[]>([]);
  const [matchup, setMatchup] = useState<Matchup | null>(null);
  const [gameHitters, setGameHitters] = useState<Player[]>([]);
  const [gameRelay, setGameRelay] = useState<GameRelay | null>(null);
  const [gameUpdatedAt, setGameUpdatedAt] = useState("");
  const [playerProfile, setPlayerProfile] = useState<PlayerProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [appTab, setAppTab] = useState<"analysis" | "ranking" | "games">(
    "ranking",
  );
  const playerRequest = useRef(0);
  const playerAbort = useRef<AbortController | null>(null);
  const tableDrag = useRef({ startX: 0, startScrollLeft: 0, moved: false, suppressClick: false });
  useEffect(() => {
    if (!pitchLocationAtBat) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPitchLocationAtBat(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [pitchLocationAtBat]);
  function startTableDrag(event: React.PointerEvent<HTMLElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    tableDrag.current = {
      startX: event.clientX,
      startScrollLeft: event.currentTarget.scrollLeft,
      moved: false,
      suppressClick: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.classList.add("dragging");
  }
  function moveTableDrag(event: React.PointerEvent<HTMLElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const distance = event.clientX - tableDrag.current.startX;
    if (Math.abs(distance) > 5) tableDrag.current.moved = true;
    if (tableDrag.current.moved) {
      event.preventDefault();
      event.currentTarget.scrollLeft = tableDrag.current.startScrollLeft - distance;
    }
  }
  function endTableDrag(event: React.PointerEvent<HTMLElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    event.currentTarget.classList.remove("dragging");
    tableDrag.current.suppressClick = tableDrag.current.moved;
    tableDrag.current.moved = false;
    window.setTimeout(() => { tableDrag.current.suppressClick = false; }, 250);
  }
  function blockDraggedClick(event: React.MouseEvent<HTMLElement>) {
    if (!tableDrag.current.suppressClick) return;
    event.preventDefault();
    event.stopPropagation();
    tableDrag.current.suppressClick = false;
  }
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
  const requestedInning = selectedInning || selectedGame?.inning || 9;
  const situation = inningSituations[
    Math.min(Math.max(requestedInning, 1), inningSituations.length) - 1
  ];
  const lastAvailableInning = Math.min(12, Math.max(9, selectedGame?.inning || 9));
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
    const relayAtBats = gameRelay?.at_bats?.[side] ?? [];
    if (relayAtBats.length) {
      return relayAtBats.map((atBat) => ({
        order: atBat.bat_order,
        batter: `${atBat.bat_order}번 · ${atBat.name}`,
        result: atBat.result,
        pitches: atBat.pitches.length,
        pitchDetails: atBat.pitches,
        relayAtBat: atBat,
        rbi: 0,
        official: true,
      }));
    }
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
      pitchDetails: [] as AtBatPitch[],
      relayAtBat: null as RelayAtBat | null,
      rbi: (inning + index) % 5 === 0 ? 1 : 0,
      official: false,
    }));
  };
  const awayInningAtBats = selectedGame
    ? buildInningAtBats(selectedGame.away, "초")
    : [];
  const homeInningAtBats = selectedGame
    ? buildInningAtBats(selectedGame.home, "말")
    : [];
  const latestRelayAtBat = focusedAtBat
    ?? gameRelay?.at_bats?.home?.at(-1)
    ?? gameRelay?.at_bats?.away?.at(-1)
    ?? null;
  const shownPitcher = latestRelayAtBat?.pitcher;
  const shownBatter = latestRelayAtBat?.batter_profile;
  const handedness = (value: string | undefined, role: "투" | "타") => {
    if (!value) return "";
    if (role === "투") return value.includes("좌투") ? "좌투" : value.includes("우투") ? "우투" : "";
    return value.includes("좌타") ? "좌타" : value.includes("우타") ? "우타" : value.includes("양타") ? "양타" : "";
  };
  const shownPlottedPitches = latestRelayAtBat?.pitches.some((pitch) => pitch.x != null && pitch.y != null)
    ? latestRelayAtBat.pitches.filter((pitch) => pitch.x != null && pitch.y != null).map((pitch) => ({
        ...pitch,
        ...visualPitchPosition(pitch),
        kind: pitch.kind === "ball" ? "ball" : pitch.kind === "inplay" ? "out" : "strike",
      }))
    : plottedPitches;

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
      const routePlayer = typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("player")
        : null;
      const routeTeam = typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("team")
        : null;
      setSelected(
        ordered.find((player) => player.name === routePlayer && (!routeTeam || player.team === routeTeam)) ?? ordered[0],
      );
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
      const routeGameId = typeof window !== "undefined" && window.location.pathname.startsWith("/games/")
        ? decodeURIComponent(window.location.pathname.split("/")[2] ?? "")
        : "";
      setSelectedGame((current) => {
        const targetId = routeGameId || current?.game_id;
        return targetId ? (nextGames.find((game) => game.game_id === targetId) ?? null) : null;
      });
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
    window.history.pushState(null, "", "/ranking");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function navigateTab(tab: "analysis" | "ranking" | "games", player?: Player) {
    setAppTab(tab);
    if (tab === "games") {
      setSelectedGame(null);
      setSelectedInning(0);
      setGameDate(today);
    }
    const path = tab === "analysis"
      ? `/analysis${player ? `?player=${encodeURIComponent(player.name)}&team=${encodeURIComponent(player.team)}` : ""}`
      : tab === "games" ? "/games" : "/ranking";
    window.history.pushState(null, "", path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function openGame(game: Game) {
    setSelectedGame(game);
    setSelectedInning(0);
    window.history.pushState(null, "", `/games/${encodeURIComponent(game.game_id)}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function closeGame() {
    setSelectedGame(null);
    setSelectedInning(0);
    window.history.pushState(null, "", "/games");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  useEffect(() => {
    const syncRoute = () => {
      const path = window.location.pathname;
      setAppTab(path.startsWith("/games") ? "games" : path.startsWith("/analysis") ? "analysis" : "ranking");
      if (path.startsWith("/games/")) {
        const gameId = decodeURIComponent(path.split("/")[2] ?? "");
        const compactGameDate = gameId.slice(0, 8);
        if (/^\d{8}$/.test(compactGameDate)) {
          setGameDate(`${compactGameDate.slice(0, 4)}-${compactGameDate.slice(4, 6)}-${compactGameDate.slice(6, 8)}`);
        }
      } else if (path === "/games" || path === "/games/") {
        setSelectedGame(null);
      }
    };
    syncRoute();
    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
  }, []);
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
    setFocusedAtBat(null);
    setExpandedAtBat("");
  }, [selectedGame?.game_id, selectedInning]);
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
    if (appTab !== "analysis" || !selected.name) return;
    const controller = new AbortController();
    setProfileLoading(true);
    fetch(
      `${API}/api/player-profile?name=${encodeURIComponent(selected.name)}&team=${encodeURIComponent(selected.team)}&position=${selected.position === "투수" ? "pitcher" : "hitter"}`,
      { signal: controller.signal },
    )
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data) => setPlayerProfile(data))
      .catch(() => {
        if (!controller.signal.aborted) setPlayerProfile(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setProfileLoading(false);
      });
    return () => controller.abort();
  }, [appTab, selected.name, selected.position, selected.team]);
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
            onClick={() => navigateTab("ranking")}
          >
            랭킹
          </button>
          <button
            className={appTab === "analysis" ? "active" : ""}
            onClick={() => navigateTab("analysis", selected)}
          >
            선수 분석
          </button>
          <button
            className={appTab === "games" ? "active" : ""}
            onClick={() => navigateTab("games")}
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
            <div
              className="rankingTable detailed fullStats dragScrollTable"
              onPointerDown={startTableDrag}
              onPointerMove={moveTableDrag}
              onPointerUp={endTableDrag}
              onPointerCancel={endTableDrag}
              onClickCapture={blockDraggedClick}
            >
              <div className="rankingTableHead" style={{ gridTemplateColumns: rankingColumns }}>
                <span>선수</span>
                <span>팀</span>
                {rankingFields.map((field) => <span key={field}>{statLabels[field] ?? field}</span>)}
                <span>분석</span>
              </div>
              {filtered.map((p) => (
                <button
                  key={`${p.name}-${p.team}`}
                  style={{ gridTemplateColumns: rankingColumns }}
                  onClick={() => {
                    setSelected(p);
                    navigateTab("analysis", p);
                  }}
                >
                  <strong>{p.name}</strong>
                  <span>{p.team}</span>
                  {rankingFields.map((field, index) =>
                    index === (position === "타자" ? 3 : 1) ? (
                      <b key={field}>{formatStat(field, p.stats[field])}</b>
                    ) : (
                      <span key={field}>{formatStat(field, p.stats[field])}</span>
                    ),
                  )}
                  <em>상세 보기 →</em>
                </button>
              ))}
            </div>
          ) : (
            <div
              className="teamStandings dragScrollTable"
              onPointerDown={startTableDrag}
              onPointerMove={moveTableDrag}
              onPointerUp={endTableDrag}
              onPointerCancel={endTableDrag}
              onClickCapture={blockDraggedClick}
            >
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
                <span>팀 타율</span>
                <span>안타</span>
                <span>홈런</span>
                <span>득점</span>
                <span>타점</span>
                <span>도루</span>
                <span>팀 OPS</span>
                <span>평균자책</span>
                <span>WHIP</span>
                <span>탈삼진</span>
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
                  <span>{row.team_avg ? row.team_avg.toFixed(3).replace(/^0/, "") : "-"}</span>
                  <span>{row.team_hits ?? "-"}</span>
                  <span>{row.team_hr ?? "-"}</span>
                  <span>{row.team_runs ?? "-"}</span>
                  <span>{row.team_rbi ?? "-"}</span>
                  <span>{row.team_sb ?? "-"}</span>
                  <span>{row.team_ops ? row.team_ops.toFixed(3).replace(/^0/, "") : "-"}</span>
                  <span>{row.team_era ? row.team_era.toFixed(2) : "-"}</span>
                  <span>{row.team_whip ? row.team_whip.toFixed(2) : "-"}</span>
                  <span>{row.team_so ?? "-"}</span>
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
            <button className="backLink" onClick={() => navigateTab("ranking")}>
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
              {playerProfile?.profile?.image_url && (
                <img
                  className="playerPortrait"
                  src={playerProfile.profile.image_url}
                  alt={`${selected.name} 선수 사진`}
                />
              )}
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
              {selected.position === "타자" && (
                <div className="wrcStat">
                  <span>wRC+</span>
                  <strong>{playerProfile?.seasons?.[0]?.wrc_plus ?? "-"}</strong>
                  <small>리그 평균 100</small>
                </div>
              )}
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
            <section className="playerBioSection">
              <div className="sectionTitle">
                <h3>선수 프로필</h3>
                <span>{profileLoading ? "상세 기록 불러오는 중" : "프로 데뷔부터 현재까지"}</span>
              </div>
              {playerProfile?.profile ? (
                <div className="playerBioGrid">
                  <div><span>등번호</span><b>{playerProfile.profile.back_number || "-"}</b></div>
                  <div><span>생년월일</span><b>{playerProfile.profile.birth_date?.slice(0, 10) || "-"}</b></div>
                  <div><span>포지션</span><b>{playerProfile.profile.primary_pos || playerProfile.profile.position}</b></div>
                  <div><span>투타</span><b>{playerProfile.profile.throws}투 {playerProfile.profile.bats}타</b></div>
                  <div><span>신체</span><b>{playerProfile.profile.height}cm · {playerProfile.profile.weight}kg</b></div>
                  <div><span>프로 입단</span><b>{playerProfile.profile.draft_info || `${playerProfile.profile.debut_year}년`}</b></div>
                  <div className="wide"><span>선수 경력</span><b>{playerProfile.profile.career_history || "-"}</b></div>
                </div>
              ) : !profileLoading && <p className="profileEmpty">선수 프로필을 찾지 못했습니다.</p>}
            </section>
            <section className="careerSection">
              <div className="sectionTitle">
                <h3>연도별 정규시즌 기록</h3>
                <span>{playerProfile?.career?.first_year ?? "-"}–{playerProfile?.career?.last_year ?? "현재"}</span>
              </div>
              <div className="careerTableWrap">
                {selected.position === "타자" ? (
                  <table className="careerTable">
                    <thead><tr><th>연도</th><th>팀</th><th>경기</th><th>타석</th><th>타율</th><th>출루율</th><th>장타율</th><th>OPS</th><th>홈런</th><th>타점</th><th>도루</th><th>wRC+</th><th>WAR</th></tr></thead>
                    <tbody>{playerProfile?.seasons?.map((row) => (
                      <tr key={`${row.year}-${row.team_name}`}><td>{row.year}</td><td>{row.team_name}</td><td>{row.games}</td><td>{row.pa}</td><td>{row.avg}</td><td>{row.obp}</td><td>{row.slg}</td><td>{row.ops}</td><td>{row.hr}</td><td>{row.rbi}</td><td>{row.sb}</td><td className="highlight">{row.wrc_plus ?? "-"}</td><td>{row.war ?? "-"}</td></tr>
                    ))}{playerProfile?.career && (
                      <tr className="careerTotal"><td>통산</td><td>{playerProfile.career.seasons}시즌</td><td>{playerProfile.career.games ?? "-"}</td><td>{playerProfile.career.pa ?? "-"}</td><td>{playerProfile.career.avg ?? "-"}</td><td>{playerProfile.career.obp ?? "-"}</td><td>{playerProfile.career.slg ?? "-"}</td><td>{playerProfile.career.ops ?? "-"}</td><td>{playerProfile.career.hr ?? "-"}</td><td>{playerProfile.career.rbi ?? "-"}</td><td>{playerProfile.career.sb ?? "-"}</td><td className="highlight">{playerProfile.career.wrc_plus ?? "-"}</td><td>{playerProfile.career.war ?? "-"}</td></tr>
                    )}</tbody>
                  </table>
                ) : (
                  <table className="careerTable">
                    <thead><tr><th>연도</th><th>팀</th><th>경기</th><th>이닝</th><th>ERA</th><th>승</th><th>패</th><th>세이브</th><th>홀드</th><th>삼진</th><th>WHIP</th><th>WAR</th></tr></thead>
                    <tbody>{playerProfile?.seasons?.map((row) => (
                      <tr key={`${row.year}-${row.team_name}`}><td>{row.year}</td><td>{row.team_name}</td><td>{row.games}</td><td>{row.ip}</td><td>{row.era}</td><td>{row.wins}</td><td>{row.losses}</td><td>{row.saves}</td><td>{row.holds}</td><td>{row.so}</td><td>{row.whip}</td><td>{row.war ?? "-"}</td></tr>
                    ))}{playerProfile?.career && (
                      <tr className="careerTotal"><td>통산</td><td>{playerProfile.career.seasons}시즌</td><td>{playerProfile.career.games ?? "-"}</td><td>{playerProfile.career.innings ?? "-"}</td><td>{playerProfile.career.era ?? "-"}</td><td>{playerProfile.career.wins ?? "-"}</td><td>{playerProfile.career.losses ?? "-"}</td><td>{playerProfile.career.saves ?? "-"}</td><td>{playerProfile.career.holds ?? "-"}</td><td>{playerProfile.career.so ?? "-"}</td><td>{playerProfile.career.whip ?? "-"}</td><td>{playerProfile.career.war ?? "-"}</td></tr>
                    )}</tbody>
                  </table>
                )}
              </div>
            </section>
            <section className="recentGamesSection">
              <div className="sectionTitle"><h3>최근 5경기</h3><span>KBO 정규시즌</span></div>
              <div className="recentGamesGrid">
                {playerProfile?.recent_games?.map((game) => (
                  <article key={`${game.game_date}-${game.opponent}`}>
                    <time>{game.game_date.slice(0, 10)}</time><strong>vs {game.opponent}</strong>
                    {selected.position === "타자" ? (
                      <p><b>{game.h_hits}안타</b> / {game.h_ab}타수 · {game.h_hr}홈런 · {game.h_rbi}타점 · {game.h_so}삼진</p>
                    ) : (
                      <p><b>{game.p_ip}이닝</b> · {game.p_hits}피안타 · {game.p_so}삼진 · {game.p_er}자책</p>
                    )}
                  </article>
                ))}
              </div>
            </section>
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
                      onClick={() => openGame(g)}
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
                onClick={closeGame}
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
                    {Array.from({ length: lastAvailableInning }, (_, index) => index + 1).map((i) => (
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
                      {latestRelayAtBat
                        ? `${selectedInning || selectedGame.inning || 9}회 · ${focusedAtBat ? "선택한 타석" : "가장 최근 타석"}`
                        : viewingLive
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
                      {latestRelayAtBat
                        ? <>{shownPitcher?.name || "투수 정보 없음"} <em>{handedness(shownPitcher?.throws_bats, "투")}</em></>
                        : viewingLive
                        ? livePitcher || "확인 중"
                        : situation.half === "초"
                          ? selectedGame.home_starter
                          : selectedGame.away_starter}
                    </span>
                    <strong>
                      {latestRelayAtBat?.pitches.length
                        ? `${latestRelayAtBat.pitches.at(-1)?.number}구 · ${latestRelayAtBat.pitches.at(-1)?.pitch_type || latestRelayAtBat.pitches.at(-1)?.call} · ${latestRelayAtBat.pitches.at(-1)?.speed || "-"} km/h`
                        : viewingLive
                        ? `LIVE · ${selectedGame.inning}회${selectedGame.inning_half}`
                        : `${situation.pitchNo}구 · ${situation.pitchType} · ${situation.speed} km/h`}
                    </strong>
                    <span>
                      <b>타자</b>
                      {latestRelayAtBat
                        ? <>{shownBatter?.name || latestRelayAtBat.name} <em>{handedness(shownBatter?.throws_bats, "타")}</em> · {latestRelayAtBat.bat_order}번</>
                        : viewingLive
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
                        {shownPlottedPitches.map((pitch, i) => (
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
                        {latestRelayAtBat?.pitches.length ? (
                          <>
                            <b>{latestRelayAtBat.pitches.at(-1)?.number}구 · {latestRelayAtBat.pitches.at(-1)?.pitch_type || latestRelayAtBat.pitches.at(-1)?.call}</b>
                            <span>{latestRelayAtBat.pitches.at(-1)?.speed || "-"} km/h · {focusedAtBat ? "선택한 타석 기준" : "이닝의 가장 최근 타석 기준"}</span>
                          </>
                        ) : viewingLive ? (
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
                      {(latestRelayAtBat?.pitches.length || pitchDetails.length > 0) && (
                        <div className="pitchSequence">
                          {(latestRelayAtBat?.pitches ?? pitchDetails.slice(0, viewingLive ? livePitchCount : 5)).map((pitch) => (
                            <div key={pitch.number}>
                              <b>{pitch.number}구</b>
                              <strong>{"pitch_type" in pitch ? pitch.pitch_type || "구종 미제공" : pitch.type}</strong>
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
                        타석을 클릭하면 위 투구 화면의 기준이 변경됩니다
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
                            {group.rows.map((atBat, index) => {
                              const rowKey = `${group.half}-${selectedInning}-${atBat.order}-${index}`;
                              const isExpanded = expandedAtBat === rowKey;
                              return (
                                <div className={`atBatItem ${isExpanded ? "expanded" : ""}`} key={rowKey}>
                                  <button
                                    className="atBatSummary"
                                    type="button"
                                    aria-expanded={isExpanded}
                                    onClick={() => {
                                      setExpandedAtBat(isExpanded ? "" : rowKey);
                                      if (atBat.relayAtBat) setFocusedAtBat(atBat.relayAtBat);
                                    }}
                                  >
                                    <b>{atBat.order || "-"}</b>
                                    <strong>{atBat.batter}</strong>
                                    <span>{atBat.result}</span>
                                    <em>{atBat.pitches}구</em>
                                    <i>{isExpanded ? "접기" : "상세"}</i>
                                  </button>
                                  {isExpanded && (
                                    <div className="atBatDetail">
                                      {atBat.pitchDetails.length ? (
                                        <>
                                          <div className="miniStrikeZone" aria-label="투구 위치 스트라이크존">
                                            <i className="zoneGrid" />
                                            {atBat.pitchDetails.map((pitch) =>
                                              pitch.x != null && pitch.y != null ? (
                                                <span
                                                  key={pitch.number}
                                                  className={`miniPitch ${pitch.call.includes("볼") ? "ball" : "strike"}`}
                                                  style={{
                                                    left: `${visualPitchPosition(pitch).x}%`,
                                                    top: `${visualPitchPosition(pitch).y}%`,
                                                  }}
                                                >
                                                  {pitch.number}
                                                </span>
                                              ) : null,
                                            )}
                                            {!atBat.pitchDetails.some((pitch) => pitch.x != null && pitch.y != null) && (
                                              <small>위치 데이터<br />미제공</small>
                                            )}
                                          </div>
                                          <div className="atBatPitchList">
                                            {atBat.pitchDetails.map((pitch) => (
                                              <div key={pitch.number}>
                                                <b>{pitch.number}구</b>
                                                <strong>{pitch.call}</strong>
                                                <span>{pitch.pitch_type || "구종 미제공"}</span>
                                                <em>{pitch.speed ? `${pitch.speed} km/h` : "구속 미제공"}</em>
                                              </div>
                                            ))}
                                          </div>
                                          {atBat.relayAtBat && atBat.pitchDetails.some((pitch) => pitch.x != null && pitch.y != null) && (
                                            <button
                                              type="button"
                                              className="openPitchLocation"
                                              onClick={() => setPitchLocationAtBat(atBat.relayAtBat)}
                                            >
                                              투구 위치 보기
                                            </button>
                                          )}
                                        </>
                                      ) : (
                                        <p>이 경기에서는 선수별 투구 상세가 제공되지 않았습니다.</p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
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
      {pitchLocationAtBat && (
        <div className="pitchLocationOverlay" role="presentation" onMouseDown={() => setPitchLocationAtBat(null)}>
          <section
            className="pitchLocationModal"
            role="dialog"
            aria-modal="true"
            aria-label="투구 위치 보기"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header>
              <h2>투구 위치 보기</h2>
              <button type="button" aria-label="닫기" onClick={() => setPitchLocationAtBat(null)}>×</button>
            </header>
            <div className="pitchMatchup">
              <div>
                <img src={`https://www.yagoonara.com/players/${pitchLocationAtBat.pitcher?.pcode}.jpg`} alt="" />
                <span><small>투수</small><strong>{pitchLocationAtBat.pitcher?.name || "투수 정보 없음"}</strong><em>{pitchLocationAtBat.pitcher?.throws_bats} NO.{pitchLocationAtBat.pitcher?.back_number}</em></span>
              </div>
              <b>VS</b>
              <div>
                <img src={`https://www.yagoonara.com/players/${pitchLocationAtBat.batter_profile?.pcode || pitchLocationAtBat.pcode}.jpg`} alt="" />
                <span><small>타자</small><strong>{pitchLocationAtBat.batter_profile?.name || pitchLocationAtBat.name}</strong><em>{pitchLocationAtBat.batter_profile?.throws_bats} NO.{pitchLocationAtBat.batter_profile?.back_number}</em></span>
              </div>
            </div>
            <div className="pitchLocationField">
              <img src="/gamecenter-stadium-v2.png" alt="구장 포수 시점" />
              <div className="pitchModalZone"><i /></div>
              {pitchLocationAtBat.pitches.map((pitch) => pitch.x != null && pitch.y != null ? (
                <span
                  key={pitch.number}
                  className={`pitchModalMarker ${pitch.kind || "strike"}`}
                  style={{ left: `${32 + pitch.x * 0.36}%`, top: `${18 + pitch.y * 0.55}%` }}
                >{pitch.number}</span>
              ) : null)}
            </div>
            <p className="pitchResult"><strong>{pitchLocationAtBat.name}</strong> : {pitchLocationAtBat.result}</p>
            <div className="pitchModalList">
              {pitchLocationAtBat.pitches.slice().reverse().map((pitch) => (
                <div key={pitch.number}>
                  <b className={pitch.kind || "strike"}>{pitch.number}</b>
                  <strong>{pitch.call}</strong>
                  <span>{pitch.speed ? `${pitch.speed}km/h` : "-"} {pitch.pitch_type || "구종 미제공"}</span>
                  <em>{pitch.count ? `| ${pitch.count}` : ""}</em>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
      <footer>
        <span>BASELAB</span>
        <p>1982–2025 KBO 역사 기록 + 2026 KBO 실시간 기록</p>
      </footer>
    </main>
  );
}
