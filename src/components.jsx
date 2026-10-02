import { useState, useMemo, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

export function LoginForm({ onSubmit }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  function handle(e) {
    e.preventDefault()
    if (!email.includes('@')) return setError('E-mail inválido')
    if (password.length < 8) return setError('Senha muito curta')
    setError('')
    onSubmit({ email, password })
  }
  return (
    <form onSubmit={handle} aria-label="login" noValidate>
      <label htmlFor="email">E-mail</label>
      <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <label htmlFor="password">Senha</label>
      <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && <p role="alert">{error}</p>}
      <button type="submit">Entrar</button>
    </form>
  )
}

export function TodoList({ initial = [] }) {
  const [items, setItems] = useState(initial)
  const [text, setText] = useState('')
  const [filter, setFilter] = useState('all')
  const visible = items.filter((i) => filter === 'all' || (filter === 'done' ? i.done : !i.done))
  return (
    <div>
      <input aria-label="nova tarefa" value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={() => { if (text) { setItems([...items, { id: Date.now() + Math.random(), text, done: false }]); setText('') } }}>Adicionar</button>
      <div role="group" aria-label="filtros">
        {['all', 'open', 'done'].map((f) => <button key={f} aria-pressed={filter === f} onClick={() => setFilter(f)}>{f}</button>)}
      </div>
      <ul>
        {visible.map((i) => (
          <li key={i.id}>
            <label><input type="checkbox" checked={i.done} onChange={() => setItems(items.map((x) => x.id === i.id ? { ...x, done: !x.done } : x))} />{i.text}</label>
            <button aria-label={`remover ${i.text}`} onClick={() => setItems(items.filter((x) => x.id !== i.id))}>x</button>
          </li>
        ))}
      </ul>
      <p>{items.filter((i) => !i.done).length} pendentes</p>
    </div>
  )
}

export function DataTable({ rows }) {
  const [sort, setSort] = useState({ key: 'name', dir: 1 })
  const [q, setQ] = useState('')
  const data = useMemo(() => rows
    .filter((r) => r.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (a[sort.key] > b[sort.key] ? 1 : -1) * sort.dir), [rows, sort, q])
  const th = (key, label) => (
    <th><button onClick={() => setSort((s) => ({ key, dir: s.key === key ? -s.dir : 1 }))}>{label}</button></th>
  )
  return (
    <div>
      <input aria-label="buscar" value={q} onChange={(e) => setQ(e.target.value)} />
      <table>
        <thead><tr>{th('name', 'Nome')}{th('age', 'Idade')}{th('city', 'Cidade')}</tr></thead>
        <tbody>{data.map((r) => <tr key={r.id}><td>{r.name}</td><td>{r.age}</td><td>{r.city}</td></tr>)}</tbody>
      </table>
      <p>{data.length} resultados</p>
    </div>
  )
}

export function Modal({ title, children }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    ref.current?.focus()
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])
  return (
    <>
      <button onClick={() => setOpen(true)}>Abrir</button>
      {open && createPortal(
        <div role="dialog" aria-modal="true" aria-labelledby="mt">
          <h2 id="mt">{title}</h2>
          <div>{children}</div>
          <button ref={ref} onClick={() => setOpen(false)}>Fechar</button>
        </div>, document.body)}
    </>
  )
}

export function Tabs({ tabs }) {
  const [active, setActive] = useState(0)
  const refs = useRef([])
  function onKeyDown(e) {
    const n = tabs.length
    const next = e.key === 'ArrowRight' ? (active + 1) % n : e.key === 'ArrowLeft' ? (active - 1 + n) % n : active
    if (next !== active) { setActive(next); refs.current[next]?.focus() }
  }
  return (
    <div>
      <div role="tablist" onKeyDown={onKeyDown}>
        {tabs.map((t, i) => (
          <button key={t.label} role="tab" ref={(el) => (refs.current[i] = el)} aria-selected={i === active} tabIndex={i === active ? 0 : -1} onClick={() => setActive(i)}>{t.label}</button>
        ))}
      </div>
      <div role="tabpanel">{tabs[active].content}</div>
    </div>
  )
}
