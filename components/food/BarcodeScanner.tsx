"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Barcode,
  Camera,
  Flashlight,
  FlashlightOff,
  History,
  Keyboard,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  DEMO_BARCODES,
  lookupBarcode,
  loadScanHistory,
  normalizeBarcode,
  pushScanHistory,
  scaleFood,
  searchBarcodeCatalog,
  type BarcodeProduct,
  type ScanHistoryEntry,
} from "@/lib/mock/barcodeDatabase";
import {
  createBarcodeDetector,
  detectFromVideo,
  supportsBarcodeDetector,
} from "@/lib/barcode/detector";
import type { FoodItem } from "@/lib/types";
import { useToast } from "@/components/providers/ToastProvider";
import { useAppTranslation } from "@/components/providers/LanguageProvider";

type MealType = "breakfast" | "lunch" | "dinner" | "snack";
type ScannerMode = "camera" | "manual" | "history";
type ScannerPhase = "scanning" | "looking-up" | "result" | "not-found";

interface BarcodeScannerProps {
  open: boolean;
  isPro: boolean;
  mealType: MealType;
  remainingCalories: number;
  onClose: () => void;
  onLog: (food: FoodItem, mealType: MealType) => void;
  /** Persist meal choice so parent defaults survive reopen */
  onMealTypeChange?: (mealType: MealType) => void;
}

const SERVING_OPTIONS = [0.5, 1, 1.5, 2, 3];

export function BarcodeScanner({
  open,
  isPro,
  mealType: initialMealType,
  remainingCalories,
  onClose,
  onLog,
  onMealTypeChange,
}: BarcodeScannerProps) {
  const { toast } = useToast();
  const { t } = useAppTranslation(["food", "common"]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastScanRef = useRef<string>("");
  const cooldownRef = useRef<number>(0);
  const phaseRef = useRef<ScannerPhase>("scanning");
  const handleDetectedRef = useRef<(raw: string) => Promise<void>>(async () => undefined);

  const [mode, setMode] = useState<ScannerMode>("camera");
  const [phase, setPhase] = useState<ScannerPhase>("scanning");
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [detectorReady, setDetectorReady] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [product, setProduct] = useState<BarcodeProduct | null>(null);
  const [scannedCode, setScannedCode] = useState("");
  const [servings, setServings] = useState(1);
  const [mealType, setMealType] = useState<MealType>(initialMealType);
  const [history, setHistory] = useState<ScanHistoryEntry[]>([]);
  const [catalogQuery, setCatalogQuery] = useState("");

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const stopCamera = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const handleDetectedCode = useCallback(
    async (raw: string) => {
      const code = normalizeBarcode(raw);
      if (!code || code.length < 6) return;
      const now = Date.now();
      if (code === lastScanRef.current && now - cooldownRef.current < 2500) return;
      lastScanRef.current = code;
      cooldownRef.current = now;

      setScannedCode(code);
      setPhase("looking-up");
      await new Promise((r) => setTimeout(r, 450));
      const found = lookupBarcode(code);
      if (found) {
        setProduct(found);
        setServings(1);
        setPhase("result");
        setHistory(pushScanHistory(found));
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate?.(30);
        }
        toast(t("toast.found", { name: found.name }), "success");
      } else {
        setProduct(null);
        setPhase("not-found");
        toast(t("toast.notInDb"), "info");
      }
    },
    [t, toast],
  );

  useEffect(() => {
    handleDetectedRef.current = handleDetectedCode;
  }, [handleDetectedCode]);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    stopCamera();
    if (!open) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play();
      }

      const track = stream.getVideoTracks()[0];
      const capabilities = track?.getCapabilities?.() as
        | { torch?: boolean }
        | undefined;
      setTorchSupported(Boolean(capabilities?.torch));

      const detector = await createBarcodeDetector();
      setDetectorReady(Boolean(detector));

      if (detector && video) {
        const tick = async () => {
          if (!streamRef.current) return;
          if (phaseRef.current === "scanning") {
            const hit = await detectFromVideo(detector, video);
            if (hit?.rawValue) await handleDetectedRef.current(hit.rawValue);
          }
          rafRef.current = requestAnimationFrame(() => {
            void tick();
          });
        };
        void tick();
      }
    } catch {
      setCameraError(t("scanner.cameraBlocked"));
    }
  }, [open, stopCamera, t]);

  useEffect(() => {
    if (!open) {
      stopCamera();
      return;
    }
    setMealType(initialMealType);
    setHistory(loadScanHistory());
    setPhase("scanning");
    setProduct(null);
    setManualCode("");
    setServings(1);
    setMode("camera");
  }, [open, initialMealType, stopCamera]);

  useEffect(() => {
    if (open && mode === "camera" && phase === "scanning") {
      void startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [open, mode, phase, startCamera, stopCamera]);

  async function toggleTorch() {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    try {
      // @ts-expect-error torch constraint is not in all TS media typings
      await track.applyConstraints({ advanced: [{ torch: !torchOn }] });
      setTorchOn((v) => !v);
    } catch {
      toast(t("toast.flashlightUnsupported"), "info");
    }
  }

  function submitManual() {
    const code = normalizeBarcode(manualCode);
    if (code.length < 6) {
      toast(t("toast.invalidBarcode"), "error");
      return;
    }
    void handleDetectedCode(code);
  }

  function logProduct() {
    if (!product) return;
    const scaled = scaleFood(product, servings);
    onLog(scaled, mealType);
    toast(
      t("toast.logged", {
        name: scaled.name,
        meal: t(`meal.${mealType}`, { ns: "common" }),
      }),
      "success",
    );
    onClose();
  }

  function resetScan() {
    setPhase("scanning");
    setProduct(null);
    setScannedCode("");
    setServings(1);
    lastScanRef.current = "";
    if (mode === "camera") void startCamera();
  }

  if (!open) return null;

  const scaled = product ? scaleFood(product, servings) : null;
  const catalogHits = searchBarcodeCatalog(catalogQuery);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black text-white">
      <header className="flex items-center justify-between gap-3 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-display text-lg font-semibold">{t("scanner.title")}</p>
            {isPro ? (
              <Badge variant="accent">{t("labels.pro", { ns: "common" })}</Badge>
            ) : (
              <Badge variant="accent">{t("labels.free", { ns: "common" })}</Badge>
            )}
          </div>
          <p className="text-xs text-white/60">
            {t("scanner.subtitle", { remaining: remainingCalories })}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl bg-white/10 p-2.5 hover:bg-white/15"
          aria-label={t("scanner.closeAria")}
        >
          <X size={18} />
        </button>
      </header>

      <div className="flex gap-2 px-4 pb-3">
        {(
          [
            { id: "camera" as const, label: t("scanner.tabCamera"), icon: Camera },
            { id: "manual" as const, label: t("scanner.tabManual"), icon: Keyboard },
            { id: "history" as const, label: t("scanner.tabHistory"), icon: History },
          ]
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setMode(tab.id);
              if (tab.id === "camera") setPhase("scanning");
            }}
            className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-medium transition ${
              mode === tab.id
                ? "bg-accent text-accent-fg"
                : "bg-white/10 text-white/80"
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {mode === "camera" && phase === "scanning" && (
            <motion.div
              key="camera"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <video
                ref={videoRef}
                playsInline
                muted
                className="h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70" />

              <div className="absolute inset-0 flex items-center justify-center p-8">
                <div className="relative aspect-[4/3] w-full max-w-sm overflow-hidden rounded-3xl border-2 border-accent/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
                  <div className="absolute left-3 top-3 h-6 w-6 border-l-2 border-t-2 border-accent" />
                  <div className="absolute right-3 top-3 h-6 w-6 border-r-2 border-t-2 border-accent" />
                  <div className="absolute bottom-3 left-3 h-6 w-6 border-b-2 border-l-2 border-accent" />
                  <div className="absolute bottom-3 right-3 h-6 w-6 border-b-2 border-r-2 border-accent" />
                  <motion.div
                    className="absolute inset-x-4 h-0.5 bg-accent shadow-[0_0_12px_var(--accent)]"
                    animate={{ top: ["12%", "88%", "12%"] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
              </div>

              <div className="absolute inset-x-0 bottom-0 space-y-3 p-4 pb-6">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-white/80">
                    {detectorReady
                      ? t("scanner.autoDetectOn")
                      : cameraError
                        ? cameraError
                        : t("scanner.cameraReady")}
                  </p>
                  {torchSupported && (
                    <button
                      type="button"
                      onClick={() => void toggleTorch()}
                      className="rounded-xl bg-white/10 p-3"
                      aria-label={t("scanner.torchAria")}
                    >
                      {torchOn ? <FlashlightOff size={18} /> : <Flashlight size={18} />}
                    </button>
                  )}
                </div>
                {cameraError && (
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => setMode("manual")}
                  >
                    {t("scanner.enterManually")}
                  </Button>
                )}
                {!supportsBarcodeDetector() && !cameraError && (
                  <div className="rounded-2xl bg-white/10 p-3">
                    <p className="mb-2 text-xs text-white/70">
                      {t("scanner.noAutoRead")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {DEMO_BARCODES.map((demo) => (
                        <button
                          key={demo.code}
                          type="button"
                          onClick={() => void handleDetectedCode(demo.code)}
                          className="rounded-full bg-accent/20 px-3 py-1.5 text-xs text-accent"
                        >
                          {demo.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {supportsBarcodeDetector() && (
                  <div className="flex flex-wrap gap-2">
                    {DEMO_BARCODES.slice(0, 3).map((demo) => (
                      <button
                        key={demo.code}
                        type="button"
                        onClick={() => void handleDetectedCode(demo.code)}
                        className="rounded-full bg-white/10 px-3 py-1.5 text-[11px] text-white/80"
                      >
                        {t("scanner.demoPrefix", {
                          label: demo.label.split(" · ").pop(),
                        })}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {phase === "looking-up" && (
            <motion.div
              key="lookup"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#0a0a0a] px-6"
            >
              <div className="h-12 w-12 animate-spin rounded-full border-2 border-accent border-t-transparent" />
              <p className="font-display text-lg font-semibold">{t("scanner.lookingUp")}</p>
              <p className="font-mono text-sm text-white/50">{scannedCode}</p>
            </motion.div>
          )}

          {phase === "result" && scaled && product && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute inset-0 overflow-y-auto bg-[#0a0a0a] px-4 pb-8"
            >
              <div className="mx-auto max-w-lg space-y-4 pt-2">
                <div className="rounded-apex-lg border border-white/10 bg-white/5 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <Badge variant="accent">{t("scanner.matched")}</Badge>
                        {product.verified && (
                          <Badge variant="success">{t("scanner.verified")}</Badge>
                        )}
                      </div>
                      <h2 className="font-display text-2xl font-bold">{product.name}</h2>
                      {product.brand && (
                        <p className="mt-1 text-sm text-accent">{product.brand}</p>
                      )}
                      <p className="mt-1 text-xs text-white/50">
                        {t("scanner.upc", { code: product.barcode })}
                        {product.source ? ` · ${product.source}` : ""}
                      </p>
                    </div>
                    <Barcode className="text-accent" size={28} />
                  </div>

                  <div className="mt-5 grid grid-cols-4 gap-2 text-center">
                    <MacroTile label={t("macros.kcal", { ns: "common" })} value={scaled.calories} />
                    <MacroTile
                      label={t("macros.proteinShort", { ns: "common" })}
                      value={`${scaled.protein}g`}
                      color="#60a5fa"
                    />
                    <MacroTile
                      label={t("macros.carbsShort", { ns: "common" })}
                      value={`${scaled.carbs}g`}
                      color="#fbbf24"
                    />
                    <MacroTile
                      label={t("macros.fatShort", { ns: "common" })}
                      value={`${scaled.fat}g`}
                      color="#f472b6"
                    />
                  </div>

                  <div className="mt-5">
                    <p className="mb-2 text-xs font-medium text-white/70">{t("scanner.servings")}</p>
                    <div className="flex flex-wrap gap-2">
                      {SERVING_OPTIONS.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setServings(s)}
                          className={`rounded-full px-3 py-1.5 text-sm ${
                            servings === s
                              ? "bg-accent text-accent-fg font-semibold"
                              : "bg-white/10 text-white/80"
                          }`}
                        >
                          {s}×
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-white/50">{scaled.serving}</p>
                  </div>

                  <div className="mt-5 space-y-2">
                    <ProgressBar
                      label={t("scanner.caloriesVsRemaining")}
                      value={Math.min(scaled.calories, remainingCalories || scaled.calories)}
                      max={Math.max(remainingCalories, scaled.calories, 1)}
                      showValue={false}
                    />
                    <p className="text-xs text-white/50">
                      {scaled.calories <= remainingCalories
                        ? t("scanner.fitsRemaining", { remaining: remainingCalories })
                        : t("scanner.overRemaining", {
                            over: scaled.calories - remainingCalories,
                          })}
                    </p>
                  </div>

                  <div className="mt-5">
                    <p className="mb-2 text-xs font-medium text-white/70">{t("scanner.logTo")}</p>
                    <div className="grid grid-cols-4 gap-2">
                      {(["breakfast", "lunch", "dinner", "snack"] as MealType[]).map(
                        (m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => {
                              setMealType(m);
                              onMealTypeChange?.(m);
                            }}
                            className={`rounded-xl py-2 text-xs capitalize ${
                              mealType === m
                                ? "bg-accent text-accent-fg font-semibold"
                                : "bg-white/10"
                            }`}
                          >
                            {t(`meal.${m}`, { ns: "common" })}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="secondary" className="flex-1" onClick={resetScan}>
                    {t("scanner.scanAgain")}
                  </Button>
                  <Button className="flex-1" onClick={logProduct}>
                    <Zap size={16} />
                    {t("scanner.logFood")}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {phase === "not-found" && (
            <motion.div
              key="not-found"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 overflow-y-auto bg-[#0a0a0a] px-4 pb-8"
            >
              <div className="mx-auto max-w-lg space-y-4 pt-6">
                <div className="rounded-apex-lg border border-white/10 bg-white/5 p-5 text-center">
                  <p className="font-display text-xl font-semibold">{t("scanner.noMatchTitle")}</p>
                  <p className="mt-2 text-sm text-white/60">
                    {t("scanner.noMatchBody", { code: scannedCode })}
                  </p>
                </div>
                <Input
                  label={t("scanner.searchCatalog")}
                  labelClassName="text-white"
                  value={catalogQuery}
                  onChange={(e) => setCatalogQuery(e.target.value)}
                  placeholder={t("scanner.searchPlaceholder")}
                  className="border-white/15 bg-white/5 text-white"
                />
                <ul className="space-y-2">
                  {catalogHits.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setProduct(item);
                          setScannedCode(item.barcode);
                          setPhase("result");
                          setHistory(pushScanHistory(item));
                        }}
                        className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left"
                      >
                        <span>
                          <span className="block text-sm font-medium">{item.name}</span>
                          <span className="text-xs text-white/50">
                            {item.brand} · {item.calories} {t("macros.kcal", { ns: "common" })}
                          </span>
                        </span>
                        <span className="text-accent text-xs">
                          {t("buttons.select", { ns: "common" })}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
                <Button fullWidth variant="secondary" onClick={resetScan}>
                  {t("scanner.tryAgain")}
                </Button>
              </div>
            </motion.div>
          )}

          {mode === "manual" && phase === "scanning" && (
            <motion.div
              key="manual"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute inset-0 overflow-y-auto bg-[#0a0a0a] px-4 pb-8"
            >
              <div className="mx-auto max-w-lg space-y-4 pt-4">
                <div className="rounded-apex-lg border border-white/10 bg-white/5 p-5">
                  <p className="font-display text-lg font-semibold">
                    {t("scanner.enterBarcodeTitle")}
                  </p>
                  <p className="mt-1 text-sm text-white/60">
                    {t("scanner.enterBarcodeBody")}
                  </p>
                  <div className="mt-4 space-y-3">
                    <Input
                      label={t("scanner.barcodeNumber")}
                      labelClassName="text-white"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      inputMode="numeric"
                      placeholder={t("scanner.barcodePlaceholder")}
                      className="border-white/15 bg-black/40 font-mono text-white"
                    />
                    <Button fullWidth size="lg" onClick={submitManual}>
                      {t("scanner.lookUp")}
                    </Button>
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-white/80">
                    {t("scanner.tryDemoCodes")}
                  </p>
                  <div className="space-y-2">
                    {DEMO_BARCODES.map((demo) => (
                      <button
                        key={demo.code}
                        type="button"
                        onClick={() => {
                          setManualCode(demo.code);
                          void handleDetectedCode(demo.code);
                        }}
                        className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left"
                      >
                        <span className="text-sm">{demo.label}</span>
                        <span className="font-mono text-xs text-white/40">{demo.code}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {mode === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute inset-0 overflow-y-auto bg-[#0a0a0a] px-4 pb-8"
            >
              <div className="mx-auto max-w-lg space-y-3 pt-4">
                <p className="font-display text-lg font-semibold">{t("scanner.recentScans")}</p>
                {history.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/15 px-4 py-10 text-center text-sm text-white/50">
                    {t("scanner.historyEmpty")}
                  </div>
                ) : (
                  history.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        const found = lookupBarcode(item.barcode);
                        if (!found) return;
                        setProduct(found);
                        setScannedCode(found.barcode);
                        setPhase("result");
                        setMode("camera");
                      }}
                      className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left"
                    >
                      <span>
                        <span className="block text-sm font-medium">{item.name}</span>
                        <span className="text-xs text-white/50">
                          {item.brand ? `${item.brand} · ` : ""}
                          {item.calories} {t("macros.kcal", { ns: "common" })} ·{" "}
                          {new Date(item.scannedAt).toLocaleString()}
                        </span>
                      </span>
                      <span className="text-xs text-accent">
                        {t("buttons.open", { ns: "common" })}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function MacroTile({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div className="rounded-2xl bg-black/40 px-2 py-3">
      <p className="font-display text-lg font-bold" style={color ? { color } : undefined}>
        {value}
      </p>
      <p className="text-[10px] uppercase tracking-wide text-white/50">{label}</p>
    </div>
  );
}
