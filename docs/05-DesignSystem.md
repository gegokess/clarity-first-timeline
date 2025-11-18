# Design System - Clarity First

Die App folgt dem Style Guide **"Clarity First"**: Dark-Mode-First, minimalistisch und mit konsequenter Hierarchie. Dieses Dokument beschreibt alle Token, Komponenten und Interaktionsregeln, damit UI und Code synchron bleiben.

---

## 1. Design-Philosophie

| Prinzip | Beschreibung | Umsetzung in der App |
| :--- | :--- | :--- |
| **Minimalismus & Fokus** | Jedes Element benötigt eine Funktion. Hoher Kontrast, keine dekorativen Texturen. | Reduzierte Farbpalette, großzügige Leerräume und nur zwei Schriftgewichte. |
| **Hierarchie & Scannbarkeit** | Kennzahlen/CTA sofort erfassbar. Größen, Gewichte und Farbe erzeugen Priorität. | Projektname (H1), Zoom-Chips (H2) und Meta-Informationen (Body/Meta). Cards besitzen klare Label-Sektionen. |
| **Komfort & Zugänglichkeit** | Dark Mode als Standard wirkt augenschonend. Alle interaktiven Elemente erfüllen das 44x44 px Touch-Ziel. | Buttons/FABs besitzen große Hit-Areas, farbcodierte Feedback-States und klare Focus-Indikatoren. |
| **Focused Interaction** | In jeder Ansicht gibt es maximal eine primäre Aktion. Sekundäre Aktionen treten zurück. | Primär-Button = Gradient, Sekundär-Buttons = getönte Outlines, Icon-Buttons = monochrom. |

---

## 2. Foundations / Tokens

### 2.1 Farbpalette (Dark Mode Default)

```css
:root {
  /* Bases */
  --color-bg: #030712;
  --color-surface: #0C1220;
  --color-panel: #151C2F;
  --color-panel-alt: #1B243C;

  /* Lines & Text */
  --color-border: #222C44;
  --color-line: #25335B;
  --color-text: #F4F7FB;
  --color-text-muted: #94A3C5;

  /* Semantic & Accents */
  --color-success: #43F5C0;
  --color-warning: #FACC15;
  --color-danger: #FF6574;
  --color-info: #5F8BFF;
  --gradient-accent: linear-gradient(120deg, #6E7EFF 0%, #49E9FF 45%, #5DE1A4 100%);
}
```

- **Positiv** = Blau/Grün (Success/Info).  
- **Negativ** = Rot/Orange (Danger/Warning).  
- **Neutral** = Layering über `surface -> panel -> panel-alt`.

### 2.2 Typografie

| Rolle | Größe | Weight | Einsatz |
| :--- | :--- | :--- | :--- |
| **Kennzahl / Saldo** | 32-36 pt | 700-800 | Dashboard-Beträge, FAB-Label |
| **H1** | 24-28 pt | 600 | Projektname |
| **H2** | 18-20 pt | 600 | Sektionen (Sidebar, Dialogtitel) |
| **Body** | 16 pt | 400 | Standard-Text, Listen |
| **Meta/Labels** | 12-14 pt | 400-500 | Chips, Tooltips |

Fonts: `Inter`, system-ui fallback. Zeilenhöhe 1.4-1.6.  
**Touch-Ziel:** Minimum 44x44 px oder 32px padding bei Buttons.

### 2.3 Spacing, Raster & Rounding

- **8 px Grid**: `8 / 16 / 24 / 32 / 40 / 48` als Standardwerte (`--space-2` ... `--space-12`).  
- **Cards/Sektionen:** Radius 12-16 px -> `rounded-2xl`.  
- **Inputs / Buttons:** Radius 8-12 px (`rounded-xl`/`rounded-2xl`).  
- **Avatare/FAB:** `rounded-full`.

### 2.4 Shadows & Blur

```css
:root {
  --shadow-sm: 0 2px 4px rgba(10, 12, 21, 0.40);
  --shadow-md: 0 15px 35px rgba(5, 10, 25, 0.35);
  --shadow-lg: 0 30px 60px rgba(5, 10, 25, 0.45);
}
```

- **Default Cards**: `shadow-lg` + semitransparente Border.  
- **Floating Layer (Toolbar, Modals)**: `backdrop-blur`, `shadow-[0_20px_40px_rgba(0,0,0,0.45)]`.

---

## 3. Komponenten

### 3.1 Toolbar / Header

- **Struktur:** Brand-Icon, Projektname (inline editable), Projekt-Zeitraum (Meta Text), Zoom-Control (Segmented Chips), Action-Cluster (Settings, Add, Export, Import).  
- **Farben:** Hintergrund `surface/90`, Border `line/80`, Blur für Glaseffekt.  
- **Buttons:**  
  - Primär (AP hinzufügen) -> `bg-accent-gradient`, shadow, 2xl radius.  
  - Sekundär (Meilenstein, Export) -> `border line/70` auf `panel`.  
  - Informativ (Import) -> `info/10` Fill.

### 3.2 Sidebar / WorkPackage Tree

- **Container:** `panel` Cards mit 16 px Padding, `border line/70`, `rounded-2xl`.  
- **Expand/Collapse:** Icon Buttons `44x44` mit Hover-Highlight.  
- **Mode Toggle:** Pill-Switch mit Gradient für aktiven Modus, disabled wenn keine UAPs.  
- **Manual Dates:** Inputs `bg panel-alt`, `border line/60`.  
- **SubPackages:** Karten auf `panel-alt/70`, Border + Mini-Timeline (Start/End Chips).  
- **CTA:** `UAP hinzufügen` als dashed border (line/70) + icon.

### 3.3 Milestone List

- Section Card `panel` mit `rounded-2xl`.  
- Items `panel-alt/70`, Status-Icon in Warning-Farbe.  
- Edit-State = inline Form mit Buttons (`accent-gradient` für Speichern).  
- Delete/Edit Buttons = Icon Buttons `p-1.5`, radius 12px.

### 3.4 Timeline

- **Grid:** Raster-Linien `line` mit `stroke-dasharray="2 6"`.  
- **Header:** `panel` Fill, Typografie 12 px, `border line`.  
- **AP-Container:** `panel` Fill, `rx=12`, Border `line`.  
- **UAP Bars:** HTML im `foreignObject` -> `bg panel-alt`, Border `line/70`, hover Border `info`.  
- **Milestones:** Diamant in Warning, Label 12 px Bold.  
- **Tooltip:** `panel-alt` Box, Border `line/70`, `rounded-xl`.

### 3.5 Dialoge & Overlays

- Fullscreen Overlay `bg-black/70 + backdrop-blur`.  
- Dialogflächen `panel-alt` mit 24 px Radius, `border line/70`.  
- Buttons identisch zum Toolbar-Pattern (Primary Gradient, Secondary Panel).  
- Drag & Drop Overlay = dashed Border, Icon + CTA-Text + Meta Copy.

### 3.6 Feedback (Toasts)

- `panel-alt/90` Background, Border `line/70`, `rounded-2xl`, `backdrop-blur`.  
- Farbige Accent-Bar (`success/danger/warning/info`) an der linken Kante, Icon in gleicher Farbe.  
- Slide-In Animation `animate-slideIn`.

---

## 4. Interaktion & Datenvisualisierung

- **Drag & Drop Timeline:** Cursor `grab/grabbing`, Resize Handles `ew-resize`.  
- **Clamping Info:** Text-Hinweis im WP-Header, Icon `info`.  
- **Statusfarben:**  
  - Positive Zeiträume -> `accent-2` / Success.  
  - Kritische Daten -> `danger` Buttons, Warning Lines.  
- **BNB (optional):** Aktiver Tab = gefülltes Icon + Accent, inaktive Outline.

---

## 5. Tailwind Integration

```javascript
// tailwind.config.cjs
module.exports = {
  theme: {
    extend: {
      colors: {
        bg: '#030712',
        surface: '#0C1220',
        panel: '#151C2F',
        'panel-alt': '#1B243C',
        border: '#222C44',
        line: '#25335B',
        text: '#F4F7FB',
        'text-muted': '#94A3C5',
        success: '#43F5C0',
        warning: '#FACC15',
        danger: '#FF6574',
        info: '#5F8BFF',
        'accent-1': '#6E7EFF',
        'accent-2': '#49E9FF',
        'accent-3': '#5DE1A4',
      },
      backgroundImage: {
        'accent-gradient': 'linear-gradient(120deg, #6E7EFF 0%, #49E9FF 45%, #5DE1A4 100%)',
      },
      boxShadow: {
        sm: '0 2px 4px rgba(10,12,21,0.40)',
        md: '0 15px 35px rgba(5,10,25,0.35)',
        lg: '0 30px 60px rgba(5,10,25,0.45)',
      },
      borderRadius: {
        xs: '6px',
        sm: '10px',
        md: '14px',
        lg: '18px',
      },
    },
  },
};
```

**Utility Cheatsheet**

- Card: `bg-panel rounded-2xl border border-line/70 shadow-lg p-4`  
- Primary Button: `bg-accent-gradient text-white rounded-2xl px-4 py-2 shadow-md`  
- Secondary Button: `bg-panel border border-line/70 rounded-2xl px-4 py-2`  
- Pill: `bg-panel-alt/80 rounded-full px-3 py-1 text-text-muted`  
- Import Area: `border-2 border-dashed border-info/60 rounded-3xl p-8 text-center`

---

## 6. Accessibility & Motion

- **Kontrast:** Text `#F4F7FB` auf `#0C1220` = 11.75:1. Muted Text (#94A3C5) weiterhin 4.9:1 auf Panel.  
- **Focus:** `outline: 2px solid var(--color-info); outline-offset: 2px;` nur auf interaktiven Elementen.  
- **Motion:** `animate-slideIn` für Toasts, `transition-all 200ms` für Buttons und Chips. Keine parallax Effekte -> Fokus auf Klarheit.  
- **ARIA:** Icon Buttons (Settings, Delete, Import Dialog Close) besitzen `aria-label` + optional `title`.

---

## 7. Versionierung

- **Version:** 3.0 (Clarity First)  
- **Stand:** 2025-11-18  
- **Verantwortung:** Design & Frontend Team (Codex + Projektzeitplan)

> Änderungen an Tokens oder Komponenten müssen sowohl in `src/index.css`, `tailwind.config.cjs` als auch hier dokumentiert werden.
