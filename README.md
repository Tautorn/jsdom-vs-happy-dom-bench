# jsdom vs happy-dom bench

A simple benchmark of **jsdom** and **happy-dom** as the test environment for **Vitest**, using real React components and Testing Library.

This is the code behind the article [jsdom or happy-dom? Pros, cons and a benchmark you can reproduce](https://www.tautorn.com.br/en/blog/jsdom-vs-happy-dom) (also available [in Portuguese](https://www.tautorn.com.br/blog/jsdom-vs-happy-dom)).

## How to run

Requires Node 22.22+, 24.15+ or 26+.

```bash
npm install
npm run bench
```

The script generates 30 copies of the suite (240 tests), runs everything on jsdom and on happy-dom, under two Vitest configurations, 5 times each, and prints the median:

```text
Median (seconds):
┌─────────────────────────┬───────┬───────────┬───────────────────┐
│ (index)                 │ jsdom │ happy-dom │ jsdom / happy-dom │
├─────────────────────────┼───────┼───────────┼───────────────────┤
│ default (isolate: true) │ 71.89 │ 44.38     │ 1.62              │
│ isolate: false          │ 28.52 │ 18.86     │ 1.51              │
└─────────────────────────┴───────┴───────────┴───────────────────┘
```

Results from the article: 2 vCPUs (Intel Xeon 2.1 GHz), 8 GB of RAM, Linux, Node 22. Your absolute numbers will differ; what matters is the ratio.

It takes a few minutes. For a quick check, reduce the files and runs:

```bash
FILES=5 RUNS=1 npm run bench
```

### Compatibility check

Checks 20 browser APIs and behaviors in both environments (`innerText`, `matchMedia`, `dialog.showModal()`, form validation, etc.):

```bash
npm run compat
```

## What's inside

| File | What it is |
| --- | --- |
| `src/components.jsx` | 5 React components: login form with validation, to-do list, 300-row table, modal and tabs |
| `tests/suite.template.jsx` | 8 tests using Testing Library and `user-event` |
| `tests/setup.js` | `jest-dom` setup and `cleanup` |
| `bench.mjs` | generates the suite copies, runs both environments and computes the median |
| `compat.mjs` | compatibility checks |

The UI text in the components and tests is in Portuguese, to match the examples in the article.

## Versions

| Package | Version |
| --- | --- |
| jsdom | 30.1.1 |
| happy-dom | 20.14.5 |
| Vitest | 5.0.3 |
| React | 19.3.0 |
| @testing-library/react | 16.3.3 |

Versions are pinned in `package.json` so results are comparable. To try newer versions, update them and run it again.

## License

[MIT](LICENSE)
