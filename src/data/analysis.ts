import type { EventType, Match, MatchEvent, MatchInsight, TeamSide } from './matches';

export type MatchPeriod = 'First half' | 'Second half';
type TeamValues = [number, number];
type NullableTeamValues = [number | null, number | null];

export type MatchAnalysis = {
  goalsByTeam: TeamValues;
  scoreFromEvents: TeamValues;
  scoreAgreesWithEvents: boolean;
  totalShotsByTeam: TeamValues;
  shotsOnTargetByTeam: TeamValues;
  shootingAccuracyByTeam: NullableTeamValues;
  eventsByPeriod: Record<MatchPeriod, number>;
  eventsByTeamAndPeriod: Record<MatchPeriod, TeamValues>;
  shootingActivityByPeriod: Record<MatchPeriod, { totalShots: TeamValues; shotsOnTarget: TeamValues }>;
  importantEvents: MatchEvent[];
  keyMoment: MatchEvent | undefined;
  insights: MatchInsight[];
  syntheticAggregates: Match['syntheticStats'];
};

export type MatchValidation = {
  valid: boolean;
  issues: string[];
};

const shotTypes: EventType[] = ['Shot', 'Shot on target', 'Goal'];

function teamIndex(team: TeamSide): 0 | 1 {
  return team === 'home' ? 0 : 1;
}

function getPeriod(minute: number): MatchPeriod {
  return minute <= 45 ? 'First half' : 'Second half';
}

function teamName(match: Match, team: TeamSide): string {
  return team === 'home' ? match.home : match.away;
}

function isShot(event: MatchEvent): boolean {
  return shotTypes.includes(event.type);
}

function isShotOnTarget(event: MatchEvent): boolean {
  return event.type === 'Goal' || event.type === 'Shot on target';
}

function formatAccuracy(value: number | null): string {
  return value === null ? 'unavailable' : `${value}%`;
}

function eventTimestamp(event: MatchEvent): number {
  return event.minute * 60 + (event.second ?? 0);
}

export function analyzeMatch(match: Match): MatchAnalysis {
  const goalsByTeam: TeamValues = [0, 0];
  const totalShotsByTeam: TeamValues = [0, 0];
  const shotsOnTargetByTeam: TeamValues = [0, 0];
  const eventsByPeriod: Record<MatchPeriod, number> = { 'First half': 0, 'Second half': 0 };
  const eventsByTeamAndPeriod: Record<MatchPeriod, TeamValues> = {
    'First half': [0, 0],
    'Second half': [0, 0],
  };
  const shootingActivityByPeriod: Record<MatchPeriod, { totalShots: TeamValues; shotsOnTarget: TeamValues }> = {
    'First half': { totalShots: [0, 0], shotsOnTarget: [0, 0] },
    'Second half': { totalShots: [0, 0], shotsOnTarget: [0, 0] },
  };

  match.events.forEach((event) => {
    const index = teamIndex(event.team);
    const period = getPeriod(event.minute);
    eventsByPeriod[period] += 1;
    eventsByTeamAndPeriod[period][index] += 1;

    if (isShot(event)) {
      totalShotsByTeam[index] += 1;
      shootingActivityByPeriod[period].totalShots[index] += 1;
    }
    if (event.type === 'Goal') goalsByTeam[index] += 1;
    if (isShotOnTarget(event)) {
      shotsOnTargetByTeam[index] += 1;
      shootingActivityByPeriod[period].shotsOnTarget[index] += 1;
    }
  });

  const shootingAccuracyByTeam: NullableTeamValues = [
    totalShotsByTeam[0] === 0 ? null : Math.round((shotsOnTargetByTeam[0] / totalShotsByTeam[0]) * 100),
    totalShotsByTeam[1] === 0 ? null : Math.round((shotsOnTargetByTeam[1] / totalShotsByTeam[1]) * 100),
  ];
  const firstHalfShots = shootingActivityByPeriod['First half'].totalShots;
  const secondHalfShots = shootingActivityByPeriod['Second half'].totalShots;
  const shootingChange: TeamValues = [secondHalfShots[0] - firstHalfShots[0], secondHalfShots[1] - firstHalfShots[1]];
  const shootingTeam: 0 | 1 = shootingChange[0] >= shootingChange[1] ? 0 : 1;
  const shootingTeamSide: TeamSide = shootingTeam === 0 ? 'home' : 'away';
  const shootingTeamName = teamName(match, shootingTeamSide);
  const shootingEventIds = match.events.filter((event) => isShot(event) && event.team === shootingTeamSide).map((event) => event.id);
  const goalEvents = match.events.filter((event) => event.type === 'Goal');
  const goalPeriod = goalEvents.filter((event) => getPeriod(event.minute) === 'Second half').length >= goalEvents.filter((event) => getPeriod(event.minute) === 'First half').length ? 'Second half' : 'First half';
  const goalEventIds = goalEvents.filter((event) => getPeriod(event.minute) === goalPeriod).map((event) => event.id);
  const accuracyTeam: 0 | 1 = (shootingAccuracyByTeam[0] ?? -1) >= (shootingAccuracyByTeam[1] ?? -1) ? 0 : 1;
  const accuracyTeamSide: TeamSide = accuracyTeam === 0 ? 'home' : 'away';
  const accuracyEventIds = match.events.filter((event) => isShot(event) && event.team === accuracyTeamSide).map((event) => event.id);
  const importantEvents = match.events.filter((event) => event.type === 'Goal' || event.type === 'Shot on target');

  const insights: MatchInsight[] = [
    {
      id: 'shooting-change',
      title: 'Shooting activity change',
      icon: 'trend',
      period: 'Second half vs first half',
      team: shootingTeamSide,
      summary: `${shootingTeamName} recorded ${secondHalfShots[shootingTeam]} shots after halftime versus ${firstHalfShots[shootingTeam]} before it.`,
      evidence: `${shootingTeamName}: ${shootingChange[shootingTeam] >= 0 ? '+' : ''}${shootingChange[shootingTeam]} shots · ${secondHalfShots[shootingTeam]} second half · ${firstHalfShots[shootingTeam]} first half`,
      detail: shootingChange[shootingTeam] === 0 ? 'The event stream shows no change in this team’s shot volume between halves. This is descriptive only and does not infer tactical intent.' : `The event stream shows a ${Math.abs(shootingChange[shootingTeam])}-shot ${shootingChange[shootingTeam] > 0 ? 'increase' : 'decrease'} for ${shootingTeamName} after halftime. This is a recorded pattern, not proof of causation.`,
      eventIds: shootingEventIds,
    },
    {
      id: 'shooting-accuracy',
      title: 'Shooting accuracy',
      icon: 'shield',
      period: 'Full match',
      team: accuracyTeamSide,
      summary: `${teamName(match, accuracyTeamSide)} put ${shotsOnTargetByTeam[accuracyTeam]} of ${totalShotsByTeam[accuracyTeam]} recorded shots on target.`,
      evidence: `${match.home}: ${formatAccuracy(shootingAccuracyByTeam[0])} · ${match.away}: ${formatAccuracy(shootingAccuracyByTeam[1])}`, 
      detail: 'Accuracy is calculated only from explicit Shot, Shot on target, and Goal events. A goal counts as one shot and one shot on target.',
      eventIds: accuracyEventIds,
    },
    {
      id: 'goal-timing',
      title: 'Goal timing',
      icon: 'spark',
      period: goalPeriod,
      summary: `${goalEventIds.length} of ${goalEvents.length} recorded goals arrived in the ${goalPeriod.toLowerCase()}.`,
      evidence: `First half: ${goalEvents.filter((event) => getPeriod(event.minute) === 'First half').length} goals · Second half: ${goalEvents.filter((event) => getPeriod(event.minute) === 'Second half').length} goals`,
      detail: 'This is a chronological observation from the event log. It does not claim that the period caused the result.',
      eventIds: goalEventIds,
    },
  ];

  return {
    goalsByTeam,
    scoreFromEvents: goalsByTeam,
    scoreAgreesWithEvents: goalsByTeam[0] === match.score[0] && goalsByTeam[1] === match.score[1],
    totalShotsByTeam,
    shotsOnTargetByTeam,
    shootingAccuracyByTeam,
    eventsByPeriod,
    eventsByTeamAndPeriod,
    shootingActivityByPeriod,
    importantEvents,
    keyMoment: goalEvents[goalEvents.length - 1] ?? importantEvents[importantEvents.length - 1],
    insights,
    syntheticAggregates: match.syntheticStats,
  };
}

export function generateLocalRecap(match: Match, analysis: MatchAnalysis): string {
  const goalEvents = match.events.filter((event) => event.type === 'Goal');
  const goals = goalEvents.map((event) => `${event.minute}' ${teamName(match, event.team)} — ${event.description.toLowerCase()}`).join('; ');
  const busiestPeriod: MatchPeriod = analysis.eventsByPeriod['Second half'] >= analysis.eventsByPeriod['First half'] ? 'Second half' : 'First half';
  const periodSentence = `The ${busiestPeriod.toLowerCase()} contained ${analysis.eventsByPeriod[busiestPeriod]} logged events, compared with ${analysis.eventsByPeriod[busiestPeriod === 'First half' ? 'Second half' : 'First half']} in the other half.`;
  const shotSummary = `${match.home} recorded ${analysis.totalShotsByTeam[0]} shots with ${analysis.shotsOnTargetByTeam[0]} on target; ${match.away} recorded ${analysis.totalShotsByTeam[1]} shots with ${analysis.shotsOnTargetByTeam[1]} on target.`;

  return `${match.home} beat ${match.away} ${match.score[0]}–${match.score[1]}. Key events arrived chronologically at ${goals}. ${periodSentence} ${shotSummary} This is a deterministic local prototype recap based on the selected synthetic match data, not AI-generated copy.`;
}

export function validateMatch(match: Match): MatchValidation {
  const issues: string[] = [];
  const teamIds = new Set(match.teams.map((team) => team.id));
  const playerIds = new Set(match.players.map((player) => player.id));
  const teamSides = new Map(match.teams.map((team) => [team.id, team.side]));
  const playerTeams = new Map(match.players.map((player) => [player.id, player.teamId]));
  const goalCounts: TeamValues = [0, 0];
  const totalShots: TeamValues = [0, 0];
  const shotsOnTarget: TeamValues = [0, 0];

  match.events.forEach((event, index) => {
    if (index > 0 && eventTimestamp(event) < eventTimestamp(match.events[index - 1])) issues.push(`Event timestamps are not ordered at ${event.id}.`);
    if (!teamIds.has(event.teamId)) issues.push(`Event ${event.id} references unknown team ${event.teamId}.`);
    if (teamSides.get(event.teamId) !== event.team) issues.push(`Event ${event.id} has an inconsistent team side.`);
    if (event.playerId && !playerIds.has(event.playerId)) issues.push(`Event ${event.id} references unknown player ${event.playerId}.`);
    if (event.playerId && playerTeams.get(event.playerId) !== event.teamId) issues.push(`Event ${event.id} assigns a player to the wrong team.`);
    const indexForEvent = teamIndex(event.team);
    if (isShot(event)) totalShots[indexForEvent] += 1;
    if (event.type === 'Goal') goalCounts[indexForEvent] += 1;
    if (isShotOnTarget(event)) shotsOnTarget[indexForEvent] += 1;
  });

  if (goalCounts[0] !== match.score[0] || goalCounts[1] !== match.score[1]) issues.push('Recorded goals do not agree with the final score.');
  if (shotsOnTarget[0] > totalShots[0] || shotsOnTarget[1] > totalShots[1]) issues.push('Shots on target exceed total shots.');

  return { valid: issues.length === 0, issues };
}

export function getEventCount(match: Match, type: EventType, period?: MatchPeriod): number {
  return match.events.filter((event) => event.type === type && (!period || getPeriod(event.minute) === period)).length;
}
