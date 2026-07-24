"use client";

import {
  applyBrandToDocument,
  applyHeadmasterCreds,
  applySetupPassword,
  DEFAULT_SITE_CONFIG,
  mergeSiteConfig,
  SITE_PREVIEW_KEY,
  writeHeadmasterCreds,
  writeSetupPassword,
  type SiteConfig,
} from "@/lib/site-config";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type SiteConfigContextValue = {
  config: SiteConfig;
  ready: boolean;
  /** True when localStorage preview overrides school.json */
  hasPreview: boolean;
  updateSiteConfig: (partial: Partial<SiteConfig> | SiteConfig) => void;
  setSiteConfig: (next: SiteConfig) => void;
  /** Change headmaster username/password; persists in this browser immediately. */
  setHeadmasterCredentials: (user: string, password: string) => void;
  /** Change /setup unlock password; persists in this browser immediately. */
  setSetupPassword: (password: string) => void;
  savePreview: (override?: SiteConfig) => void;
  clearPreview: () => void;
  resetSiteConfig: () => void;
  exportSiteConfig: () => void;
  importSiteConfig: (file: File) => Promise<void>;
  clearSchoolData: () => void;
};

const SiteConfigContext = createContext<SiteConfigContextValue | null>(null);

function deepMergePartial(
  current: SiteConfig,
  partial: Partial<SiteConfig> | SiteConfig
): SiteConfig {
  return mergeSiteConfig(current, partial);
}

export function SiteConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
  const [ready, setReady] = useState(false);
  const [hasPreview, setHasPreview] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      let base = DEFAULT_SITE_CONFIG;
      try {
        const res = await fetch("/school.json", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          base = mergeSiteConfig(DEFAULT_SITE_CONFIG, json);
        }
      } catch {
        /* keep defaults */
      }

      let next = base;
      let preview = false;
      try {
        const raw = localStorage.getItem(SITE_PREVIEW_KEY);
        if (raw) {
          next = mergeSiteConfig(base, JSON.parse(raw));
          preview = true;
        }
      } catch {
        /* ignore bad preview */
      }

      next = applySetupPassword(applyHeadmasterCreds(next));

      if (!cancelled) {
        setConfig(next);
        setHasPreview(preview);
        applyBrandToDocument(next);
        setReady(true);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    applyBrandToDocument(config);
  }, [config, ready]);

  const updateSiteConfig = useCallback(
    (partial: Partial<SiteConfig> | SiteConfig) => {
      setConfig((prev) => deepMergePartial(prev, partial));
    },
    []
  );

  const setSiteConfig = useCallback((next: SiteConfig) => {
    setConfig(
      applySetupPassword(
        applyHeadmasterCreds(mergeSiteConfig(DEFAULT_SITE_CONFIG, next))
      )
    );
  }, []);

  const setHeadmasterCredentials = useCallback(
    (user: string, password: string) => {
      writeHeadmasterCreds({ user, password });
      setConfig((prev) => ({
        ...prev,
        headmasterUser: user,
        headmasterPassword: password,
      }));
    },
    []
  );

  const setSetupPassword = useCallback((password: string) => {
    writeSetupPassword(password);
    setConfig((prev) => ({
      ...prev,
      setupPassword: password,
    }));
  }, []);

  const savePreview = useCallback(
    (override?: SiteConfig) => {
      const data = applySetupPassword(
        applyHeadmasterCreds(override ?? config)
      );
      localStorage.setItem(SITE_PREVIEW_KEY, JSON.stringify(data));
      setHasPreview(true);
      setConfig(data);
    },
    [config]
  );

  const clearPreview = useCallback(() => {
    localStorage.removeItem(SITE_PREVIEW_KEY);
    setHasPreview(false);
    void (async () => {
      try {
        const res = await fetch("/school.json", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          const next = applySetupPassword(
            applyHeadmasterCreds(mergeSiteConfig(DEFAULT_SITE_CONFIG, json))
          );
          setConfig(next);
          applyBrandToDocument(next);
          return;
        }
      } catch {
        /* fall through */
      }
      const next = applySetupPassword(applyHeadmasterCreds(DEFAULT_SITE_CONFIG));
      setConfig(next);
      applyBrandToDocument(next);
    })();
  }, []);

  const resetSiteConfig = useCallback(() => {
    localStorage.removeItem(SITE_PREVIEW_KEY);
    setHasPreview(false);
    const next = applySetupPassword(applyHeadmasterCreds(DEFAULT_SITE_CONFIG));
    setConfig(next);
    applyBrandToDocument(next);
  }, []);

  const exportSiteConfig = useCallback(() => {
    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "school.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [config]);

  const importSiteConfig = useCallback(async (file: File) => {
    const text = await file.text();
    const parsed = JSON.parse(text) as unknown;
    let next = mergeSiteConfig(DEFAULT_SITE_CONFIG, parsed);
    if (next.headmasterUser && next.headmasterPassword) {
      writeHeadmasterCreds({
        user: next.headmasterUser,
        password: next.headmasterPassword,
      });
    }
    if (next.setupPassword?.trim()) {
      writeSetupPassword(next.setupPassword);
    }
    next = applySetupPassword(applyHeadmasterCreds(next));
    setConfig(next);
    localStorage.setItem(SITE_PREVIEW_KEY, JSON.stringify(next));
    setHasPreview(true);
    applyBrandToDocument(next);
  }, []);

  const clearSchoolData = useCallback(() => {
    const keys = Object.keys(localStorage);
    for (const k of keys) {
      if (k === SITE_PREVIEW_KEY) continue;
      if (
        k.startsWith("seat-of-wisdom") ||
        k.startsWith("sow-") ||
        k.includes("afrancho-data") ||
        k.includes("teacher-session") ||
        k.includes("student-session") ||
        k.includes("head-session")
      ) {
        localStorage.removeItem(k);
      }
    }
    window.location.reload();
  }, []);

  const value = useMemo(
    () => ({
      config,
      ready,
      hasPreview,
      updateSiteConfig,
      setSiteConfig,
      setHeadmasterCredentials,
      setSetupPassword,
      savePreview,
      clearPreview,
      resetSiteConfig,
      exportSiteConfig,
      importSiteConfig,
      clearSchoolData,
    }),
    [
      config,
      ready,
      hasPreview,
      updateSiteConfig,
      setSiteConfig,
      setHeadmasterCredentials,
      setSetupPassword,
      savePreview,
      clearPreview,
      resetSiteConfig,
      exportSiteConfig,
      importSiteConfig,
      clearSchoolData,
    ]
  );

  return (
    <SiteConfigContext.Provider value={value}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig() {
  const ctx = useContext(SiteConfigContext);
  if (!ctx) {
    throw new Error("useSiteConfig must be used within SiteConfigProvider");
  }
  return ctx;
}
