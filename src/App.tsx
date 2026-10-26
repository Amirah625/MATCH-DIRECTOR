import { useMemo, useState } from 'react';
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  CircleDot,
  FileText,
  Goal,
  Home,
  Lightbulb,
  ListFilter,
  Menu,
  MessageSquareText,
  Play,
  RotateCcw,
  Settings,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  X,
  Zap,
} from 'lucide-react';
import { analyzeMatch, generateLocalRecap, type MatchAnalysis } from './data/analysis';
import { matches, type EventType, type Match, type MatchEvent, type MatchInsight, type TeamSide } from './data/matches';

type Page = 'Home' | 'Match Analysis' | 'Highlights' | 'Match Recap' | 'Settings';
type Tab = 'Overview' | 'Statistics' | 'Timeline' | 'Insights' | 'Highlights' | 'Recap';

const eventTypes: Array<'All events' | EventType> = ['All events', 'Goal', 'Shot', 'Shot on target', 'Corner', 'Foul', 'Yellow card', 'Substitution', 'Tackle', 'Interception', 'Possession recovery', 'Pass'];

function TeamMark({ side, label }: { side: TeamSide; label: string }) {
  return <div className={`team-mark ${side}`} aria-label={`${label} synthetic team badge`}><span>{label.slice(0, 1)}</span></div>;
}

function StripeMotif({ className = '' }: { className?: string }) {
  return <div className={`stripe-motif ${className}`} aria-hidden="true"><i /><i /><i /><i /><i /></div>;
}

function App() {
  const [match, setMatch] = useState<Match>(matches[0]);
  const [page, setPage] = useState<Page>('Match Analysis');
  const [tab, setTab] = useState<Tab>('Overview');
  const [mobileNav, setMobileNav] = useState(false);
  const [eventFilter, setEventFilter] = useState<'All events' | EventType>('All events');
  const [selectedInsight, setSelectedInsight] = useState<MatchInsight | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<MatchEvent | null>(null);
  const [recapGenerated, setRecapGenerated] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const analysis = useMemo(() => analyzeMatch(match), [match]);
  const generatedRecap = useMemo(() => generateLocalRecap(match, analysis), [analysis, match]);
  const filteredEvents = useMemo(() => eventFilter === 'All events' ? match.events : match.events.filter((event) => event.type === eventFilter), [eventFilter, match]);

  function selectMatch(nextMatch: Match) {
    setMatch(nextMatch);
    setSelectedInsight(null);
    setSelectedEvent(null);
    setEventFilter('All events');
    setAnswer('');
    setRecapGenerated(false);
  }

  function resetDemo() {
    selectMatch(matches[0]);
    setPage('Match Analysis');
    setTab('Overview');
    setQuestion('');
  }

  function askQuestion() {
    const normalized = question.toLowerCase();
    if (!question.trim()) return;
    if (normalized.includes('possession') || normalized.includes('control')) {
      setAnswer(`${match.home} had ${match.syntheticStats.possession[0]}% possession compared with ${match.away}'s ${match.syntheticStats.possession[1]}%.`);
    } else if (normalized.includes('shot')) {
      setAnswer(`${match.home} recorded ${analysis.totalShotsByTeam[0]} shots (${analysis.shotsOnTargetByTeam[0]} on target) in the event log; ${match.away} recorded ${analysis.totalShotsByTeam[1]} shots (${analysis.shotsOnTargetByTeam[1]} on target). The separate synthetic aggregate is ${match.syntheticStats.totalShots[0]}–${match.syntheticStats.totalShots[1]}.`);
    } else if (normalized.includes('score') || normalized.includes('result') || normalized.includes('win')) {
      setAnswer(`${match.home} beat ${match.away} ${match.score[0]}–${match.score[1]}. The latest recorded goal came in the ${analysis.keyMoment?.minute ?? 'unavailable'}th minute.`);
    } else if (normalized.includes('goal') || normalized.includes('scor')) {
      setAnswer(`The recorded goals came at ${match.events.filter((event) => event.type === 'Goal').map((event) => `${event.minute}'`).join(', ')}.`);
    } else {
      setAnswer(`Try asking about possession, shots, goals, the score, or who controlled the match. This prototype only uses the selected synthetic match data.`);
    }
  }

  const navigate = (nextPage: Page) => {
    setPage(nextPage);
    if (nextPage === 'Match Analysis') setTab('Overview');
    if (nextPage === 'Highlights') setTab('Highlights');
    if (nextPage === 'Match Recap') setTab('Recap');
    setMobileNav(false);
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-mark"><span /><span /><span /></div>
          <div><strong>Match</strong><strong>Director</strong></div>
        </div>
        <div className="synthetic-stamp"><span className="live-dot" /> LOCAL DEMO / V1</div>
        <nav className="side-nav" aria-label="Primary navigation">
          <NavItem icon={<Home size={17} />} label="Home" active={page === 'Home'} onClick={() => navigate('Home')} />
          <NavItem icon={<Activity size={17} />} label="Match Analysis" active={page === 'Match Analysis'} onClick={() => navigate('Match Analysis')} />
          <NavItem icon={<Play size={17} />} label="Highlights" active={page === 'Highlights'} onClick={() => navigate('Highlights')} />
          <NavItem icon={<FileText size={17} />} label="Match Recap" active={page === 'Match Recap'} onClick={() => navigate('Match Recap')} />
          <NavItem icon={<Settings size={17} />} label="Settings" active={page === 'Settings'} onClick={() => navigate('Settings')} />
        </nav>
        <div className="sidebar-bottom">
          <StripeMotif className="sidebar-stripes" />
          <p>More than a score.<br /><span>The real football story.</span></p>
          <button className="reset-button" onClick={resetDemo}><RotateCcw size={14} /> Reset demo</button>
        </div>
      </aside>
      {mobileNav && <button className="mobile-overlay" aria-label="Close navigation" onClick={() => setMobileNav(false)} />}

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left"><button className="mobile-menu" aria-label="Open navigation" onClick={() => setMobileNav(true)}><Menu size={21} /></button><span className="eyebrow">MATCH INTELLIGENCE / {page.toUpperCase()}</span></div>
          <div className="topbar-actions"><span className="status-dot" /> System ready <Bell size={17} /><div className="avatar">MD</div></div>
        </header>

        <section className="match-header">
          <div className="match-context"><span className="eyebrow">{match.competition}</span><span className="synthetic-badge"><span /> SYNTHETIC DATA</span></div>
          <div className="match-selector-wrap"><label htmlFor="match-select">SIMULATION</label><div className="select-wrap"><select id="match-select" value={match.id} onChange={(event) => selectMatch(matches.find((item) => item.id === event.target.value) ?? matches[0])}>{matches.map((item) => <option key={item.id} value={item.id}>{item.home} vs {item.away}</option>)}</select><ChevronDown size={15} /></div></div>
          <div className="scoreboard">
            <div className="team"><TeamMark side="home" label={match.home} /><div><strong>{match.home}</strong><small>HOME</small></div></div>
            <div className="score"><strong>{match.score[0]} <span>–</span> {match.score[1]}</strong><span className="full-time">FULL TIME</span></div>
            <div className="team away-team"><div><strong>{match.away}</strong><small>AWAY</small></div><TeamMark side="away" label={match.away} /></div>
          </div>
          <StripeMotif className="header-stripes" />
        </section>

        {page === 'Home' ? <HomeView match={match} analysis={analysis} onGoToAnalysis={() => navigate('Match Analysis')} /> : page === 'Settings' ? <SettingsView /> : <>
          <div className="tab-bar" role="tablist" aria-label="Match analysis sections">{(['Overview', 'Statistics', 'Timeline', 'Insights', 'Highlights', 'Recap'] as Tab[]).map((item) => <button key={item} role="tab" aria-selected={tab === item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)}>{item}{item === 'Highlights' && <span className="tab-count">{match.events.filter((event) => event.type === 'Goal').length}</span>}</button>)}</div>
          <div className="workspace">
            {tab === 'Overview' && <Overview match={match} analysis={analysis} generatedRecap={generatedRecap} filteredEvents={filteredEvents} eventFilter={eventFilter} setEventFilter={setEventFilter} onInsight={setSelectedInsight} onEvent={setSelectedEvent} onTab={setTab} onGenerate={() => setRecapGenerated(true)} recapGenerated={recapGenerated} />}
            {tab === 'Statistics' && <Statistics match={match} analysis={analysis} />}
            {tab === 'Timeline' && <Timeline match={match} events={filteredEvents} eventFilter={eventFilter} setEventFilter={setEventFilter} onEvent={setSelectedEvent} />}
            {tab === 'Insights' && <Insights insights={analysis.insights} onInsight={setSelectedInsight} />}
            {tab === 'Highlights' && <Highlights match={match} onEvent={setSelectedEvent} />}
            {tab === 'Recap' && <Recap match={match} analysis={analysis} generatedRecap={generatedRecap} generated={recapGenerated} onGenerate={() => setRecapGenerated(true)} />}
            <QuestionPanel question={question} setQuestion={setQuestion} answer={answer} onAsk={askQuestion} />
          </div>
        </>}
      </main>

      {selectedInsight && <InsightDrawer insight={selectedInsight} onClose={() => setSelectedInsight(null)} />}
      {selectedEvent && <EventDrawer event={selectedEvent} match={match} onClose={() => setSelectedEvent(null)} />}
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return <button className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>{icon}<span>{label}</span>{active && <ChevronRight size={14} />}</button>;
}

function HomeView({ match, analysis, onGoToAnalysis }: { match: Match; analysis: MatchAnalysis; onGoToAnalysis: () => void }) {
  return <div className="landing-view"><div className="landing-kicker"><span className="yellow-line" /> YOUR MATCH ROOM</div><h1>See the game<br /><em>in a new light.</em></h1><p>Match Director turns matchday data into a clear football story for analysts, producers and curious fans.</p><div className="landing-actions"><button className="primary-button" onClick={onGoToAnalysis}>Open match analysis <ArrowRight size={16} /></button><div className="landing-meta"><Trophy size={16} /> Next up: {match.home} vs {match.away}</div></div><div className="landing-cards"><MiniMetric label="Score check" value={analysis.scoreAgreesWithEvents ? 'Valid' : 'Review'} icon={<Check size={17} />} /><MiniMetric label="Events mapped" value={String(match.events.length).padStart(2, '0')} icon={<Activity size={17} />} /><MiniMetric label="Story status" value="Local" icon={<Trophy size={17} />} /></div></div>;
}

function MiniMetric({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) { return <div className="mini-metric">{icon}<div><small>{label}</small><strong>{value}</strong></div></div>; }

function Overview({ match, analysis, generatedRecap, filteredEvents, eventFilter, setEventFilter, onInsight, onEvent, onTab, onGenerate, recapGenerated }: { match: Match; analysis: MatchAnalysis; generatedRecap: string; filteredEvents: MatchEvent[]; eventFilter: 'All events' | EventType; setEventFilter: (value: 'All events' | EventType) => void; onInsight: (insight: MatchInsight) => void; onEvent: (event: MatchEvent) => void; onTab: (tab: Tab) => void; onGenerate: () => void; recapGenerated: boolean }) {
  return <>
    <div className="overview-grid">
      <Pitch match={match} />
      <StatsCard match={match} />
      <InsightHero insight={analysis.insights[0]} onTab={onTab} />
      {analysis.keyMoment && <KeyMoment event={analysis.keyMoment} match={match} onClick={() => onEvent(analysis.keyMoment!)} />}
    </div>
    <div className="lower-grid">
      <TimelinePreview match={match} events={filteredEvents} eventFilter={eventFilter} setEventFilter={setEventFilter} onEvent={onEvent} onViewAll={() => onTab('Timeline')} />
      <InsightPreview insights={analysis.insights} onInsight={onInsight} onViewAll={() => onTab('Insights')} />
      <RecapPreview match={match} recap={generatedRecap} generated={recapGenerated} onGenerate={onGenerate} onViewAll={() => onTab('Recap')} />
    </div>
  </>;
}

function SectionHeader({ icon, title, kicker, action }: { icon: React.ReactNode; title: string; kicker?: string; action?: React.ReactNode }) { return <div className="section-header"><div className="section-title"><span className="section-icon">{icon}</span><div>{kicker && <small>{kicker}</small>}<h2>{title}</h2></div></div>{action}</div>; }

function Pitch({ match }: { match: Match }) {
  return <section className="panel pitch-panel"><SectionHeader icon={<Target size={16} />} kicker="EVENT-BASED MATCH VIEW" title="Pitch reference" action={<span className="panel-chip"><CircleDot size={12} /> Event view</span>} /><div className="pitch"><div className="pitch-line half-line" /><div className="pitch-line centre-circle" /><div className="pitch-dot centre-dot" /><div className="pitch-box home-box" /><div className="pitch-box away-box" /><div className="pitch-goal home-goal" /><div className="pitch-goal away-goal" /><span className="pitch-label home-label">{match.homeShort}</span><span className="pitch-label away-label">{match.awayShort}</span></div><div className="pitch-footer"><span><i className="legend-dot yellow" /> {match.home} events</span><span><i className="legend-dot green" /> {match.away} events</span><small>Reference only · no player tracking</small></div></section>;
}

function StatsCard({ match }: { match: Match }) {
  const stats = [{ label: 'Possession · synthetic aggregate', values: match.syntheticStats.possession, suffix: '%' }, { label: 'Total shots · synthetic aggregate', values: match.syntheticStats.totalShots }, { label: 'Shots on target · synthetic aggregate', values: match.syntheticStats.shotsOnTarget }, { label: 'Completed passes · synthetic aggregate', values: match.syntheticStats.completedPasses }, { label: 'Corners · synthetic aggregate', values: match.syntheticStats.corners }, { label: 'Fouls · synthetic aggregate', values: match.syntheticStats.fouls }];
  return <section className="panel stats-panel"><SectionHeader icon={<BarChart3 size={16} />} kicker="MATCH NUMBERS" title="Key match stats" />{stats.map((stat) => { const total = stat.values[0] + stat.values[1]; return <div className="stat-row" key={stat.label}><div className="stat-label"><span>{stat.label}</span><strong>{stat.values[0]}{stat.suffix ?? ''} <b>—</b> {stat.values[1]}{stat.suffix ?? ''}</strong></div><div className="stat-bars"><i style={{ width: `${(stat.values[0] / total) * 100}%` }} /><i style={{ width: `${(stat.values[1] / total) * 100}%` }} /></div></div>; })}</section>;
}

function InsightHero({ insight, onTab }: { insight: MatchInsight; onTab: (tab: Tab) => void }) { return <section className="panel insight-hero"><div className="hero-icon"><Sparkles size={19} /></div><div className="hero-heading"><small>LOCAL INSIGHT / EVENT PATTERN</small><h2>{insight.title}</h2></div><p>{insight.summary}</p><p className="hero-detail">{insight.evidence}</p><button className="outline-button" onClick={() => onTab('Insights')}>View full analysis <ArrowRight size={15} /></button><StripeMotif className="card-stripes" /></section>; }

function KeyMoment({ event, match, onClick }: { event: MatchEvent; match: Match; onClick: () => void }) { return <button className="panel key-moment" onClick={onClick}><div className="moment-top"><span><Zap size={16} /> KEY MOMENT</span><ChevronRight size={17} /></div><div className="moment-body"><strong>{event.minute}'</strong><div><h3>{event.description}</h3><p>{event.details ?? `Recorded for ${event.team === 'home' ? match.home : match.away}.`}</p></div></div></button>; }

function TimelinePreview({ match, events, eventFilter, setEventFilter, onEvent, onViewAll }: { match: Match; events: MatchEvent[]; eventFilter: 'All events' | EventType; setEventFilter: (value: 'All events' | EventType) => void; onEvent: (event: MatchEvent) => void; onViewAll: () => void }) { return <section className="panel timeline-card"><SectionHeader icon={<CalendarDays size={16} />} title="Match timeline" action={<button className="text-button" onClick={onViewAll}>View all <ArrowRight size={14} /></button>} /><div className="filter-line"><ListFilter size={13} /><select aria-label="Filter timeline events" value={eventFilter} onChange={(event) => setEventFilter(event.target.value as 'All events' | EventType)}>{eventTypes.map((type) => <option key={type}>{type}</option>)}</select></div><div className="timeline-list">{events.slice(0, 5).map((event) => <TimelineItem key={event.id} event={event} match={match} onClick={() => onEvent(event)} />)}</div></section>; }

function TimelineItem({ event, match, onClick }: { event: MatchEvent; match: Match; onClick: () => void }) { const icon = event.type === 'Goal' ? <Goal size={13} /> : event.type === 'Yellow card' ? <span className="yellow-card" /> : event.type === 'Substitution' ? <RotateCcw size={13} /> : <Target size={13} />; return <button className="timeline-item" onClick={onClick}><strong>{event.minute}'</strong><span className={`event-icon ${event.type.toLowerCase().replace(/ /g, '-')}`}>{icon}</span><span className="event-copy"><b>{event.type}</b><small>{event.description}</small></span><span className={`event-team ${event.team}`}>{event.team === 'home' ? match.homeShort : match.awayShort}</span></button>; }

function InsightPreview({ insights, onInsight, onViewAll }: { insights: MatchInsight[]; onInsight: (insight: MatchInsight) => void; onViewAll: () => void }) { return <section className="panel insights-card"><SectionHeader icon={<Lightbulb size={16} />} title="Local insights" action={<button className="text-button" onClick={onViewAll}>View all <ArrowRight size={14} /></button>} /><div className="insight-list">{insights.map((insight) => <button className="insight-row" key={insight.id} onClick={() => onInsight(insight)}><span className="insight-row-icon">{insight.icon === 'trend' ? <TrendingUp size={16} /> : insight.icon === 'shield' ? <Shield size={16} /> : <Sparkles size={16} />}</span><span><b>{insight.title}</b><small>{insight.evidence}</small></span><ChevronRight size={15} /></button>)}</div></section>; }

function RecapPreview({ match, recap, generated, onGenerate, onViewAll }: { match: Match; recap: string; generated: boolean; onGenerate: () => void; onViewAll: () => void }) { return <section className="panel recap-card"><SectionHeader icon={<FileText size={16} />} title="Match recap" action={<button className="text-button" onClick={onViewAll}>Full summary <ArrowRight size={14} /></button>} /><div className="mini-score"><span>{match.homeShort}</span><strong>{match.score[0]} <i>–</i> {match.score[1]}</strong><span>{match.awayShort}</span></div><p>{generated ? recap : 'Generate a deterministic story from this match’s selected events and validated statistics.'}</p><button className="generate-button" onClick={onGenerate}>{generated ? <Check size={15} /> : <Sparkles size={15} />}{generated ? 'Recap generated' : 'Generate match recap'}</button></section>; }

function Statistics({ match, analysis }: { match: Match; analysis: MatchAnalysis }) { return <div className="full-view"><SectionHeader icon={<BarChart3 size={16} />} kicker="COMPARISON BOARD" title="Full match statistics" /><p className="view-intro">Event-derived goals and recorded shots are separated from labeled synthetic match aggregates.</p><div className="big-stat-grid">{[{ label: 'Goals · event-derived', values: analysis.goalsByTeam }, { label: 'Possession · synthetic aggregate', values: match.syntheticStats.possession, suffix: '%' }, { label: 'Total shots · synthetic aggregate', values: match.syntheticStats.totalShots }, { label: 'Shots on target · synthetic aggregate', values: match.syntheticStats.shotsOnTarget }, { label: 'Completed passes · synthetic aggregate', values: match.syntheticStats.completedPasses }, { label: 'Corners · synthetic aggregate', values: match.syntheticStats.corners }, { label: 'Fouls · synthetic aggregate', values: match.syntheticStats.fouls }].map((stat) => <div className="big-stat" key={stat.label}><small>{stat.label}</small><div><strong>{stat.values[0]}{stat.suffix ?? ''}</strong><span>vs</span><strong>{stat.values[1]}{stat.suffix ?? ''}</strong></div><div className="big-bar"><i style={{ width: `${(stat.values[0] / (stat.values[0] + stat.values[1])) * 100}%` }} /></div><div className="big-stat-teams"><span>{match.home}</span><span>{match.away}</span></div></div>)}</div></div>; }

function Timeline({ match, events, eventFilter, setEventFilter, onEvent }: { match: Match; events: MatchEvent[]; eventFilter: 'All events' | EventType; setEventFilter: (value: 'All events' | EventType) => void; onEvent: (event: MatchEvent) => void }) { return <div className="full-view"><div className="full-view-heading"><div><SectionHeader icon={<CalendarDays size={16} />} kicker="CHRONOLOGICAL LOG" title="Match timeline" /><p className="view-intro">Select any event to inspect its broadcast-ready context.</p></div><div className="filter-control"><ListFilter size={15} /><select aria-label="Filter timeline events" value={eventFilter} onChange={(event) => setEventFilter(event.target.value as 'All events' | EventType)}>{eventTypes.map((type) => <option key={type}>{type}</option>)}</select></div></div><div className="timeline-expanded">{events.map((event) => <TimelineItem key={event.id} event={event} match={match} onClick={() => onEvent(event)} />)}</div></div>; }

function Insights({ insights, onInsight }: { insights: MatchInsight[]; onInsight: (insight: MatchInsight) => void }) { return <div className="full-view"><SectionHeader icon={<Lightbulb size={16} />} kicker="LOCAL PATTERN ENGINE" title="Local match insights" /><p className="view-intro">Insights are derived from the selected match’s recorded events. No external model is connected.</p><div className="insight-grid">{insights.map((insight) => <button key={insight.id} className="large-insight" onClick={() => onInsight(insight)}><div className="large-insight-icon">{insight.icon === 'trend' ? <TrendingUp size={21} /> : insight.icon === 'shield' ? <Shield size={21} /> : <Sparkles size={21} />}</div><small>{insight.period}</small><h3>{insight.title}</h3><p>{insight.summary}</p><strong>{insight.evidence}</strong><span>Open supporting detail <ArrowRight size={14} /></span></button>)}</div></div>; }

function Highlights({ match, onEvent }: { match: Match; onEvent: (event: MatchEvent) => void }) { const highlights = match.events.filter((event) => event.type === 'Goal' || event.type === 'Shot on target'); return <div className="full-view"><SectionHeader icon={<Play size={16} />} kicker="BROADCAST SHORTLIST" title="Match highlights" /><p className="view-intro">Key moments selected from the local event log for a quick editorial pass.</p><div className="highlight-list">{highlights.map((event, index) => <button key={event.id} className="highlight-row" onClick={() => onEvent(event)}><span className="highlight-number">0{index + 1}</span><span className={`highlight-symbol ${event.type === 'Goal' ? 'goal' : 'shot'}`}>{event.type === 'Goal' ? <Goal size={16} /> : <Target size={16} />}</span><div><small>{event.minute}' · {event.type}</small><h3>{event.description}</h3><p>{event.team === 'home' ? match.home : match.away}</p></div><ChevronRight size={17} /></button>)}</div></div>; }

function Recap({ match, analysis, generatedRecap, generated, onGenerate }: { match: Match; analysis: MatchAnalysis; generatedRecap: string; generated: boolean; onGenerate: () => void }) { const goals = analysis.importantEvents.filter((event) => event.type === 'Goal'); return <div className="full-view recap-view"><div className="recap-hero"><div><span className="eyebrow">LOCAL PROTOTYPE GENERATOR</span><h1>{match.home} <em>vs</em> {match.away}</h1><p>{generated ? generatedRecap : 'The local recap generator is ready to turn this match’s selected events into a deterministic story.'}</p></div><div className="recap-big-score"><span>{match.homeShort}</span><strong>{match.score[0]}–{match.score[1]}</strong><span>{match.awayShort}</span></div></div><div className="recap-events"><div><small>THE STORY IN THREE MOMENTS</small><h2>What shaped the result</h2></div>{goals.slice(0, 3).map((event) => <div className="recap-event" key={event.id}><strong>{event.minute}'</strong><span>{event.team === 'home' ? match.home : match.away}</span><p>{event.description}</p></div>)}</div><button className="primary-button" onClick={onGenerate}><Sparkles size={16} /> {generated ? 'Refresh generated recap' : 'Generate match recap'}</button></div>; }

function QuestionPanel({ question, setQuestion, answer, onAsk }: { question: string; setQuestion: (value: string) => void; answer: string; onAsk: () => void }) { return <section className="question-panel"><div className="question-copy"><div className="question-icon"><MessageSquareText size={17} /></div><div><small>ASK THE MATCH / PROTOTYPE</small><h2>What do you want to know?</h2><p>Try “Who had more shots?” or “When were the goals scored?”</p></div></div><form className="question-form" onSubmit={(event) => { event.preventDefault(); onAsk(); }}><input aria-label="Ask a question about the match" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask about this match..." /><button aria-label="Submit question" type="submit"><ArrowRight size={17} /></button></form>{answer && <div className="answer"><span><Check size={14} /> Prototype answer</span><p>{answer}</p></div>}</section>; }

function InsightDrawer({ insight, onClose }: { insight: MatchInsight; onClose: () => void }) { return <Modal onClose={onClose}><div className="drawer-label"><Sparkles size={15} /> LOCAL RULE-BASED INSIGHT</div><h2>{insight.title}</h2><span className="drawer-period">{insight.period}</span><p className="drawer-lede">{insight.summary}</p><div className="evidence-box"><small>SUPPORTING EVIDENCE</small><strong>{insight.evidence}</strong></div><div className="evidence-box"><small>EVENT REFERENCES</small><strong>{insight.eventIds.join(' · ')}</strong></div><p>{insight.detail}</p><button className="primary-button" onClick={onClose}>Close detail</button></Modal>; }

function EventDrawer({ event, match, onClose }: { event: MatchEvent; match: Match; onClose: () => void }) { return <Modal onClose={onClose}><div className="drawer-label"><CalendarDays size={15} /> EVENT DETAIL</div><div className="event-drawer-title"><strong>{event.minute}'</strong><div><span className={`event-type-tag ${event.type.toLowerCase().replace(/ /g, '-')}`}>{event.type}</span><h2>{event.description}</h2></div></div><p>This simulated event belongs to <b>{event.team === 'home' ? match.home : match.away}</b> and is part of the local match timeline.</p><div className="evidence-box"><small>BROADCAST NOTE</small><strong>{event.type === 'Goal' ? 'High-value moment for the match recap.' : 'Useful context for the final match narrative.'}</strong></div><button className="primary-button" onClick={onClose}>Close detail</button></Modal>; }

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) { return <div className="modal-backdrop" role="dialog" aria-modal="true"><div className="modal-card"><button className="close-button" aria-label="Close detail" onClick={onClose}><X size={18} /></button>{children}</div></div>; }

function SettingsView() { return <div className="full-view settings-view"><SectionHeader icon={<Settings size={16} />} kicker="WORKSPACE PREFERENCES" title="Settings" /><div className="settings-list"><div><div><h3>Simulation mode</h3><p>Keep this workspace on local synthetic match data.</p></div><span className="toggle on"><i /></span></div><div><div><h3>Broadcast language</h3><p>English · concise matchday tone</p></div><ChevronDown size={17} /></div><div><div><h3>Analysis engine</h3><p>Prototype rules · no connected AI backend</p></div><span className="settings-status">LOCAL</span></div></div></div>; }

export default App;
