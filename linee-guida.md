Linee guida libreria componenti C85
19 nov 2026 · @Telsy account
Scopo
Questo documento è il brief per un'altra istanza di Claude: deve costruire ui-toolkit, una libreria di componenti Angular riusabile, documentata in Storybook, che riproduca il più fedelmente possibile il design system "C85 glass" dell'app Torneo (Angular 22 + Tailwind 4). Ogni valore qui riportato è preso dal codice di produzione (src/styles.css, src/app/ui/**) salvo dove indicato come regola generale.
Come usarlo:
• I valori (hex, rem, ms) sono vincolanti: vanno riportati identici nei token.
• Le regole (come derivare sfumature, quando usare un colore) servono a estendere il sistema a colori e componenti che Torneo non ha.
• Dove una scelta resta aperta (framework, nome del pacchetto) è segnalata come domanda nella sezione finale.
Principi di design
L'identità è "vetro caldo su sfondo vivo": superfici traslucide sfocate sopra un mesh di gradienti arancio/rosso/verde, testo quasi nero, un solo colore d'azione (arancio). Il sistema ha due "temi di densità": quello pubblico (glass, mobile first) e quello backoffice (piatto, compatto, desktop).
1.  Un solo colore d'azione. L'arancio brand #FFB936 è riservato a CTA primarie, stato attivo e focus in dark. Mai usarlo per testo su chiaro (contrasto insufficiente): per il testo accento esiste accent-text.
2.  Testo scuro su arancio. Su primary il testo è sempre #1E1E1E, mai bianco.
3.  Vetro solo su sfondo vivo. Le card glass hanno senso perché dietro c'è il mesh; senza mesh si degrada a superficie solida.
4.  Piatto, non gradiente, sui controlli. Bottoni pieni senza sfumature né glow, con bordo 1px più scuro del riempimento.
5.  Numeri in condensed. Punteggi, statistiche e classifiche usano Barlow Condensed con cifre tabulari; tutto il resto Manrope.
6.  Mobile first, touch target ≥ 44px (2.75rem) nel tema pubblico.
7.  Accessibilità come vincolo: WCAG AA (4.5:1 testo, 3:1 bordi/icone) verificato da test automatici sui token; rispetto di prefers-reduced-motion, prefers-reduced-transparency, prefers-contrast.
8.  Ogni token ha la sua versione dark e i componenti non contengono colori letterali: solo variabili.
Colore
Il sistema è a tre livelli: brand (4 colori), token semantici con ruolo fisso (fill, hover, bordo, testo, soft) e neutri caldi. I componenti usano solo i token semantici. Le regole sotto permettono di generare i 5 ruoli per qualunque nuova tinta (blu, viola, ecc.) con la stessa "firma" di Torneo.
Brand
Nome
Hex
OKLCH (L / C / h)
Uso
Orange
#FFB936
0.83 / 0.158 / 78
primary, attivo, selezione, focus in dark
Red
#CE2828
0.55 / 0.201 / 27
danger, errori, cartellini
Green
#2E8B57
0.57 / 0.119 / 155
success, solo nel mesh e nei soft
Ink
#1E1E1E
0.24 / 0 / –
testo, testo su primary, nav attiva in light
Token semantici (light → dark)
Token
Light
Dark
Note
bg
#FFF6E8
#0F0F10
sotto il mesh
surface (glass)
rgb(255 255 255 / .72)
rgb(30 30 30 / .70)
con blur 18px saturate 170%
surface-strong
rgb(255 255 255 / .86)
rgb(30 30 30 / .86)
input, secondary button
surface-solid
#FFFCF7
#1E1E1E
fallback glass, popover
surface-sunken
rgb(30 30 30 / .05)
rgb(255 255 255 / .06)
hover ghost, righe tabella
text
#1E1E1E
#F7F5F2

text-muted
#4F4A44
#C4BDB4
8.2:1 su bg
accent-text
#8A4B00
#FFB936
testo "arancio" leggibile
primary / primary-hover
#FFB936 / #FFAA0D
uguale

primary-border
#E09A14
uguale
bordo bottoni primari
on-primary
#1E1E1E
#1E1E1E

danger / danger-hover
#CE2828 / #B32020
uguale
on-danger bianco
danger-text
#A31C1C
#FF8A80

success
#23704A
uguale
on-success bianco
success-text
#1D6341
#6EDC9E

warning
#F5A524
uguale
on-warning ink
warning-text
#7A4A00
#FFC857

*-soft (brand/danger/success/warning)
fill a 28 / 12 / 14 / 18%
18 / 22 / 24 / 20%
sfondi badge e chip
border
rgb(30 30 30 / .10)
rgb(255 255 255 / .10)
divisori decorativi
border-strong
#7A726A
#8C857D
bordi di controlli, ≥ 3:1
glass-edge
rgb(255 255 255 / .75)
rgb(255 255 255 / .12)
bordo card glass
focus
#1E1E1E
#FFB936
outline 3px, offset 2px
nav-active bg / fg
ink / orange
orange / ink
tab bar, segmented
skeleton / shine
rgb(30 30 30/.08) / rgb(255 255 255/.6)
rgb(255 255 255/.08) / /.12

Backoffice (tema piatto desktop): bg #F3F2F0 / #111112, surface #FFFFFF / #1B1B1D, surface-alt #F8F7F5 / #232326, row-hover #FFF3DC / #2E2A22, divider #E2DFDA / #313135, border #837C74, text-muted #57524C / #B3ACA3, sidebar sempre scura (#1E1E1E / #0A0A0B) con voce attiva orange su ink.
Regole di sfumatura (per qualsiasi tinta)
Lavora in OKLCH: tieni fissa la tinta (h), muovi lightness (L) e chroma (C). I valori di Torneo seguono questa griglia, da replicare per ogni nuovo colore:
Ruolo
L (light)
C
Regola
fill
0.55–0.83
0.12–0.20
il colore "puro"; testo sopra scelto per contrasto (sotto)
fill-hover
fill − 0.03/0.06
+0.01
più scuro, mai più chiaro
fill-border
fill − 0.09
≈ uguale
solo sui fill chiari (L > 0.7)
text su chiaro
0.44–0.48
0.09–0.17
h può ruotare di −10° verso il rosso per i gialli/arancio (78→60)
text su scuro
0.76–0.86
0.13–0.15

soft
fill con alpha 0.12–0.28 light, 0.18–0.24 dark
–
alpha più alta per tinte chiare (arancio 0.28, rosso 0.12)
Esempio di estensione per un blu h 255: fill oklch(0.55 0.17 255), hover oklch(0.50 0.16 255), text light oklch(0.46 0.14 255), text dark oklch(0.80 0.12 255), soft = fill al 14% (light) / 22% (dark). Verifica sempre i contrasti col test automatico.
Testo su un fill: on = ink #1E1E1E se il contrasto con ink ≥ quello con bianco, altrimenti #FFFFFF (in pratica ink sopra L ≈ 0.7). Per tinte libere scelte dall'utente usa la stessa funzione a runtime.
Neutri: sempre caldi, h 67–81, C 0.005–0.02 (mai grigi puri tranne ink e bg dark). Scala usata: #FFFCF7 0.99, #FFF6E8 0.98, #C4BDB4 0.80, #8C857D 0.62, #7A726A 0.56, #4F4A44 0.41, #1E1E1E 0.24, #0F0F10 0.17. Per gradini intermedi interpola L in OKLCH tenendo h ≈ 72 e C ≈ 0.015.
Trasparenze, non nuovi colori: bordi, superfici e soft sono il colore base con alpha (ink o bianco al 5–10% per hairline, al 72–86% per vetro). In dark si inverte: bianco a bassa alpha su fondo scuro.
Vincoli di contrasto (da testare automaticamente)
• Testo e text-muted ≥ 4.5:1 su bg, surface-solid e sul vetro composto sopra bg (blend del tint con la sua alpha).
• accent-text, *-text ≥ 4.5:1 sia su surface-solid sia sul rispettivo soft composto.
• on-* ≥ 4.5:1 sul proprio fill.
• border-strong e focus ≥ 3:1 su bg e surface (WCAG 1.4.11).
• L'arancio non va mai usato come testo su chiaro (1.6:1).
Palette categoriche e colori liberi
• Swatch scelti dall'utente (11, ciascuno con il suo on): Arancio #FFB936, Rosso #C62828, Bordeaux #8E2448, Fucsia #AD1457, Viola #6A1B9A, Blu #1565C0, Azzurro #4FC3F7, Verde acqua #00796B, Verde #2E7D32, Giallo #FDD835, Grigio ardesia #455A64.
• Fallback avatar (scelto da hash del nome): orange/ink, ink/orange, #23704A/bianco, #CE2828/bianco.
• Grafici: ogni serie deve stare nella banda OKLCH L 0.43–0.77 (light) o 0.48–0.67 (dark), C ≥ 0.10, contrasto ≥ 3:1 sulla superficie, ΔE OKLab ≥ 15 tra serie adiacenti e ≥ 8 simulando protanopia/deuteranopia (Machado 2009). Un colore fuori banda si "aggancia" muovendo solo L. Testo assi = text-muted, griglia = border.
Tipografia
Due famiglie: Manrope (variabile 200–800) per tutto il testo, Barlow Condensed (500/600/700) per titoli display e numeri. Entrambe self-hosted in woff2 (subset latin + latin-ext, font-display: swap, preload dei file principali), mai da Google Fonts per privacy.
--font-sans: "Manrope", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
--font-display: "Barlow Condensed", "Manrope", ui-sans-serif, system-ui, sans-serif;
Base: body 16px, line-height 1.5, -webkit-font-smoothing: antialiased, text-rendering: optimizeLegibility; h1–h3 con text-wrap: balance.
Gerarchia
Livello
Famiglia
Size / line-height
Peso
Stile
Uso
Display / H1 hero
display
3rem → 3.75rem da 640px, lh 0.95–1
700
UPPERCASE
titolo pagina/torneo, landing
H1 pagina
display
2.25rem → 3rem, lh 1
700
UPPERCASE, tracking 0.025em
titoli di pagina interni
H2 sezione grande
display
1.875rem
700
UPPERCASE
blocchi principali
H2 / titolo card
sans
1.125rem
800
normale
titolo dentro card
Eyebrow / section title
sans
0.75rem
800
UPPERCASE, tracking 0.14em, text-muted
etichetta sopra le sezioni
Body
sans
1rem / 1.5
400–500

testo corrente
Body small (il più usato)
sans
0.875rem / 1.25rem
400–600

metadati, liste, hint
Label campo
sans
0.875rem
700

label di form
Caption
sans
0.75rem / 1rem
600–700

badge, note
Micro
sans
0.6875rem
700

chip iniziali, header tabella backoffice
Header tabella
sans
0.75rem
700
UPPERCASE, tracking 0.06em, text-muted

Bottone
sans
0.9375rem (sm 0.875, lg 1) lh 1
700


Numero grande (score, stat)
display
3rem
800
tabular-nums
punteggi live, KPI
Numero in tabella
display (.font-numeric)
eredita
700
tabular-nums, tracking 0.01em
classifiche, minuti
H1 backoffice
sans
1.375rem / 1.2
800

titoli pagina gestionale
Regole
• I pesi usati sono 400, 600, 700, 800: non introdurre 300 o 900.
• UPPERCASE solo su display condensed, eyebrow, header tabella e badge "live" (tracking 0.08em). Mai su body.
• Tracking positivo cresce al calare della size: 0.01em numeri, 0.02em badge, 0.06em header tabella, 0.14em eyebrow.
• Colori del testo: text per contenuto, text-muted per secondario, accent-text per link/valori evidenziati, *-text per stati. Mai opacità sul testo per "attenuarlo".
• Utility .font-numeric = display + font-variant-numeric: tabular-nums + tracking 0.01em: obbligatoria per colonne di numeri allineati.
• Responsive: solo i display salgono di un gradino a ≥ 640px; il body non cambia.
Spaziatura, raggi, bordi, ombre
Griglia di 4px (scala Tailwind: 1 = 0.25rem). I gradini più usati sono, in ordine: 2 (8px), 3 (12px), 4 (16px), 1 (4px), 1.5 (6px), 6 (24px). Gap tra elementi in riga 0.5rem, tra card in lista 0.75rem, tra sezioni di pagina 1.5–2rem.
Token
Valore
Uso
padding card
sm 0.75rem · md 1rem · lg 1.5rem
default md
padding pagina
max(1rem, safe-area) laterale
contenitore max-width: 64rem centrato
radius-card
1.25rem (20px)
card, dialog, toast (1rem)
radius-control
0.875rem (14px)
bottoni, input, select
radius pill
9999px
badge, segmented, chip, avatar persona
radius piccoli
0.75rem icone in tile · 1rem empty-state icon · 0.375rem skeleton text

backoffice
card 0.5rem · control 0.375rem
tema piatto
touch target
min 2.75rem (44px)
bottoni md, input, tab, link in footer
header / tab bar
3.75rem / 4rem
sticky, tab bar flottante
Bordi: 1px ovunque. border (ink 10%) per divisori decorativi, border-strong per i confini dei controlli, glass-edge (bianco 75%) per le card vetro, primary-border sui bottoni primari. Bordo sinistro 4px colorato per toast di stato, 3px arancio per card brand nel backoffice.
Ombre (tinte calde in light, nere in dark):
--shadow-glass: 0 1px 0 0 rgb(255 255 255 / .6) inset, 0 10px 30px -12px rgb(90 50 0 / .25), 0 2px 6px -2px rgb(30 30 30 / .08);
--shadow-float: 0 18px 40px -16px rgb(30 30 30 / .4), 0 4px 12px -4px rgb(30 30 30 / .15);
/* dark */
--shadow-glass: 0 1px 0 0 rgb(255 255 255 / .06) inset, 0 12px 32px -12px rgb(0 0 0 / .6);
--shadow-float: 0 18px 40px -12px rgb(0 0 0 / .7);
Due soli livelli di elevazione: glass (card a riposo) e float (hover di card interattive, tab attiva, toast, tab bar, menu). Il backoffice azzera shadow-glass e usa un float leggero.
Vetro (.glass): background: surface; backdrop-filter: blur(18px) saturate(170%); border: 1px solid glass-edge; box-shadow: shadow-glass. Variante strong = surface all'86%. Fallback obbligatori: senza backdrop-filter, con prefers-reduced-transparency o prefers-contrast: more diventa surface-solid (con border-strong in alto contrasto).
Sfondo mesh: body::before fisso, inset: -20vmax, quattro radial-gradient (arancio 12%/8%, rosso 92%/22%, verde 70%/96%, arancio 8%/88%, raggi 30–40vmax, sfumati a trasparente al 70%) con alpha --mesh-alpha 0.45 light / 0.30 dark, saturate(115%). Il mesh è parte dell'identità: va incluso come decoratore globale nello Storybook.
Card brand: glow radial-gradient(120% 80% at 0% 0%, brand-soft, transparent 60%) nell'angolo in alto a sinistra e bordo arancio al 55%.
Motion
Un'unica curva, --ui-ease: cubic-bezier(0.22, 1, 0.36, 1) (ease-out marcato), e durate brevi: 160ms micro-interazioni, 200ms stati di card/tab, 220–260ms ingressi, 240ms transizioni di pagina.
Animazione
Durata
Effetto
hover/colore controlli
160ms
background, border-color
press bottone
160ms
scale(0.97) su :active
card interattiva
200ms
hover translateY(-2px) + shadow-float; active scale(0.99)
dialog
220ms
pop-in: da opacity 0, translateY(8px) scale(0.98)
bottom sheet
260ms
slide-up da translateY(100%)
toast
260ms
da opacity 0, translateY(-12px) scale(0.98)
spinner
700ms linear infinito
bordo 2px currentColor con lato destro trasparente
live dot
1.4s infinito
ping scale(1→2.6), opacity 0.7→0
skeleton
1.4s ease-in-out infinito
shimmer gradient 200%
transizione pagina
240ms
View Transitions: slide 12% + fade nella direzione della tab; fade 180ms tra altre pagine; header e tab bar fermi
altezza carousel
200ms
adatta l'altezza al pannello attivo
Reduced motion (obbligatorio): tutte le animazioni e transizioni a 0.01ms, niente view transition, live dot e skeleton statici, scroll-behavior: auto.
Catalogo componenti
I componenti sotto esistono in Torneo (src/app/ui) e vanno replicati con la stessa API e lo stesso aspetto. Prefisso consigliato ui-. Ogni componente usa solo token, ha stati hover / focus-visible / active / disabled, e una storia per tema light, dark e backoffice.
Azioni
Button — attributo su <button> e <a> (stessa resa).
• Props: variant primary | secondary | ghost | danger · size sm | md | lg · block · iconOnly · loading · disabled · type (default button, mai submit per errore).
• Misure: altezza sm 2.25rem / md 2.75rem / lg 3.25rem; padding orizzontale 0.875 / 1.125 / 1.5rem; icon-only quadrato; gap icona 0.5rem; radius radius-control; peso 700, line-height 1, white-space: nowrap.
• Varianti: primary fill primary, testo ink, bordo primary-border, hover primary-hover; secondary surface-strong, testo text, bordo border-strong, hover surface-solid; ghost trasparente, hover surface-sunken; danger fill danger, testo bianco, hover danger-hover.
• Stati: active scale(0.97); disabled opacity 0.5 + not-allowed; loading = spinner 1em a sinistra, aria-busy, disabilitato. Su <a> disabled → aria-disabled.
• Icon-only richiede aria-label.
Contenitori
GlassCard — variant default | strong | brand · padding none | sm | md | lg · interactive. Radius 1.25rem, overflow: hidden, classe .glass. Brand = glow arancio in alto a sinistra + bordo arancio 55%. Interactive = lift 2px + shadow-float.
Dialog / Sheet / Confirm / Choice — servizio che apre un pannello glass su backdrop rgb(15 15 16 / .45) + blur 4px. Dialog centrato min(32rem, 100vw − 2rem), animazione pop-in; sheet ancorato in basso (max 40rem, 90dvh, angoli inferiori a 0, safe-area). Focus trap, Esc, ripristino del focus, aria-modal. Helper confirm({title, message, confirmLabel, cancelLabel, tone: primary|danger}) → Promise<boolean>; choose({title, options}) → valore o null.
Feedback e stato
Badge — pill, padding 0.25rem 0.625rem, 0.75rem/700, tracking 0.02em. tone: neutral (surface-sunken + border), brand (fill primary), success / warning / danger (soft + *-text), live (fill danger, testo bianco, UPPERCASE 0.08em, pallino pulsante).
Role chip (micro badge) — cerchio 1.25rem, 0.6875rem/700, una lettera visibile + nome completo sr-only + tooltip title. Toni: primary, warning-soft, danger-soft, success-soft.
Toast — in alto sotto l'header, larghezza min(26rem, 100%), radius 1rem, glass strong, shadow-float, bordo sinistro 4px del tono (info = text, success, warning, danger), icona colorata col *-text, titolo bold + dettaglio text-sm muted. Due live region sempre nel DOM: assertive per errori, polite per il resto.
Skeleton — variant text | rect | circle, lines, width, height. Ultima riga al 60%. aria-hidden; la regione che carica porta aria-busy.
EmptyState — colonna centrata, padding 2.5rem 1.5rem: tile icona 4rem radius 1rem su brand-soft con icona 32px accent-text, titolo 1.125rem/800, descrizione muted max 24rem, slot azioni.
Spinner — 1em, bordo 2px currentColor, lato destro trasparente, 700ms lineare.
Dati
Stat — tile glass, padding 1rem, <dl>. Label 0.75rem/700 UPPERCASE muted con icona in tile 2rem radius 0.75rem; valore font-numeric 2.25rem/700 + hint text-sm muted. tone neutral | brand | success | danger (colora tile icona e valore).
Table — columns, rows, caption (sr-only di default), stack, rowKey, rowLink, template di cella custom. Da 640px tabella vera: header 0.75rem UPPERCASE muted, celle padding 0.75rem, divisori border, hover surface-sunken. Sotto 640px con stack ogni riga diventa una card a griglia 2 colonne con label da data-label e cella primaria a tutta larghezza; senza stack righe compatte su una linea con la cella primaria troncata. Riga navigabile = un solo link esteso su tutta la riga. Backoffice: header sticky su surface-alt, zebra, hover row-hover.
Chart — wrapper Chart.js 4 caricato on demand: type, data, options, ariaLabel, height (12rem). Colori assi/griglia letti dai token e aggiornati al cambio tema; canvas role=img + tabella sr-only dei dati; animazioni off con reduced motion.
TeamLogo / Avatar — immagine con fallback a iniziali (max 2, font display 700, size × 0.38). Size xs 1.5 · sm 2 · md 2.5 · lg 3.5 · xl 5rem. Logo = quadrato radius 28% su tile glass, object-fit: contain; avatar = cerchio. Colore del fallback: colore scelto con on calcolato, altrimenti palette fallback via hash del nome.
Form
Field — wrapper con label (0.875rem/700, asterisco danger-text se required), slot controllo, hint text-sm muted, errore text-sm 600 danger-text con icona alert e role=alert. Collega id, aria-describedby, aria-invalid, required al controllo.
Input (direttiva su input/select/textarea) — min-height 2.75rem, padding 0.625rem 0.875rem, radius control, bordo border-strong, fondo surface-strong. Focus: bordo focus + anello 0 0 0 3px brand-soft, 0 0 0 1px focus. Invalid: bordo danger. Placeholder muted all'85%.
Select — trigger role=combobox con aspetto Input; pannello overlay della stessa larghezza (si ribalta sopra), bottom sheet sotto 640px; ricerca interna accent-insensitive oltre una soglia di opzioni; opzioni con riga secondaria, avatar/logo con colore, gruppi con intestazione. Tastiera completa (frecce, Home/End, type-ahead, Enter, Esc, Tab).
Segmented — tablist WAI-ARIA in un binario glass a pill (padding 0.25rem, gap 0.25rem). Tab min-height 2.75rem, padding 0 1rem, 0.875rem/700, colore muted; selezionata nav-active bg/fg + shadow-float; icona opzionale 18px. Roving tabindex, ←/→ con wrap, Home/End.
ColorSwatches — radio group nativo: "Nessuno" (tratteggio diagonale) + gli swatch; selezionato con doppio anello (surface 2px + text 4px).
ImageInput — file (ridimensionato nel browser) o URL, anteprima circle o square (riusa Avatar/TeamLogo), "Rimuovi", errori nel Field.
Navigazione e layout
Header — sticky, glass a tutta larghezza senza radius, solo bordo inferiore, ombra 0 8px 24px -18px. Altezza 3.75rem: logo (tile 2.5rem radius 0.875rem con gradiente scuro #2c2c30 → #0f0f10) + titolo display 1.375rem UPPERCASE tracking 0.025em + tagline 0.6875rem/700 UPPERCASE tracking 0.18em muted.
TabBar — flottante in basso (0.75rem + safe-area), max 30rem, radius 1.5rem, glass strong + shadow-glass + shadow-float. Voci: colonna icona+label 0.6875rem/700 (0.75rem da 640px), min-height 3.5rem; icona in una pill 3rem × 1.875rem che da attiva prende nav-active bg/fg; press scale(0.92).
Carousel — scroll-snap orizzontale nativo, slideWidth (85% default), gap 0.75rem, frecce e pallini opzionali, tastiera sulla traccia. TabCarousel = Segmented sopra un Carousel di pannelli a tutta larghezza, altezza adattata al pannello attivo.
Sticky bar — barra di pagina che si ferma sotto l'header (top: sticky-top + 0.5rem).
Footer — bordo superiore border, link 0.875rem/600 muted, hover text + sottolineatura offset 4px, separatore ·.
Icone
Set proprietario stile Lucide: griglia 24×24, stroke currentColor 2px, line cap/join round, size default 20px (16 in badge e campi, 18 in segmented, 32 in empty state con stroke 1.75). Alcune icone sono piene (fill: currentColor, es. cartellini). Il set di icone di ui-toolkit è fuori scope per ora: i componenti ricevono l'icona da fuori (slot o prop) e ne rispettano solo dimensioni e colore (`currentColor`).
Layout, responsive, accessibilità
Mobile first con due breakpoint: 640px (tabelle vere, display più grandi, tab bar con label 0.75rem) e 1024px (desktop: layout a più colonne, backoffice piatto con sidebar).
Layout
• Contenitore pagina centrato max-width: 64rem, padding laterale max(1rem, safe-area), padding top 1.25rem.
• Spazio in fondo riservato alla tab bar: tab-bar-height + 2.5rem + safe-area; nessuno spazio sulle pagine senza tab bar.
• Variabili di layout: --header-height 3.75rem, --tabbar-height 4rem, --sticky-top = safe-area-top + header-height; scroll-padding-top = header + 1rem.
• Su desktop i blocchi della home passano a griglie a 2 colonne; le card in carousel scendono a min(42.5%, 12rem) contro min(85%, 24rem) su mobile; una card singola va a tutta larghezza in layout orizzontale (immagine 50% a sinistra).
• Backoffice ≥ 1024px: sidebar scura + top bar 3.5rem, header di pagina con titolo a sinistra e azioni a destra separati da un divisore, liste di card trasformate in un unico pannello a righe divise con zebra.
• Safe area iOS rispettata su header, tab bar, sheet, toast (env(safe-area-inset-*)).
• Z-index: sticky bar 900, header e tab bar 1000, toast 1100, skip link 1200; overlay CDK sopra.
Accessibilità (criteri obbligatori)
• Contrasti come nella sezione Colore, verificati da test unitari sui token (non a occhio).
• Focus visibile ovunque: :focus-visible { outline: 3px solid var(--focus); outline-offset: 2px }; gli input usano bordo + anello.
• Target touch ≥ 44px nel tema pubblico.
• Pattern ARIA completi: tablist (segmented), combobox/listbox (select), dialog modale con focus trap, live region (toast), aria-busy sui caricamenti, aria-current="page" nella navigazione, tabelle con caption.
• Icone decorative aria-hidden; bottoni solo icona con aria-label; informazione mai affidata al solo colore (chip con lettera + testo sr-only, badge con testo).
• Skip link "Vai al contenuto" come primo elemento focusabile.
• Media query di preferenza: prefers-color-scheme (con override data-theme="light|dark" su <html>), prefers-reduced-motion, prefers-reduced-transparency, prefers-contrast: more.
• Stampa: bianco e nero, niente chrome (header, tab bar, bottoni, toast), card con bordo nero 1px senza radius, righe non spezzate tra pagine.
Temi
Tre temi selezionabili dalla toolbar di Storybook: light, dark (attributo data-theme su <html>; senza attributo segue il sistema) e backoffice (classe .bo sul contenitore, che rimappa i token --ui-* sui --bo-*: niente vetro, radius 0.5/0.375rem, controlli compatti da 2.25rem, tabelle dense). I componenti non devono sapere in che tema sono: cambia solo il valore dei token.
Storybook e consegna
La libreria va divisa in due pacchetti: token (indipendenti dal framework) e componenti, con uno Storybook che documenta entrambi.
Token come codice
• Un'unica fonte in TypeScript/JSON (tokens.ts: BRAND, THEMES.light|dark, BACKOFFICE.light|dark, scale di spazio, radius, ombre, motion, font).
• Da quella fonte si generano tokens.css (custom properties --ui-*, --bo-*, --brand-* con i blocchi light, dark di sistema, [data-theme=dark], .bo) e un preset Tailwind 4 (@theme inline che mappa bg-surface, text-muted, text-accent, font-display, rounded-card, rounded-control, ecc.).
• Le utility condivise (.glass, .glass-strong, .font-numeric, .ui-btn*, .ui-input, .ui-skeleton, .ui-spinner, keyframes) stanno in un base.css del pacchetto.
• Helper colore esportati: contrastRatio, blend, oklch/fromOklch, onColor(hex) (ink o bianco), deriveTone(hue) che genera fill/hover/border/text/soft con le regole della sezione Colore, snapToMode per i grafici.
• Test unitari che falliscono se un token viola i contrasti dichiarati o se CSS e TS divergono.
Struttura dello Storybook
1.  Foundations: Colori (swatch con hex, OKLCH e rapporto di contrasto calcolato dal vivo in light e dark), Generatore di toni (input hue → 5 ruoli con verifica AA), Tipografia (tutta la gerarchia), Spaziatura, Radius, Ombre ed elevazione, Vetro e mesh, Motion (demo di ogni animazione).
2.  Components: una pagina per componente con storia Default, una storia per ogni variante/size/tono, stati (hover, focus, disabled, loading, error, empty), controlli args per ogni prop, pagina Docs con tabella delle props e note di accessibilità.
3.  Patterns: composizioni tipiche (header + tab bar, pagina con card e sticky segmented, form in dialog, tabella responsive, empty state con CTA, dashboard backoffice).
Decoratori globali: sfondo bg + mesh, toolbar tema (light / dark / backoffice), viewport mobile 390px e desktop 1280px, addon a11y attivo su tutte le storie, interaction test (play) per i componenti con tastiera (segmented, select, dialog, carousel).
Criteri di accettazione
[ ] Tutti i valori della sezione Colore, Tipografia, Spaziatura e Motion presenti come token, identici.
[ ] Ogni componente del catalogo con le stesse props e la stessa resa, in light, dark e backoffice.
[ ] Nessun colore letterale nei componenti (lint o test che lo verifica).
[ ] Addon a11y senza violazioni; test di contrasto verdi.
[ ] Reduced motion, reduced transparency e high contrast verificabili da toolbar.
[ ] Font self-hosted inclusi nel pacchetto, nessuna richiesta a CDN di font.
[ ] Confronto visivo con Torneo (https://c85.it) su: bottoni, card, badge, segmented, tab bar, tabella, toast, dialog.
Decisioni aperte
• Nome del progetto: ui-toolkit. Pacchetto npm ui-toolkit con entry point secondario ui-toolkit/tokens per token, CSS e preset Tailwind.
• Framework: Angular standalone (porting diretto da Torneo: signals, OnPush, zoneless, Angular CDK per overlay e dialog).
• Tema backoffice: incluso nella libreria, come terzo tema accanto a light e dark.
• Icone: fuori scope per ora, si definiscono in un secondo momento. I componenti accettano un'icona tramite slot o prop, senza dipendere da un set specifico.
• Pubblicazione del pacchetto: fuori scope, gestita dal proprietario del progetto. Non configurare registry né pipeline di publish.
Prompt da incollare
Sei un senior design-system engineer. Costruisci "ui-toolkit", una libreria di componenti Angular riusabile con Storybook,
seguendo ALLA LETTERA il documento "Linee guida libreria componenti C85" che ti allego.

Vincoli:
- I valori (hex, rem, ms, curve) del documento sono vincolanti: riportali identici nei token.
- Le regole di sfumatura OKLCH servono per estendere il sistema a nuove tinte: implementa deriveTone(hue).
- Due pacchetti: tokens (TS -> CSS custom properties + preset Tailwind 4) e componenti.
- Framework componenti: Angular (standalone, signals input/model, OnPush, zoneless), come libreria Angular CLI
  pubblicabile con ng-packagr. Storybook ultima versione stabile per Angular.
- Componenti senza colori letterali, solo token; tre temi: light, dark, backoffice.
- Accessibilita: WCAG AA, pattern ARIA indicati, addon a11y senza violazioni, test di contrasto sui token.

Procedi cosi:
1. Proponi la struttura del repo e chiedimi conferma.
2. Token + Foundations in Storybook.
3. Componenti nell'ordine: Button, GlassCard, Badge, Field/Input, Segmented, Select, Dialog, Toast,
   Skeleton, EmptyState, Stat, Table, Avatar/TeamLogo, Carousel, TabCarousel, Header, TabBar, Chart.
4. Patterns.
Dopo ogni passo mostra cosa hai fatto e verifica i criteri di accettazione del documento.
