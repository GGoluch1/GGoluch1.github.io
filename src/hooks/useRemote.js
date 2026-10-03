import { useEffect, useState } from "react";
import { useLatest } from "./useLatest";

// Runs one of the async loaders in src/lib/remote.js and returns its result:
// null while loading, when switched off, or if the request fails.
// It loads again whenever `key` changes.
export function useRemote(load, key) {
  const [data, setData] = useState(null);
  const loadRef = useLatest(load);

  useEffect(() => {
    let live = true;
    loadRef
      .current()
      .then((value) => live && setData(value))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [key, loadRef]);

  return data;
}
