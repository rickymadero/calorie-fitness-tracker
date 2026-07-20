"use client";

import { useEffect, useState, type ComponentType } from "react";
import { Apple, Footprints, HeartPulse, Dumbbell, Watch } from "lucide-react";
import { ExploreBackHeader } from "@/components/layout/ExploreBackHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProGate } from "@/components/pro/ProGate";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { useAppTranslation } from "@/components/providers/LanguageProvider";
import {
  appleHealthPrefs,
  garminConnectPrefs,
  type HealthProviderPrefs,
  type HealthSyncKey,
} from "@/lib/storage/appleHealth";

type ProviderId = "apple" | "garmin";

type ProviderConfig = {
  id: ProviderId;
  icon: ComponentType<{ size?: number; className?: string }>;
  get: () => HealthProviderPrefs;
  set: (prefs: HealthProviderPrefs) => void;
  titleKey: string;
  bodyKey: string;
  connectKey: string;
  connectedToast: string;
  disconnectedToast: string;
  connectFirstKey: string;
};

export default function HealthIntegrationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useAppTranslation(["settings", "common"]);

  const providers: ProviderConfig[] = [
    {
      id: "apple",
      icon: Apple,
      get: appleHealthPrefs.get,
      set: appleHealthPrefs.set,
      titleKey: "health.apple.title",
      bodyKey: "health.apple.body",
      connectKey: "health.apple.connect",
      connectedToast: "health.apple.connected",
      disconnectedToast: "health.apple.disconnected",
      connectFirstKey: "health.apple.connectFirst",
    },
    {
      id: "garmin",
      icon: Watch,
      get: garminConnectPrefs.get,
      set: garminConnectPrefs.set,
      titleKey: "health.garmin.title",
      bodyKey: "health.garmin.body",
      connectKey: "health.garmin.connect",
      connectedToast: "health.garmin.connected",
      disconnectedToast: "health.garmin.disconnected",
      connectFirstKey: "health.garmin.connectFirst",
    },
  ];

  const [state, setState] = useState<Record<ProviderId, HealthProviderPrefs>>({
    apple: appleHealthPrefs.get(),
    garmin: garminConnectPrefs.get(),
  });

  useEffect(() => {
    setState({
      apple: appleHealthPrefs.get(),
      garmin: garminConnectPrefs.get(),
    });
  }, []);

  function save(id: ProviderId, next: HealthProviderPrefs) {
    const provider = providers.find((p) => p.id === id)!;
    provider.set(next);
    setState((prev) => ({ ...prev, [id]: next }));
  }

  function toggleConnect(provider: ProviderConfig) {
    const prefs = state[provider.id];
    if (prefs.connected) {
      save(provider.id, {
        ...prefs,
        connected: false,
        connectedAt: undefined,
      });
      toast(t(provider.disconnectedToast), "info");
      return;
    }
    save(provider.id, {
      ...prefs,
      connected: true,
      connectedAt: new Date().toISOString(),
    });
    toast(t(provider.connectedToast), "success");
  }

  function toggleSync(provider: ProviderConfig, key: HealthSyncKey) {
    const prefs = state[provider.id];
    if (!prefs.connected) {
      toast(t(provider.connectFirstKey), "info");
      return;
    }
    save(provider.id, { ...prefs, [key]: !prefs[key] });
  }

  const syncMeta: {
    key: HealthSyncKey;
    icon: typeof Footprints;
    title: string;
    body: string;
  }[] = [
    {
      key: "steps",
      icon: Footprints,
      title: t("health.sync.steps"),
      body: t("health.sync.stepsBody"),
    },
    {
      key: "workouts",
      icon: Dumbbell,
      title: t("health.sync.workouts"),
      body: t("health.sync.workoutsBody"),
    },
    {
      key: "recovery",
      icon: HeartPulse,
      title: t("health.sync.recovery"),
      body: t("health.sync.recoveryBody"),
    },
  ];

  return (
    <ProGate feature={t("features.healthIntegrations", { ns: "common" })}>
      <div>
        <ExploreBackHeader title={t("health.title")} />
        <p className="text-sm text-muted">{t("health.subtitle")}</p>

        {providers.map((provider) => {
          const Icon = provider.icon;
          const prefs = state[provider.id];
          return (
            <Card key={provider.id} className="mt-6" elevated>
              <div className="flex items-start gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-muted-bg text-foreground">
                  <Icon size={26} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-lg font-semibold">
                      {t(provider.titleKey)}
                    </h2>
                    {prefs.connected ? (
                      <Badge variant="accent">{t("health.statusOn")}</Badge>
                    ) : (
                      <Badge>{t("health.statusOff")}</Badge>
                    )}
                    {user?.plan === "pro" && (
                      <Badge variant="accent">
                        {t("labels.pro", { ns: "common" })}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {t(provider.bodyKey)}
                  </p>
                  {prefs.connected && prefs.connectedAt && (
                    <p className="mt-2 text-xs text-muted">
                      {t("health.connectedSince", {
                        date: new Date(prefs.connectedAt).toLocaleDateString(),
                      })}
                    </p>
                  )}
                </div>
              </div>

              <Button
                className="mt-5"
                fullWidth
                variant={prefs.connected ? "outline" : "primary"}
                onClick={() => toggleConnect(provider)}
              >
                {prefs.connected
                  ? t("health.disconnect")
                  : t(provider.connectKey)}
              </Button>

              <div className="mt-5 border-t border-border pt-4">
                <h3 className="text-sm font-semibold">{t("health.syncTitle")}</h3>
                <p className="mt-1 text-xs text-muted">{t("health.syncHint")}</p>
                <ul className="mt-3 space-y-2">
                  {syncMeta.map((row) => {
                    const SyncIcon = row.icon;
                    const on = prefs[row.key];
                    return (
                      <li
                        key={`${provider.id}-${row.key}`}
                        className="flex items-center gap-3 rounded-2xl border border-border bg-muted-bg/40 px-3 py-3"
                      >
                        <SyncIcon
                          size={18}
                          className="shrink-0 text-accent-dim dark:text-accent"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{row.title}</p>
                          <p className="text-xs text-muted">{row.body}</p>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={on}
                          aria-label={`${t(provider.titleKey)} ${row.title}`}
                          onClick={() => toggleSync(provider, row.key)}
                          className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                            on ? "bg-accent" : "bg-border"
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
                              on ? "left-5" : "left-0.5"
                            }`}
                          />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </Card>
          );
        })}

        <p className="mt-4 text-xs leading-relaxed text-muted">
          {t("health.webNote")}
        </p>
      </div>
    </ProGate>
  );
}
