import { useState } from "react";
import { Modal } from "./Modal";
import { t } from "../i18n";
import type { FamilyRole } from "../game/canteenFamily";
import type { WorkerState } from "../types";

type Props = {
  role: FamilyRole | null;
  workers: WorkerState[];
  onClose(): void;
  onSendCoffee?(workerId?: string): void;
  onCatCheer?(): void;
  onCleanWarehouse?(): void;
};

const PROMPT_TEMPLATES = [
  {
    title: "⚡ 極速排查與根因定位 (Bug Hunter)",
    prompt: "請以精簡專業的步調排查此問題。首先閱讀相關原始碼，找出最關鍵的錯誤假設，提出驗證方法，並只在最小邊界內進行修正。",
  },
  {
    title: "🛡️ Google 安全與規範審查 (Security & Standard)",
    prompt: "請依照 Google Engineering Practices 審查此模組：檢查邊界例外、資源釋放、輸入驗證、記憶體安全性與並發安全。",
  },
  {
    title: "🎨 像素與視覺體驗美化 (Pixel Polish)",
    prompt: "請優化目前畫面的像素對齊、邊距呼吸感、暗色系階調對比與微動態，確保在各種解析度下均有一致的清晰復古質感。",
  },
  {
    title: "🏗️ 模組化無痛重構 (Clean Architecture)",
    prompt: "在完全保持現有功能與型別相容的前提下，重構以下模組，提取重複邏輯，降低耦合度並補充清楚的單元測試。",
  },
];

export function SnackBarModal({ role, workers, onClose, onSendCoffee, onCatCheer, onCleanWarehouse }: Props) {
  const [activeTab, setActiveTab] = useState<FamilyRole>(role ?? "boss");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [cheered, setCheered] = useState(false);
  const [cleaned, setCleaned] = useState(false);

  if (!role) return null;

  const currentTab = role || activeTab;

  const copyPrompt = (text: string, index: number) => {
    void navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCoffee = (workerId?: string) => {
    onSendCoffee?.(workerId);
    setCheered(true);
    setTimeout(() => setCheered(false), 2500);
  };

  const handleClean = () => {
    onCleanWarehouse?.();
    setCleaned(true);
    setTimeout(() => setCleaned(false), 2500);
  };

  return (
    <Modal label="snack-bar-modal" onClose={onClose} title={t("🏪 溫馨福利社 · 休息與補給站")}>
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--border, #2a3a60)", paddingBottom: "10px", marginBottom: "16px", overflowX: "auto" }}>
        <button
          className={`ui-btn ${currentTab === "boss" ? "ui-btn--primary" : ""}`}
          onClick={() => setActiveTab("boss")}
          style={{ fontSize: "12px", whiteSpace: "nowrap" }}
        >
          ☕ {t("老闆 · 老爹")}
        </button>
        <button
          className={`ui-btn ${currentTab === "wife" ? "ui-btn--primary" : ""}`}
          onClick={() => setActiveTab("wife")}
          style={{ fontSize: "12px", whiteSpace: "nowrap" }}
        >
          📋 {t("老闆娘 · 帳本")}
        </button>
        <button
          className={`ui-btn ${currentTab === "eldestDaughter" ? "ui-btn--primary" : ""}`}
          onClick={() => setActiveTab("eldestDaughter")}
          style={{ fontSize: "12px", whiteSpace: "nowrap" }}
        >
          💡 {t("大女兒 · 智惠")}
        </button>
        <button
          className={`ui-btn ${currentTab === "youngerDaughter" ? "ui-btn--primary" : ""}`}
          onClick={() => setActiveTab("youngerDaughter")}
          style={{ fontSize: "12px", whiteSpace: "nowrap" }}
        >
          🍰 {t("小女兒 · 甜甜")}
        </button>
        <button
          className={`ui-btn ${currentTab === "son" ? "ui-btn--primary" : ""}`}
          onClick={() => setActiveTab("son")}
          style={{ fontSize: "12px", whiteSpace: "nowrap" }}
        >
          📦 {t("兒子 · 阿強")}
        </button>
      </div>

      {currentTab === "boss" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(217, 119, 6, 0.1)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(217, 119, 6, 0.3)" }}>
            <span style={{ fontSize: "28px" }}>☕</span>
            <div>
              <h4 style={{ margin: 0, color: "#f59e0b" }}>{t("老闆的元氣吧檯")}</h4>
              <p style={{ margin: "4px 0 0", fontSize: "13px", opacity: 0.85 }}>
                {t("「這批黃金曼特寧豆子剛烘焙好！敲程式碼辛苦了，喝杯熱咖啡提神，Bug 瞬間退散！」")}
              </p>
            </div>
          </div>

          <div style={{ marginTop: "8px" }}>
            <h5 style={{ margin: "0 0 8px", fontSize: "13px" }}>{t("招待大家喝咖啡：")}</h5>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              <button
                className="ui-btn ui-btn--primary"
                onClick={() => handleCoffee()}
                disabled={cheered}
                style={{ fontSize: "13px" }}
              >
                {cheered ? t("✨ 全員打氣送出！") : t("☕ 請全員一人一杯熱美式！")}
              </button>
              {workers.map((w) => (
                <button
                  key={w.id}
                  className="ui-btn"
                  onClick={() => handleCoffee(w.id)}
                  style={{ fontSize: "12px" }}
                >
                  ☕ {w.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {currentTab === "wife" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(16, 185, 129, 0.1)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
            <span style={{ fontSize: "28px" }}>📋</span>
            <div>
              <h4 style={{ margin: 0, color: "#10b981" }}>{t("老闆娘的福利社小帳本")}</h4>
              <p style={{ margin: "4px 0 0", fontSize: "13px", opacity: 0.85 }}>
                {t("「今天大家的進度都很不錯喔！我幫你們把帳單和用量整理得很清楚，省心又放心～」")}
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "4px" }}>
            <div style={{ background: "rgba(255,255,255,0.04)", padding: "10px", borderRadius: "6px" }}>
              <div style={{ fontSize: "11px", opacity: 0.65 }}>{t("現有 NPC 工人")}</div>
              <div style={{ fontSize: "18px", fontWeight: "bold", color: "#38bdf8", marginTop: "2px" }}>{workers.length} {t("位")}</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.04)", padding: "10px", borderRadius: "6px" }}>
              <div style={{ fontSize: "11px", opacity: 0.65 }}>{t("忙碌中工作者")}</div>
              <div style={{ fontSize: "18px", fontWeight: "bold", color: "#f59e0b", marginTop: "2px" }}>{workers.filter((w) => w.busy).length} {t("位")}</div>
            </div>
          </div>

          <div style={{ fontSize: "12px", opacity: 0.8, background: "rgba(0,0,0,0.2)", padding: "10px", borderRadius: "6px" }}>
            <div><b>Antigravity CLI (agy)</b>: {t("本機原生免 API Key · 支援 Gemini 3.8 Flash / Pro 系列")}</div>
            <div style={{ marginTop: "4px" }}><b>Claude Code & Codex</b>: {t("官方 CLI 認證即插即用")}</div>
          </div>
        </div>
      )}

      {currentTab === "eldestDaughter" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(59, 130, 246, 0.1)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(59, 130, 246, 0.3)" }}>
            <span style={{ fontSize: "28px" }}>💡</span>
            <div>
              <h4 style={{ margin: 0, color: "#38bdf8" }}>{t("大女兒智惠的靈感便籤盒")}</h4>
              <p style={{ margin: "4px 0 0", fontSize: "13px", opacity: 0.85 }}>
                {t("「這是我閱讀文檔與實務經驗累積的指令便籤，點擊直接複製貼給小人，立刻見效！」")}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "240px", overflowY: "auto" }}>
            {PROMPT_TEMPLATES.map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "6px",
                  padding: "10px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <b style={{ fontSize: "13px", color: "#e2e8f0" }}>{item.title}</b>
                  <button
                    className="ui-btn"
                    onClick={() => copyPrompt(item.prompt, idx)}
                    style={{ fontSize: "11px", padding: "2px 8px" }}
                  >
                    {copiedIndex === idx ? t("✓ 已複製") : t("📋 複製")}
                  </button>
                </div>
                <div style={{ fontSize: "12px", opacity: 0.75, marginTop: "6px", lineHeight: "1.4" }}>
                  {item.prompt}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {currentTab === "youngerDaughter" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(244, 63, 94, 0.1)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(244, 63, 94, 0.3)" }}>
            <span style={{ fontSize: "28px" }}>🍰</span>
            <div>
              <h4 style={{ margin: 0, color: "#fb7185" }}>{t("小女兒甜甜的外送點心車")}</h4>
              <p style={{ margin: "4px 0 0", fontSize: "13px", opacity: 0.85 }}>
                {t("「剛出爐的草莓泡芙跟冰涼波霸奶茶！黑貓剛剛吃完點心正在曬太陽呢喵～」")}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
            <button
              className="ui-btn ui-btn--primary"
              onClick={() => {
                onCatCheer?.();
                onSendCoffee?.();
              }}
              style={{ flex: 1, padding: "10px", fontSize: "13px" }}
            >
              🐾 {t("跟黑貓玩耍 & 外送甜點！")}
            </button>
          </div>
        </div>
      )}

      {currentTab === "son" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(234, 88, 12, 0.1)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(234, 88, 12, 0.3)" }}>
            <span style={{ fontSize: "28px" }}>📦</span>
            <div>
              <h4 style={{ margin: 0, color: "#fb923c" }}>{t("倉庫搬運工阿強 · 後勤站")}</h4>
              <p style={{ margin: "4px 0 0", fontSize: "13px", opacity: 0.85 }}>
                {t("「倉庫的貨物已經全部分類碼好！隨時需要釋放快取、清理殘留檔案，按一下我就搞定！」")}
              </p>
            </div>
          </div>

          <div style={{ marginTop: "6px" }}>
            <button
              className="ui-btn ui-btn--primary"
              onClick={handleClean}
              disabled={cleaned}
              style={{ width: "100%", padding: "10px", fontSize: "13px" }}
            >
              {cleaned ? t("✨ 倉庫與快取已整理乾淨！") : t("🧹 一鍵盤點與清理本機快取日誌")}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
