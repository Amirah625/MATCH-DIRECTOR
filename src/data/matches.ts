export type TeamSide = 'home' | 'away';
export type EventType = 'Pass' | 'Shot' | 'Shot on target' | 'Goal' | 'Tackle' | 'Interception' | 'Possession recovery' | 'Corner' | 'Foul' | 'Yellow card' | 'Substitution';
export type EventOutcome = 'completed' | 'saved' | 'blocked' | 'wide' | 'scored' | 'won' | 'committed' | 'received' | 'on' | 'off';

export type SyntheticTeam = {
  id: string;
  name: string;
  shortName: string;
  side: TeamSide;
};

export type SyntheticPlayer = {
  id: string;
  name: string;
  teamId: string;
};

export type MatchEvent = {
  id: string;
  minute: number;
  second?: number;
  type: EventType;
  team: TeamSide;
  teamId: string;
  playerId?: string;
  outcome?: EventOutcome;
  description: string;
  details?: string;
};

export type MatchInsight = {
  id: string;
  title: string;
  icon: 'trend' | 'shield' | 'spark';
  period: string;
  team?: TeamSide;
  summary: string;
  evidence: string;
  detail: string;
  eventIds: string[];
};

export type Match = {
  id: string;
  competition: string;
  home: string;
  away: string;
  homeShort: string;
  awayShort: string;
  teams: [SyntheticTeam, SyntheticTeam];
  players: SyntheticPlayer[];
  score: [number, number];
  syntheticStats: {
    possession: [number, number];
    totalShots: [number, number];
    shotsOnTarget: [number, number];
    completedPasses: [number, number];
    corners: [number, number];
    fouls: [number, number];
  };
  events: MatchEvent[];
};

export const matches: Match[] = [
  {
    id: 'lakeside-eastvale',
    competition: 'Premier League · Matchday 8',
    home: 'Lakeside FC',
    away: 'Eastvale United',
    homeShort: 'LFC',
    awayShort: 'EUV',
    teams: [
      { id: 'lakeside-fc', name: 'Lakeside FC', shortName: 'LFC', side: 'home' },
      { id: 'eastvale-united', name: 'Eastvale United', shortName: 'EUV', side: 'away' },
    ],
    players: [
      { id: 'lfc-mara', name: 'Mara', teamId: 'lakeside-fc' },
      { id: 'lfc-vega', name: 'Vega', teamId: 'lakeside-fc' },
      { id: 'lfc-owen', name: 'Owen', teamId: 'lakeside-fc' },
      { id: 'lfc-ibrahim', name: 'Ibrahim', teamId: 'lakeside-fc' },
      { id: 'euv-okafor', name: 'Okafor', teamId: 'eastvale-united' },
      { id: 'euv-chen', name: 'Chen', teamId: 'eastvale-united' },
      { id: 'euv-diaz', name: 'Diaz', teamId: 'eastvale-united' },
      { id: 'euv-sule', name: 'Sule', teamId: 'eastvale-united' },
    ],
    score: [2, 1],
    syntheticStats: {
      possession: [62, 38],
      totalShots: [14, 8],
      shotsOnTarget: [6, 3],
      completedPasses: [512, 343],
      corners: [6, 4],
      fouls: [10, 13],
    },
    events: [
      { id: 'le-12-01', minute: 12, second: 10, type: 'Pass', team: 'home', teamId: 'lakeside-fc', playerId: 'lfc-owen', outcome: 'completed', description: 'Owen finds Mara between the lines' },
      { id: 'le-14-22', minute: 14, second: 22, type: 'Shot', team: 'home', teamId: 'lakeside-fc', playerId: 'lfc-mara', outcome: 'wide', description: 'Mara drags a low drive wide' },
      { id: 'le-18-04', minute: 18, second: 4, type: 'Shot on target', team: 'home', teamId: 'lakeside-fc', playerId: 'lfc-vega', outcome: 'saved', description: 'Vega tests the keeper from distance' },
      { id: 'le-23-18', minute: 23, second: 18, type: 'Yellow card', team: 'away', teamId: 'eastvale-united', playerId: 'euv-okafor', outcome: 'received', description: 'Okafor booked for a late midfield challenge' },
      { id: 'le-29-40', minute: 29, second: 40, type: 'Corner', team: 'home', teamId: 'lakeside-fc', playerId: 'lfc-owen', outcome: 'completed', description: 'Lakeside win a corner on the right' },
      { id: 'le-34-11', minute: 34, second: 11, type: 'Goal', team: 'home', teamId: 'lakeside-fc', playerId: 'lfc-mara', outcome: 'scored', description: 'Mara finishes a cutback', details: 'Lakeside lead after a low cross from the right.' },
      { id: 'le-40-07', minute: 40, second: 7, type: 'Interception', team: 'away', teamId: 'eastvale-united', playerId: 'euv-diaz', outcome: 'won', description: 'Diaz cuts out a central pass' },
      { id: 'le-44-55', minute: 44, second: 55, type: 'Foul', team: 'home', teamId: 'lakeside-fc', playerId: 'lfc-owen', outcome: 'committed', description: 'Owen concedes a foul near halfway' },
      { id: 'le-55-16', minute: 55, second: 16, type: 'Shot', team: 'away', teamId: 'eastvale-united', playerId: 'euv-sule', outcome: 'blocked', description: 'Sule’s effort is blocked in traffic' },
      { id: 'le-57-02', minute: 57, second: 2, type: 'Substitution', team: 'away', teamId: 'eastvale-united', playerId: 'euv-chen', outcome: 'completed', description: 'Chen replaces Okafor', details: 'Eastvale add a fresh runner to the right side.' },
      { id: 'le-62-41', minute: 62, second: 41, type: 'Shot on target', team: 'away', teamId: 'eastvale-united', playerId: 'euv-sule', outcome: 'saved', description: 'Sule forces a close-range save' },
      { id: 'le-68-09', minute: 68, second: 9, type: 'Goal', team: 'away', teamId: 'eastvale-united', playerId: 'euv-sule', outcome: 'scored', description: 'Eastvale level from a counter', details: 'Sule finishes the transition after a quick recovery in midfield.' },
      { id: 'le-72-26', minute: 72, second: 26, type: 'Tackle', team: 'home', teamId: 'lakeside-fc', playerId: 'lfc-ibrahim', outcome: 'won', description: 'Ibrahim wins the ball in the attacking half' },
      { id: 'le-78-33', minute: 78, second: 33, type: 'Shot on target', team: 'home', teamId: 'lakeside-fc', playerId: 'lfc-vega', outcome: 'saved', description: 'Vega’s header is tipped over the bar' },
      { id: 'le-80-05', minute: 80, second: 5, type: 'Corner', team: 'home', teamId: 'lakeside-fc', playerId: 'lfc-owen', outcome: 'completed', description: 'Lakeside keep the pressure with a corner' },
      { id: 'le-84-48', minute: 84, second: 48, type: 'Goal', team: 'home', teamId: 'lakeside-fc', playerId: 'lfc-vega', outcome: 'scored', description: 'Vega seals the result', details: 'The winner arrives after Lakeside recover possession high up the pitch.' },
      { id: 'le-88-12', minute: 88, second: 12, type: 'Yellow card', team: 'home', teamId: 'lakeside-fc', playerId: 'lfc-ibrahim', outcome: 'received', description: 'Ibrahim booked for delaying a restart' },
    ],
  },
  {
    id: 'pinecrest-harbor',
    competition: 'Premier League · Matchday 8',
    home: 'Pinecrest Athletic',
    away: 'Harbor City',
    homeShort: 'PAT',
    awayShort: 'HCT',
    teams: [
      { id: 'pinecrest-athletic', name: 'Pinecrest Athletic', shortName: 'PAT', side: 'home' },
      { id: 'harbor-city', name: 'Harbor City', shortName: 'HCT', side: 'away' },
    ],
    players: [
      { id: 'pat-santos', name: 'Santos', teamId: 'pinecrest-athletic' },
      { id: 'pat-ibrahim', name: 'Ibrahim', teamId: 'pinecrest-athletic' },
      { id: 'pat-lee', name: 'Lee', teamId: 'pinecrest-athletic' },
      { id: 'hct-morgan', name: 'Morgan', teamId: 'harbor-city' },
      { id: 'hct-vale', name: 'Vale', teamId: 'harbor-city' },
      { id: 'hct-rocha', name: 'Rocha', teamId: 'harbor-city' },
    ],
    score: [3, 0],
    syntheticStats: {
      possession: [54, 46],
      totalShots: [16, 9],
      shotsOnTarget: [8, 2],
      completedPasses: [438, 401],
      corners: [7, 2],
      fouls: [8, 11],
    },
    events: [
      { id: 'ph-09-13', minute: 9, second: 13, type: 'Shot on target', team: 'away', teamId: 'harbor-city', playerId: 'hct-morgan', outcome: 'saved', description: 'Morgan’s first-time effort is held' },
      { id: 'ph-15-32', minute: 15, second: 32, type: 'Pass', team: 'home', teamId: 'pinecrest-athletic', playerId: 'pat-lee', outcome: 'completed', description: 'Lee switches play into the left channel' },
      { id: 'ph-18-08', minute: 18, second: 8, type: 'Shot', team: 'away', teamId: 'harbor-city', playerId: 'hct-rocha', outcome: 'wide', description: 'Rocha sends a curling shot wide' },
      { id: 'ph-22-45', minute: 22, second: 45, type: 'Shot', team: 'home', teamId: 'pinecrest-athletic', playerId: 'pat-santos', outcome: 'blocked', description: 'Santos is denied by a packed defence' },
      { id: 'ph-31-06', minute: 31, second: 6, type: 'Yellow card', team: 'home', teamId: 'pinecrest-athletic', playerId: 'pat-lee', outcome: 'received', description: 'Lee stops a counter with a tactical foul' },
      { id: 'ph-38-28', minute: 38, second: 28, type: 'Corner', team: 'away', teamId: 'harbor-city', playerId: 'hct-vale', outcome: 'completed', description: 'Harbor win their second corner' },
      { id: 'ph-45-02', minute: 45, second: 2, type: 'Tackle', team: 'home', teamId: 'pinecrest-athletic', playerId: 'pat-ibrahim', outcome: 'won', description: 'Ibrahim wins a duel before the break' },
      { id: 'ph-51-20', minute: 51, second: 20, type: 'Goal', team: 'home', teamId: 'pinecrest-athletic', playerId: 'pat-santos', outcome: 'scored', description: 'Santos scores from the edge', details: 'Pinecrest convert the second phase of a corner.' },
      { id: 'ph-58-14', minute: 58, second: 14, type: 'Shot on target', team: 'home', teamId: 'pinecrest-athletic', playerId: 'pat-santos', outcome: 'saved', description: 'Santos tests the near post' },
      { id: 'ph-63-10', minute: 63, second: 10, type: 'Substitution', team: 'home', teamId: 'pinecrest-athletic', playerId: 'pat-ibrahim', outcome: 'completed', description: 'Ibrahim replaces Santos', details: 'Pinecrest refresh the front line with a direct runner.' },
      { id: 'ph-67-52', minute: 67, second: 52, type: 'Interception', team: 'away', teamId: 'harbor-city', playerId: 'hct-vale', outcome: 'won', description: 'Vale intercepts a pass at the top of the box' },
      { id: 'ph-72-05', minute: 72, second: 5, type: 'Goal', team: 'home', teamId: 'pinecrest-athletic', playerId: 'pat-ibrahim', outcome: 'scored', description: 'Quick finish at the near post', details: 'Ibrahim meets a low cross after a recovery in the final third.' },
      { id: 'ph-76-31', minute: 76, second: 31, type: 'Shot on target', team: 'home', teamId: 'pinecrest-athletic', playerId: 'pat-lee', outcome: 'saved', description: 'Lee’s free kick is pushed away' },
      { id: 'ph-82-18', minute: 82, second: 18, type: 'Foul', team: 'away', teamId: 'harbor-city', playerId: 'hct-rocha', outcome: 'committed', description: 'Rocha concedes a foul under pressure' },
      { id: 'ph-88-44', minute: 88, second: 44, type: 'Goal', team: 'home', teamId: 'pinecrest-athletic', playerId: 'pat-ibrahim', outcome: 'scored', description: 'Late counter completes the win', details: 'Pinecrest finish a three-event transition with a third goal.' },
    ],
  },
];
