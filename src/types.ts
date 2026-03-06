export type Station = {
  id: number;
  number: number;
};

export type Stream = {
  id: number;
  streamName: string;
  streamSource: string;
};

export type Game = {
  entrant1Score: number | null;
  entrant2Score: number | null;
  stageId: number | null;
  winnerId: number;
};

export type Participant = {
  id: number;
  connectCode: string;
  discordId: string;
  discordUsername: string;
  gamerTag: string;
  prefix: string;
  pronouns: string;
  userSlug: string;
};

export type Set = {
  id: number;
  setId: number | string;
  ordinal: number;
  fullRoundText: string;
  shortRoundText: string;
  identifier: string;
  bestOf: number;
  round: number;
  state: number;
  entrant1Id: number | null;
  entrant1Name: string | null;
  entrant1Participants: Participant[];
  entrant1PrereqStr: string | null;
  entrant1Score: number | null;
  entrant2Id: number | null;
  entrant2Name: string | null;
  entrant2Participants: Participant[];
  entrant2PrereqStr: string | null;
  entrant2Score: number | null;
  games: Game[];
  winnerId: number | null;
  updatedAt: number;
  startedAt: number | null;
  completedAt: number | null;
  station: Station | null;
  stream: Stream | null;
};

export type Seed = {
  id: number;
  poolId: number;
  seedNum: number;
  groupSeedNum: number;
  placeholder: string | null;
  entrant: {
    id: number;
    participants: Participant[];
  } | null;
};

export type Standing = {
  standingNum: number;
  entrant: {
    id: number;
    participants: Participant[];
  };
  setWins: number;
  setLosses: number;
  gamesWon: number;
  gamesLost: number;
  gameRatio: number;
  h2hPoints: number | null;
};

export type TiebreakMethod = "wins" | "head_to_head" | "game_ratio";

export type Pool = {
  id: number;
  name: string;
  bracketType: number;
  waveId: number | null;
  winnersTargetPhaseId: number | null;
  tiebreakMethod1: TiebreakMethod | null;
  tiebreakMethod2: TiebreakMethod | null;
  tiebreakMethod3: TiebreakMethod | null;
  standings: Standing[];
  sets: Set[];
};

export type Phase = {
  id: number;
  name: string;
  pools: Pool[];
  phaseOrder: number;
  seeds: Seed[];
};

export type Event = {
  id: number;
  name: string;
  slug: string;
  isOnline: boolean;
  videogameId: number;
  phases: Phase[];
};

export type Tournament = {
  id: number;
  name: string;
  slug: string;
  location: string;
  events: Event[];
  participants: Participant[];
  stations: Station[];
  streams: Stream[];
};

export type Status = "closed" | "error" | "open";
