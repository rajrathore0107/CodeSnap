import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSharedSnippet } from '../api';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

function ShareView() {
  const { shareId } = useParams();
  const [snippet, setSnippet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await getSharedSnippet(shareId);
        setSnippet(res.data);
      } catch (err) {
        setError('Snippet not found or is private');
      }
      setLoading(false);
    }
    load();
  }, [shareId]);

  useEffect(() => {
    if (snippet) {
      document.querySelectorAll('pre code').forEach(block => {
        hljs.highlightElement(block);
      });
    }
  }, [snippet]);

  if (loading) return (
    <div style={styles.center}>Loading snippet...</div>
  );

  if (error) return (
    <div style={styles.center}>
      <p style={{ color: '#f85149' }}>{error}</p>
      <Link to="/explore" style={styles.link}>Browse public snippets</Link>
    </div>
  );

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <Link to="/explore" style={styles.logo}>CodeSnap</Link>
        <Link to="/login" style={styles.loginBtn}>Sign In</Link>
      </header>

      <div style={styles.content}>
        <div style={styles.meta}>
          <h1 style={styles.title}>{snippet.title}</h1>
          {snippet.description && (
            <p style={styles.desc}>{snippet.description}</p>
          )}
          <div style={styles.tags}>
            <span style={styles.langTag}>{snippet.language}</span>
            {snippet.tags.map(tag => (
              <span key={tag} style={styles.tag}>#{tag}</span>
            ))}
          </div>
          <p style={styles.author}>by {snippet.user?.name}</p>
        </div>

        <div style={styles.codeBlock}>
          <pre style={styles.pre}>
            <code className={`language-${snippet.language}`}>
              {snippet.code}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#0d1117' },
  center: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    color: '#8b949e',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 32px',
    borderBottom: '1px solid #30363d',
    background: '#161b22',
  },
  logo: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#58a6ff',
  },
  loginBtn: {
    background: '#238636',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
  },
  content: {
    maxWidth: '900px',
    margin: '40px auto',
    padding: '0 24px',
  },
  meta: { marginBottom: '24px' },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#e6edf3',
    marginBottom: '8px',
  },
  desc: {
    fontSize: '15px',
    color: '#8b949e',
    marginBottom: '12px',
  },
  tags: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '8px',
  },
  langTag: {
    background: '#1f6feb33',
    color: '#58a6ff',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },
  tag: {
    background: '#30363d',
    color: '#8b949e',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
  },
  author: {
    fontSize: '13px',
    color: '#6e7681',
  },
  codeBlock: {
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid #30363d',
  },
  pre: { margin: 0, padding: '24px', overflowX: 'auto' },
  link: { color: '#58a6ff' },
};

export default ShareView;