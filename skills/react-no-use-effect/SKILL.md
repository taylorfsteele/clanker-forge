---
name: react-no-use-effect
description: MUST USE when writing or reviewing React components or hooks that use or reach for useEffect. useEffect is an escape hatch for synchronizing with external systems, not a general-purpose effect tool — prefer deriving during render, event handlers, a data-fetching library, the key prop, or a single-purpose hooks library gook, and reserve useEffect for the genuine external-system cases.
---

# Do Not Use useEffect

**Default stance: Avoid `useEffect` unless truly necessary.**

`useEffect` exists to synchronize with **external systems** — not to "run some code" in response to renders, props, or state. Most `useEffect` in codebases is neither, and each one risks stale closures, missing cleanup, and extra renders.

- **Writing:** exhaust the alternatives below before reaching for the escape hatch.
- **Reviewing:** walk every `useEffect` through sections 1–5. Only an effect that survives all five is a genuine escape hatch (section 6).

React docs: [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)

## 1. Calculate During Render

If you can derive a value from props or state, just calculate it:

```tsx
// BAD: useEffect to sync derived state
const [fullName, setFullName] = useState("");
useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);

// GOOD: Calculate during render
const fullName = `${firstName} ${lastName}`;
```

## 2. Use Event Handlers for User Actions

If code should run because the user did something, put it in the event handler:

```tsx
// BAD: useEffect reacting to state change
useEffect(() => {
  if (isSubmitted) {
    toast.success("Saved!");
  }
}, [isSubmitted]);

// GOOD: In the event handler
const handleSubmit = () => {
  save();
  toast.success("Saved!");
};
```

## 3. Use a Data-Fetching Solution for Data Fetching

Never use `useEffect` for data fetching. Use your project's data-fetching solution instead — a query/cache library (TanStack Query, SWR, RTK Query, Apollo, etc.) for client-side fetching, or your framework's loader/server-side data pattern for SSR.

```tsx
// BAD: useEffect fetch
useEffect(() => {
  fetch("/api/data").then(setData);
}, []);

// GOOD: a query hook from your data-fetching library
const { data } = useQuery({
  queryKey: ["data"],
  queryFn: () => fetch("/api/data").then((r) => r.json()),
});
```

## 4. Encapsulate Necessary Effects in a Single-Purpose Hook

Some patterns genuinely require `useEffect`. When they do, don't inline a raw effect in your component — wrap it in a small, reusable hook that does one task and does it well, guarded against the usual `useEffect` footguns (stale closures, missing cleanup, re-running on every render). The component then calls a well-named hook and never touches `useEffect` directly.

Many of these are well-trodden patterns:

- Storage synced with React state (`localStorage` / `sessionStorage`)
- Run once on mount (cleaner than `useEffect` with `[]`)
- Skip the initial render
- Debouncing / throttling values or callbacks
- Tracking the previous value
- Responsive breakpoints / media queries
- Online/offline network status

Most of these types of single-purpose hooks are available via a React hook library. Check the project for a common hook library like `react-use` or `react-hookz/web` to see what is available in the application and use the applicable single use hook instead of the useEffect. If you need to add one of these, add it as a reusable utility hook in this codebase rather than a one-off effect. For reference on how to build and implement such hooks correctly, see [react-hookz/web](https://github.com/react-hookz/web) — it's a well-built collection to model your hooks after (e.g. `useLocalStorageValue`, `useMountEffect`, `useUpdateEffect`, `useDebounce`, `usePrevious`, `useMediaQuery`, `useNetworkState`).

## 5. Use the `key` Prop to Reset State

Instead of `useEffect` to reset state when props change:

```tsx
// BAD: useEffect to reset
useEffect(() => {
  setComment("");
}, [userId]);

// GOOD: Use key to remount with fresh state
<UserProfile userId={userId} key={userId} />
```

## 6. When useEffect IS the Escape Hatch

Reach for it only to **synchronize with an external system** that none of sections 1–5 covers:

- Connecting to WebSockets, MQTT, or other real-time services
- Browser API subscriptions (resize, intersection) not already in the hooks library
- Integrating non-React libraries (maps, charts) — and even here `useSyncExternalStore` is usually the correct choice

Even then it's an escape hatch, not an inline effect: wrap it in a single-purpose hook per section 4.
