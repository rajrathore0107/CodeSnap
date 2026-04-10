import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getMySnippets, createSnippet,
  deleteSnippet, updateSnippet
} from '../api';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

const LANGUAGES = [
  'javascript', 'python', 'java', 'cpp', 'css',
  'html', 'typescript', 'go', 'rust', 'sql',
];

const EMPTY_FORM = {
  title: '', description: '', code: '',
  language: 'javascript', tags: '', isPublic: false,
};

function Dashboard() {
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [copied, setCopied] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadSnippets();
  }, []);

  useEffect(() => {
    document.querySelectorAll('pre code').forEach(block => {
      if (!block.dataset.highlighted) {
        hljs.highlightElement(block);
      }
    });
  }, [snippets]);

  async function loadSnippets() {
    try {
      const res = await getMySnippets();
      setSnippets(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const data = {
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    };

    try {
      if (editId) {
        const res = await updateSnippet(editId, data);
        setSnippets(snippets.map(s => s.id === editId ? res.data : s));
        setEditId(null);
      } else {
        const res = await createSnippet(data);
        setSnippets([res.data, ...snippets]);
      }
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this snippet?')) return;
    try {
      await deleteSnippet(id);
      setSnippets(snippets.filter(s => s.id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  function handleEdit(snippet) {
    setForm({
      title: snippet.title,
      description: snippet.description || '',
      code: snippet.code,
      language: snippet.language,
      tags: snippet.tags.join(', '),
      isPublic: snippet.isPublic,
    });
    setEditId(snippet.id);
    setShowForm(true);
  }

  function copyShareLink(shareId) {
    const url = `${window.location.origin}/share/${shareId}`;
    navigator.clipboard.writeText(url);
    setCopied(shareId);
    setTimeout(() => setCopied(''), 2000);
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
          <span style={styles.headerSub}>{user.name}'s snippets</span>
        </div>
        <div style={styles.headerRight}>
          <Link to="/explore" style={styles.exploreBtn}>Explore</Link>
          <button
            onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_FORM); }}
            style={styles.createBtn}
          >
            + New Snippet
          </button>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </header>

      {showForm && (
        <div style={styles.overlay} onClick={() => setShowForm(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>
              {editId ? 'Edit Snippet' : 'New Snippet'}
            </h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.row}>
                <div style={{ ...styles.group, flex: 2 }}>
                  <label style={styles.label}>Title *</label>
                  <input
                    type="text"
                    placeholder="My awesome snippet"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    style={styles.input}
                    required
                  />
                </div>
                <div style={{ ...styles.group, flex: 1 }}>
                  <label style={styles.label}>Language *</label>
                  <select
                    value={form.language}
                    onChange={e => setForm({ ...form, language: e.target.value })}
                    style={styles.input}
                  >
                    {LANGUAGES.map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={styles.group}>
                <label style={styles.label}>Description</label>
                <input
                  type="text"
                  placeholder="What does this snippet do?"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.group}>
                <label style={styles.label}>Code *</label>
                <textarea
                  placeholder="Paste your code here..."
                  value={form.code}
                  onChange={e => setForm({ ...form, code: e.target.value })}
                  style={styles.textarea}
                  required
                />
              </div>

              <div style={styles.group}>
                <label style={styles.label}>Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="react, hooks, useState"
                  value={form.tags}
                  onChange={e => setForm({ ...form, tags: e.target.value })}
                  style={styles.input}
                />
              </div>

              <label style={styles.checkLabel}>
                <input
                  type="checkbox"
                  checked={form.isPublic}
                  onChange={e => setForm({ ...form, isPublic: e.target.checked })}
                />
                <span style={{ marginLeft: '8px' }}>Make public (shareable)</span>
              </label>

              <div style={styles.modalBtns}>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.submitBtn}>
                  {editId ? 'Update Snippet' : 'Save Snippet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={styles.content}>
        {loading ? (
          <div style={styles.center}>Loading your snippets...</div>
        ) : snippets.length === 0 ? (
          <div style={styles.empty}>
            <p style={styles.emptyText}>No snippets yet</p>
            <button
              onClick={() => setShowForm(true)}
              style={styles.createBtn}
            >
              Create your first snippet
            </button>
          </div>
        ) : (
          <div style={styles.list}>
            {snippets.map(snippet => (
              <div key={snippet.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={styles.cardTitleRow}>
                    <h3 style={styles.cardTitle}>{snippet.title}</h3>
                    <div style={styles.badges}>
                      <span style={styles.langBadge}>{snippet.language}</span>
                      {snippet.isPublic && (
                        <span style={styles.publicBadge}>Public</span>
                      )}
                    </div>
                  </div>
                  <div style={styles.cardActions}>
                    {snippet.isPublic && (
                      <button
                        onClick={() => copyShareLink(snippet.shareId)}
                        style={styles.actionBtn}
                      >
                        {copied === snippet.shareId ? 'Copied!' : 'Copy Link'}
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(snippet)}
                      style={styles.actionBtn}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(snippet.id)}
                      style={{ ...styles.actionBtn, color: '#f85149' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {snippet.description && (
                  <p style={styles.cardDesc}>{snippet.description}</p>
                )}

                <div style={styles.codeBlock}>
                  <pre style={styles.pre}>
                    <code className={`language-${snippet.language}`}>
                      {snippet.code}
                    </code>
                  </pre>
                </div>

                {snippet.tags.length > 0 && (
                  <div style={styles.tagRow}>
                    {snippet.tags.map(tag => (
                      <span key={tag} style={styles.tag}>#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
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
  exploreBtn: {
    background: 'transparent',
    color: '#e6edf3',
    border: '1px solid #30363d',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
  },
  createBtn: {
    background: '#238636',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
  },
  logoutBtn: {
    background: 'transparent',
    color: '#8b949e',
    border: '1px solid #30363d',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
  },
  content: { maxWidth: '900px', margin: '0 auto', padding: '32px 24px' },
  center: { textAlign: 'center', padding: '60px', color: '#8b949e' },
  empty: {
    textAlign: 'center',
    padding: '80px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  emptyText: { fontSize: '18px', color: '#8b949e' },
  list: { display: 'flex', flexDirection: 'column', gap: '20px' },
  card: {
    background: '#161b22',
    border: '1px solid #30363d',
    borderRadius: '12px',
    padding: '20px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '10px',
    gap: '12px',
  },
  cardTitleRow: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
  cardTitle: { fontSize: '16px', fontWeight: '600', color: '#e6edf3' },
  badges: { display: 'flex', gap: '6px' },
  langBadge: {
    background: '#1f6feb22',
    color: '#58a6ff',
    padding: '3px 8px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600',
  },
  publicBadge: {
    background: '#23863622',
    color: '#3fb950',
    padding: '3px 8px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600',
  },
  cardActions: { display: 'flex', gap: '8px', flexShrink: 0 },
  actionBtn: {
    background: 'transparent',
    color: '#8b949e',
    border: '1px solid #30363d',
    borderRadius: '6px',
    padding: '5px 12px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  cardDesc: {
    fontSize: '13px',
    color: '#8b949e',
    marginBottom: '12px',
  },
  codeBlock: {
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #21262d',
    marginBottom: '12px',
    maxHeight: '300px',
    overflowY: 'auto',
  },
  pre: { margin: 0, padding: '16px', fontSize: '13px' },
  tagRow: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  tag: {
    background: '#21262d',
    color: '#8b949e',
    padding: '3px 8px',
    borderRadius: '20px',
    fontSize: '11px',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    padding: '20px',
  },
  modal: {
    background: '#161b22',
    border: '1px solid #30363d',
    borderRadius: '16px',
    padding: '32px',
    width: '100%',
    maxWidth: '680px',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#e6edf3',
    marginBottom: '24px',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  row: { display: 'flex', gap: '12px' },
  group: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '500', color: '#cdd9e5' },
  input: {
    background: '#0d1117',
    border: '1px solid #30363d',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#e6edf3',
    fontSize: '14px',
    outline: 'none',
  },
  textarea: {
    background: '#0d1117',
    border: '1px solid #30363d',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#e6edf3',
    fontSize: '13px',
    outline: 'none',
    minHeight: '200px',
    resize: 'vertical',
    fontFamily: 'Fira Code, monospace',
  },
  checkLabel: {
    display: 'flex',
    alignItems: 'center',
    color: '#cdd9e5',
    fontSize: '14px',
    cursor: 'pointer',
  },
  modalBtns: { display: 'flex', gap: '10px', marginTop: '8px' },
  cancelBtn: {
    flex: 1,
    padding: '11px',
    borderRadius: '8px',
    border: '1px solid #30363d',
    background: 'transparent',
    color: '#8b949e',
    fontSize: '14px',
    cursor: 'pointer',
  },
  submitBtn: {
    flex: 1,
    padding: '11px',
    borderRadius: '8px',
    border: 'none',
    background: '#238636',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

export default Dashboard;