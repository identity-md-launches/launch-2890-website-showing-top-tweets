import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { ArrowDown, ArrowDownUp, ArrowRight, ArrowUpRight, Bookmark, Check, ChevronDown, CircleHelp, Code2, Copy, Flame, Heart, Info, Leaf, MessageCircle, Radio, Repeat2, Search, Sparkles, Users, X } from 'lucide-react';
import { authors, capturedAt, posts, selectPosts, topics } from './data';
import type { Post, Topic } from './data';

const STORAGE_KEY = 'the-pond:saved:v1';
const PAGE_SIZE = 6;
const topicIcons = { Building: Code2, 'AI agents': Sparkles, Community: Users, Memes: Leaf };

function containDialogFocus(event: ReactKeyboardEvent<HTMLDialogElement>) {
  if (event.key !== 'Tab') return;
  const controls = event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input, select, [tabindex="0"]');
  const first = controls[0], last = controls[controls.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
}

function XMark({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-5-7.6L5.2 22H2l8.5-9.8L.8 2h6.4l4.5 6.9L18.9 2ZM17.8 20h1.8L6.1 3.9H4.2L17.8 20Z" /></svg>;
}

function loadSaved() {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string' && posts.some(p => p.id === id)) : [];
  } catch { return []; }
}

function PostCard({ post, saved, onSave, onCopy }: { post: Post; saved: boolean; onSave: (id: string) => void; onCopy: (post: Post) => void }) {
  const card = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const element = card.current;
    if (!element) return;
    const resize = new ResizeObserver(() => {
      element.style.setProperty('--card-rows', String(Math.ceil((element.getBoundingClientRect().height + 16) / 8)));
    });
    resize.observe(element);
    return () => resize.disconnect();
  }, []);
  const author = authors.find(author => author.handle === post.author)!;
  const TopicIcon = topicIcons[post.topic as keyof typeof topicIcons];
  const date = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(post.date);
  const mediaAlt: Record<string, string> = {
    '2115740326153371722': 'Original post image: the IMD Terminal dashboard with protocol metrics and charts.',
    '2115508430186348696': 'Original post image: IMD hackathon winners, headed by imdusd, theidmfun, and paperclash_xyz.',
    '2117083801075786019': 'Original post image: a black and white Pepe with a mechanical arm.',
  };
  return <article ref={card} className="post" data-post-id={post.id}>
    <div className="post-topline"><span className={`topic topic-${post.topic.toLowerCase().replace(' ', '-')}`}><TopicIcon size={14} />{post.topic}</span><time dateTime={new Date(post.date).toISOString()} title={new Date(post.date).toUTCString()}>{date}</time></div>
    <div className="post-author-row">
      <a className="author-link" href={`https://x.com/${author.handle}`} target="_blank" rel="noreferrer"><img className="avatar" src={author.avatar} alt="" width="40" height="40" loading="lazy" /><span><strong>{author.name}</strong><span className="handle">@{author.handle}</span></span></a>
      <a className="icon-button post-x" href={post.url} target="_blank" rel="noreferrer" aria-label={`Open ${author.name}’s tweet on X`} title="Open original on X"><XMark size={17} /></a>
    </div>
    <blockquote>{post.text.split(/(@[a-zA-Z0-9_]+|\$[a-zA-Z]+)/g).map((part, i) => /^[@$]/.test(part) ? <span className="mention" key={i}>{part}</span> : part)}</blockquote>
    {post.excerpt && <a className="excerpt-link" href={post.url} target="_blank" rel="noreferrer">Read full tweet <ArrowUpRight size={14} /></a>}
    {post.media && <a className={`post-media media-${post.id}`} href={post.url} target="_blank" rel="noreferrer"><img src={post.media} alt={mediaAlt[post.id]} width={post.id === '2117083801075786019' ? 505 : 680} height={post.id === '2117083801075786019' ? 680 : post.id === '2115508430186348696' ? 456 : 384} loading="lazy" /></a>}
    <div className="post-footer">
      <div className="post-stats" role="group" aria-label="Engagement at snapshot">
        <span title={`${post.replies} replies at snapshot`}><MessageCircle size={15} /><span>{post.replies}</span></span>
        <span title={`${post.reposts} reposts at snapshot`}><Repeat2 size={16} /><span>{post.reposts}</span></span>
        <span title={`${post.likes} likes at snapshot`}><Heart size={15} /><span>{post.likes}</span></span>
      </div>
      <div className="post-actions"><button type="button" className="icon-button" title="Copy tweet link" aria-label={`Copy link to ${author.name}’s tweet`} onClick={() => onCopy(post)}><Copy size={16} /></button><button type="button" className={`icon-button save-button ${saved ? 'is-saved' : ''}`} title={saved ? 'Remove from saved' : 'Save tweet'} aria-label={`${saved ? 'Unsave' : 'Save'} ${author.name}’s tweet`} aria-pressed={saved} onClick={() => onSave(post.id)}><Bookmark size={17} fill={saved ? 'currentColor' : 'none'} /></button></div>
    </div>
  </article>;
}

export default function App() {
  const [view, setView] = useState<'feed' | 'saved'>(() => location.hash === '#saved' ? 'saved' : 'feed');
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState<Topic>('All tweets');
  const [sort, setSort] = useState('top');
  const [saved, setSaved] = useState<string[]>(loadSaved);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [notice, setNotice] = useState('');
  const [storageWarning, setStorageWarning] = useState(false);
  const [copyFallback, setCopyFallback] = useState('');
  const aboutDialog = useRef<HTMLDialogElement>(null);
  const copyDialog = useRef<HTMLDialogElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const moreButton = useRef<HTMLButtonElement>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const result = selectPosts(query, topic, sort, view === 'saved', saved);
  const shown = result.slice(0, limit);

  useEffect(() => {
    const change = () => { setView(location.hash === '#saved' ? 'saved' : 'feed'); setQuery(''); setTopic('All tweets'); setLimit(PAGE_SIZE); };
    addEventListener('hashchange', change);
    return () => removeEventListener('hashchange', change);
  }, []);
  useEffect(() => () => clearTimeout(noticeTimer.current), []);
  useEffect(() => { if (copyFallback) copyDialog.current?.showModal(); }, [copyFallback]);

  function announce(message: string) {
    clearTimeout(noticeTimer.current);
    setNotice(message);
    noticeTimer.current = setTimeout(() => setNotice(''), 3500);
  }

  function toggleSaved(id: string) {
    const removing = saved.includes(id);
    const next = removing ? saved.filter(value => value !== id) : [...saved, id];
    setSaved(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); }
    catch { setStorageWarning(true); }
    announce(removing ? 'Tweet removed from saved.' : 'Tweet saved. Find it in Saved tweets.');
    if (removing && view === 'saved') requestAnimationFrame(() => {
      document.querySelector<HTMLElement>('.post .save-button, .empty-state .button')?.focus();
    });
  }

  async function copyPost(post: Post) {
    try { await navigator.clipboard.writeText(post.url); announce('Tweet link copied.'); }
    catch { setCopyFallback(post.url); }
  }

  function filter(nextTopic: Topic) { setTopic(nextTopic); setLimit(PAGE_SIZE); }
  function reset() { setQuery(''); setTopic('All tweets'); setLimit(PAGE_SIZE); searchInput.current?.focus(); }
  function navFeed() {
    setView('feed'); setQuery(''); setTopic('All tweets'); setLimit(PAGE_SIZE);
  }
  function loadMore() {
    const nextId = result[limit]?.id;
    setLimit(value => value + PAGE_SIZE);
    requestAnimationFrame(() => {
      const next = document.querySelector<HTMLElement>(`[data-post-id="${nextId}"]`);
      if (next) { next.tabIndex = -1; next.focus({ preventScroll: true }); next.scrollIntoView({ block: 'nearest', behavior: 'instant' }); }
    });
  }

  return <>
    <a className="skip-link" href="#feed">Skip to tweets</a>
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#feed" onClick={navFeed} aria-label="The Pond home"><img src="./favicon.svg" alt="" width="40" height="40" /><span>The Pond<span className="brand-byline">An IdentityMD feed</span></span></a>
        <nav className="main-nav" aria-label="Main navigation">
          <a className={view === 'feed' ? 'nav-item active' : 'nav-item'} href="#feed" onClick={navFeed} aria-label="Top tweets" aria-current={view === 'feed' ? 'page' : undefined}><Flame size={19} /><span>Top tweets</span>{view === 'feed' && <span className="nav-dot" />}</a>
          <a className={view === 'saved' ? 'nav-item active' : 'nav-item'} href="#saved" aria-label={`Saved tweets${saved.length ? `, ${saved.length} saved` : ''}`} aria-current={view === 'saved' ? 'page' : undefined}><Bookmark size={19} /><span>Saved tweets</span>{saved.length > 0 && <span className="saved-count">{saved.length}</span>}</a>
          <button type="button" className="nav-item" aria-label="About the pond" onClick={() => aboutDialog.current?.showModal()}><CircleHelp size={19} /><span>About the pond</span></button>
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-art"><img src="./images/agent-pepe.svg" alt="" width="180" height="106" /><span>A little frog.<br />A lot of intelligence.</span></div>
          <a className="sidebar-external" href="https://imd.fun" target="_blank" rel="noreferrer"><span>Explore IdentityMD</span><ArrowUpRight size={16} /></a>
          <p>Made for the community.<br />Independent. Frog approved.</p>
        </div>
        <a className="mobile-x icon-button" href="https://x.com/search?q=IdentityMD%20OR%20%24IMD&src=typed_query" target="_blank" rel="noreferrer" aria-label="Find IdentityMD on X"><XMark /></a>
      </aside>

      <div className="page">
        <header className="page-header"><div className="breadcrumb"><span>Discover</span><span>/</span><strong>{view === 'saved' ? 'Saved tweets' : 'Top tweets'}</strong></div><a className="header-x" href="https://x.com/search?q=IdentityMD%20OR%20%24IMD&src=typed_query" target="_blank" rel="noreferrer"><XMark size={14} /> Find us on the timeline <ArrowUpRight size={14} /></a></header>
        <main id="main">
          {view === 'feed' ? <section className="hero" aria-labelledby="hero-title">
            <div className="hero-copy"><h1 id="hero-title">The IdentityMD<br /><span>signal.</span></h1><p>Top tweets from the IdentityMD community.</p><a href="#feed" className="button primary">Explore the feed <ArrowDown size={16} /></a></div>
            <img className="hero-art" src="./images/agent-pepe.svg" alt="An AI-equipped Pepe in a field jacket, wearing a headset and holding a neural processor." width="560" height="330" />
          </section> : <section className="saved-heading"><Bookmark size={28} /><div><h1>Saved tweets</h1><p>Your favorite signals, kept in this browser.</p></div></section>}

          <div className="content-layout">
            <section className="feed-section" id="feed" aria-label={view === 'saved' ? 'Saved tweets' : 'IdentityMD tweets'} tabIndex={-1}>
              <div className="feed-heading"><h2>{view === 'saved' ? 'Your collection' : 'From the timeline'}</h2><button type="button" className="snapshot" onClick={() => aboutDialog.current?.showModal()} title="About this snapshot"><span className="snapshot-dot" />2 Nov 2026<Info size={13} /></button></div>
              <div className="feed-tools">
                <div className="search-box"><Search size={17} /><label className="sr-only" htmlFor="tweet-search">Search tweets</label><input id="tweet-search" ref={searchInput} type="search" name="search" autoComplete="off" value={query} placeholder="Search tweets…" onChange={event => { setQuery(event.target.value); setLimit(PAGE_SIZE); }} />{query && <button type="button" className="clear-search" aria-label="Clear search" onClick={() => { setQuery(''); searchInput.current?.focus(); }}><X size={16} /></button>}</div>
                <label className="sort-control"><ArrowDownUp size={15} /><span className="sr-only">Sort tweets</span><select value={sort} onChange={event => { setSort(event.target.value); setLimit(PAGE_SIZE); }}><option value="top">Most liked</option><option value="newest">Newest first</option></select><ChevronDown size={13} /></label>
              </div>
              <div className="filter-row" role="group" aria-label="Filter by topic">{topics.map(item => <button type="button" key={item} onClick={() => filter(item)} aria-pressed={topic === item} className={`filter ${topic === item ? 'selected' : ''}`}>{item === 'All tweets' && <Flame size={14} />}{item === 'All tweets' ? <><span className="all-wide">All tweets</span><span className="all-short">All</span></> : item}</button>)}</div>
              <div className="results-caption" aria-live="polite"><span>{result.length} {result.length === 1 ? 'tweet' : 'tweets'}{query ? ` matching “${query}”` : topic !== 'All tweets' ? ` about ${topic.toLowerCase()}` : ' worth a look'}</span><span>{sort === 'top' ? 'Ranked by snapshot likes' : 'Newest in this snapshot'}</span></div>
              {storageWarning && <p className="storage-warning" role="status">Browser storage is unavailable. Saved tweets will last for this visit.</p>}
              {shown.length ? <div className="post-grid">{shown.map(post => <PostCard key={post.id} post={post} saved={saved.includes(post.id)} onSave={toggleSaved} onCopy={copyPost} />)}</div> : <div className="empty-state">{view === 'saved' && !saved.length ? <><Bookmark size={32} /><h3>Keep the good ones.</h3><p>Save a tweet with its bookmark button.<br />It will be here when you come back.</p><a href="#feed" className="button primary" onClick={navFeed}>Explore tweets <ArrowRight size={16} /></a></> : <><Search size={32} /><h3>No signals found.</h3><p>Try another search or clear your filters.</p><button type="button" className="button secondary" onClick={reset}>Clear filters <X size={16} /></button></>}</div>}
              {result.length > limit && <div className="load-more"><button type="button" className="button secondary" ref={moreButton} onClick={loadMore}>Load {Math.min(PAGE_SIZE, result.length - limit)} more tweets <ArrowDown size={16} /></button><p>A little further down the rabbit hole. Or frog hole.</p></div>}
              {shown.length > 0 && result.length <= limit && <div className="feed-end"><Check size={16} /><span>You’re all caught up with this snapshot.</span></div>}
              <footer className="feed-footer"><span>Good signal travels.</span><a href="https://x.com/intent/tweet?text=Find%20the%20IdentityMD%20signal.%20%24IMD%20https%3A%2F%2Fimd.fun" target="_blank" rel="noreferrer">Join the conversation <ArrowUpRight size={14} /></a></footer>
            </section>

            <aside className="right-rail" aria-label="About the community">
              <section className="welcome-panel"><div className="welcome-symbol"><Radio size={23} /><span>The community frequency</span></div><h2>Welcome to the pond.</h2><p>A corner of the internet where frogs meet AI, ideas become projects, and the community builds together.</p><a className="button secondary" href="https://imd.fun" target="_blank" rel="noreferrer">Meet IdentityMD <ArrowUpRight size={16} /></a><div className="community-stats"><div><strong>{posts.length}</strong><span>Sourced tweets</span></div><div><strong>{authors.length}</strong><span>Community voices</span></div></div></section>
              <section className="topics-panel"><h2>In the conversation</h2><div className="conversation-topics">{(['Building', 'AI agents', 'Community', 'Memes'] as const).map(item => <button type="button" key={item} onClick={() => { filter(item); document.querySelector('#feed')?.scrollIntoView({ block: 'start', behavior: 'instant' }); }}><span><span className="topic-hash">#</span>{item === 'Building' ? 'BuiltOnIMD' : item.replace(' ', '')}</span><span>{posts.filter(post => post.topic === item).length}<ArrowUpRight size={13} /></span></button>)}</div></section>
              <section className="people-panel"><h2>People in the pond</h2>{authors.slice(0, 4).map(author => <a className="person" key={author.handle} href={`https://x.com/${author.handle}`} target="_blank" rel="noreferrer"><img className="avatar" src={author.avatar} alt="" width="34" height="34" loading="lazy" /><span><strong>{author.name}</strong><span className="handle">@{author.handle}</span></span><ArrowUpRight size={15} /></a>)}</section>
              <div className="rail-note"><Leaf size={16} /><p>An independent community feed.<br />A snapshot, never a live firehose.</p></div><button type="button" className="text-button" onClick={() => aboutDialog.current?.showModal()}>How this feed works <ArrowUpRight size={13} /></button>
            </aside>
          </div>
        </main>
      </div>
    </div>
    <div className={`toast ${notice ? 'visible' : ''}`} role="status" aria-live="polite">{notice && <><Check size={17} /><span>{notice}</span></>}</div>
    <dialog ref={aboutDialog} className="dialog" aria-labelledby="about-title" onKeyDown={containDialogFocus} onClick={event => { if (event.target === event.currentTarget) aboutDialog.current?.close(); }}><div className="dialog-header"><img src="./favicon.svg" alt="" width="36" height="36" /><button type="button" className="icon-button" aria-label="Close about the pond" onClick={() => aboutDialog.current?.close()}><X size={20} /></button></div><h2 id="about-title">A little more signal.</h2><p>The Pond is an independent collection of public tweets about IdentityMD, its builders, and its AI agent community.</p><h3>What does “top” mean?</h3><p>“Most liked” ranks these {posts.length} collected posts by the likes captured on <time dateTime={capturedAt}>2 November 2026</time>. Reposts break ties. It is a selected snapshot, not a complete ranking of X. Counts do not update automatically.</p><h3>Follow the source</h3><p>Every tweet links to its original on X. Longer posts show an excerpt. Authors’ claims are their own; inclusion is not an endorsement. Profile labels do not imply an official affiliation.</p><h3>A bookmark stays with you</h3><p>Saved tweets live in this browser’s local storage. Clearing browser data removes them. No account, analytics, or wallet connection is needed.</p><a className="button secondary" href="https://imd.fun" target="_blank" rel="noreferrer">Visit IdentityMD <ArrowUpRight size={16} /></a></dialog>
    <dialog ref={copyDialog} className="dialog copy-dialog" aria-labelledby="copy-title" onKeyDown={containDialogFocus} onClose={() => setCopyFallback('')}><div className="dialog-header"><Copy size={24} /><button type="button" className="icon-button" aria-label="Close copy link" onClick={() => copyDialog.current?.close()}><X size={20} /></button></div><h2 id="copy-title">Copy this tweet link</h2><p>Automatic copying is unavailable. Select the link and copy it with your browser.</p><label className="copy-label">Tweet link<input type="url" readOnly value={copyFallback} onFocus={event => event.target.select()} /></label><button type="button" className="button secondary" onClick={() => copyDialog.current?.querySelector('input')?.select()}>Select link <Copy size={16} /></button></dialog>
  </>;
}
