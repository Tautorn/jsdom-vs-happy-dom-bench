// Generates N copies of the suite, runs it on jsdom and happy-dom and prints the median.
// Usage: npm run bench   (optional env vars: FILES=30 RUNS=5)
import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync, copyFileSync } from 'node:fs'

const FILES = Number(process.env.FILES ?? 30)
const RUNS = Number(process.env.RUNS ?? 5)
const ENVS = ['jsdom', 'happy-dom']
const CONFIGS = { 'default (isolate: true)': [], 'isolate: false': ['--no-isolate'] }

rmSync('tests/generated', { recursive: true, force: true })
mkdirSync('tests/generated', { recursive: true })
for (let i = 1; i <= FILES; i++) {
  copyFileSync('tests/suite.template.jsx', `tests/generated/suite-${String(i).padStart(2, '0')}.test.jsx`)
}

const median = (a) => { const s = [...a].sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2 }
const results = {}

console.log(`${FILES} files, ${FILES * 8} tests, ${RUNS} runs per combination\n`)
for (let r = 0; r < RUNS; r++) {
  for (const [cfg, extra] of Object.entries(CONFIGS)) {
    const order = r % 2 ? [...ENVS].reverse() : ENVS // alternate the order every round
    for (const env of order) {
      let out = ''
      try {
        out = execFileSync('npx', ['vitest', 'run', '--environment', env, ...extra], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
      } catch (e) {
        console.error(`Failed: ${env} / ${cfg}\n${e.stdout ?? ''}${e.stderr ?? ''}`)
        process.exit(1)
      }
      const seconds = Number(out.match(/Duration\s+([\d.]+)s/)?.[1])
      ;(results[cfg] ??= {})[env] ??= []
      results[cfg][env].push(seconds)
      console.log(`run ${r + 1}  ${cfg.padEnd(24)} ${env.padEnd(10)} ${seconds.toFixed(2)}s`)
    }
  }
}

console.log('\nMedian (seconds):')
console.table(Object.fromEntries(Object.entries(results).map(([cfg, v]) => [cfg, {
  jsdom: median(v.jsdom),
  'happy-dom': median(v['happy-dom']),
  'jsdom / happy-dom': +(median(v.jsdom) / median(v['happy-dom'])).toFixed(2),
}])))
