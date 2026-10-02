// Runs the same list of checks on jsdom and happy-dom
import { JSDOM } from 'jsdom'
import { Window } from 'happy-dom'

const html = `<!doctype html><html><head><style>
  .box { color: rgb(255, 0, 0); display: none; }
  #p > .c:has(span) { color: rgb(0, 0, 255); }
</style></head><body>
<form id="f"><input id="email" type="email" required value="bruno"><input id="num" type="number" value="42"><button id="b">ok</button></form>
<div class="box" id="box">oi</div>
<div id="p"><div class="c" id="c"><span>x</span></div></div>
<p id="t">Hello <span style="display:none">hidden</span>world</p>
<label for="lbl">Nome</label><input id="lbl">
<dialog id="d"><p>modal</p></dialog>
</body></html>`

function make(kind) {
  if (kind === 'jsdom') { const d = new JSDOM(html, { pretendToBeVisual: true }); return d.window }
  const w = new Window(); w.document.write(html); return w
}

const checks = {
  'getComputedStyle reads CSS from <style>': (w) => w.getComputedStyle(w.document.getElementById('box')).color === 'rgb(255, 0, 0)',
  'getComputedStyle display:none': (w) => w.getComputedStyle(w.document.getElementById('box')).display === 'none',
  ':has() selector': (w) => w.document.querySelector('#p > .c:has(span)')?.id === 'c',
  'checkValidity() on invalid email': (w) => w.document.getElementById('email').checkValidity() === false,
  'validity.typeMismatch': (w) => w.document.getElementById('email').validity.typeMismatch === true,
  'submit blocked by invalid field': (w) => { let fired = false; const f = w.document.getElementById('f'); f.addEventListener('submit', (e) => { fired = true; e.preventDefault() }); w.document.getElementById('b').click(); return fired === false },
  'valueAsNumber on type=number': (w) => w.document.getElementById('num').valueAsNumber === 42,
  'innerText skips display:none': (w) => w.document.getElementById('t').innerText.replace(/\s+/g, ' ').trim() === 'Hello world',
  'clicking a label focuses the input': (w) => { w.document.querySelector('label').click(); return w.document.activeElement?.id === 'lbl' },
  'dialog.showModal()': (w) => { const d = w.document.getElementById('d'); if (typeof d.showModal !== 'function') return false; d.showModal(); return d.open === true },
  'getBoundingClientRect with real size': (w) => w.document.getElementById('box').getBoundingClientRect().width > 0,
  'matchMedia exists': (w) => typeof w.matchMedia === 'function',
  'ResizeObserver exists': (w) => typeof w.ResizeObserver === 'function',
  'IntersectionObserver exists': (w) => typeof w.IntersectionObserver === 'function',
  'customElements + shadowRoot': (w) => { class X extends w.HTMLElement { connectedCallback() { this.attachShadow({ mode: 'open' }).innerHTML = '<b>s</b>' } } w.customElements.define('x-el', X); const e = w.document.createElement('x-el'); w.document.body.appendChild(e); return e.shadowRoot?.querySelector('b')?.textContent === 's' },
  'MutationObserver fires': async (w) => { let n = 0; const mo = new w.MutationObserver(() => n++); mo.observe(w.document.body, { childList: true }); w.document.body.appendChild(w.document.createElement('i')); await new Promise((r) => setTimeout(r, 20)); return n > 0 },
  'element.animate exists': (w) => typeof w.document.body.animate === 'function',
  'Range/Selection': (w) => { const r = w.document.createRange(); r.selectNodeContents(w.document.getElementById('t')); w.getSelection().addRange(r); return w.getSelection().toString().includes('Hello') },
  'navigator.clipboard exists': (w) => !!w.navigator.clipboard,
  'scrollIntoView exists': (w) => typeof w.document.body.scrollIntoView === 'function',
  'HTMLCanvasElement.getContext works': (w) => { try { return !!w.document.createElement('canvas').getContext('2d') } catch { return false } },
  'fetch on window': (w) => typeof w.fetch === 'function',
}

const results = {}
for (const kind of ['jsdom', 'happy-dom']) {
  results[kind] = {}
  for (const [name, fn] of Object.entries(checks)) {
    const w = make(kind)
    const orig = console.error; console.error = () => {}
    try { results[kind][name] = !!(await fn(w)) } catch (e) { results[kind][name] = 'error: ' + e.message.slice(0, 60) }
    console.error = orig
    try { w.close?.(); await w.happyDOM?.abort?.() } catch {}
  }
}
const pad = (s, n) => String(s).padEnd(n)
console.log(pad('check', 42), pad('jsdom', 10), 'happy-dom')
for (const name of Object.keys(checks)) console.log(pad(name, 42), pad(results.jsdom[name], 10), results['happy-dom'][name])
process.exit(0)
