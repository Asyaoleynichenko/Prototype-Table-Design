import { useState, useEffect, useRef } from 'react'
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
}

// ── Table column config ──────────────────────────────────────────────────────
const COL_CHK = [ICO.chkGray, ICO.chkMain, ICO.chkWork, ICO.chkFam, ICO.chkGray]
const FEAT_W  = 262
const PLAN_W  = 250

type V = boolean | 'base'
interface Feat { id: string; label: string; isNew?: boolean; v: V[]; tip: string }
interface Sect { id: string; title: string; logo: string; rows: Feat[] }

const DATA: Sect[] = [
  {
    id: 'cloud', title: 'Облако', logo: ICO.logoCloud,
    rows: [
      { id: 'no-ads',      label: 'Без рекламы',                                                    v: [false, true,   true,   true,   false], tip: 'Облако без рекламных блоков — больше внимания вашим файлам.' },
      { id: 'doc-edit',    label: 'Редактирование документов',                                      v: ['base',true,   true,   true,  'base'], tip: 'Редактируйте документы, хранящиеся в Облаке.' },
      { id: 'autosave',    label: 'Автосохранение файлов с телефона в Облако',            v: ['base',true,   true,   true,  'base'], tip: 'Сохраняйте файлы с телефона в Облако автоматически.' },
      { id: 'extra-space', label: 'Дополнительное место для файлов',                           v: [false, true,   true,   true,   false], tip: 'Больше пространства в Облаке для документов, фотографий и других файлов.' },
      { id: 'upload-100',  label: 'Загрузка файлов до 100 ГБ в Облако',             v: [false, true,   true,   true,   false], tip: 'Загружайте в Облако файлы размером до 100 ГБ.' },
      { id: 'timer',       label: 'Таймер для автоудаления отправленных папок',                v: [false, true,   true,   true,   false], tip: 'Папки вместе с содержимым удалятся у получателя через выбранное вами время.' },
      { id: 'folder-dsgn', label: 'Выбор оформления для совместных папок',                    v: [false, true,   true,   true,   false], tip: 'Настройте оформление папки, которой делитесь по ссылке.' },
      { id: 'folder-pass', label: 'Пароль для совместных папок в веб-версии',             v: [false, true,   true,   true,   false], tip: 'В веб-версии можно защитить совместную папку паролем.' },
      { id: 'share-3',     label: 'Можно делиться местом ещё с 3 участниками',           v: [false, false,  false,  true,   false], tip: 'Делитесь пространством подписки ещё с тремя участниками.' },
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
      { id: 'mail-noad',   label: 'Без рекламы',                                          v: [false, true,   true,   true,   false], tip: 'Пользуйтесь Почтой без рекламных блоков.' },
      { id: 'attach-100',  label: 'Отправка вложений до 100 ГБ в письмах',               v: [false, true,   true,   false,  false], tip: 'Отправляйте в письмах вложения размером до 100 ГБ.' },
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
    sub: '8 ГБ в едином пространстве Облака и Почты',
    bg: 'white', border: '1px solid rgba(0,16,61,0.08)',
    isCurrent: true,
  },
  {
    id: 'main', name: 'Основной',
    sub: 'Больше места и возможностей', bg: '#f0f7ff',
    price: 'от 87 ₽', disc: 'до — 79%',
    bullets: [
      { ico: ICO.phone,   txt: 'Безлимит для фото с телефона' },
      { ico: ICO.copy,    txt: 'Удаление дубликатов' },
      { ico: ICO.doc,     txt: 'Загрузка файлов до 100 ГБ' },
      { ico: ICO.block,   txt: 'Без рекламы в Почте и Облаке' },
    ]
  },
  {
    id: 'work', name: 'Для работы',
    sub: 'Место и функции для рабочих задач', bg: '#f2fcfe',
    price: 'от 108 ₽', disc: 'до — 80%',
    bullets: [
      { ico: ICO.stars,   txt: 'Краткий пересказ' },
      { ico: ICO.notif,   txt: 'Уведомление о прочтении' },
      { ico: ICO.mailRu,  txt: 'Красивый адрес' },
      { ico: ICO.block,   txt: 'Без рекламы в Почте и Облаке' },
    ]
  },
  {
    id: 'family', name: 'Семейный',
    sub: 'Одна подписка на четверых', bg: '#f8f6ff',
    price: 'от 149 ₽', disc: 'до — 75%',
    bullets: [
      { ico: ICO.phone,   txt: 'Семейный безлимит' },
      { ico: ICO.users,   txt: 'Добавление ещё 3 участников' },
      { ico: ICO.folder,  txt: 'Семейные папки и альбомы' },
      { ico: ICO.block,   txt: 'Без рекламы в Почте и Облаке' },
    ]
  },
  {
    id: 'minimal', name: 'Минимальный',
    sub: 'Только место в Облаке и Почте', bg: '#f6f7f8',
    price: 'от 83 ₽', disc: 'до — 79%',
    bullets: [
      { ico: ICO.limited, txt: 'Безлимит для фото с телефона' },
      { ico: ICO.limited, txt: 'Удаление дубликатов' },
      { ico: ICO.limited, txt: 'Загрузка файлов до 100 ГБ' },
      { ico: ICO.limited, txt: 'Без рекламы в Почте и Облаке' },
    ]
  },
]

// ── Table sub-components ─────────────────────────────────────────────────────

function NewBadge() {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      height: 22, padding: '0 6px', borderRadius: 100,
      background: '#b8fc75', transform: 'rotate(-5deg)', flexShrink: 0,
    }}>
      <span style={{
        fontFamily: "'VK Sans Display:Medium', sans-serif",
        color: '#087c6d', fontSize: 13, lineHeight: '18px', whiteSpace: 'nowrap',
      }}>New</span>
    </span>
  )
}

interface TipState { x: number; y: number; text: string }

function FeatureRow({ feat }: { feat: Feat }) {
  const [hovered, setHovered] = useState(false)
  const [tip, setTip] = useState<TipState | null>(null)
  const btnRef = useRef<HTMLButtonElement>(null)

  const onIconEnter = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      setTip({ x: r.left + r.width / 2, y: r.top, text: feat.tip })
    }
  }

  const hoverBg = hovered ? 'rgba(0,0,0,0.042)' : 'transparent'
  const hoverBgSolid = hovered ? '#f5f5f5' : 'white'

  return (
    <>
      <div
        style={{
          display: 'flex', alignItems: 'center',
          borderRadius: 8, paddingLeft: 12, paddingTop: 4, paddingBottom: 4,
          background: hoverBg, transition: 'background 100ms',
          minWidth: FEAT_W + PLANS.length * PLAN_W,
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setTip(null) }}
      >
        {/* Cover the 24px padding gap so check icons can't peek through when scrolled */}
        <div style={{
          position: 'sticky', left: 0, zIndex: 4,
          width: 24, alignSelf: 'stretch', flexShrink: 0, marginRight: -24,
          background: hoverBgSolid, transition: 'background 100ms',
        }} />
        <div style={{
          width: FEAT_W, flexShrink: 0,
          position: 'sticky', left: 24, zIndex: 5,
          background: hoverBgSolid, transition: 'background 100ms',
          display: 'flex', alignItems: 'center', gap: 6,
          paddingRight: 8,
        }}>
          {feat.isNew && <NewBadge />}
          <span style={{
            fontFamily: "'Arial:Regular', Arial, sans-serif",
            fontSize: 15, lineHeight: '20px', color: '#2c2d2e',
            flexShrink: 1,
          }}>
            {feat.label}
          </span>
          <button
            ref={btnRef}
            onMouseEnter={onIconEnter}
            onMouseLeave={() => setTip(null)}
            aria-label="Подробнее"
            style={{
              opacity: hovered ? 1 : 0, transition: 'opacity 150ms',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 16, height: 16, borderRadius: '50%',
              border: '1.5px solid rgba(0,0,0,0.3)',
              background: 'transparent', cursor: 'default',
              flexShrink: 0, marginLeft: 'auto',
            }}
          >
            <span style={{
              fontFamily: "'Arial:Bold', Arial, sans-serif",
              fontSize: 10, color: 'rgba(0,0,0,0.45)', lineHeight: 1,
            }}>i</span>
          </button>
        </div>

        {feat.v.map((val, ci) => (
          <div key={ci} style={{
            width: PLAN_W, flexShrink: 0,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            height: 28,
          }}>
            {val === false
              ? <img src={ICO.cross}    alt="—" style={{ width: 20, height: 20 }} />
              : <img src={COL_CHK[ci]} alt="✓" style={{ width: 20, height: 20 }} />
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
          fontFamily: "'Arial:Regular', Arial, sans-serif",
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
      fontFamily: "'Arial:Regular', Arial, sans-serif",
      fontSize: 11, lineHeight: '14px',
      padding: '2px 8px 3px', borderRadius: 10,
      whiteSpace: 'nowrap', flexShrink: 0,
    }}>
      Ваш тариф
    </div>
  )

  return (
    <div style={{
      width: PLAN_W, flexShrink: 0,
      background: `linear-gradient(90deg, white 0%, ${plan.bg} 100%)`, border: plan.border,
      borderRadius: 20,
      padding: compact ? '12px 20px' : '16px 20px 20px',
      display: 'flex', flexDirection: 'column',
      transition: 'padding 260ms ease-out',
      overflow: 'hidden', boxSizing: 'border-box',
    }}>

      {/* "Ваш тариф" above name — expanded only */}
      {plan.isCurrent && (
        <div style={{ ...show(!compact, 28), alignSelf: 'flex-end', marginBottom: 8, transition: TR + ', margin-bottom 260ms ease-out' }}>
          <YourPlanBadge />
        </div>
      )}

      {/* Name row: plain name in expanded; name + inline badge in compact */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        marginBottom: compact ? 0 : 4,
        transition: 'margin-bottom 260ms ease-out',
      }}>
        <p style={{
          fontFamily: "'VK Sans Display:Medium', sans-serif",
          fontSize: 15, lineHeight: '20px', color: '#2c2d2e',
          margin: 0, flex: 1,
        }}>
          {compact ? (plan.cname ?? plan.name) : plan.name}
        </p>
        {plan.isCurrent && compact && <YourPlanBadge />}
      </div>

      {/* Subtitle — expanded only */}
      {plan.sub && (
        <div style={{ ...show(!compact, 40), marginBottom: 8, transition: TR + ', margin-bottom 260ms ease-out' }}>
          <p style={{
            fontFamily: "'Arial:Regular', Arial, sans-serif",
            fontSize: 12, lineHeight: '16px',
            color: 'rgba(39,43,55,0.5)', margin: 0,
          }}>
            {plan.sub}
          </p>
        </div>
      )}

      {/* Bullets — expanded only */}
      {plan.bullets && (
        <div style={{ ...show(!compact, 130), display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10, transition: TR + ', margin-bottom 260ms ease-out' }}>
          {plan.bullets.map((b, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
              <img src={b.ico} alt="" style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1 }} />
              <span style={{
                fontFamily: "'Arial:Regular', Arial, sans-serif",
                fontSize: 12, lineHeight: '16px', color: '#2c2d2e',
              }}>{b.txt}</span>
            </div>
          ))}
        </div>
      )}

      {/* Price button — hug content width, text differs by state */}
      {plan.price && (
        <div style={{ position: 'relative', marginTop: compact ? 8 : 0, alignSelf: 'flex-start' }}>
          <button style={{
            width: 'fit-content', height: 36,
            background: '#0077ff', color: 'white',
            fontFamily: "'VK Sans Display:Medium', sans-serif",
            fontSize: 14, lineHeight: '20px',
            borderRadius: 8, padding: '8px 12px',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxSizing: 'border-box',
          }}>
            {compact ? 'Подключить' : `Подключить ${plan.price}`}
          </button>
          {plan.disc && (
            <div style={{
              position: 'absolute', top: -11, right: 4,
              transform: 'rotate(5deg)',
              background: '#b8fc75', color: '#087c6d',
              fontFamily: "'Arial:Regular', Arial, sans-serif",
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

function TableHeader({ compact, plansRef, canLeft }: {
  compact: boolean
  plansRef: React.RefObject<HTMLDivElement | null>
  canLeft: boolean
}) {
  return (
    <div style={{
      display: 'flex',
      background: 'white',
      borderRadius: '24px 24px 0 0',
      padding: compact ? '16px 24px 14px' : '24px 24px 20px',
      transition: 'padding 250ms ease-out',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Left column — never translates; extends to x=0 so it covers the header's left
          padding area, preventing sliding plan cards from showing through */}
      <div style={{
        width: FEAT_W - 8 + 24, flexShrink: 0,
        marginLeft: -24, paddingLeft: 24,
        paddingTop: compact ? 12 : 16,
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
        background: 'white', position: 'relative', zIndex: 2,
      }}>
        {/* Compact heading — fades in when scrolled */}
        <div style={{
          maxHeight: compact ? 50 : 0, opacity: compact ? 1 : 0,
          overflow: 'hidden',
          transition: 'max-height 250ms ease-out, opacity 220ms ease-out',
        }}>
          <p style={{
            fontFamily: "'VK Sans Display:Medium', sans-serif",
            fontSize: 17, lineHeight: '22px', color: '#2c2d2e',
            margin: '0 0 8px',
          }}>
            Больше возможностей с&#160;тарифами Mail&#160;Space
          </p>
        </div>
        {/* Expanded heading + description — fades out when scrolled */}
        <div style={{
          maxHeight: compact ? 0 : 200, opacity: compact ? 0 : 1,
          overflow: 'hidden',
          transition: 'max-height 250ms ease-out, opacity 220ms ease-out',
        }}>
          <p style={{
            fontFamily: "'VK Sans Display:Medium', sans-serif",
            fontSize: 17, lineHeight: '22px', color: '#2c2d2e',
            margin: '0 0 8px',
          }}>
            Сравните с&#160;другими и&#160;улучшите свой тариф
          </p>
          <p style={{
            fontFamily: "'Arial:Regular', Arial, sans-serif",
            fontSize: 12, lineHeight: '16px',
            color: 'rgba(39,43,55,0.5)', margin: 0,
          }}>
            Можно выбрать функции и&#160;память от&#160;<strong style={{ fontFamily: "'Arial:Bold', Arial, sans-serif", fontWeight: 700 }}>256&#160;ГБ до&#160;4&#160;ТБ</strong>. Когда подключите новый тариф, текущий отключится. Если остались оплаченные дни в&#160;текущем тарифе, на&#160;новый будет скидка
          </p>
        </div>
      </div>

      {/* Plans section only — gets translateX; slides under the left column */}
      <div ref={plansRef} style={{ display: 'flex', gap: 8, marginLeft: 8, flexShrink: 0 }}>
        {PLANS.map(plan => (
          <PlanCard key={plan.id} plan={plan} compact={compact} />
        ))}
      </div>

      {/* Gradient + blur fade at the transition zone between left column and plan cards */}
      {canLeft && (
        <div style={{
          position: 'absolute',
          left: FEAT_W - 8 + 24,
          top: 0, bottom: 0,
          width: 64,
          background: 'linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          pointerEvents: 'none',
          zIndex: 3,
        }} />
      )}
    </div>
  )
}

// ── Page layout components ───────────────────────────────────────────────────

function PortalMenu() {
  const S = { fontFamily: "'Arial:Regular', Arial, sans-serif", fontSize: 13, color: '#2c2d2e' } as const
  return (
    <div style={{
      height: 32, background: '#f6f7f8',
      borderBottom: '1px solid rgba(0,16,61,0.06)',
      position: 'relative', flexShrink: 0,
    }}>
      <span style={{ ...S, position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)' }}>
        Mail
      </span>

      <div style={{ position: 'absolute', left: 68, top: 8, display: 'flex', gap: 16, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <span style={S}>Почта</span>
          <div style={{ position: 'relative', width: 16, height: 16 }}>
            <div style={{ background: '#07f', borderRadius: 8, width: 16, height: 16, position: 'absolute' }} />
            <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Arial:Regular'", fontSize: 10, color: 'white', lineHeight: '16px' }}>2</span>
          </div>
        </div>
        {['Облако', 'Однокласники', 'ВКонтакте', 'Новости', 'Знакомства', 'Игры'].map(s => (
          <span key={s} style={S}>{s}</span>
        ))}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <span style={S}>Все проекты</span>
          <img src={PG.gridIcon} alt="" style={{ width: 16, height: 16 }} />
        </div>
      </div>

      <div style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: 2 }}>
        <span style={S}>a.oleynichenko@vk.team</span>
        <img src={PG.dropdown} alt="" style={{ width: 16, height: 16 }} />
      </div>

      <div style={{ position: 'absolute', right: 210, top: 8, width: 16, height: 16, borderRadius: '50%', overflow: 'hidden' }}>
        <img src={PG.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    </div>
  )
}

function HeadBar() {
  return (
    <div style={{
      height: 56, background: '#f6f7f8',
      display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
      paddingLeft: 20, paddingRight: 20, paddingTop: 0, paddingBottom: 0,
      flexShrink: 0,
    }}>
      <img src={PG.mailLogo} alt="Mail" style={{ height: 30, width: 93 }} />
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
          <div style={{ fontFamily: "'VK Sans Display:Medium', sans-serif", fontSize: 20, lineHeight: '24px', color: '#2c2d2e' }}>
            Ася Олейниченко
          </div>
          <div style={{ fontFamily: "'Arial:Regular', Arial, sans-serif", fontSize: 15, lineHeight: '20px', color: '#87898f' }}>
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
              flex: 1, fontFamily: "'VK Sans Display:Medium', sans-serif",
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
  return (
    <div style={{
      background: 'white', borderRadius: 20, padding: 24,
      width: 648, flexShrink: 0,
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      boxSizing: 'border-box',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: "'VK Sans Display:Medium', sans-serif", fontSize: 17, lineHeight: '22px', color: '#2c2d2e' }}>
            Занято 4.5 ГБ из 8 ГБ
          </span>
          <div style={{ display: 'flex', alignItems: 'center' }}>
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

        <div style={{ paddingTop: 4, paddingBottom: 4 }}>
          <div style={{ height: 8, background: 'rgba(0,16,61,0.06)', borderRadius: 4, position: 'relative', marginBottom: 8 }}>
            <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: 54.471, background: '#b8fc75', borderRadius: 4, border: '2px solid white' }} />
            <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: 28.913, background: '#07f', borderRadius: 4, border: '2px solid white' }} />
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            {[{ color: '#07f', label: 'Почта 1.3 ГБ' }, { color: '#b8fc75', label: 'Облако 3.3 ГБ' }].map(l => (
              <div key={l.label} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ width: 8, height: 8, borderRadius: 20, background: l.color, flexShrink: 0 }} />
                <span style={{ fontFamily: "'Arial:Regular', Arial, sans-serif", fontSize: 12, lineHeight: '16px', color: '#2c2d2e' }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button style={{
          background: '#07f', color: 'white',
          fontFamily: "'VK Sans Display:Medium', sans-serif",
          fontSize: 14, lineHeight: '20px', height: 32,
          borderRadius: 8, padding: '6px 12px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
        }}>Увеличить место</button>
        <button style={{
          background: 'transparent', color: '#0070f0',
          fontFamily: "'VK Sans Display:Medium', sans-serif",
          fontSize: 14, lineHeight: '20px', height: 32,
          borderRadius: 8, padding: '6px 8px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
        }}>Очистить место</button>
      </div>
    </div>
  )
}

function ActionsCard() {
  const actions = [
    { icon: PG.promoIcon, label: 'Активация промокода' },
    { icon: PG.histIcon,  label: 'История платежей' },
    { icon: PG.histIcon,  label: 'Банковская карта' },
  ]
  const [hovered, setHovered] = useState<string | null>(null)
  return (
    <div style={{
      background: 'white', borderRadius: 20, padding: 8,
      flex: 1, display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center',
    }}>
      {actions.map(a => (
        <div key={a.label}
          onMouseEnter={() => setHovered(a.label)}
          onMouseLeave={() => setHovered(null)}
          style={{
            display: 'flex', alignItems: 'center', gap: 16,
            padding: 8, borderRadius: 12, cursor: 'pointer',
            background: hovered === a.label ? '#f6f7f8' : 'transparent',
            transition: 'background 120ms ease-out',
          }}>
          <div style={{ background: '#f6f7f8', borderRadius: 20, padding: 8, flexShrink: 0 }}>
            <img src={a.icon} alt="" style={{ width: 20, height: 20, display: 'block' }} />
          </div>
          <span style={{ flex: 1, fontFamily: "'VK Sans Display:Medium', sans-serif", fontSize: 17, lineHeight: '22px', color: '#2c2d2e' }}>
            {a.label}
          </span>
          <img src={PG.chevron} alt="" style={{ width: 20, height: 20, flexShrink: 0 }} />
        </div>
      ))}
    </div>
  )
}

function ActiveTariffsCard() {
  return (
    <div style={{
      background: 'white', borderRadius: 20, padding: '24px 24px 32px',
      display: 'flex', flexDirection: 'column', gap: 16, width: '100%', boxSizing: 'border-box',
    }}>
      <span style={{ fontFamily: "'VK Sans Display:Medium', sans-serif", fontSize: 17, lineHeight: '22px', color: '#2c2d2e' }}>
        Активные тарифы
      </span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {/* Free plan */}
        <div style={{ border: '1px solid rgba(0,16,61,0.08)', borderRadius: 16, width: 306, flexShrink: 0, height: 92, display: 'flex', alignItems: 'flex-start', overflow: 'hidden' }}>
          <div style={{ padding: 16, display: 'flex', alignItems: 'flex-start' }}>
            <div style={{ width: 32, height: 32, borderRadius: 100, overflow: 'hidden', background: '#07f' }}>
              <img src={PG.serviceIcos} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
          <div style={{ flex: 1, padding: '16px 16px 16px 0', display: 'flex', flexDirection: 'column', gap: 8, position: 'relative' }}>
            <div style={{ position: 'absolute', top: -1, right: -1, background: '#f0f1f3', borderRadius: '0 16px 0 16px', padding: '3px 12px 4px' }}>
              <span style={{ fontFamily: "'Arial:Regular', Arial, sans-serif", fontSize: 11, lineHeight: '14px', color: '#2c2d2e' }}>Бесплатный</span>
            </div>
            <div>
              <div style={{ fontFamily: "'VK Sans Display:Medium', sans-serif", fontSize: 15, lineHeight: '20px', color: '#2c2d2e' }}>8 ГБ</div>
              <div style={{ fontFamily: "'Arial:Regular', Arial, sans-serif", fontSize: 12, lineHeight: '16px', color: 'rgba(39,43,55,0.5)' }}>И другие функции в Почте и Облаке</div>
            </div>
            <div style={{ fontFamily: "'Arial:Regular', Arial, sans-serif", fontSize: 12, lineHeight: '16px', color: '#0070f0', cursor: 'default' }}>
              Что входит в тариф
            </div>
          </div>
        </div>

        {/* Mail Space free promo card */}
        <div style={{ background: 'rgba(0,119,255,0.06)', borderRadius: 16, width: 306, flexShrink: 0, height: 92, display: 'flex', alignItems: 'flex-start', overflow: 'hidden' }}>
          <div style={{ width: 108, height: 92, position: 'relative', flexShrink: 0, overflow: 'hidden' }}>
            {/* Background blob vector — flipped + rotated */}
            <div style={{ position: 'absolute', left: 0.29, top: -11.79, width: 93.44, height: 92.45, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ transform: 'scaleY(-1) rotate(-176.49deg)', flexShrink: 0 }}>
                <img src={PG.blobVector} alt="" style={{ width: 88.27, height: 87.21 }} />
              </div>
            </div>
            {/* Two small rotated photo thumbnails */}
            <div style={{ position: 'absolute', left: 3.73 + 1.11, top: 36.95 + 20.42, width: 31.96, height: 31.95, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ transform: 'rotate(-47deg)', flexShrink: 0 }}>
                <img src={PG.img9} alt="" style={{ width: 22.49, height: 22.73, borderRadius: 5, objectFit: 'cover' }} />
              </div>
            </div>
            <div style={{ position: 'absolute', left: 10.49 + 1.11, top: 27.19 + 20.42, width: 34.84, height: 35.09, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ transform: 'rotate(-10.97deg)', flexShrink: 0 }}>
                <img src={PG.img8} alt="" style={{ width: 29.68, height: 29.99, borderRadius: 6, objectFit: 'cover' }} />
              </div>
            </div>
            {/* Main illustration image */}
            <img src={PG.img11} alt="" style={{ position: 'absolute', left: 21.62, top: -6, width: 76.22, height: 79, objectFit: 'cover' }} />
            {/* "ТБ" badge */}
            <div style={{ position: 'absolute', left: '50%', bottom: 55.95, transform: 'translateX(calc(-50% + 16.24px))', width: 28.48, height: 24.05, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ transform: 'rotate(16.03deg)', flexShrink: 0 }}>
                <div style={{
                  background: '#a641f6', borderRadius: 5.81,
                  border: '0.884px solid rgba(255,255,255,0.6)',
                  width: 24.46, height: 18,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '2.57px 5.22px 2.28px',
                  boxSizing: 'border-box',
                }}>
                  <span style={{ fontFamily: "'VK Sans Text:Medium', sans-serif", fontSize: 10.79, color: 'white', lineHeight: 1, whiteSpace: 'nowrap' }}>ТБ</span>
                </div>
              </div>
            </div>
          </div>
          <div style={{ flex: 1, padding: '16px 16px 16px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div>
              <div style={{ fontFamily: "'VK Sans Display:Medium', sans-serif", fontSize: 15, lineHeight: '20px', color: '#2c2d2e' }}>Mail Space бесплатно</div>
              <div style={{ fontFamily: "'Arial:Regular', Arial, sans-serif", fontSize: 12, lineHeight: '16px', color: 'rgba(39,43,55,0.5)' }}>Больше места и функций</div>
            </div>
            <div style={{ fontFamily: "'Arial:Regular', Arial, sans-serif", fontSize: 12, lineHeight: '16px', color: '#0070f0', cursor: 'default' }}>
              Забрать 1 ТБ на месяц
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function IncludedFeaturesCard() {
  const features = [
    { icon: PG.cloudIco,   title: '8 ГБ',                          desc: 'Для файлов из Облака, писем и вложений из Почты' },
    { icon: PG.uploadIco,  title: 'Загрузка файлов до 2 ГБ',       desc: 'Сохраняйте документы, билеты, фотографии — открыть их можно с любого устройства' },
    { icon: PG.attachIco,  title: 'Отправка вложений до 200 МБ',   desc: 'Отправляйте в Почте фото, видео, книги, презентации' },
    { icon: PG.docTextIco, title: 'Редактирование документов',      desc: 'Редактируйте сами, с коллегами или близкими. Например, ведите общий бюджет в таблице' },
    { icon: PG.phoneIco,   title: 'Автозагрузка файлов',           desc: 'Фото и видео с телефона сами загрузятся в Облако — будет резервная копия, если с телефоном вдруг что-то случится' },
    { icon: PG.shieldIco,  title: 'Проверка вложений антивирусом', desc: 'Письма и файлы в Почте и Облаке проверяются антивирусом Dr.Web' },
  ]
  return (
    <div style={{
      background: 'white', borderRadius: 20, padding: '24px 24px 32px',
      display: 'flex', flexDirection: 'column', gap: 16,
      width: '100%', boxSizing: 'border-box',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: "'VK Sans Display:Medium', sans-serif", fontSize: 17, lineHeight: '22px', color: '#2c2d2e' }}>
          Входит в ваш тариф
        </span>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button style={{
            background: '#07f', color: 'white',
            fontFamily: "'VK Sans Display:Medium', sans-serif",
            fontSize: 14, lineHeight: '20px', height: 32,
            borderRadius: 8, padding: '6px 12px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
          }}>Подключить 1 ТБ</button>
          <div style={{
            position: 'absolute', top: -10, right: -4, transform: 'rotate(5deg)',
            background: '#b8fc75', color: '#087c6d',
            fontFamily: "'Arial:Regular', Arial, sans-serif",
            fontSize: 9, lineHeight: '12px',
            padding: '1px 8px', borderRadius: 10, whiteSpace: 'nowrap',
          }}>Месяц бесплатно</div>
        </div>
      </div>

      <div style={{ border: '1px solid rgba(0,16,61,0.08)', borderRadius: 16, padding: '0 8px', overflow: 'hidden' }}>
        {features.map((f, i) => (
          <div key={f.title}>
            <div style={{ display: 'flex', alignItems: 'stretch', paddingRight: 16 }}>
              <div style={{ paddingTop: 4, paddingRight: 8, flexShrink: 0 }}>
                <div style={{ padding: 8, borderRadius: 20 }}>
                  <img src={f.icon} alt="" style={{ width: 20, height: 20, display: 'block' }} />
                </div>
              </div>
              <div style={{ flex: 1, paddingTop: 12, paddingBottom: 12, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{ fontFamily: "'VK Sans Display:Medium', sans-serif", fontSize: 15, lineHeight: '20px', color: '#2c2d2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {f.title}
                </div>
                <div style={{ fontFamily: "'Arial:Regular', Arial, sans-serif", fontSize: 13, lineHeight: '18px', color: 'rgba(39,43,55,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {f.desc}
                </div>
              </div>
            </div>
            {i < features.length - 1 && (
              <div style={{ height: 1, background: 'rgba(0,16,61,0.06)', marginLeft: 44 }} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Comparison Table ──────────────────────────────────────────────────────────
// Sticky header uses overflow:clip so it doesn't create a Y scroll container.
// That lets position:sticky target the page scroller instead of the wrapper.
// Horizontal scroll is on the body only; the header mirrors it via translateX.

function ComparisonTable({ compact }: { compact: boolean }) {
  const planHeaderRef = useRef<HTMLDivElement>(null)
  const bodyRef       = useRef<HTMLDivElement>(null)
  const totalW = FEAT_W + PLANS.length * PLAN_W + (PLANS.length - 1) * 8 + 48

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

  const STEP = PLAN_W + 8
  const canLeft  = scrollLeft > 1
  const canRight = scrollLeft < scrollMax - 1

  const ArrowBtn = ({ dir }: { dir: 'left' | 'right' }) => (
    <button
      onClick={() => scrollBy(dir === 'right' ? STEP : -STEP)}
      style={{
        position: 'absolute',
        [dir === 'right' ? 'right' : 'left']: dir === 'right' ? 16 : FEAT_W + 24,
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
      <div style={{ position: 'sticky', top: 0, zIndex: 20, overflow: 'clip', background: '#f6f7f8' }}>
        <TableHeader compact={compact} plansRef={planHeaderRef} canLeft={canLeft} />
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
            padding: '20px 24px 32px',
          }}>
            {DATA.map((sect, si) => (
              <div key={sect.id} style={{ marginTop: si > 0 ? 20 : 0 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '8px 12px 8px 0', marginBottom: 4,
                  position: 'sticky', left: 24, zIndex: 4,
                  background: 'white', width: 'fit-content',
                }}>
                  <img src={sect.logo} alt={sect.title} style={{ width: 32, height: 32 }} />
                  <span style={{
                    fontFamily: "'VK Sans Display:Medium', sans-serif",
                    fontSize: 17, lineHeight: '22px', color: '#2c2d2e', whiteSpace: 'nowrap',
                  }}>
                    {sect.title}
                  </span>
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
  const scrollRef   = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  // Use scroll position to detect compact: fires when the sentinel (placed
  // just before the table) exits the top of the viewport. getBoundingClientRect
  // is anchored to the viewport, not the scroll container, so it never
  // oscillates when the header height changes.
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

  return (
    <div
      ref={scrollRef}
      style={{
        height: '100vh', overflowY: 'auto', overflowX: 'auto',
        background: '#f6f7f8',
        scrollbarColor: 'rgba(0,0,0,0.18) transparent',
        scrollbarWidth: 'thin',
      }}
    >
      <div style={{ minWidth: 1366 }}>

        <PortalMenu />
        <HeadBar />

        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', paddingBottom: 120 }}>
          <Sidebar />

          {/* Main content — 992px to match design */}
          <div style={{ width: 992, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Page title */}
            <div style={{ paddingTop: 0, paddingBottom: 0 }}>
              <h1 style={{
                fontFamily: "'VK Sans Display:Medium', sans-serif",
                fontSize: 32, lineHeight: '40px', color: '#2c2d2e',
                margin: '0 0 8px', fontWeight: 500,
              }}>
                Управление подпиской Mail Space
              </h1>
              <p style={{ margin: 0, fontFamily: "'Arial:Regular', Arial, sans-serif", fontSize: 15, lineHeight: '20px', color: '#2c2d2e' }}>
                В&#160;этом разделе можно управлять подпиской и&#160;местом в&#160;едином пространстве Почты и&#160;Облака. Гигабайты от&#160;разных тарифов суммируются.{' '}
                <span style={{ color: '#0070f0', cursor: 'default' }}>Как работает подписка.</span>
              </p>
            </div>

            {/* Card row: storage + actions */}
            <div style={{ display: 'flex', gap: 24, height: 200 }}>
              <StorageCard />
              <ActionsCard />
            </div>

            <ActiveTariffsCard />
            <IncludedFeaturesCard />

            {/* Sentinel: compact fires when this crosses the viewport top */}
            <div ref={sentinelRef} style={{ height: 0 }} />

            <ComparisonTable compact={compact} />

          </div>
        </div>
      </div>
    </div>
  )
}
