import { useState, useEffect, useCallback, useRef } from "react";
import Icon from "@/components/ui/icon";

type Section = "home" | "profile" | "pvp" | "clans" | "raids" | "shop" | "prestige";

const NAV_ITEMS: { id: Section; label: string; icon: string }[] = [
  { id: "home", label: "Главная", icon: "Home" },
  { id: "profile", label: "Профиль", icon: "User" },
  { id: "pvp", label: "PvP", icon: "Swords" },
  { id: "clans", label: "Кланы", icon: "Shield" },
  { id: "raids", label: "Рейды", icon: "Skull" },
  { id: "shop", label: "Магазин", icon: "ShoppingBag" },
  { id: "prestige", label: "Ритуал", icon: "Infinity" },
];

const EQUIPMENT_SLOTS = [
  { label: "Корона", icon: "Crown", rarity: "epic", item: "Корона Фараона" },
  { label: "Амулет", icon: "Gem", rarity: "rare", item: "Глаз Гора" },
  { label: "Посох", icon: "Wand2", rarity: "legendary", item: "Посох Тота" },
  { label: "Броня", icon: "Shield", rarity: "common", item: "Пустой слот" },
  { label: "Кольцо", icon: "Circle", rarity: "rare", item: "Кольцо Исиды" },
  { label: "Реликвия", icon: "Star", rarity: "epic", item: "Скарабей судьбы" },
];

const RARITY_COLORS: Record<string, string> = {
  common: "text-muted-foreground border-border",
  rare: "text-blue-400 border-blue-400/40",
  epic: "text-purple-400 border-purple-400/40",
  legendary: "text-gold border-gold/60",
};

const RARITY_LABELS: Record<string, string> = {
  common: "—",
  rare: "РЕДК",
  epic: "ЭПИК",
  legendary: "ЛЕГЕНД",
};

function StatBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">{label}</span>
        <span className="font-mono text-xs text-gold">{value}<span className="text-muted-foreground">/{max}</span></span>
      </div>
      <div className="stat-bar">
        <div className="stat-bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-6">
      <div className="section-line mb-4" />
      <div className="flex items-end gap-4">
        <h2 className="font-heading text-2xl text-foreground tracking-widest">{title}</h2>
        {sub && <span className="font-mono text-xs text-muted-foreground mb-0.5">{sub}</span>}
      </div>
      <div className="section-line mt-4" />
    </div>
  );
}

const IDLE_PER_SEC = 48;
const TAP_POWER = 12;
const LEVEL_THRESHOLDS = [0, 10000, 25000, 50000, 90000, 150000];

interface FloatLabel {
  id: number;
  x: number;
  y: number;
  value: number;
}

function HomeSection() {
  const [dust, setDust] = useState(14820);
  const [exp, setExp] = useState(6820);
  const [level, setLevel] = useState(12);
  const [tapAnim, setTapAnim] = useState(false);
  const [floats, setFloats] = useState<FloatLabel[]>([]);
  const [totalTaps, setTotalTaps] = useState(0);
  const [flashRing, setFlashRing] = useState(false);
  const floatCounter = useRef(0);
  const tapRef = useRef<HTMLButtonElement>(null);

  // Idle накопление
  useEffect(() => {
    const interval = setInterval(() => {
      setDust((d) => d + IDLE_PER_SEC);
      setExp((e) => e + 2);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Уровень вверх
  useEffect(() => {
    const next = LEVEL_THRESHOLDS[level - 11] ?? Infinity;
    if (exp >= next && level < 99) {
      setLevel((l) => l + 1);
      setExp(0);
    }
  }, [exp, level]);

  const handleTap = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = tapRef.current?.getBoundingClientRect();
    const x = rect ? e.clientX - rect.left : 70;
    const y = rect ? e.clientY - rect.top : 70;
    const bonus = Math.random() < 0.1 ? TAP_POWER * 3 : TAP_POWER;
    const id = floatCounter.current++;

    setDust((d) => d + bonus);
    setExp((ex) => ex + 3);
    setTotalTaps((t) => t + 1);
    setTapAnim(true);
    setFlashRing(true);
    setFloats((f) => [...f, { id, x, y, value: bonus }]);

    setTimeout(() => setTapAnim(false), 100);
    setTimeout(() => setFlashRing(false), 200);
    setTimeout(() => setFloats((f) => f.filter((fl) => fl.id !== id)), 800);
  }, []);

  const nextLevelExp = LEVEL_THRESHOLDS[level - 10] ?? 10000;
  const expPct = Math.min(100, Math.round((exp / nextLevelExp) * 100));

  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="Империя Мумии" sub="IDLE-RPG" />

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Пыль", value: dust.toLocaleString("ru"), icon: "Wind" },
          { label: "Скарабеи", value: "340", icon: "Gem" },
          { label: "Уровень", value: String(level), icon: "TrendingUp" },
        ].map((s) => (
          <div key={s.label} className="glyph-border bg-card p-3 text-center">
            <Icon name={s.icon as "Wind"} size={16} className="text-gold mx-auto mb-1" />
            <div className="font-mono text-sm text-foreground">{s.value}</div>
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="relative flex items-center justify-center py-8">
        <div className="absolute inset-0 hieroglyph-pattern rounded-none" />

        {/* Кольцо-вспышка */}
        <div className={`absolute w-44 h-44 border-2 border-gold/0 transition-all duration-150 ${flashRing ? "border-gold/50 scale-110" : "scale-100"}`} />

        <button
          ref={tapRef}
          onClick={handleTap}
          className={`tap-button relative z-10 w-40 h-40 border border-gold/40 bg-card flex flex-col items-center justify-center gap-2 select-none transition-transform duration-75 ${tapAnim ? "scale-90" : "hover:border-gold/70 hover:scale-105"}`}
        >
          <div className={`absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent transition-opacity duration-100 ${tapAnim ? "opacity-100" : "opacity-40"}`} />

          {/* Летящие числа */}
          {floats.map((fl) => (
            <span
              key={fl.id}
              className="pointer-events-none absolute font-heading text-sm text-gold z-20 animate-float-up"
              style={{ left: fl.x, top: fl.y }}
            >
              +{fl.value}
            </span>
          ))}

          <div className={`text-5xl transition-transform duration-75 ${tapAnim ? "scale-90" : ""}`}>
            🏺
          </div>
          <span className="font-heading text-xs text-gold tracking-widest">ТАПНУТЬ</span>
          <span className="font-mono text-[10px] text-muted-foreground">+{TAP_POWER} ПЫЛИ</span>
        </button>
      </div>

      <div className="glyph-border bg-card p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="font-heading text-xs tracking-widest text-muted-foreground">ПРОГРЕСС</span>
          <span className="font-mono text-xs text-gold">УР. {level} → {level + 1}</span>
        </div>
        <StatBar label="Опыт" value={exp} max={nextLevelExp} />
        <StatBar label="Пыль/сек" value={IDLE_PER_SEC} max={100} />
        <StatBar label="Тапов всего" value={totalTaps} max={1000} />
      </div>

      <div className="space-y-2">
        <div className="font-heading text-xs text-muted-foreground tracking-widest mb-3">АКТИВНЫЕ КВЕСТЫ</div>
        {[
          { title: "Разбудить слуг", reward: "500 пыли", progress: Math.min(totalTaps, 5), total: 5 },
          { title: "Первый рейд", reward: "1× Скарабей", progress: 0, total: 1 },
          { title: "Создать клан", reward: "Эссенция ×10", progress: 0, total: 1 },
        ].map((q) => (
          <div key={q.title} className={`glyph-border bg-card p-3 flex items-center justify-between gap-3 ${q.progress >= q.total ? "border-gold/30" : ""}`}>
            <div className="flex-1 min-w-0">
              <div className="font-body text-sm text-foreground truncate">{q.title}</div>
              <div className="stat-bar mt-1.5">
                <div className="stat-bar-fill" style={{ width: `${Math.min(100, (q.progress / q.total) * 100)}%` }} />
              </div>
              <div className="font-mono text-[10px] text-muted-foreground mt-1">{q.progress}/{q.total}</div>
            </div>
            <div className="text-right shrink-0 flex flex-col items-end gap-1">
              <div className="font-mono text-xs text-gold">{q.reward}</div>
              {q.progress >= q.total && (
                <button className="font-heading text-[9px] bg-gold text-black px-2 py-0.5 tracking-wider hover:opacity-80 transition-opacity">
                  ЗАБРАТЬ
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileSection() {
  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="Профиль" sub="ИНВЕНТАРЬ · ХАРАКТЕРИСТИКИ" />

      <div className="glyph-border bg-card p-4 flex items-center gap-4">
        <div className="w-16 h-16 border border-gold/40 flex items-center justify-center text-4xl bg-obsidian shrink-0">
          🧟
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-heading text-lg text-foreground tracking-widest">АМЕНХОТЕП III</div>
          <div className="font-mono text-xs text-muted-foreground">Управляющий пирамидами · Уровень 12</div>
          <div className="flex gap-2 mt-2">
            <span className="font-mono text-[10px] border border-gold/40 text-gold px-1.5 py-0.5">НЕЖИТЬ</span>
            <span className="font-mono text-[10px] border border-purple-400/40 text-purple-400 px-1.5 py-0.5">НЕКРОМАНТ</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="font-heading text-xs text-muted-foreground tracking-widest">ХАРАКТЕРИСТИКИ</div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Сила", value: 42, max: 100, icon: "Zap" },
            { label: "Интеллект", value: 78, max: 100, icon: "Brain" },
            { label: "Воля", value: 55, max: 100, icon: "Shield" },
            { label: "Удача", value: 33, max: 100, icon: "Star" },
          ].map((s) => (
            <div key={s.label} className="glyph-border bg-card p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Icon name={s.icon as "Zap"} size={12} className="text-gold" />
                <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">{s.label}</span>
              </div>
              <div className="font-heading text-xl text-foreground">{s.value}</div>
              <div className="stat-bar">
                <div className="stat-bar-fill" style={{ width: `${s.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="font-heading text-xs text-muted-foreground tracking-widest">СНАРЯЖЕНИЕ</div>
        <div className="grid grid-cols-2 gap-2">
          {EQUIPMENT_SLOTS.map((slot) => (
            <div key={slot.label} className={`glyph-border bg-card p-3 border ${RARITY_COLORS[slot.rarity]}`}>
              <div className="flex items-center gap-2 mb-1.5">
                <Icon name={slot.icon as "Crown"} size={12} />
                <span className="font-mono text-[10px] uppercase tracking-widest opacity-60">{slot.label}</span>
              </div>
              <div className="font-body text-xs text-foreground truncate">{slot.item}</div>
              <div className="font-mono text-[9px] mt-1 opacity-50">{RARITY_LABELS[slot.rarity]}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="font-heading text-xs text-muted-foreground tracking-widest mb-3">ИНВЕНТАРЬ</div>
        <div className="grid grid-cols-4 gap-1.5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className={`aspect-square glyph-border bg-card flex items-center justify-center text-lg ${i < 5 ? "border-border" : "border-border/30 opacity-40"}`}>
              {i === 0 && "⚗️"}
              {i === 1 && "🪬"}
              {i === 2 && "💊"}
              {i === 3 && "🔮"}
              {i === 4 && "🗡️"}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PvpSection() {
  const [tab, setTab] = useState<"duels" | "league">("duels");
  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="PvP" sub="ДУЭЛИ ТЕНЕЙ · ЛИГА" />

      <div className="flex border-b border-border">
        {[
          { id: "duels", label: "Дуэли теней" },
          { id: "league", label: "Лига" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as "duels" | "league")}
            className={`flex-1 py-2.5 font-heading text-xs tracking-widest transition-colors ${tab === t.id ? "text-gold border-b border-gold -mb-px" : "text-muted-foreground hover:text-foreground"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "duels" && (
        <div className="space-y-4 animate-fade-in">
          <div className="glyph-border bg-card p-4 text-center space-y-2">
            <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Рейтинг</div>
            <div className="font-heading text-4xl text-gold">1 240</div>
            <div className="font-mono text-xs text-muted-foreground">топ 12% · победы: 34 / поражения: 18</div>
          </div>

          <div className="space-y-2">
            <div className="font-heading text-xs text-muted-foreground tracking-widest mb-3">ДОСТУПНЫЕ ПРОТИВНИКИ</div>
            {[
              { name: "Нефертари", level: 13, rating: 1310, win: "62%", emoji: "🧟‍♀️" },
              { name: "Птахотеп", level: 11, rating: 1180, win: "71%", emoji: "💀" },
              { name: "Хорусмин", level: 14, rating: 1420, win: "44%", emoji: "🧿" },
            ].map((p) => (
              <div key={p.name} className="glyph-border bg-card p-3 flex items-center gap-3">
                <div className="text-2xl">{p.emoji}</div>
                <div className="flex-1">
                  <div className="font-heading text-sm text-foreground tracking-wider">{p.name}</div>
                  <div className="font-mono text-[10px] text-muted-foreground">Уровень {p.level} · Рейтинг {p.rating}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xs text-gold">{p.win}</div>
                  <div className="font-mono text-[10px] text-muted-foreground">шанс победы</div>
                </div>
                <button className="border border-gold/40 text-gold font-heading text-xs px-3 py-1.5 hover:bg-gold hover:text-black transition-colors tracking-wider">
                  БОЙ
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "league" && (
        <div className="space-y-4 animate-fade-in">
          <div className="glyph-border bg-card p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-heading text-xs text-muted-foreground tracking-widest">СЕЗОН 3</span>
              <span className="font-mono text-xs text-gold">осталось 5д 14ч</span>
            </div>
            <div className="section-line" />
            <div className="font-heading text-sm text-foreground tracking-widest">СЕРЕБРЯНАЯ ЛИГА</div>
          </div>

          <div className="space-y-1.5">
            {[
              { rank: 1, name: "Рамзес VI", rating: 1840, you: false },
              { rank: 2, name: "Хнум-Ра", rating: 1720, you: false },
              { rank: 3, name: "Сехмет", rating: 1610, you: false },
              { rank: 11, name: "АМЕНХОТЕП III", rating: 1240, you: true },
              { rank: 12, name: "Тутмос", rating: 1210, you: false },
            ].map((p) => (
              <div key={p.rank} className={`glyph-border p-3 flex items-center gap-3 ${p.you ? "bg-gold/10 border-gold/30" : "bg-card"}`}>
                <div className={`font-mono text-sm w-6 text-center ${p.rank <= 3 ? "text-gold" : "text-muted-foreground"}`}>
                  {p.rank <= 3 ? ["I", "II", "III"][p.rank - 1] : p.rank}
                </div>
                <div className="flex-1 font-heading text-xs tracking-wider text-foreground">{p.name}</div>
                <div className="font-mono text-xs text-gold">{p.rating}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ClansSection() {
  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="Кланы" sub="БРАТСТВО МУМИЙ" />

      <div className="glyph-border bg-card p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="text-3xl">⚱️</div>
          <div>
            <div className="font-heading text-base text-gold tracking-widest">ДЕТИ АНУБИСА</div>
            <div className="font-mono text-xs text-muted-foreground">Ранг IV · 18/25 членов</div>
          </div>
        </div>
        <div className="section-line" />
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { label: "Сила клана", value: "48K" },
            { label: "Победы", value: "234" },
            { label: "Сезон", value: "#5" },
          ].map((s) => (
            <div key={s.label}>
              <div className="font-heading text-lg text-foreground">{s.value}</div>
              <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="font-heading text-xs text-muted-foreground tracking-widest mb-3">СОБЫТИЯ КЛАНА</div>
        {[
          { title: "Гонка кланов", status: "active", ends: "2д 8ч", reward: "Эссенция ×50" },
          { title: "Мировой босс", status: "soon", ends: "7д 0ч", reward: "Легенд. реликвия" },
          { title: "PvP-лига кланов", status: "ended", ends: "завершено", reward: "Получено" },
        ].map((e) => (
          <div key={e.title} className="glyph-border bg-card p-3 flex items-center gap-3">
            <div className={`w-1.5 h-10 shrink-0 ${e.status === "active" ? "bg-gold animate-pulse-gold" : e.status === "soon" ? "bg-muted" : "bg-border"}`} />
            <div className="flex-1">
              <div className="font-heading text-sm text-foreground tracking-wider">{e.title}</div>
              <div className="font-mono text-[10px] text-muted-foreground">{e.ends}</div>
            </div>
            <div className="font-mono text-xs text-gold text-right">{e.reward}</div>
          </div>
        ))}
      </div>

      <div className="space-y-1.5">
        <div className="font-heading text-xs text-muted-foreground tracking-widest mb-3">ЧЛЕНЫ КЛАНА</div>
        {[
          { name: "Рамзес", role: "Вождь", power: "12K", emoji: "👑" },
          { name: "Нефертити", role: "Офицер", power: "9.4K", emoji: "🛡" },
          { name: "Аменхотеп III", role: "Рядовой", power: "6.2K", emoji: "⚔️", you: true },
          { name: "Хнум", role: "Рядовой", power: "4.8K", emoji: "🏺" },
        ].map((m) => (
          <div key={m.name} className={`glyph-border p-3 flex items-center gap-2 ${"you" in m && m.you ? "bg-gold/10 border-gold/30" : "bg-card"}`}>
            <span className="text-base">{m.emoji}</span>
            <div className="flex-1">
              <div className="font-heading text-xs tracking-wider text-foreground">{m.name}</div>
              <div className="font-mono text-[10px] text-muted-foreground">{m.role}</div>
            </div>
            <div className="font-mono text-xs text-gold">{m.power}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RaidsSection() {
  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="Рейды" sub="ПОДЗЕМНЫЕ ЗАЛЫ" />

      <div className="glyph-border bg-card p-4 flex items-center gap-4">
        <div className="text-4xl">💀</div>
        <div className="flex-1">
          <div className="font-heading text-sm text-foreground tracking-widest">СТРАЖ НЕКРОПОЛЯ</div>
          <div className="font-mono text-xs text-muted-foreground mb-2">Мировой босс · обновление через 4ч</div>
          <div className="stat-bar">
            <div className="stat-bar-fill" style={{ width: "67%", background: "linear-gradient(90deg, #7f1d1d, #ef4444)" }} />
          </div>
          <div className="font-mono text-[10px] text-muted-foreground mt-1">HP: 3 340 000 / 5 000 000</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="font-heading text-xs text-muted-foreground tracking-widest mb-3">ДОСТУПНЫЕ РЕЙДЫ</div>
        {[
          { name: "Камера фараона", level: "10+", difficulty: "НОРМ", reward: "Редкий шмот", emoji: "🗄", locked: false },
          { name: "Зал анубиса", level: "15+", difficulty: "СЛОЖН", reward: "Эпик реликвия", emoji: "⚖️", locked: false },
          { name: "Обелиск вечности", level: "25+", difficulty: "ЭЛИТА", reward: "Легендарный лут", emoji: "🏛", locked: true },
          { name: "Бездна хаоса", level: "40+", difficulty: "ХАОС", reward: "Уникальный сет", emoji: "🌑", locked: true },
        ].map((r) => (
          <div key={r.name} className={`glyph-border p-3 flex items-center gap-3 ${r.locked ? "opacity-40" : "bg-card"}`}>
            <div className="text-2xl">{r.emoji}</div>
            <div className="flex-1">
              <div className="font-heading text-sm text-foreground tracking-wider">{r.name}</div>
              <div className="font-mono text-[10px] text-muted-foreground">Уровень {r.level}</div>
            </div>
            <div className="text-right mr-2">
              <div className={`font-mono text-[9px] px-1.5 py-0.5 border ${r.difficulty === "ЭЛИТА" ? "border-gold/40 text-gold" : r.difficulty === "ХАОС" ? "border-red-400/40 text-red-400" : "border-border text-muted-foreground"}`}>
                {r.difficulty}
              </div>
              <div className="font-mono text-[10px] text-gold mt-1">{r.reward}</div>
            </div>
            {!r.locked && (
              <button className="border border-gold/40 text-gold font-heading text-xs px-3 py-1.5 hover:bg-gold hover:text-black transition-colors tracking-wider shrink-0">
                ВОЙТИ
              </button>
            )}
            {r.locked && <Icon name="Lock" size={14} className="text-muted-foreground shrink-0" />}
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="font-heading text-xs text-muted-foreground tracking-widest mb-3">ЭКСПЕДИЦИИ</div>
        {[
          { name: "Пустыня Сахара", time: "2ч 14мин", reward: "140 пыли", active: true },
          { name: "Нильский берег", time: "4ч 0мин", reward: "320 пыли + реликв.", active: false },
        ].map((e) => (
          <div key={e.name} className="glyph-border bg-card p-3 flex items-center gap-3">
            <div className={`w-1.5 h-10 shrink-0 ${e.active ? "bg-gold animate-pulse-gold" : "bg-border"}`} />
            <div className="flex-1">
              <div className="font-body text-sm text-foreground">{e.name}</div>
              <div className="font-mono text-[10px] text-muted-foreground">{e.active ? `осталось ${e.time}` : e.time}</div>
            </div>
            <div className="font-mono text-xs text-gold">{e.reward}</div>
            <button className={`font-heading text-xs px-3 py-1.5 transition-colors tracking-wider border ${e.active ? "border-gold/60 text-gold hover:bg-gold hover:text-black" : "border-border text-muted-foreground hover:border-gold/40 hover:text-gold"}`}>
              {e.active ? "ЗАБРАТЬ" : "СТАРТ"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ShopSection() {
  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="Магазин" sub="РЫНОК ДРЕВНИХ" />

      <div className="glyph-border bg-card p-3 flex items-center gap-2">
        <Icon name="Gem" size={14} className="text-gold" />
        <span className="font-mono text-sm text-foreground">340</span>
        <span className="font-mono text-xs text-muted-foreground">скарабеев</span>
        <button className="ml-auto font-heading text-xs border border-gold/40 text-gold px-3 py-1 hover:bg-gold hover:text-black transition-colors tracking-wider">
          + ПОПОЛНИТЬ
        </button>
      </div>

      <div className="space-y-2">
        <div className="font-heading text-xs text-muted-foreground tracking-widest mb-3">BATTLE PASS</div>
        <div className="glyph-border bg-gradient-to-r from-card to-gold/5 p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-heading text-base text-gold tracking-widest">СЕЗОН 3 · ПРОКЛЯТИЕ ТОТА</div>
              <div className="font-mono text-xs text-muted-foreground">28 дней · 40 наград</div>
            </div>
            <div className="text-right">
              <div className="font-heading text-xl text-gold">980</div>
              <div className="font-mono text-[10px] text-muted-foreground">СКАРАБЕЕВ</div>
            </div>
          </div>
          <div className="stat-bar">
            <div className="stat-bar-fill" style={{ width: "45%" }} />
          </div>
          <div className="font-mono text-[10px] text-muted-foreground">Прогресс: 18/40</div>
          <button className="w-full border border-gold text-gold font-heading text-sm py-2.5 hover:bg-gold hover:text-black transition-colors tracking-widest">
            КУПИТЬ BATTLE PASS
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="font-heading text-xs text-muted-foreground tracking-widest mb-3">УСКОРИТЕЛИ</div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { name: "Авто-сбор 24ч", price: "80", desc: "Сбор пыли без тапов", emoji: "⚙️" },
            { name: "Буст ×2 · 1ч", price: "40", desc: "Удвоение всего дохода", emoji: "⚡" },
            { name: "Слот экспедиции", price: "200", desc: "+1 активная экспедиция", emoji: "🗺" },
            { name: "Переброс рейда", price: "30", desc: "Сбросить таймер рейда", emoji: "🔄" },
          ].map((item) => (
            <div key={item.name} className="glyph-border bg-card p-3 space-y-2">
              <div className="text-xl">{item.emoji}</div>
              <div className="font-heading text-xs text-foreground tracking-wider">{item.name}</div>
              <div className="font-mono text-[10px] text-muted-foreground">{item.desc}</div>
              <button className="w-full border border-gold/40 text-gold font-heading text-xs py-1.5 hover:bg-gold hover:text-black transition-colors flex items-center justify-center gap-1">
                <Icon name="Gem" size={10} />
                {item.price}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="font-heading text-xs text-muted-foreground tracking-widest mb-3">СТАРТОВЫЕ ПАКИ</div>
        {[
          { name: "Пак Новичка", price: "199 ₽", contents: "500 скарабеев + редкий сет", highlight: false },
          { name: "Пак Фараона", price: "599 ₽", contents: "2000 скарабеев + эпик реликвия + 7д буст ×2", highlight: true },
        ].map((p) => (
          <div key={p.name} className={`glyph-border p-4 flex items-center gap-3 ${p.highlight ? "bg-gold/10 border-gold/40" : "bg-card"}`}>
            <div className="flex-1">
              <div className={`font-heading text-sm tracking-widest ${p.highlight ? "text-gold" : "text-foreground"}`}>{p.name}</div>
              <div className="font-mono text-[10px] text-muted-foreground mt-0.5">{p.contents}</div>
            </div>
            <button className={`font-heading text-xs px-4 py-2 transition-colors tracking-wider border shrink-0 ${p.highlight ? "bg-gold text-black border-gold hover:bg-transparent hover:text-gold" : "border-gold/40 text-gold hover:bg-gold hover:text-black"}`}>
              {p.price}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function PrestigeSection() {
  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="Ритуал" sub="ПРЕСТИЖ · БЕСКОНЕЧНАЯ БАШНЯ" />

      <div className="glyph-border bg-card p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="text-3xl">♾️</div>
          <div>
            <div className="font-heading text-sm text-foreground tracking-widest">РИТУАЛ ВЕЧНОСТИ</div>
            <div className="font-mono text-xs text-muted-foreground">Престиж 0 · Эссенция: 0</div>
          </div>
        </div>
        <div className="section-line" />
        <div className="font-body text-xs text-muted-foreground leading-relaxed">
          Сброс прогресса в обмен на постоянные бонусы. Каждый Ритуал открывает новые возможности и усиливает механики.
        </div>
        <div className="space-y-2">
          {[
            { bonus: "+5% к доходу пыли" },
            { bonus: "Новый слот снаряжения" },
            { bonus: "Доступ к Башне бесконечности" },
          ].map((b, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 border border-border" />
              <span className="font-mono text-xs text-muted-foreground">{b.bonus}</span>
            </div>
          ))}
        </div>
        <div className="glyph-border bg-muted/40 p-3 space-y-1">
          <div className="flex justify-between font-mono text-xs">
            <span className="text-muted-foreground">Требуется уровень</span>
            <span className="text-foreground">50 (текущий: 12)</span>
          </div>
          <div className="stat-bar mt-2">
            <div className="stat-bar-fill" style={{ width: "24%" }} />
          </div>
        </div>
        <button className="w-full border border-border text-muted-foreground font-heading text-sm py-2.5 tracking-widest cursor-not-allowed opacity-50">
          ПРОВЕСТИ РИТУАЛ
        </button>
      </div>

      <div className="space-y-2">
        <div className="font-heading text-xs text-muted-foreground tracking-widest mb-3">БЕСКОНЕЧНАЯ БАШНЯ</div>
        <div className="glyph-border bg-card p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🏛</div>
            <div>
              <div className="font-heading text-sm text-foreground tracking-widest">ОБЕЛИСК ВРЕМЁН</div>
              <div className="font-mono text-xs text-muted-foreground">Лучший этаж: —</div>
            </div>
            <Icon name="Lock" size={16} className="text-muted-foreground ml-auto" />
          </div>
          <div className="font-mono text-[10px] text-muted-foreground">Требуется 1 Ритуал Вечности</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="font-heading text-xs text-muted-foreground tracking-widest mb-3">ПОСТОЯННЫЕ БОНУСЫ</div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { name: "Жажда крови", desc: "Урон +X%", cost: "50 эссенции", icon: "Zap" },
            { name: "Проклятие", desc: "Иммун. к замедлению", cost: "80 эссенции", icon: "Shield" },
            { name: "Жадность богов", desc: "Пыль ×1.5", cost: "100 эссенции", icon: "Coins" },
            { name: "Неизбежность", desc: "Крит. шанс +10%", cost: "120 эссенции", icon: "Target" },
          ].map((b) => (
            <div key={b.name} className="glyph-border bg-card p-3 opacity-50">
              <Icon name={b.icon as "Zap"} size={12} className="text-gold mb-1.5" />
              <div className="font-heading text-xs text-foreground tracking-wider">{b.name}</div>
              <div className="font-mono text-[10px] text-muted-foreground mt-0.5">{b.desc}</div>
              <div className="font-mono text-[9px] text-gold mt-1.5">{b.cost}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [active, setActive] = useState<Section>("home");

  const sections: Record<Section, JSX.Element> = {
    home: <HomeSection />,
    profile: <ProfileSection />,
    pvp: <PvpSection />,
    clans: <ClansSection />,
    raids: <RaidsSection />,
    shop: <ShopSection />,
    prestige: <PrestigeSection />,
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative">
      <div className="fixed top-0 left-0 right-0 z-50 max-w-md mx-auto">
        <div className="bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏺</span>
            <span className="font-heading text-sm text-gold tracking-widest">MUMMY CLICK</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Icon name="Wind" size={12} className="text-muted-foreground" />
              <span className="font-mono text-xs text-muted-foreground">14,820</span>
            </div>
            <div className="flex items-center gap-1">
              <Icon name="Gem" size={12} className="text-gold" />
              <span className="font-mono text-xs text-gold">340</span>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 pt-[60px] pb-[72px] overflow-y-auto scrollbar-thin">
        <div className="px-4 pt-4">
          {sections[active]}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-background/95 backdrop-blur-sm border-t border-border z-50">
        <div className="grid grid-cols-7">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`relative flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors ${active === item.id ? "text-gold" : "text-muted-foreground hover:text-foreground"}`}
            >
              {active === item.id && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-px bg-gold" />
              )}
              <Icon name={item.icon as "Home"} size={16} />
              <span className="font-mono text-[8px] uppercase tracking-widest leading-none">
                {item.label.split(" ")[0]}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}