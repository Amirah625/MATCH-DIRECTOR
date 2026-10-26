import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { matches } from '../src/data/matches.ts';
import { analyzeMatch, generateLocalRecap, validateMatch } from '../src/data/analysis.ts';

for (const match of matches) {
  describe(`match ${match.id}`, () => {
    const analysis = analyzeMatch(match);
    const validation = validateMatch(match);

    test('event timestamps are chronologically ordered', () => {
      assert.ok(validation.valid, `Validation issues: ${validation.issues.join('; ')}`);
      for (let index = 1; index < match.events.length; index += 1) {
        const previous = match.events[index - 1].minute * 60 + (match.events[index - 1].second ?? 0);
        const current = match.events[index].minute * 60 + (match.events[index].second ?? 0);
        assert.ok(current >= previous, `Event ${match.events[index].id} is out of order`);
      }
    });

    test('team references are valid', () => {
      const teamIds = new Set(match.teams.map((team) => team.id));
      for (const event of match.events) {
        assert.ok(teamIds.has(event.teamId), `Event ${event.id} references unknown team ${event.teamId}`);
        const team = match.teams.find((item) => item.id === event.teamId);
        assert.equal(team?.side, event.team, `Event ${event.id} has an inconsistent team side`);
      }
    });

    test('goals agree with the final score', () => {
      assert.equal(analysis.scoreAgreesWithEvents, true, 'Goals derived from events do not match the recorded score');
      assert.deepEqual(analysis.goalsByTeam, match.score);
    });

    test('goals are counted as shots on target', () => {
      for (const team of ['home', 'away'] as const) {
        const goals = match.events.filter((event) => event.type === 'Goal' && event.team === team).length;
        assert.ok(analysis.shotsOnTargetByTeam[team === 'home' ? 0 : 1] >= goals, `${team} goals should be included in shots on target`);
      }
    });

    test('shots on target do not exceed total shots', () => {
      assert.ok(analysis.shotsOnTargetByTeam[0] <= analysis.totalShotsByTeam[0], 'Home shots on target exceed total shots');
      assert.ok(analysis.shotsOnTargetByTeam[1] <= analysis.totalShotsByTeam[1], 'Away shots on target exceed total shots');
    });

    test('insights cite evidence that exists in the match', () => {
      const eventIds = new Set(match.events.map((event) => event.id));
      for (const insight of analysis.insights) {
        assert.ok(insight.eventIds.length > 0, `Insight ${insight.id} has no event references`);
        for (const eventId of insight.eventIds) {
          assert.ok(eventIds.has(eventId), `Insight ${insight.id} references unknown event ${eventId}`);
        }
      }
    });

    test('recap references the correct teams, score, and events', () => {
      const recap = generateLocalRecap(match, analysis);
      assert.ok(recap.includes(match.home), 'Recap missing home team');
      assert.ok(recap.includes(match.away), 'Recap missing away team');
      assert.ok(recap.includes(`${match.score[0]}–${match.score[1]}`), 'Recap missing the score');
      for (const goal of match.events.filter((event) => event.type === 'Goal')) {
        assert.ok(recap.includes(`${goal.minute}'`), `Recap missing goal at ${goal.minute}'`);
      }
      assert.ok(recap.includes('local prototype'), 'Recap should be labeled as a local prototype');
    });
  });
}

describe('match switching', () => {
  const first = analyzeMatch(matches[0]);
  const second = analyzeMatch(matches[1]);

  test('switching matches changes the displayed data', () => {
    assert.notDeepEqual(first.goalsByTeam, second.goalsByTeam, 'Goals should differ between matches');
    assert.notDeepEqual(first.totalShotsByTeam, second.totalShotsByTeam, 'Shot totals should differ between matches');
    assert.notDeepEqual(first.insights, second.insights, 'Insights should differ between matches');
  });

  test('insights do not cite unsupported event counts', () => {
    for (const analysis of [first, second]) {
      for (const insight of analysis.insights) {
        assert.ok(!insight.evidence.toLowerCase().includes('possession'), `Insight ${insight.id} should not claim possession causation`);
        assert.ok(!insight.evidence.toLowerCase().includes('momentum'), `Insight ${insight.id} should not claim momentum causation`);
      }
    }
  });
});
