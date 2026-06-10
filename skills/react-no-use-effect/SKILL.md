---
name: react-no-use-effect
description: Avoid useEffect in React. Use when writing or reviewing React components or hooks that reach for useEffect — covers deriving during render, event handlers, data-fetching solutions, react-hookz/web hooks, and the key prop, plus the narrow cases where useEffect is genuinely appropriate (synchronizing with external systems).
---

# Do Not Use useEffect

**Default stance: Avoid `useEffect` unless truly necessary.**

React docs: [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)

Most `useEffect` usage in codebases is unnecessary and creates bugs. Before reaching for `useEffect`, exhaust these alternatives.

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

If you need to add one of these, add it as a reusable utility hook in this codebase rather than a one-off effect. For reference on how to build and implement such hooks correctly, see [react-hookz/web](https://github.com/react-hookz/web) — it's a well-built collection to model your hooks after (e.g. `useLocalStorageValue`, `useMountEffect`, `useUpdateEffect`, `useDebounce`, `usePrevious`, `useMediaQuery`, `useNetworkState`).

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

## When useEffect IS Appropriate

Use `useEffect` for **synchronizing with external systems**:

- Connecting to WebSockets, MQTT, or other real-time services
- Setting up browser API subscriptions (resize, intersection, if they're not present in the hooks library)
- Integrating with non-React libraries (maps, charts, etc.), and even then `useSyncExternalStore` is usually the correct choice.

Even then, wrap the effect in a single-purpose, reusable hook (see section 4) rather than inlining it — and look at how [react-hookz/web](https://github.com/react-hookz/web) implements the equivalent before building your own.
