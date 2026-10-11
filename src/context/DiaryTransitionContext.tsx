import { useRouter } from "expo-router";
import { createContext, ReactNode, useCallback, useContext, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "react-native-reanimated";
import DiaryOpenOverlay from "../components/DiaryOpenOverlay";
import type { Diary } from "../types/diary";

type Box = { x: number; y: number; width: number; height: number };
export type CardRect = Box & { title: Box };
type Active = { mode: "open" | "close"; diary: Diary; origin: CardRect };
type Ctx = {
  activeId: number | null;
  closing: boolean;
  open: (diary: Diary, origin: CardRect) => void;
  close: (diary: Diary) => void;
  reportFirst: (rect: CardRect) => void;
  reportReady: () => void;
};

const DiaryTransitionContext = createContext<Ctx>({
  activeId: null, closing: false, open: () => {}, close: () => {}, reportFirst: () => {}, reportReady: () => {},
});
export const useDiaryTransition = () => useContext(DiaryTransitionContext);

export function DiaryTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState<Active | null>(null);
  const [ready, setReady] = useState(false);
  const busy = useRef(false);
  const firstSlot = useRef<CardRect | null>(null);

  const open = useCallback(
    (diary: Diary, origin: CardRect) => {
      if (busy.current) return;
      if (reduceMotion) return router.replace(`/(app)/diary/${diary.id}`);
      busy.current = true;
      setReady(false);
      setActive({ mode: "open", diary, origin });
    },
    [reduceMotion, router],
  );

  const close = useCallback(
    (diary: Diary) => {
      if (busy.current) return;
      const origin = firstSlot.current;
      // no cached slot (e.g. app resumed straight into a diary): plain navigation
      if (reduceMotion || !origin) return router.replace("/(app)");
      busy.current = true;
      setActive({ mode: "close", diary, origin });
    },
    [reduceMotion, router],
  );

  const reportFirst = useCallback((r: CardRect) => {
    firstSlot.current = r;
  }, []);
  const reportReady = useCallback(() => setReady(true), []);
  const finish = useCallback(() => {
    busy.current = false;
    setActive(null);
  }, []);

  const value = useMemo(
    () => ({ activeId: active?.diary.id ?? null, closing: active?.mode === "close", open, close, reportFirst, reportReady }),
    [active, open, close, reportFirst, reportReady],
  );

  return (
    <DiaryTransitionContext.Provider value={value}>
      {children}
      {active && (
        <DiaryOpenOverlay
          mode={active.mode}
          diary={active.diary}
          origin={active.origin}
          ready={ready}
          onMid={() =>
            router.replace(active.mode === "open" ? `/(app)/diary/${active.diary.id}` : "/(app)")
          }
          onDone={finish}
        />
      )}
    </DiaryTransitionContext.Provider>
  );
}