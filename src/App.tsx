import { useState, useEffect, useRef, createContext, useContext } from 'react'
import { createPortal } from 'react-dom'

const AP = '/assets'

// ── Table icons ─────────────────────────────────────────────────────────────
const ICO = {
  cross:     `${AP}/e5330.svg`,
  chkGray:   `${AP}/17101.svg`,
  chkMain:   `${AP}/ed13e.svg`,
  chkWork:   `${AP}/bd5e0.svg`,
  chkFam:    `${AP}/5896e.svg`,
  logoCloud: `${AP}/d965a.svg`,
  logoMail:  `${AP}/b0867.svg`,
  phone:     `${AP}/0db7a.svg`,
  copy:      `${AP}/effcd.svg`,
  doc:       `${AP}/09775.svg`,
  block:     `${AP}/81d35.svg`,
  stars:     `${AP}/05a90.svg`,
  notif:     `${AP}/9cf11.svg`,
  mailRu:    `${AP}/0192c.svg`,
  users:     `${AP}/fef15.svg`,
  folder:    `${AP}/3fcf3.svg`,
  limited:   `${AP}/d40b1.svg`,
}

// ── Page layout icons ────────────────────────────────────────────────────────
const PG = {
  mailLogo:    `${AP}/f4c34.svg`,
  avatar:      `${AP}/ed958.png`,
  avatarPortal:`${AP}/ec729.png`,
  dropdown:    `${AP}/3eefa.svg`,
  gridIcon:    `${AP}/c3d80.svg`,
  arrowRight:  `${AP}/40401.svg`,
  // storage card
  storageAva:  `${AP}/11659.png`,
  avatarSvg1:  `${AP}/54cc3.svg`,
  avatarSvg2:  `${AP}/621ae.svg`,
  counter:     `${AP}/b7469.svg`,
  // actions card
  promoIcon:   `${AP}/f6c7c.svg`,
  histIcon:    `${AP}/5772d.svg`,
  chevron:     `${AP}/d30fa.svg`,
  // included features
  cloudIco:    `${AP}/cf901.svg`,
  uploadIco:   `${AP}/6b8f3.svg`,
  attachIco:   `${AP}/9d101.svg`,
  docTextIco:  `${AP}/e7503.svg`,
  phoneIco:    `${AP}/1d9dc.svg`,
  shieldIco:   `${AP}/4298e.svg`,
  // promo card illustration
  img11:       `${AP}/919ee.png`,
  img9:        `${AP}/3c641.png`,
  img8:        `${AP}/fa4f8.png`,
  blobVector:  `${AP}/58823.svg`,
  serviceIcos: `${AP}/0d62f.svg`,
  flash:       `${AP}/33c88.svg`,
}

// ── Breakpoints ──────────────────────────────────────────────────────────────
// xl ≥1366  desktop mock (sidebar + 992 content)
// lg ≥1024  laptop: sidebar stays, content fills
// md ≥768   tablet: no sidebar, stacked cards
// sm <768   mobile
type BP = 'sm' | 'md' | 'lg' | 'xl'
function widthToBp(w: number): BP {
  if (w >= 1366) return 'xl'
  if (w >= 1200) return 'lg'
  if (w >= 768) return 'md'
  return 'sm'
}

interface Layout {
  bp: BP
  w: number
  featW: number
  planW: number
  tablePad: number
  pagePad: number
  hasSidebar: boolean
  stackCards: boolean
  menuOpen: boolean
  setMenuOpen: (v: boolean) => void
  paid: boolean
  setPaid: (v: boolean) => void
}

const PLAN_W = 250
const LayoutCtx = createContext<Layout>({
  bp: 'xl', w: 1366, featW: 262, planW: PLAN_W, tablePad: 24, pagePad: 24,
  hasSidebar: true, stackCards: false, menuOpen: false, setMenuOpen: () => {},
  paid: false, setPaid: () => {},
})
function useLayout() { return useContext(LayoutCtx) }

function appBase() {
  const raw = import.meta.env.BASE_URL || '/'
  return raw.endsWith('/') ? raw : `${raw}/`
}

function paidFromUrl() {
  if (typeof window === 'undefined') return false
  const { pathname, search, hash } = window.location
  const clean = pathname.replace(/\/+$/, '') || '/'
  if (clean.endsWith('/paid')) return true
  if (clean.endsWith('/free')) return false
  const q = new URLSearchParams(search)
  if (q.get('mode') === 'paid' || q.has('paid')) return true
  if (/^#\/?paid/.test(hash)) return true
  return false
}

function urlForPaid(paid: boolean) {
  return paid ? `${appBase()}paid` : appBase()
}

function metricsFor(bp: BP) {
  const pagePad = bp === 'sm' ? 16 : 24
  const featW = bp === 'sm' ? 168 : bp === 'md' ? 208 : 262
  const tablePad = pagePad
  return {
    featW,
    planW: PLAN_W,
    tablePad,
    pagePad,
    hasSidebar: bp === 'xl' || bp === 'lg',
    stackCards: bp === 'sm' || bp === 'md',
  }
}

// ── Table column config ──────────────────────────────────────────────────────
const COL_CHK = [ICO.chkGray, ICO.chkMain, ICO.chkWork, ICO.chkFam, ICO.chkGray]

type V = boolean | 'base'
interface Feat { id: string; label: string; isNew?: boolean; v: V[]; tip: string }
interface Sect { id: string; title: string; logo: string; rows: Feat[] }

const DATA: Sect[] = [
  {
    id: 'cloud', title: 'Облако', logo: ICO.logoCloud,
    rows: [
      { id: 'no-ads',      label: 'Без рекламы',                                                    v: [false, true,   true,   true,   false], tip: 'Облако без рекламных блоков — больше внимания вашим файлам.' },
      { id: 'doc-edit',    label: 'Редактирование документов',                                      v: ['base',true,   true,   true,  'base'], tip: 'Редактируйте документы, хранящиеся в Облаке.' },
      { id: 'autosave',    label: 'Автосохранение файлов с телефона в Облако',            v: ['base',true,   true,   true,  'base'], tip: 'Сохраняйте файлы с телефона в Облако автоматически.' },
      { id: 'extra-space', label: 'Дополнительное место для файлов',                           v: [false, true,   true,   true,   false], tip: 'Больше пространства в Облаке для документов, фотографий и других файлов.' },
      { id: 'upload-100',  label: 'Загрузка файлов до 100 ГБ в Облако',             v: [false, true,   true,   true,   false], tip: 'Загружайте в Облако файлы размером до 100 ГБ.' },
      { id: 'timer',       label: 'Таймер для автоудаления отправленных папок',                v: [false, true,   true,   true,   false], tip: 'Папки вместе с содержимым удалятся у получателя через выбранное вами время.' },
      { id: 'folder-dsgn', label: 'Выбор оформления для совместных папок',                    v: [false, true,   true,   true,   false], tip: 'Настройте оформление папки, которой делитесь по ссылке.' },
      { id: 'folder-pass', label: 'Пароль для совместных папок\nв веб-версии',             v: [false, true,   true,   true,   false], tip: 'В веб-версии можно защитить совместную папку паролем.' },
      { id: 'share-3',     label: 'Можно делиться местом ещё с 3 участниками',           v: [false, false,  false,  true,   false], tip: 'Делитесь пространством подписки ещё с тремя участниками.' },
      { id: 'dedup',       label: 'Удаление дубликатов',        isNew: true,                       v: [false, true,   true,   true,   false], tip: 'Находите и удаляйте повторяющиеся файлы, чтобы освободить место.' },
      { id: 'swipes',      label: 'Разбор фото свайпами',       isNew: true,                       v: [false, true,   true,   true,   false], tip: 'Разбирайте фотографии свайпами: выбирайте, что сохранить, а что удалить.' },
      { id: 'fam-folders', label: 'Семейные папки с общим доступом', isNew: true,             v: [false, false,  false,  true,   false], tip: 'Храните семейные файлы в папках с общим доступом.' },
      { id: 'fam-albums',  label: 'Семейные альбомы с общим доступом', isNew: true,           v: [false, false,  false,  true,   false], tip: 'Собирайте семейные фотографии в альбомах с общим доступом.' },
      { id: 'fam-cal',     label: 'Семейный календарь',         isNew: true,                       v: [false, false,  false,  true,   false], tip: 'Планируйте семейные события в общем календаре.' },
      { id: 'fam-docs',    label: 'Распознавание документов семьи', isNew: true,                   v: [false, false,  false,  true,   false], tip: 'Распознавайте текст на изображениях семейных документов.' },
      { id: 'fam-unlim',   label: 'Безлимит и отключение рекламы у всех в подписке', isNew: true, v: [false, false, false, true, false], tip: 'Безлимит и отключение рекламы доступны всем участникам подписки.' },
    ]
  },
  {
    id: 'mail', title: 'Почта', logo: ICO.logoMail,
    rows: [
      { id: 'mail-space',  label: 'Дополнительное место для писем',                      v: [false, true,   true,   true,   true],  tip: 'Больше места для хранения писем и вложений в Почте.' },
      { id: 'antivirus',   label: 'Проверка вложений антивирусов',                       v: ['base',true,   true,   true,  'base'], tip: 'Вложения проверяются антивирусом на наличие угроз.' },
      { id: 'mail-noad',   label: 'Без рекламы',                                          v: [false, true,   true,   true,   false], tip: 'Пользуйтесь Почтой без рекламных блоков.' },
      { id: 'attach-100',  label: 'Отправка вложений до 100 ГБ в письмах',               v: [false, true,   true,   false,  false], tip: 'Отправляйте в письмах вложения размером до 100 ГБ.' },
      { id: 'widgets',     label: 'Полезные виджеты Календаря и Задач всегда на виду',   v: [false, false,  true,   false,  false], tip: 'Держите события Календаря и задачи на виду в интерфейсе Почты.' },
      { id: 'undo',        label: 'Отмена отправки писем в течение 20 секунд',            v: [false, false,  true,   false,  false], tip: 'Передумали отправлять письмо? Отмените отправку в течение 20 секунд.' },
      { id: 'read-rcpt',   label: 'Уведомления о прочтении ваших писем',                 v: [false, false,  true,   false,  false], tip: 'Получайте уведомления о прочтении отправленных писем.' },
      { id: 'address',     label: 'Красивый адрес',              isNew: true,            v: [false, false,  true,   false,  false], tip: 'Используйте красивый адрес для вашей почты.' },
      { id: 'ai-style',    label: 'Генерация и изменение стиля писем', isNew: true,      v: [false, false,  true,   false,  false], tip: 'Создавайте черновики писем и меняйте стиль текста с помощью нейросети.' },
      { id: 'ai-sum',      label: 'Краткий пересказ писем',      isNew: true,            v: [false, false,  true,   false,  false], tip: 'Получайте краткое содержание письма, чтобы быстрее понять главное.' },
      { id: 'ai-asst',     label: 'Нейропомощник',               isNew: true,            v: [false, false,  true,   false,  false], tip: 'Используйте нейропомощника для работы с письмами.' },
    ]
  }
]

interface PlanDef {
  id: string; name: string; cname?: string
  bg: string; border?: string; isCurrent?: boolean
  sub?: string
  price?: string; disc?: string
  bullets?: { ico: string; txt: string }[]
}

const PLANS: PlanDef[] = [
  {
    id: 'free', name: 'Бесплатный', cname: 'Бесплатно',
    sub: '8 ГБ в едином пространстве Облака и Почты',
    bg: 'white', border: '1px solid rgba(0,16,61,0.08)',
    isCurrent: true,
  },
  {
    id: 'main', name: 'Основной',
    sub: 'Больше места и возможностей', bg: '#f0f7ff',
    price: 'от 87 ₽', disc: 'до — 79%',
    bullets: [
      { ico: ICO.phone,   txt: 'Безлимит для фото с телефона' },
      { ico: ICO.copy,    txt: 'Удаление дубликатов' },
      { ico: ICO.doc,     txt: 'Загрузка файлов до 100 ГБ' },
      { ico: ICO.block,   txt: 'Без рекламы в Почте и Облаке' },
    ]
  },
  {
    id: 'work', name: 'Для работы',
    sub: 'Место и функции для рабочих задач', bg: '#f2fcfe',
    price: 'от 108 ₽', disc: 'до −80%',
    bullets: [
      { ico: ICO.stars,   txt: 'Краткий пересказ' },
      { ico: ICO.notif,   txt: 'Уведомление о прочтении' },
      { ico: ICO.mailRu,  txt: 'Красивый адрес' },
      { ico: ICO.block,   txt: 'Без рекламы в Почте и Облаке' },
    ]
  },
  {
    id: 'family', name: 'Семейный',
    sub: 'Одна подписка на четверых', bg: '#f8f6ff',
    price: 'от 149 ₽', disc: 'до −75%',
    bullets: [
      { ico: ICO.phone,   txt: 'Семейный безлимит' },
      { ico: ICO.users,   txt: 'Добавление ещё 3 участников' },
      { ico: ICO.folder,  txt: 'Семейные папки и альбомы' },
      { ico: ICO.block,   txt: 'Без рекламы в Почте и Облаке' },
    ]
  },
  {
    id: 'minimal', name: 'Минимальный',
    sub: 'Только место в Облаке и Почте', bg: '#f6f7f8',
    price: 'от 83 ₽', disc: 'до −79%',
    bullets: [
      { ico: ICO.limited, txt: 'Безлимит для фото с телефона' },
      { ico: ICO.limited, txt: 'Удаление дубликатов' },
      { ico: ICO.limited, txt: 'Загрузка файлов до 100 ГБ' },
      { ico: ICO.limited, txt: 'Без рекламы в Почте и Облаке' },
    ]
  },
]

const PAID_COL = [4, 1, 2, 3]
const PAID_PLANS: PlanDef[] = [
  {
    ...PLANS[4],
    isCurrent: true,
    sub: undefined,
    disc: undefined,
    bg: 'white',
    border: '1px solid rgba(0,16,61,0.08)',
  },
  PLANS[1],
  PLANS[2],
  PLANS[3],
]

function usePlans() {
  const { paid } = useLayout()
  if (!paid) return { plans: PLANS, mapV: (v: V[]) => v, chks: COL_CHK }
  return {
    plans: PAID_PLANS,
    mapV: (v: V[]) => PAID_COL.map(i => v[i]),
    chks: PAID_COL.map(i => COL_CHK[i]),
  }
}

// ── Table sub-components ─────────────────────────────────────────────────────

function NewBadge() {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      height: 22, padding: '0 6px', borderRadius: 100,
      background: '#b8fc75', transform: 'rotate(-5deg)', flexShrink: 0,
    }}>
      <span style={{
        fontFamily: "var(--fontfamilyaccent)",
        color: '#087c6d', fontSize: 13, lineHeight: '18px', whiteSpace: 'nowrap',
      }}>New</span>
    </span>
  )
}

interface TipState { x: number; y: number; text: string }

function FeatureRow({ feat }: { feat: Feat }) {
  const { featW, planW, tablePad, bp } = useLayout()
  const { plans, mapV, chks } = usePlans()
  const [hovered, setHovered] = useState(false)
  const [tip, setTip] = useState<TipState | null>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const touch = bp === 'sm' || bp === 'md'

  const placeTip = () => {
    if (!btnRef.current) return
    const r = btnRef.current.getBoundingClientRect()
    const x = Math.min(Math.max(r.left + r.width / 2, 128), window.innerWidth - 128)
    setTip({ x, y: r.top, text: feat.tip })
  }

  const hoverBg = hovered ? 'rgba(0,0,0,0.042)' : 'transparent'
  const hoverBgSolid = hovered ? '#f5f5f5' : 'white'

  return (
    <>
      <div
        style={{
          display: 'flex', alignItems: 'center',
          borderRadius: 8, paddingTop: 4, paddingBottom: 4,
          background: hoverBg, transition: 'background 100ms',
          minWidth: featW + plans.length * planW,
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); if (!touch) setTip(null) }}
      >
        <div style={{
          position: 'sticky', left: 0, zIndex: 4,
          width: tablePad, alignSelf: 'stretch', flexShrink: 0, marginRight: -tablePad,
          background: hoverBgSolid, transition: 'background 100ms',
        }} />
        <div style={{
          width: featW, flexShrink: 0,
          position: 'sticky', left: tablePad, zIndex: 5,
          background: hoverBgSolid, transition: 'background 100ms',
          display: 'flex', alignItems: 'center', gap: 6,
          paddingLeft: 12, paddingRight: 8,
        }}>
          {feat.isNew && <NewBadge />}
          <span style={{
            fontFamily: "var(--fontfamilybase)",
            fontSize: bp === 'sm' ? 13 : 15, lineHeight: bp === 'sm' ? '18px' : '20px', color: '#2c2d2e',
            flexShrink: 1, whiteSpace: 'pre-line',
          }}>
            {feat.label}
          </span>
          <button
            ref={btnRef}
            onMouseEnter={() => { if (!touch) placeTip() }}
            onMouseLeave={() => { if (!touch) setTip(null) }}
            onClick={() => { if (touch) { if (tip) setTip(null); else placeTip() } }}
            aria-label="Подробнее"
            style={{
              opacity: hovered || touch ? 1 : 0, transition: 'opacity 150ms',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 16, height: 16, borderRadius: '50%',
              border: '1.5px solid rgba(0,0,0,0.3)',
              background: 'transparent', cursor: 'pointer',
              flexShrink: 0, marginLeft: 'auto',
            }}
          >
            <span style={{
              fontFamily: "var(--fontfamilybase)",
              fontSize: 10, color: 'rgba(0,0,0,0.45)', lineHeight: 1,
            }}>i</span>
          </button>
        </div>

        {mapV(feat.v).map((val, ci) => (
          <div key={ci} style={{
            width: planW, flexShrink: 0,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            height: 28,
          }}>
            {val === false
              ? <img src={ICO.cross}    alt="—" style={{ width: 20, height: 20 }} />
              : <img src={chks[ci]} alt="✓" style={{ width: 20, height: 20 }} />
            }
          </div>
        ))}
      </div>

      {tip && createPortal(
        <div style={{
          position: 'fixed',
          left: tip.x, top: tip.y - 10,
          transform: 'translate(-50%, -100%)',
          zIndex: 9999, maxWidth: 240,
          background: '#2c2d2e', color: 'white',
          borderRadius: 12, padding: '8px 12px',
          fontSize: 12, lineHeight: '16px',
          fontFamily: "var(--fontfamilybase)",
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          pointerEvents: 'none',
        }}>
          {tip.text}
          <div style={{
            position: 'absolute', left: '50%', bottom: -5,
            transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: '6px solid #2c2d2e',
          }} />
        </div>,
        document.body
      )}
    </>
  )
}

function PlanCard({ plan, compact }: { plan: PlanDef; compact: boolean }) {
  const { planW, paid } = useLayout()
  const currentPaid = paid && plan.isCurrent
  const hideSub = paid
  const TR = 'max-height 260ms ease-out, opacity 220ms ease-out'
  const show = (visible: boolean, maxH: number) => ({
    maxHeight: visible ? maxH : 0,
    opacity:   visible ? 1    : 0,
    overflow: 'hidden',
    transition: TR,
  })

  const YourPlanBadge = () => (
    <div style={{
      background: '#2c2d2e', color: 'white',
      fontFamily: "var(--fontfamilybase)",
      fontSize: 11, lineHeight: '14px',
      padding: '2px 8px 3px', borderRadius: 10,
      whiteSpace: 'nowrap', flexShrink: 0,
    }}>
      Ваш тариф
    </div>
  )

  return (
    <div style={{
      width: planW, flexShrink: 0,
      background: plan.bg,
      border: plan.border,
      borderRadius: 20,
      padding: compact ? '12px 20px' : '16px 20px 20px',
      display: 'flex', flexDirection: 'column',
      justifyContent: compact ? 'flex-start' : 'space-between',
      minHeight: compact ? 72 : 242,
      transition: 'padding 260ms ease-out, min-height 260ms ease-out',
      overflow: 'hidden', boxSizing: 'border-box',
      position: 'relative',
    }}>

      {plan.isCurrent && !compact && (
        <div style={{ position: 'absolute', top: 16, right: 20 }}>
          <YourPlanBadge />
        </div>
      )}

      <div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          marginBottom: compact ? 0 : 8,
          paddingRight: plan.isCurrent && !compact ? 72 : 0,
          transition: 'margin-bottom 260ms ease-out',
        }}>
          <p style={{
            fontFamily: "var(--fontfamilyaccent)",
            fontSize: 15, lineHeight: '20px', color: '#2c2d2e',
            margin: 0, flex: 1,
          }}>
            {compact ? (plan.cname ?? plan.name) : plan.name}
          </p>
          {plan.isCurrent && compact && <YourPlanBadge />}
        </div>

        {plan.sub && !hideSub && (
          <div style={{ ...show(!compact, 40), marginBottom: plan.bullets ? 8 : 0, transition: TR + ', margin-bottom 260ms ease-out' }}>
            <p style={{
              fontFamily: "var(--fontfamilybase)",
              fontSize: 12, lineHeight: '16px',
              color: 'rgba(39,43,55,0.5)', margin: 0,
            }}>
              {plan.sub}
            </p>
          </div>
        )}

        {plan.bullets && (
          <div style={{ ...show(!compact, 130), display: 'flex', flexDirection: 'column', gap: 10, transition: TR }}>
            {plan.bullets.map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <img src={b.ico} alt="" style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1 }} />
                <span style={{
                  fontFamily: "var(--fontfamilybase)",
                  fontSize: 12, lineHeight: '16px',
                  color: currentPaid ? '#697481' : '#2c2d2e',
                }}>{b.txt}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {plan.price && (
        <div style={{ position: 'relative', marginTop: compact ? 8 : 24, alignSelf: 'flex-start' }}>
          <button style={{
                width: 'fit-content', height: 36,
                background: currentPaid ? '#f0f1f3' : '#0077ff',
                color: currentPaid ? '#2c2d2e' : 'white',
                fontFamily: "var(--fontfamilyaccent)",
                fontSize: 15, lineHeight: '20px',
                borderRadius: 8, padding: '8px 16px',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxSizing: 'border-box',
              }}>
                {paid ? plan.price : compact ? 'Подключить' : `Подключить ${plan.price}`}
              </button>
              {plan.disc && !currentPaid && (
            <div style={{
              position: 'absolute', top: -11, right: 4,
              transform: 'rotate(5deg)',
              background: '#b8fc75', color: '#087c6d',
              fontFamily: "var(--fontfamilybase)",
              fontSize: 11, lineHeight: '14px',
              padding: '1px 8px 2px', borderRadius: 10,
              whiteSpace: 'nowrap',
            }}>
              {plan.disc}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function TableHeader({ compact, plansRef, canLeft, canRight }: {
  compact: boolean
  plansRef: React.RefObject<HTMLDivElement | null>
  canLeft: boolean
  canRight: boolean
}) {
  const { featW, tablePad, bp, paid } = useLayout()
  const { plans } = usePlans()
  const tightHead = compact || bp === 'sm' || bp === 'md'
  const padY = tightHead ? (bp === 'sm' ? 12 : 16) : 24
  const headSize = bp === 'sm' ? 15 : 17
  const headLh = bp === 'sm' ? '20px' : '22px'
  return (
    <div style={{
      display: 'flex',
      background: 'white',
      borderRadius: '24px 24px 0 0',
      padding: tightHead ? `${padY}px ${tablePad}px 14px` : `${padY}px ${tablePad}px 20px`,
      transition: 'padding 250ms ease-out',
      overflow: 'hidden',
      position: 'relative',
    }}>
      <div style={{
        width: featW - 8 + tablePad, flexShrink: 0,
        marginLeft: -tablePad, paddingLeft: tablePad,
        paddingTop: tightHead ? 12 : 16,
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
        background: 'white', position: 'relative', zIndex: 4,
      }}>
        <div style={{
          maxHeight: tightHead ? 80 : 0, opacity: tightHead ? 1 : 0,
          overflow: 'hidden',
          transition: 'max-height 250ms ease-out, opacity 220ms ease-out',
        }}>
          <p style={{
            fontFamily: "var(--fontfamilyaccent)",
            fontSize: headSize, lineHeight: headLh, color: '#2c2d2e',
            margin: '0 0 8px',
          }}>
            {paid
              ? <>Больше возможностей с&#160;тарифами Mail&#160;Space</>
              : <>Сравнить с&#160;другими и&#160;улучшить свой тариф</>}
          </p>
        </div>
        <div style={{
          maxHeight: tightHead ? 0 : 200, opacity: tightHead ? 0 : 1,
          overflow: 'hidden',
          transition: 'max-height 250ms ease-out, opacity 220ms ease-out',
        }}>
          <p style={{
            fontFamily: "var(--fontfamilyaccent)",
            fontSize: 17, lineHeight: '22px', color: '#2c2d2e',
            margin: '0 0 8px',
          }}>
            {paid
              ? <>Больше возможностей с&#160;тарифами Mail&#160;Space</>
              : <>Сравните с&#160;другими и&#160;улучшите свой тариф</>}
          </p>
          <p style={{
            fontFamily: "var(--fontfamilybase)",
            fontSize: 12, lineHeight: '16px',
            color: 'rgba(39,43,55,0.5)', margin: 0,
          }}>
            {paid
              ? <>Подписка на единое пространство для ваших файлов из Облака и Почты. Выберите тариф от 512 ГБ до 4 ТБ</>
              : <>Можно выбрать функции и&#160;память от&#160;<strong style={{ fontFamily: "var(--fontfamilybase)", fontWeight: 700 }}>256&#160;ГБ до 4 ТБ</strong>. Когда подключите новый тариф, текущий отключится. Если остались оплаченные дни в текущем тарифе, на новый будет скидка</>}
          </p>
        </div>
      </div>

      {/* Plans section only — gets translateX; slides under the left column */}
      <div ref={plansRef} style={{ display: 'flex', gap: 8, marginLeft: 8, flexShrink: 0 }}>
        {plans.map(plan => (
          <PlanCard key={plan.id} plan={plan} compact={compact} />
        ))}
      </div>

      {canLeft && (
        <div style={{
          position: 'absolute',
          left: featW - 8 + tablePad,
          top: 0, bottom: 0,
          width: 88,
          background: 'linear-gradient(to right, #fff 0%, rgba(255,255,255,0.75) 40%, rgba(255,255,255,0) 100%)',
          pointerEvents: 'none',
          zIndex: 3,
        }} />
      )}
      {canRight && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: 0, bottom: 0,
          width: 88,
          background: 'linear-gradient(to left, #fff 0%, rgba(255,255,255,0.75) 40%, rgba(255,255,255,0) 100%)',
          pointerEvents: 'none',
          zIndex: 3,
        }} />
      )}
    </div>
  )
}

// ── Page layout components ───────────────────────────────────────────────────

function PortalMenu() {
  const { bp, pagePad, hasSidebar } = useLayout()
  const S = { fontFamily: "var(--fontfamilybase)", fontSize: 13, color: '#2c2d2e', whiteSpace: 'nowrap' as const }
  const links =
    bp === 'xl' ? ['Облако', 'Однокласники', 'ВКонтакте', 'Новости', 'Знакомства', 'Игры'] :
    bp === 'lg' ? ['Облако', 'ВКонтакте', 'Новости'] :
    ['Облако']
  const showAll = bp === 'xl' || bp === 'lg'
  const showEmail = bp !== 'sm'
  const padX = hasSidebar ? 20 : pagePad

  return (
    <div style={{
      height: 32, background: '#f6f7f8',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: `0 ${padX}px`, gap: 12, flexShrink: 0, minWidth: 0,
      position: 'relative', zIndex: 60,
    }}>
      <div style={{ display: 'flex', gap: bp === 'sm' ? 12 : 16, alignItems: 'center', minWidth: 0, overflow: 'hidden' }}>
        <span style={{ ...S, flexShrink: 0 }}>Mail</span>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
          <span style={S}>Почта</span>
          <div style={{ position: 'relative', width: 16, height: 16, flexShrink: 0 }}>
            <div style={{ background: '#07f', borderRadius: 8, width: 16, height: 16, position: 'absolute' }} />
            <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "var(--fontfamilybase)", fontSize: 10, color: 'white', lineHeight: '16px' }}>2</span>
          </div>
        </div>
        {links.map(s => (
          <span key={s} style={{ ...S, flexShrink: 0 }}>{s}</span>
        ))}
        {showAll && (
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
            <span style={S}>Все проекты</span>
            <img src={PG.gridIcon} alt="" style={{ width: 16, height: 16 }} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <div style={{ width: 16, height: 16, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
          <img src={PG.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        {showEmail && (
          <>
            <span style={S}>a.oleynichenko@vk.team</span>
            <img src={PG.dropdown} alt="" style={{ width: 16, height: 16 }} />
          </>
        )}
      </div>
    </div>
  )
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M3 5.5h14M3 10h14M3 14.5h14" stroke="#2c2d2e" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function ModeToggle() {
  const { paid, setPaid, bp } = useLayout()
  const compact = bp === 'sm'
  return (
    <div style={{
      background: 'white', borderRadius: 10, padding: 3,
      display: 'flex', gap: 2, flexShrink: 0,
    }}>
      {([
        { v: false, l: 'Без подписки' },
        { v: true,  l: 'С подпиской' },
      ] as const).map(o => (
        <button
          key={o.l + String(o.v)}
          type="button"
          onClick={() => setPaid(o.v)}
          style={{
            border: 'none', borderRadius: 8, padding: compact ? '5px 8px' : '6px 10px',
            background: paid === o.v ? '#07f' : 'transparent',
            color: paid === o.v ? 'white' : '#2c2d2e',
            fontFamily: "var(--fontfamilyaccent)",
            fontSize: compact ? 12 : 13, lineHeight: '16px', cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          {o.l}
        </button>
      ))}
    </div>
  )
}

function HeadBar() {
  const { pagePad, hasSidebar, menuOpen, setMenuOpen } = useLayout()
  return (
    <div style={{
      height: 56, background: '#f6f7f8',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      paddingLeft: hasSidebar ? 76 : pagePad,
      paddingRight: hasSidebar ? 20 : pagePad, gap: 8,
      flexShrink: 0, position: 'relative', zIndex: 60,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        {!hasSidebar && (
          <button
            aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              width: 32, height: 32, border: 'none', background: 'transparent',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 0, borderRadius: 8, marginLeft: -6,
            }}
          >
            <MenuIcon />
          </button>
        )}
        <img src={PG.mailLogo} alt="Mail" style={{ height: 30, width: 93 }} />
      </div>
      <ModeToggle />
    </div>
  )
}

function Sidebar() {
  const navItems = [
    { label: 'Главная',           active: false, arrow: false },
    { label: 'Личные данные',     active: false, arrow: false },
    { label: 'Моя подписка',      active: true,  arrow: false },
    { label: 'Контакты и адреса', active: false, arrow: false },
    { label: 'Безопасность',      active: false, arrow: false },
    { label: 'Помощь',            active: false, arrow: true  },
    { label: 'Все настройки',     active: false, arrow: true  },
  ]
  return (
    <div style={{ width: 264, flexShrink: 0, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 24, position: 'sticky', top: 0, alignSelf: 'flex-start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 56, height: 56, borderRadius: 48, overflow: 'hidden' }}>
          <img src={PG.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ textAlign: 'center', width: '100%' }}>
          <div style={{ fontFamily: "var(--fontfamilyaccent)", fontSize: 20, lineHeight: '24px', color: '#2c2d2e' }}>
            Ася Олейниченко
          </div>
          <div style={{ fontFamily: "var(--fontfamilybase)", fontSize: 15, lineHeight: '20px', color: '#87898f' }}>
            a.oleynichenko@vk.team
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {navItems.map(item => (
          <div key={item.label} style={{
            height: 36, display: 'flex', alignItems: 'center',
            padding: '0 16px 0 12px', borderRadius: item.active ? 8 : 0,
            background: item.active ? 'rgba(0,16,61,0.08)' : 'transparent',
            cursor: 'default',
          }}>
            <span style={{
              flex: 1, fontFamily: "var(--fontfamilyaccent)",
              fontSize: 15, lineHeight: '20px', color: '#2c2d2e',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{item.label}</span>
            {item.arrow && (
              <img src={PG.arrowRight} alt="" style={{ width: 20, height: 20, flexShrink: 0 }} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function StorageCard() {
  const { bp, stackCards, paid, pagePad } = useLayout()
  const fill = bp === 'lg' || stackCards
  return (
    <div style={{
      background: 'white', borderRadius: 20, padding: pagePad,
      width: fill ? '100%' : 600, flex: fill && !stackCards ? 1.63 : undefined,
      minWidth: 0, flexShrink: stackCards ? 1 : 0,
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      gap: 32, boxSizing: 'border-box',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, minWidth: 0 }}>
          <span style={{ fontFamily: "var(--fontfamilyaccent)", fontSize: 17, lineHeight: '22px', color: '#2c2d2e', minWidth: 0 }}>
            {paid ? 'Занято 4.5 ГБ из 584 ГБ' : 'Занято 4.5 ГБ из 8 ГБ'}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            {[PG.storageAva, PG.avatarSvg1, PG.avatarSvg2].map((src, i) => (
              <div key={i} style={{
                width: 30, height: 32, marginRight: -6,
                border: '2px solid white', borderRadius: '50%',
                overflow: 'hidden', position: 'relative', zIndex: 3 - i,
                background: '#eee',
              }}>
                <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
            <div style={{ width: 32, height: 32, flexShrink: 0 }}>
              <img src={PG.counter} alt="" style={{ width: '100%', height: '100%' }} />
            </div>
          </div>
        </div>

        <div>
          <div style={{ height: 8, background: 'rgba(0,16,61,0.06)', borderRadius: 4, position: 'relative', margin: '12px 0' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: paid ? '9.87%' : '56.25%', background: '#b8fc75', borderRadius: 4, border: '2px solid white', boxSizing: 'border-box' }} />
            <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: paid ? '5.24%' : '16.25%', background: '#07f', borderRadius: 4, border: '2px solid white', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            {[{ color: '#07f', label: 'Почта 1.3 ГБ' }, { color: '#b8fc75', label: 'Облако 3.3 ГБ' }].map(l => (
              <div key={l.label} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ width: 8, height: 8, borderRadius: 20, background: l.color, flexShrink: 0 }} />
                <span style={{ fontFamily: "var(--fontfamilybase)", fontSize: 12, lineHeight: '16px', color: '#2c2d2e' }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
        <button style={{
          background: paid ? '#f0f1f3' : '#07f', color: paid ? '#2c2d2e' : 'white',
          fontFamily: "var(--fontfamilyaccent)",
          fontSize: 14, lineHeight: '20px', height: 32,
          borderRadius: 8, padding: '6px 12px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
        }}>Увеличить место</button>
        <button style={{
          background: 'transparent', color: '#0070f0',
          fontFamily: "var(--fontfamilyaccent)",
          fontSize: 14, lineHeight: '20px', height: 32,
          borderRadius: 8, padding: '6px 8px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
        }}>Очистить место</button>
      </div>
    </div>
  )
}

function ActionsCard() {
  const { bp, stackCards, paid } = useLayout()
  const fill = bp === 'lg' || stackCards
  const actions = [
    { icon: PG.promoIcon, label: 'Активация промокода' },
    { icon: PG.histIcon,  label: 'История платежей', sub: paid ? 'Следующий платёж 18 мая 2026' : undefined },
    { icon: PG.histIcon,  label: 'Банковская карта', sub: paid ? '•••• 0637' : undefined },
  ]
  const [hovered, setHovered] = useState<string | null>(null)
  return (
    <div style={{
      background: 'white', borderRadius: 20, padding: 8,
      width: fill ? '100%' : 368, flex: fill && !stackCards ? 1 : undefined,
      minWidth: 0, flexShrink: stackCards ? 1 : 0, boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      {actions.map(a => (
        <div key={a.label}
          onMouseEnter={() => setHovered(a.label)}
          onMouseLeave={() => setHovered(null)}
          style={{
            display: 'flex', alignItems: 'center', gap: 16,
            padding: 8, borderRadius: 12, cursor: 'pointer',
            minHeight: 56, boxSizing: 'border-box',
            background: hovered === a.label ? '#f6f7f8' : 'transparent',
            transition: 'background 120ms ease-out',
          }}>
          <div style={{ background: '#f6f7f8', borderRadius: 20, padding: 8, flexShrink: 0 }}>
            <img src={a.icon} alt="" style={{ width: 20, height: 20, display: 'block' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontFamily: "var(--fontfamilyaccent)", fontSize: 17, lineHeight: '22px', color: '#2c2d2e' }}>
              {a.label}
            </span>
            {a.sub && (
              <span style={{ fontFamily: "var(--fontfamilybase)", fontSize: 15, lineHeight: '20px', color: '#aaadb3' }}>
                {a.sub}
              </span>
            )}
          </div>
          <img src={PG.chevron} alt="" style={{ width: 20, height: 20, flexShrink: 0 }} />
        </div>
      ))}
    </div>
  )
}

function ActiveTariffsCard() {
  const { bp, paid, pagePad } = useLayout()
  const tile = bp === 'sm'
    ? { width: '100%' as const, flex: '1 1 100%' }
    : bp === 'md'
    ? { flex: '1 1 280px', minWidth: 0, maxWidth: '100%' as const }
    : { width: 306, flexShrink: 0 as const, height: 92 }
  return (
    <div style={{
      background: 'white', borderRadius: 20, padding: `${pagePad}px ${pagePad}px ${bp === 'sm' ? 24 : 32}px`,
      display: 'flex', flexDirection: 'column', gap: 16, width: '100%', boxSizing: 'border-box',
      overflow: 'visible',
    }}>
      <span style={{ fontFamily: "var(--fontfamilyaccent)", fontSize: 17, lineHeight: '22px', color: '#2c2d2e' }}>
        Активные тарифы
      </span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, overflow: 'visible' }}>
        {/* Free plan */}
        <div style={{ boxShadow: 'inset 0 0 0 1px rgba(0,16,61,0.08)', borderRadius: 16, ...tile, minHeight: 92, display: 'flex', alignItems: 'flex-start', overflow: 'hidden', boxSizing: 'border-box', position: 'relative' }}>
          <div style={{
            position: 'absolute', top: 0, right: 0, zIndex: 1,
            background: '#f0f1f3', borderRadius: '0 16px 0 16px',
            height: 21, padding: '3px 12px 4px', boxSizing: 'border-box',
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          }}>
            <span style={{ fontFamily: "var(--fontfamilybase)", fontSize: 11, lineHeight: '14px', color: '#2c2d2e' }}>Бесплатный</span>
          </div>
          <div style={{ padding: 16, display: 'flex', alignItems: 'flex-start' }}>
            <div style={{ width: 32, height: 32, borderRadius: 100, overflow: 'hidden', background: '#07f' }}>
              <img src={PG.serviceIcos} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
          <div style={{ flex: 1, padding: '16px 16px 16px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div>
              <div style={{ fontFamily: "var(--fontfamilyaccent)", fontSize: 15, lineHeight: '20px', color: '#2c2d2e' }}>8 ГБ</div>
              <div style={{ fontFamily: "var(--fontfamilybase)", fontSize: 12, lineHeight: '16px', color: 'rgba(39,43,55,0.5)' }}>И другие функции в Почте и Облаке</div>
            </div>
            <div style={{ fontFamily: "var(--fontfamilybase)", fontSize: 12, lineHeight: '16px', color: '#0070f0', cursor: 'default' }}>
              Что входит в тариф
            </div>
          </div>
        </div>

        {paid && ([
          { title: '512 ГБ на месяц', sub: 'Следующий платёж 20 апреля 2026', badgeBg: 'rgba(0,119,255,0.14)' },
          { title: '64 ГБ на месяц', sub: 'Следующий платёж 18 мая 2026', badgeBg: 'rgba(0,119,255,0.1)' },
        ] as const).map(t => (
          <div key={t.title} style={{ background: 'rgba(0,119,255,0.06)', borderRadius: 16, ...tile, minHeight: 92, display: 'flex', alignItems: 'flex-start', overflow: 'hidden', boxSizing: 'border-box', position: 'relative' }}>
            <div style={{
              position: 'absolute', top: 0, right: 0, zIndex: 1,
              background: t.badgeBg, borderRadius: '0 16px 0 16px',
              height: 21, padding: '3px 12px 4px', boxSizing: 'border-box',
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
            }}>
              <span style={{ fontFamily: "var(--fontfamilybase)", fontSize: 11, lineHeight: '14px', color: '#1c4479' }}>Минимальный</span>
            </div>
            <div style={{ padding: 16, display: 'flex', alignItems: 'flex-start' }}>
              <div style={{ width: 32, height: 32, borderRadius: 100, overflow: 'hidden', background: '#07f' }}>
                <img src={PG.serviceIcos} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
            <div style={{ flex: 1, padding: '16px 16px 16px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div>
                <div style={{ fontFamily: "var(--fontfamilyaccent)", fontSize: 15, lineHeight: '20px', color: '#2c2d2e' }}>{t.title}</div>
                <div style={{ fontFamily: "var(--fontfamilybase)", fontSize: 12, lineHeight: '16px', color: 'rgba(39,43,55,0.5)' }}>{t.sub}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'default' }}>
                <img src={PG.flash} alt="" style={{ width: 16, height: 16, display: 'block' }} />
                <span style={{ fontFamily: "var(--fontfamilybase)", fontSize: 12, lineHeight: '16px', color: '#0070f0' }}>Улучшить</span>
              </div>
            </div>
          </div>
        ))}

        {/* Mail Space free promo card */}
        {!paid && (
        <div style={{ background: 'rgba(0,119,255,0.06)', borderRadius: 16, ...tile, minHeight: 92, display: 'flex', alignItems: 'flex-start', overflow: 'visible', boxSizing: 'border-box', position: 'relative' }}>
          <div style={{ width: 108, height: 92, position: 'relative', flexShrink: 0, overflow: 'visible' }}>
            <div style={{
              position: 'absolute', left: 0.29, top: -11.79, width: 93.442, height: 92.454,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ transform: 'scaleY(-1) rotate(-176.49deg)', flexShrink: 0 }}>
                <div style={{ width: 88.269, height: 87.214, position: 'relative' }}>
                  <img src={PG.blobVector} alt="" style={{
                    position: 'absolute',
                    top: '-6.88%', right: '-6.81%', bottom: '-6.51%', left: '-6.8%',
                    width: 'auto', height: 'auto', maxWidth: 'none', display: 'block',
                  }} />
                </div>
              </div>
            </div>
            <div style={{
              position: 'absolute', left: 3.73, top: 36.95, width: 31.964, height: 31.952,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ transform: 'rotate(-47deg)', flexShrink: 0 }}>
                <img src={PG.img9} alt="" style={{ width: 22.493, height: 22.73, borderRadius: 5, objectFit: 'cover', display: 'block' }} />
              </div>
            </div>
            <div style={{
              position: 'absolute', left: 10.49, top: 27.19, width: 34.843, height: 35.09,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ transform: 'rotate(-10.97deg)', flexShrink: 0 }}>
                <img src={PG.img8} alt="" style={{ width: 29.677, height: 29.989, borderRadius: 6, objectFit: 'cover', display: 'block' }} />
              </div>
            </div>
            <img src={PG.img11} alt="" style={{
              position: 'absolute', left: 21.62, top: -6, width: 76.216, height: 79,
              objectFit: 'contain', display: 'block',
            }} />
            <div style={{
              position: 'absolute', bottom: 55.95, left: 'calc(50% + 16.24px)',
              transform: 'translateX(-50%)',
              width: 28.478, height: 24.053,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ transform: 'rotate(16.03deg)', flexShrink: 0 }}>
                <div style={{
                  background: '#a641f6',
                  border: '0.884px solid rgba(255,255,255,0.6)',
                  borderRadius: 5.808,
                  width: 24.459, height: 18,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '2.568px 5.224px 2.282px',
                  boxSizing: 'border-box',
                }}>
                  <span style={{
                    fontFamily: "'VK Sans Text:Medium', 'VK Sans Text', var(--fontfamilyaccent)",
                    fontSize: 10.791, color: 'white', lineHeight: 'normal', whiteSpace: 'nowrap',
                  }}>ТБ</span>
                </div>
              </div>
            </div>
          </div>
          <div style={{ flex: 1, padding: '16px 16px 16px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div>
              <div style={{ fontFamily: "var(--fontfamilyaccent)", fontSize: 15, lineHeight: '20px', color: '#2c2d2e' }}>Mail Space бесплатно</div>
              <div style={{ fontFamily: "var(--fontfamilybase)", fontSize: 12, lineHeight: '16px', color: 'rgba(39,43,55,0.5)' }}>Больше места и функций</div>
            </div>
            <div style={{ fontFamily: "var(--fontfamilybase)", fontSize: 12, lineHeight: '16px', color: '#0070f0', cursor: 'default' }}>
              Забрать 1 ТБ на месяц
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  )
}

function ConnectTbButton() {
  return (
    <div style={{ position: 'relative', width: 'fit-content' }}>
      <button style={{
        background: '#07f', color: 'white',
        fontFamily: "var(--fontfamilyaccent)",
        fontSize: 14, lineHeight: '20px', height: 32,
        borderRadius: 8, padding: '6px 12px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
      }}>Подключить 1 ТБ</button>
      <div style={{
        position: 'absolute', top: -11, right: -4, transform: 'rotate(5deg)',
        background: '#b8fc75', color: '#087c6d',
        fontFamily: "var(--fontfamilybase)",
        fontSize: 9, lineHeight: '12px',
        padding: '1px 8px 2px', borderRadius: 10, whiteSpace: 'nowrap',
      }}>Месяц бесплатно</div>
    </div>
  )
}

function IncludedFeaturesCard() {
  const { bp, stackCards, paid, pagePad } = useLayout()
  const overlayBtn = !paid && !stackCards
  const wrapText = bp === 'sm'
  const features = [
    { icon: PG.cloudIco,   title: paid ? '584 ГБ' : '8 ГБ',        desc: 'Для файлов из Облака, писем и вложений из Почты' },
    { icon: PG.uploadIco,  title: 'Загрузка файлов до 2 ГБ',       desc: 'Сохраняйте документы, билеты, фотографии — открыть их можно с любого устройства' },
    { icon: PG.attachIco,  title: 'Отправка вложений до 200 МБ',   desc: 'Отправляйте в Почте фото, видео, книги, презентации' },
    { icon: PG.docTextIco, title: 'Редактирование документов',      desc: 'Редактируйте сами, с коллегами или близкими. Например, ведите общий бюджет в таблице' },
    { icon: PG.phoneIco,   title: 'Автозагрузка файлов',           desc: 'Фото и видео с телефона сами загрузятся в Облако — будет резервная копия, если с телефоном вдруг что-то случится' },
    { icon: PG.shieldIco,  title: 'Проверка вложений антивирусом', desc: 'Письма и файлы в Почте и Облаке проверяются антивирусом Dr.Web' },
  ]
  return (
    <div style={{
      background: 'white', borderRadius: 20, padding: `${pagePad}px ${pagePad}px ${bp === 'sm' ? 24 : 32}px`,
      display: 'flex', flexDirection: 'column', gap: 16,
      width: '100%', boxSizing: 'border-box',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: "var(--fontfamilyaccent)", fontSize: 17, lineHeight: '22px', color: '#2c2d2e' }}>
          Входит в ваш тариф
        </span>
        {!paid && !overlayBtn && <ConnectTbButton />}
      </div>

      <div style={{
        boxShadow: '0 0 0 1px rgba(0,16,61,0.08)', borderRadius: 16,
        padding: '12px 8px', overflow: 'hidden', position: 'relative',
        boxSizing: 'border-box',
      }}>
        {features.map((f, i) => (
          <div key={f.title} style={{
            display: 'flex', alignItems: 'stretch',
            paddingLeft: 8, paddingRight: overlayBtn && i === 0 ? 170 : 16,
            height: wrapText ? undefined : 64,
            minHeight: 64, boxSizing: 'border-box',
          }}>
            <div style={{ paddingTop: 4, paddingRight: 8, flexShrink: 0 }}>
              <div style={{ padding: 8, borderRadius: 20 }}>
                <img src={f.icon} alt="" style={{ width: 20, height: 20, display: 'block' }} />
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0, paddingTop: 12, paddingBottom: 12, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ fontFamily: "var(--fontfamilyaccent)", fontSize: 15, lineHeight: '20px', color: '#2c2d2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: wrapText ? 'normal' : 'nowrap' }}>
                {f.title}
              </div>
              <div style={{ fontFamily: "var(--fontfamilybase)", fontSize: 13, lineHeight: '18px', color: 'rgba(39,43,55,0.5)', overflow: 'hidden', textOverflow: wrapText ? 'unset' : 'ellipsis', whiteSpace: wrapText ? 'normal' : 'nowrap' }}>
                {f.desc}
              </div>
            </div>
          </div>
        ))}
        {overlayBtn && (
          <div style={{ position: 'absolute', top: 27, right: 20 }}>
            <ConnectTbButton />
          </div>
        )}
      </div>
    </div>
  )
}

// ── Comparison Table ──────────────────────────────────────────────────────────
// Sticky header uses overflow:clip so it doesn't create a Y scroll container.
// That lets position:sticky target the page scroller instead of the wrapper.
// Horizontal scroll is on the body only; the header mirrors it via translateX.

function ComparisonTable({ compact }: { compact: boolean }) {
  const { featW, planW, tablePad, bp } = useLayout()
  const { plans } = usePlans()
  const planHeaderRef = useRef<HTMLDivElement>(null)
  const bodyRef       = useRef<HTMLDivElement>(null)
  const headRef       = useRef<HTMLDivElement>(null)
  const totalW = featW + plans.length * planW + (plans.length - 1) * 8 + tablePad * 2

  const [scrollLeft, setScrollLeft] = useState(0)
  const [scrollMax,  setScrollMax]  = useState(0)

  useEffect(() => {
    const el = bodyRef.current
    if (!el) return
    const update = () => setScrollMax(el.scrollWidth - el.clientWidth)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [featW, tablePad, plans.length])

  useEffect(() => {
    const head = headRef.current
    const body = bodyRef.current
    if (!head || !body) return

    const apply = (delta: number) => {
      const max = body.scrollWidth - body.clientWidth
      const next = Math.max(0, Math.min(max, body.scrollLeft + delta))
      if (next === body.scrollLeft) return false
      body.scrollLeft = next
      return true
    }

    const onWheel = (e: WheelEvent) => {
      const dx = e.shiftKey ? e.deltaY : e.deltaX
      const horizontal = e.shiftKey || Math.abs(e.deltaX) >= Math.abs(e.deltaY)
      if (!horizontal || dx === 0) return
      if (apply(dx)) e.preventDefault()
    }

    let touchX = 0
    let touchY = 0
    let axis: 'h' | 'v' | null = null
    const onTouchStart = (e: TouchEvent) => {
      touchX = e.touches[0].clientX
      touchY = e.touches[0].clientY
      axis = null
    }
    const onTouchMove = (e: TouchEvent) => {
      const x = e.touches[0].clientX
      const y = e.touches[0].clientY
      const dx = touchX - x
      const dy = touchY - y
      if (!axis) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return
        axis = Math.abs(dx) >= Math.abs(dy) ? 'h' : 'v'
      }
      if (axis !== 'h') return
      e.preventDefault()
      apply(dx)
      touchX = x
      touchY = y
    }

    let ptr: { id: number; x: number; sl: number; dragging: boolean } | null = null
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || e.button !== 0) return
      if ((e.target as HTMLElement).closest('button')) return
      ptr = { id: e.pointerId, x: e.clientX, sl: body.scrollLeft, dragging: false }
    }
    const onPointerMove = (e: PointerEvent) => {
      if (!ptr || ptr.id !== e.pointerId) return
      const dx = ptr.x - e.clientX
      if (!ptr.dragging) {
        if (Math.abs(dx) < 8) return
        ptr.dragging = true
        head.setPointerCapture(e.pointerId)
      }
      body.scrollLeft = ptr.sl + dx
    }
    const onPointerUp = (e: PointerEvent) => {
      if (!ptr || ptr.id !== e.pointerId) return
      if (ptr.dragging) e.preventDefault()
      ptr = null
    }

    head.addEventListener('wheel', onWheel, { passive: false })
    head.addEventListener('touchstart', onTouchStart, { passive: true })
    head.addEventListener('touchmove', onTouchMove, { passive: false })
    head.addEventListener('pointerdown', onPointerDown)
    head.addEventListener('pointermove', onPointerMove)
    head.addEventListener('pointerup', onPointerUp)
    head.addEventListener('pointercancel', onPointerUp)
    return () => {
      head.removeEventListener('wheel', onWheel)
      head.removeEventListener('touchstart', onTouchStart)
      head.removeEventListener('touchmove', onTouchMove)
      head.removeEventListener('pointerdown', onPointerDown)
      head.removeEventListener('pointermove', onPointerMove)
      head.removeEventListener('pointerup', onPointerUp)
      head.removeEventListener('pointercancel', onPointerUp)
    }
  }, [])

  const syncScroll = () => {
    if (planHeaderRef.current && bodyRef.current) {
      const sl = bodyRef.current.scrollLeft
      planHeaderRef.current.style.transform = `translateX(-${sl}px)`
      setScrollLeft(sl)
    }
  }

  const scrollBy = (delta: number) => {
    if (bodyRef.current) {
      bodyRef.current.scrollLeft = Math.max(0, Math.min(scrollMax, bodyRef.current.scrollLeft + delta))
    }
  }

  const STEP = planW + 8
  const canLeft  = scrollLeft > 1
  const canRight = scrollLeft < scrollMax - 1

  const ArrowBtn = ({ dir }: { dir: 'left' | 'right' }) => (
    <button
      onClick={() => scrollBy(dir === 'right' ? STEP : -STEP)}
      style={{
        position: 'absolute',
        [dir === 'right' ? 'right' : 'left']: dir === 'right' ? 16 : featW + tablePad,
        top: '50%', transform: 'translateY(-50%)',
        zIndex: 30,
        width: 32, height: 32,
        borderRadius: '50%',
        background: 'white',
        border: '1px solid rgba(0,16,61,0.1)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 0,
        transition: 'opacity 150ms ease-out',
      }}
    >
      <img
        src={PG.arrowRight}
        alt={dir === 'right' ? '→' : '←'}
        style={{ width: 16, height: 16, transform: dir === 'left' ? 'rotate(180deg)' : undefined }}
      />
    </button>
  )

  return (
    <div>
      {/* overflow:clip clips overflow WITHOUT creating a scroll container,
          so position:sticky still works relative to the page scroll. */}
      <div ref={headRef} style={{ position: 'sticky', top: 0, zIndex: 20, overflow: 'clip', background: '#f6f7f8' }}>
        <TableHeader compact={compact} plansRef={planHeaderRef} canLeft={canLeft} canRight={canRight} />
        {canLeft  && <ArrowBtn dir="left"  />}
        {canRight && <ArrowBtn dir="right" />}
      </div>

      {/* Body has its own horizontal scroll, synced to header via JS. */}
      <div
        ref={bodyRef}
        onScroll={syncScroll}
        style={{
          overflowX: 'auto',
          borderRadius: '0 0 24px 24px',
          scrollbarWidth: 'none',
        }}
      >
        <div style={{ minWidth: totalW }}>
          <div style={{
            background: 'white',
            borderRadius: '0 0 24px 24px',
            padding: `24px ${tablePad}px ${bp === 'sm' ? 24 : 32}px`,
          }}>
            {DATA.map((sect, si) => (
              <div key={sect.id} style={{ marginTop: si > 0 ? 20 : 0 }}>
                <div style={{ display: 'flex', alignItems: 'stretch', marginBottom: 4 }}>
                  <div style={{
                    position: 'sticky', left: 0, zIndex: 4,
                    width: tablePad, flexShrink: 0, marginRight: -tablePad,
                    background: 'white',
                  }} />
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '8px 12px',
                    position: 'sticky', left: tablePad, zIndex: 4,
                    background: 'white', width: 'fit-content',
                  }}>
                    <img src={sect.logo} alt={sect.title} style={{ width: 32, height: 32 }} />
                    <span style={{
                      fontFamily: "var(--fontfamilyaccent)",
                      fontSize: 17, lineHeight: '22px', color: '#2c2d2e', whiteSpace: 'nowrap',
                    }}>
                      {sect.title}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {sect.rows.map(feat => (
                    <FeatureRow key={feat.id} feat={feat} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Root App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [compact, setCompact] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [paid, setPaidState] = useState(() => paidFromUrl())

  const setPaid = (v: boolean) => {
    setPaidState(v)
    const next = urlForPaid(v)
    const here = window.location.pathname.endsWith('/') ? window.location.pathname : `${window.location.pathname}/`
    const want = next.endsWith('/') ? next : `${next}/`
    if (here !== want) window.history.pushState({ paid: v }, '', next)
  }

  useEffect(() => {
    const sync = () => setPaidState(paidFromUrl())
    window.addEventListener('popstate', sync)
    window.addEventListener('hashchange', sync)
    return () => {
      window.removeEventListener('popstate', sync)
      window.removeEventListener('hashchange', sync)
    }
  }, [])
  const [w, setW] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1366))
  const scrollRef   = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const read = () => {
      const el = scrollRef.current
      setW(el?.clientWidth || window.innerWidth)
    }
    read()
    const el = scrollRef.current
    const ro = el ? new ResizeObserver(read) : null
    if (el) ro!.observe(el)
    window.addEventListener('resize', read)
    return () => {
      ro?.disconnect()
      window.removeEventListener('resize', read)
    }
  }, [])

  const bp = widthToBp(w)
  const m = metricsFor(bp)

  useEffect(() => {
    if (m.hasSidebar) setMenuOpen(false)
  }, [m.hasSidebar])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const handler = () => {
      if (!sentinelRef.current) return
      setCompact(sentinelRef.current.getBoundingClientRect().top <= 0)
    }
    el.addEventListener('scroll', handler, { passive: true })
    return () => el.removeEventListener('scroll', handler)
  }, [])

  const layout: Layout = { bp, w, ...m, menuOpen, setMenuOpen, paid, setPaid }
  const titleSize = bp === 'sm' ? { fontSize: 24, lineHeight: '30px' } : bp === 'md' ? { fontSize: 28, lineHeight: '34px' } : { fontSize: 32, lineHeight: '40px' }
  const padX = m.pagePad
  const contentPadLeft = m.hasSidebar ? 0 : padX
  const contentPadRight = m.hasSidebar ? (bp === 'xl' ? 0 : padX) : padX

  return (
    <LayoutCtx.Provider value={layout}>
    <div
      ref={scrollRef}
      style={{
        height: '100vh', overflowY: 'auto', overflowX: 'hidden',
        background: '#f6f7f8',
        scrollbarColor: 'rgba(0,0,0,0.18) transparent',
        scrollbarWidth: 'thin',
      }}
    >
      <div style={{ minWidth: 0, width: '100%' }}>

        <PortalMenu />
        <HeadBar />

        {!m.hasSidebar && menuOpen && createPortal(
          <>
            <div
              onClick={() => setMenuOpen(false)}
              style={{ position: 'fixed', top: 88, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.32)', zIndex: 40 }}
            />
            <div style={{
              position: 'fixed', left: 0, top: 88, bottom: 0, zIndex: 50,
              background: '#f6f7f8', overflowY: 'auto',
              boxShadow: '8px 0 24px rgba(0,0,0,0.12)',
            }}>
              <Sidebar />
            </div>
          </>,
          document.body
        )}

        <div style={{
          display: 'flex', gap: 16, alignItems: 'flex-start',
          paddingBottom: bp === 'sm' ? 80 : 120,
          paddingLeft: contentPadLeft, paddingRight: contentPadRight,
        }}>
          {m.hasSidebar && <Sidebar />}

          <div style={{
            width: bp === 'xl' ? 992 : '100%',
            maxWidth: bp === 'xl' ? 992 : undefined,
            flex: bp === 'xl' ? undefined : 1,
            flexShrink: 1, minWidth: 0,
            display: 'flex', flexDirection: 'column', gap: bp === 'sm' ? 16 : 24,
          }}>

            <div style={{
              paddingTop: padX, paddingBottom: 12,
              width: '100%', maxWidth: bp === 'sm' || bp === 'md' ? '100%' : 600,
            }}>
              <h1 style={{
                fontFamily: "var(--fontfamilyaccent)",
                ...titleSize, color: '#2c2d2e',
                margin: '0 0 8px', fontWeight: 500,
              }}>
                Управление подпиской Mail Space
              </h1>
              <p style={{ margin: 0, fontFamily: "var(--fontfamilybase)", fontSize: bp === 'sm' ? 14 : 15, lineHeight: '20px', color: '#2c2d2e' }}>
                В&#160;этом разделе можно управлять подпиской и&#160;местом в&#160;едином пространстве Почты и&#160;Облака. Гигабайты от&#160;разных тарифов суммируются.{' '}
                <span style={{ color: '#0070f0', cursor: 'default' }}>Как работает подписка.</span>
              </p>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: m.stackCards ? 'column' : 'row',
              gap: m.stackCards ? 16 : 24,
              minHeight: m.stackCards ? undefined : paid ? 202 : 200,
              alignItems: 'stretch',
            }}>
              <StorageCard />
              <ActionsCard />
            </div>

            <ActiveTariffsCard />
            <IncludedFeaturesCard />

            <div style={{ position: 'relative' }}>
              <div ref={sentinelRef} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 0 }} />
              <ComparisonTable compact={compact || bp === 'sm'} />
            </div>

          </div>
        </div>

        <div style={{
          minHeight: 28, display: 'flex', alignItems: 'center', flexWrap: 'wrap',
          paddingLeft: m.hasSidebar ? 32 : padX,
          paddingRight: m.hasSidebar ? (bp === 'xl' ? 32 : padX) : padX,
          paddingBottom: 12, gap: 16, flexShrink: 0,
        }}>
          {['Mail', 'О комании', 'Реклама', 'Вакансии'].map(l => (
            <span key={l} style={{
              fontFamily: "var(--fontfamilybase)",
              fontSize: 13, lineHeight: '16px', color: '#2c2d2e',
            }}>{l}</span>
          ))}
        </div>
      </div>
    </div>
    </LayoutCtx.Provider>
  )
}
