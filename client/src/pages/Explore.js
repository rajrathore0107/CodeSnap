import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPublicSnippets } from '../api';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

const LANGUAGES = [
  'all', 'javascript', 'python', 'java', 'cpp',
  'css', 'html', 'typescript', 'go', 'rust',
];

function Explore() {
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [language, setLanguage] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    loadSnippets();
  }, [language, page]);

  async function loadSnippets(searchTerm = search) {
    setLoading(true);
    try {
      const params = { page };
      if (language) params.language = language;
      if (searchTerm) params.search = searchTerm;

      const res = await getPublicSnippets(params);
      setSnippets(res.data.snippets);
      setTotalPages(res.data.pages);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  function handleSearch(e) {
    e.preventDefault();
    setPage(1);
    loadSnippets(search);
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.logo}>CodeSnap</h1>
          <span style={styles.headerSub}>Explore public snippets</span>
        </div>
        <div style={styles.headerRight}>
          {user ? (
            <>
              <Link to="/dashboard" style={styles.dashBtn}>My Snippets</Link>
              <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.dashBtn}>Sign In</Link>
              <Link to="/register" style={styles.createBtn}>Get Started</Link>
            </>
          )}
        </div>
      </header>

      <div style={styles.content}>
        <form onSubmit={handleSearch} style={styles.searchRow}>
          <input
            type="text"
            placeholder="Search snippets..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={styles.searchInput}
          />
          <button type="submit" style={styles.searchBtn}>Search</button>
        </form>

        <div style={styles.filters}>
          {LANGUAGES.map(lang => (
            <button
              key={lang}
              onClick={() => { setLanguage(lang === 'all' ? '' : lang); setPage(1); }}
              style={{
                ...styles.filterBtn,
                ...(language === (lang === 'all' ? '' : lang) ? styles.filterActive : {}),
              }}
            >
              {lang}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={styles.center}>Loading snippets...</div>
        ) : snippets.length === 0 ? (
          <div style={styles.center}>No snippets found</div>
        ) : (
          <div style={styles.grid}>
            {snippets.map(snippet => (
              <SnippetCard key={snippet.id} snippet={snippet} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div style={styles.pagination}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={styles.pageBtn}
            >
              Previous
            </button>
            <span style={styles.pageInfo}>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={styles.pageBtn}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SnippetCard({ snippet }) {
  const preview = snippet.code.slice(0, 200);

  useEffect(() => {
    document.querySelectorAll('pre code').forEach(block => {
      if (!block.dataset.highlighted) {
        hljs.highlightElement(block);
      }
    });
  }, []);

  return (
    <Link to={`/share/${snippet.shareId}`} style={styles.card}>
      <div style={styles.cardHeader}>
        <h3 style={styles.cardTitle}>{snippet.title}</h3>
        <span style={styles.langBadge}>{snippet.language}</span>
      </div>
      {snippet.description && (
        <p style={styles.cardDesc}>{snippet.description}</p>
      )}
      <div style={styles.codePreview}>
        <pre style={styles.pre}>
          <code className={`language-${snippet.language}`}>
            {preview}{snippet.code.length > 200 ? '...' : ''}
          </code>
        </pre>
      </div>
      <div style={styles.cardFooter}>
        <span style={styles.author}>by {snippet.user?.name}</span>
        <div style={styles.tags}>
          {snippet.tags.slice(0, 3).map(tag => (
            <span key={tag} style={styles.tag}>#{tag}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#0d1117' },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 32px',
    borderBottom: '1px solid #30363d',
    background: '#161b22',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '16px' },
  logo: { fontSize: '20px', fontWeight: '700', color: '#58a6ff' },
  headerSub: { fontSize: '14px', color: '#6e7681' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '10px' },
  dashBtn: {
    background: 'transparent',
    color: '#e6edf3',
    border: '1px solid #30363d',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
  },
  createBtn: {
    background: '#238636',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
  },
  logoutBtn: {
    background: 'transparent',
    color: '#8b949e',
    border: '1px solid #30363d',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
  },
  content: { maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' },
  searchRow: { display: 'flex', gap: '12px', marginBottom: '20px' },
  searchInput: {
    flex: 1,
    background: '#161b22',
    border: '1px solid #30363d',
    borderRadius: '8px',
    padding: '10px 16px',
    color: '#e6edf3',
    fontSize: '15px',
    outline: 'none',
  },
  searchBtn: {
    background: '#1f6feb',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 24px',
    fontSize: '14px',
    fontWeight: '600',
  },
  filters: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' },
  filterBtn: {
    background: '#161b22',
    color: '#8b949e',
    border: '1px solid #30363d',
    borderRadius: '20px',
    padding: '6px 14px',
    fontSize: '13px',
  },
  filterActive: {
    background: '#1f6feb22',
    color: '#58a6ff',
    borderColor: '#1f6feb',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '20px',
  },
  card: {
    background: '#161b22',
    border: '1px solid #30363d',
    borderRadius: '12px',
    padding: '20px',
    display: 'block',
    transition: 'border-color 0.2s',
    cursor: 'pointer',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px',
  },
  cardTitle: { fontSize: '15px', fontWeight: '600', color: '#e6edf3' },
  langBadge: {
    background: '#1f6feb22',
    color: '#58a6ff',
    padding: '3px 8px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600',
    flexShrink: 0,
  },
  cardDesc: {
    fontSize: '13px',
    color: '#8b949e',
    marginBottom: '12px',
    lineHeight: '1.5',
  },
  codePreview: {
    borderRadius: '8px',
    overflow: 'hidden',
    marginBottom: '12px',
    border: '1px solid #21262d',
    maxHeight: '120px',
    overflow: 'hidden',
  },
  pre: { margin: 0, padding: '12px', fontSize: '12px', overflowX: 'auto' },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  author: { fontSize: '12px', color: '#6e7681' },
  tags: { display: 'flex', gap: '6px' },
  tag: {
    background: '#21262d',
    color: '#8b949e',
    padding: '2px 8px',
    borderRadius: '20px',
    fontSize: '11px',
  },
  center: {
    textAlign: 'center',
    padding: '60px',
    color: '#8b949e',
    fontSize: '15px',
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    marginTop: '40px',
  },
  pageBtn: {
    background: '#161b22',
    color: '#e6edf3',
    border: '1px solid #30363d',
    borderRadius: '8px',
    padding: '8px 20px',
    fontSize: '14px',
  },
  pageInfo: { color: '#8b949e', fontSize: '14px' },
};

export default Explore;