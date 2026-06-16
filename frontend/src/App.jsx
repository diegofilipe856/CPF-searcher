import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Contact,
  Database,
  FileSearch,
  Fingerprint,
  Gauge,
  LayoutDashboard,
  Lock,
  Mail,
  MapPin,
  Menu,
  Phone,
  Search,
  Server,
  Shield,
  UserCircle,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import defaultProfile from "./assets/default-profile.svg";
import {
  API_BASE_URL,
  getAllCriminalRecords,
  getCriminalRecordByCpf,
  getPersonById,
  getPeople,
  getPersonByCpf,
} from "./api/people";

/* ================================================================
   Constants & Utilities
   ================================================================ */

const FIELD_GROUPS = [
  {
    title: "Identificação",
    icon: Fingerprint,
    fields: [
      ["CPF", "cpf"],
      ["RG", "rg"],
      ["Data de nascimento", "birth_date", "date"],
      ["Sexo", "sex", "sex"],
      ["Idade", "age", "years"],
      ["Signo", "zodiac_sign", "zodiac"],
    ],
  },
  {
    title: "Filiação",
    icon: UsersRound,
    fields: [
      ["Mãe", "mother_name"],
      ["Pai", "father_name"],
    ],
  },
  {
    title: "Contato",
    icon: Contact,
    fields: [
      ["E-mail", "email"],
      ["Telefone fixo", "landline"],
      ["Celular", "mobile_phone"],
    ],
  },
  {
    title: "Características",
    icon: Gauge,
    fields: [
      ["Altura", "height", "height"],
      ["Peso", "weight", "weight"],
      ["Tipo sanguíneo", "blood_type"],
    ],
  },
];

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });

const VALUE_TRANSLATIONS = {
  sex: {
    Male: "Masculino",
    Female: "Feminino",
  },
  zodiac: {
    Aquarius: "Aquário",
    Aries: "Áries",
    Capricorn: "Capricórnio",
    Pisces: "Peixes",
    Taurus: "Touro",
  },
};

function parseNumericValue(value) {
  const normalizedValue = String(value).trim().replace(",", ".");
  const match = normalizedValue.match(/-?\d+(?:\.\d+)?/);

  if (!match) {
    return null;
  }

  const numericValue = Number(match[0]);
  return Number.isNaN(numericValue) ? null : numericValue;
}

function formatValue(value, type) {
  if (value === null || value === undefined || value === "") {
    return "Não informado";
  }

  if (type === "date") {
    return dateFormatter.format(new Date(`${value}T00:00:00Z`));
  }

  if (type === "years") {
    return `${value} anos`;
  }

  if (type === "height") {
    const numericValue = parseNumericValue(value);
    return numericValue === null
      ? String(value)
      : `${numericValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} m`;
  }

  if (type === "weight") {
    const numericValue = parseNumericValue(value);
    return numericValue === null ? String(value) : `${numericValue.toLocaleString("pt-BR")} kg`;
  }

  if (VALUE_TRANSLATIONS[type]?.[value]) {
    return VALUE_TRANSLATIONS[type][value];
  }

  return String(value);
}

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function formatDocument(value) {
  if (!value) return "—";
  const digits = onlyDigits(value);
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }
  if (digits.length === 14) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
  }
  return value;
}

/* ================================================================
   Navigation Config
   ================================================================ */

const NAV_ITEMS = [
  { id: "home", label: "Início", icon: LayoutDashboard },
  { id: "people", label: "Consulta de Pessoas", icon: Search },
  { id: "criminal", label: "Fichas Criminais", icon: FileSearch },
  { id: "profile", label: "Perfil do Servidor", icon: UserCircle, disabled: true },
];

const PAGE_TITLES = {
  home: "Início",
  people: "Consulta de Pessoas",
  criminal: "Fichas Criminais",
  personCriminal: "Ficha Criminal",
};

/* ================================================================
   Shared Components
   ================================================================ */

function PersonPhoto({ compact = false }) {
  return (
    <div className={compact ? "person-photo person-photo--compact" : "person-photo"}>
      <img src={defaultProfile} alt="Foto padrão da pessoa" />
    </div>
  );
}

function StatusMessage({ type, children }) {
  const Icon = type === "error" ? AlertCircle : BadgeCheck;

  return (
    <div className={`status-message status-message--${type}`}>
      <Icon size={18} aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}

/* ================================================================
   Sidebar
   ================================================================ */

function Sidebar({ currentPage, onNavigate, open, onClose }) {
  return (
    <>
      <div
        className={`sidebar-overlay${open ? " sidebar-overlay--visible" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <nav className={`sidebar${open ? " sidebar--open" : ""}`} aria-label="Menu principal">
        <div className="sidebar__header">
          <div className="sidebar__brand">
            <div className="sidebar__logo" aria-hidden="true">
              <Shield size={22} />
            </div>
            <div>
              <span className="sidebar__label">SSP Digital</span>
              <strong className="sidebar__name">Sistema Integrado</strong>
            </div>
          </div>
          <button className="sidebar__close" onClick={onClose} aria-label="Fechar menu">
            <X size={20} />
          </button>
        </div>

        <ul className="sidebar__nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            return (
              <li key={item.id}>
                <button
                  className={`sidebar__item${active ? " sidebar__item--active" : ""}${item.disabled ? " sidebar__item--disabled" : ""}`}
                  onClick={() => {
                    if (!item.disabled) {
                      onNavigate(item.id);
                    }
                  }}
                  disabled={item.disabled}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon size={20} aria-hidden="true" />
                  <span>{item.label}</span>
                  {item.disabled && <small className="sidebar__badge">Em breve</small>}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="sidebar__footer">
          <Lock size={14} aria-hidden="true" />
          <span>Ambiente simulado</span>
        </div>
      </nav>
    </>
  );
}

/* ================================================================
   Home Page (Dashboard)
   ================================================================ */

function HomePage({ onNavigate }) {
  const [stats, setStats] = useState({ count: null, apiOnline: null });

  useEffect(() => {
    getPeople()
      .then((result) => setStats({ count: result.length, apiOnline: true }))
      .catch(() => setStats({ count: null, apiOnline: false }));
  }, []);

  const now = new Date();
  const dateStr = now.toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="home-page">
      <div className="home-welcome">
        <span className="agency-label">Painel de controle</span>
        <h1>Bem-vindo ao SSP Digital</h1>
        <p className="home-date">
          <CalendarDays size={16} aria-hidden="true" />
          {dateStr.charAt(0).toUpperCase() + dateStr.slice(1)}
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--primary">
            <UsersRound size={22} />
          </div>
          <div className="stat-card__body">
            <strong>{stats.count !== null ? stats.count : "—"}</strong>
            <span>Pessoas cadastradas</span>
          </div>
        </div>

        <div className="stat-card">
          <div className={`stat-card__icon ${stats.apiOnline === false ? "stat-card__icon--danger" : "stat-card__icon--success"}`}>
            <Server size={22} />
          </div>
          <div className="stat-card__body">
            <strong>{stats.apiOnline === null ? "—" : stats.apiOnline ? "Online" : "Offline"}</strong>
            <span>Status da API</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--accent">
            <Database size={22} />
          </div>
          <div className="stat-card__body">
            <strong>{stats.apiOnline ? "Ativa" : "—"}</strong>
            <span>Base de dados</span>
          </div>
        </div>
      </div>

      <section className="modules-section">
        <h2>Módulos do sistema</h2>
        <div className="modules-grid">
          <button className="module-card" type="button" onClick={() => onNavigate("people")}>
            <div className="module-card__icon">
              <Search size={28} />
            </div>
            <div className="module-card__body">
              <strong>Consulta de Pessoas</strong>
              <p>Pesquise por nome, CPF, RG ou filiação e acesse fichas cadastrais completas.</p>
            </div>
            <div className="module-card__arrow">
              <ChevronRight size={20} />
            </div>
          </button>

          <button className="module-card" type="button" onClick={() => onNavigate("criminal")}>
            <div className="module-card__icon">
              <FileSearch size={28} />
            </div>
            <div className="module-card__body">
              <strong>Fichas Criminais</strong>
              <p>Consulte antecedentes e registros criminais de pessoas cadastradas.</p>
            </div>
            <div className="module-card__arrow">
              <ChevronRight size={20} />
            </div>
          </button>

          <div className="module-card module-card--disabled" aria-disabled="true">
            <div className="module-card__icon">
              <UserCircle size={28} />
            </div>
            <div className="module-card__body">
              <strong>Perfil do Servidor</strong>
              <p>Gerencie seu perfil, credenciais e preferências do sistema.</p>
            </div>
            <div className="module-card__arrow">
              <span className="module-card__badge">Em breve</span>
            </div>
          </div>
        </div>
      </section>

      <div className="home-footer-info">
        <span><Server size={14} aria-hidden="true" /> API: {API_BASE_URL}</span>
        <span><MapPin size={14} aria-hidden="true" /> Base fictícia</span>
      </div>
    </div>
  );
}

/* ================================================================
   People Search — Components
   ================================================================ */

function PersonCard({ person, selected, onSelect }) {
  return (
    <button
      className={selected ? "person-card person-card--selected" : "person-card"}
      type="button"
      onClick={() => onSelect(person)}
      aria-pressed={selected}
    >
      <PersonPhoto compact />
      <span className="person-card__body">
        <strong>{person.name}</strong>
        <small>CPF {person.cpf}</small>
        <span>
          RG {person.rg} · {person.age} anos
        </span>
      </span>
    </button>
  );
}

function FieldGroup({ group, person }) {
  const Icon = group.icon;

  return (
    <section className="field-group" aria-labelledby={`group-${group.title}`}>
      <div className="field-group__title">
        <Icon size={18} aria-hidden="true" />
        <h3 id={`group-${group.title}`}>{group.title}</h3>
      </div>
      <dl>
        {group.fields.map(([label, key, type]) => (
          <div className="field-row" key={key}>
            <dt>{label}</dt>
            <dd>{formatValue(person[key], type)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function DetailPanel({ person, loading, error, onCriminalRecord }) {
  if (loading) {
    return (
      <aside className="detail-panel detail-panel--empty">
        <div className="skeleton-photo" />
        <div className="skeleton-line skeleton-line--wide" />
        <div className="skeleton-line" />
        <div className="skeleton-grid">
          <div />
          <div />
          <div />
          <div />
        </div>
      </aside>
    );
  }

  if (!person) {
    return (
      <aside className="detail-panel detail-panel--empty">
        <Shield size={42} aria-hidden="true" />
        <h2>Selecione uma pessoa</h2>
        <p>A ficha cadastral será exibida neste painel.</p>
        {error && <StatusMessage type="error">{error}</StatusMessage>}
      </aside>
    );
  }

  return (
    <aside className="detail-panel" aria-label={`Dados de ${person.name}`}>
      {error && <StatusMessage type="error">{error}</StatusMessage>}
      <div className="profile-header">
        <PersonPhoto />
        <div className="profile-header__content">
          <span className="agency-label">Registro individual</span>
          <h2>{person.name}</h2>
          <p>CPF {person.cpf}</p>
          <div className="profile-tags" aria-label="Resumo cadastral">
            <span>{formatValue(person.sex, "sex")}</span>
            <span>{person.blood_type}</span>
            <span>{person.age} anos</span>
          </div>
        </div>
      </div>

      <button className="criminal-button" type="button" onClick={() => onCriminalRecord(person)}>
        <FileSearch size={20} aria-hidden="true" />
        Ver ficha criminal
      </button>

      <div className="field-groups">
        {FIELD_GROUPS.map((group) => (
          <FieldGroup group={group} person={person} key={group.title} />
        ))}
      </div>
    </aside>
  );
}

/* ================================================================
   People Search — Page
   ================================================================ */

function PeopleSearch({ onViewCriminal }) {
  const [people, setPeople] = useState([]);
  const [selectedCpf, setSelectedCpf] = useState("");
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [query, setQuery] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState("");
  const [detailError, setDetailError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;

    setLoadingList(true);
    getPeople()
      .then((result) => {
        if (!active) return;
        setPeople(result);
        setError("");

        if (result.length > 0) {
          setSelectedCpf(result[0].cpf);
        }
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message);
      })
      .finally(() => {
        if (active) setLoadingList(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedCpf) {
      setSelectedPerson(null);
      return;
    }

    let active = true;
    const fallback = people.find((person) => person.cpf === selectedCpf);

    setLoadingDetails(true);
    setDetailError("");
    getPersonByCpf(selectedCpf)
      .then((person) => {
        if (!active) return;
        setSelectedPerson(person);
      })
      .catch((err) => {
        if (!active) return;
        setSelectedPerson(fallback || null);
        setDetailError(err.message);
      })
      .finally(() => {
        if (active) setLoadingDetails(false);
      });

    return () => {
      active = false;
    };
  }, [people, selectedCpf]);

  const filteredPeople = useMemo(() => {
    const search = normalize(query);
    const documentSearch = onlyDigits(query);

    if (!search) {
      return people;
    }

    return people.filter((person) => {
      const textMatches = [person.name, person.cpf, person.rg, person.mother_name, person.father_name].some((value) =>
        normalize(value).includes(search),
      );
      const documentMatches =
        documentSearch && [person.cpf, person.rg].some((value) => onlyDigits(value).includes(documentSearch));

      return textMatches || documentMatches;
    });
  }, [people, query]);

  function handleSelect(person) {
    setSelectedCpf(person.cpf);
    setNotice("");
  }

  function handleCriminalRecord(person) {
    if (onViewCriminal) {
      onViewCriminal(person);
    }
  }

  return (
    <div className="workspace">
      <section className="people-panel" aria-label="Pessoas cadastradas">
        <div className="section-heading">
          <div>
            <span className="agency-label">Consulta cadastral</span>
            <h1>Pessoas cadastradas</h1>
          </div>
          <div className="counter">
            <UsersRound size={18} aria-hidden="true" />
            <strong>{filteredPeople.length}</strong>
          </div>
        </div>

        <label className="search-box">
          <Search size={18} aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nome, CPF, RG ou filiação"
            type="search"
          />
        </label>

        <div className="list-status">
          <span>
            <CalendarDays size={16} aria-hidden="true" />
            Atualização local
          </span>
          <span>
            <MapPin size={16} aria-hidden="true" />
            Base fictícia
          </span>
        </div>

        {error && <StatusMessage type="error">{error}</StatusMessage>}
        {notice && <StatusMessage type="info">{notice}</StatusMessage>}

        <div className="people-list">
          {loadingList &&
            Array.from({ length: 5 }).map((_, index) => (
              <div className="person-card person-card--loading" key={index}>
                <div className="loading-avatar" />
                <div>
                  <div className="skeleton-line skeleton-line--wide" />
                  <div className="skeleton-line" />
                </div>
              </div>
            ))}

          {!loadingList &&
            filteredPeople.map((person) => (
              <PersonCard
                person={person}
                selected={selectedCpf === person.cpf}
                onSelect={handleSelect}
                key={person.id}
              />
            ))}

          {!loadingList && filteredPeople.length === 0 && !error && (
            <div className="empty-list">
              <UserRound size={32} aria-hidden="true" />
              <strong>Nenhum cadastro encontrado</strong>
              <span>Ajuste os termos da busca.</span>
            </div>
          )}
        </div>
      </section>

      <DetailPanel
        person={selectedPerson}
        loading={loadingDetails}
        error={detailError}
        onCriminalRecord={handleCriminalRecord}
      />
    </div>
  );
}

/* ================================================================
   Criminal Records — Utilities
   ================================================================ */

function statusClass(status) {
  const s = (status || "").toLowerCase();
  if (s.includes("under investigation") || s.includes("investigação") || s.includes("investigacao")) return "investigating";
  if (s.includes("convicted") || s.includes("condenado")) return "convicted";
  if (s.includes("acquitted") || s.includes("absolvido")) return "acquitted";
  if (s.includes("closed") || s.includes("encerrado") || s.includes("arquivado")) return "closed";
  if (s.includes("pending") || s.includes("pendente")) return "pending";
  return "default";
}

function severityClass(severity) {
  const s = (severity || "").toLowerCase();
  if (s.includes("high") || s.includes("alta") || s.includes("grave")) return "high";
  if (s.includes("medium") || s.includes("média") || s.includes("media")) return "medium";
  if (s.includes("low") || s.includes("baixa") || s.includes("leve")) return "low";
  return "default";
}

/* ================================================================
   Criminal Records — Suspect Info Component
   ================================================================ */

function SuspectInfo({ personId }) {
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!personId) return;
    let active = true;
    setLoading(true);
    getPersonById(personId)
      .then((p) => { if (active) setPerson(p); })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [personId]);

  if (loading) {
    return (
      <div className="record-detail-section record-detail-section--suspect">
        <h4><Fingerprint size={16} aria-hidden="true" /> Suspeito</h4>
        <div className="suspect-loading">
          <div className="skeleton-line skeleton-line--wide" />
          <div className="skeleton-line" />
        </div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="record-detail-section record-detail-section--suspect">
        <h4><Fingerprint size={16} aria-hidden="true" /> Suspeito</h4>
        <p className="suspect-unavailable">Dados não disponíveis</p>
      </div>
    );
  }

  return (
    <div className="record-detail-section record-detail-section--suspect">
      <h4><Fingerprint size={16} aria-hidden="true" /> Suspeito</h4>
      <div className="suspect-card">
        <PersonPhoto compact />
        <dl>
          <div className="field-row"><dt>Nome</dt><dd>{person.name}</dd></div>
          <div className="field-row"><dt>CPF</dt><dd>{person.cpf}</dd></div>
          <div className="field-row"><dt>RG</dt><dd>{person.rg}</dd></div>
          <div className="field-row"><dt>Idade</dt><dd>{person.age} anos</dd></div>
          <div className="field-row"><dt>Sexo</dt><dd>{formatValue(person.sex, "sex")}</dd></div>
          <div className="field-row"><dt>Cor</dt><dd>{person.color || "—"}</dd></div>
        </dl>
      </div>
    </div>
  );
}

/* ================================================================
   Criminal Records — Shared Detail Component
   ================================================================ */

function CriminalRecordDetails({ record }) {
  return (
    <div className="record-details-grid">
      <SuspectInfo personId={record.person_id} />
      <div className="record-detail-section">
        <h4><FileSearch size={16} aria-hidden="true" /> Informações do Crime</h4>
        <dl>
          <div className="field-row"><dt>Código</dt><dd>{record.code}</dd></div>
          <div className="field-row"><dt>Título</dt><dd>{record.title}</dd></div>
          <div className="field-row"><dt>Tipo</dt><dd>{record.crime_type}</dd></div>
          <div className="field-row"><dt>Categoria</dt><dd>{record.crime_category || "—"}</dd></div>
          <div className="field-row"><dt>Gravidade</dt><dd>{record.crime_severity || "—"}</dd></div>
          <div className="field-row"><dt>Status</dt><dd>{record.crime_status}</dd></div>
        </dl>
      </div>
      <div className="record-detail-section">
        <h4><MapPin size={16} aria-hidden="true" /> Ocorrência</h4>
        <dl>
          <div className="field-row"><dt>Data</dt><dd>{record.occurrence_date ? dateFormatter.format(new Date(`${record.occurrence_date}T00:00:00Z`)) : "—"}</dd></div>
          <div className="field-row"><dt>Hora</dt><dd>{record.occurrence_time || "—"}</dd></div>
          <div className="field-row"><dt>Local</dt><dd>{record.occurrence_location || "—"}</dd></div>
          <div className="field-row"><dt>Cidade</dt><dd>{record.occurrence_city ? `${record.occurrence_city}${record.occurrence_state ? " - " + record.occurrence_state : ""}` : "—"}</dd></div>
        </dl>
      </div>
      <div className="record-detail-section">
        <h4><UserRound size={16} aria-hidden="true" /> Vítima</h4>
        <dl>
          <div className="field-row"><dt>Nome</dt><dd>{record.victim_name || "—"}</dd></div>
          <div className="field-row"><dt>CPF/CNPJ</dt><dd>{formatDocument(record.victim_cpf)}</dd></div>
          <div className="field-row"><dt>Tipo</dt><dd>{record.victim_type || "—"}</dd></div>
        </dl>
      </div>
      <div className="record-detail-section">
        <h4><Shield size={16} aria-hidden="true" /> Responsável</h4>
        <dl>
          <div className="field-row"><dt>Autoridade</dt><dd>{record.responsible_authority || "—"}</dd></div>
          <div className="field-row"><dt>Unidade</dt><dd>{record.responsible_unit || "—"}</dd></div>
        </dl>
      </div>
      {record.crime_description && (
        <div className="record-detail-section record-detail-section--full">
          <h4>Descrição</h4>
          <p className="record-description">{record.crime_description}</p>
        </div>
      )}
      {record.notes && (
        <div className="record-detail-section record-detail-section--full">
          <h4>Observações</h4>
          <p className="record-description">{record.notes}</p>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   Criminal Records — Row (for the listing page)
   ================================================================ */

function CriminalRecordRow({ record, expanded, onToggle }) {
  return (
    <div className={`criminal-row${expanded ? " criminal-row--expanded" : ""}`}>
      <button className="criminal-row__summary" type="button" onClick={onToggle}>
        <span className="criminal-row__code">{record.code}</span>
        <span className="criminal-row__info">
          <strong>{record.title}</strong>
          <small>{record.crime_type}{record.crime_category ? ` · ${record.crime_category}` : ""}</small>
        </span>
        <span className="criminal-row__badges">
          <span className={`severity-badge severity-badge--${severityClass(record.crime_severity)}`}>
            {record.crime_severity || "—"}
          </span>
          <span className={`status-badge status-badge--${statusClass(record.crime_status)}`}>
            {record.crime_status}
          </span>
        </span>
        <span className="criminal-row__date">
          <CalendarDays size={14} aria-hidden="true" />
          {record.occurrence_date ? dateFormatter.format(new Date(`${record.occurrence_date}T00:00:00Z`)) : "—"}
        </span>
        <span className={`criminal-row__chevron${expanded ? " criminal-row__chevron--up" : ""}`}>
          <ChevronDown size={18} />
        </span>
      </button>

      {expanded && (
        <div className="criminal-row__details">
          <CriminalRecordDetails record={record} />
        </div>
      )}
    </div>
  );
}

/* ================================================================
   Criminal Records — Listing Page (all records)
   ================================================================ */

function CriminalRecordsPage() {
  const [records, setRecords] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortField, setSortField] = useState("code");
  const [sortDirection, setSortDirection] = useState("asc");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getAllCriminalRecords()
      .then((result) => {
        if (!active) return;
        setRecords(result);
        setError("");
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const filteredAndSorted = useMemo(() => {
    let filtered = records;
    const search = normalize(query);

    if (search) {
      filtered = records.filter((r) =>
        [r.code, r.title, r.crime_type, r.crime_category, r.crime_status, r.crime_severity, r.occurrence_city, r.occurrence_state, r.victim_name].some(
          (v) => normalize(v).includes(search)
        )
      );
    }

    return [...filtered].sort((a, b) => {
      let comparison = 0;
      if (sortField === "code") {
        comparison = (a.code || "").localeCompare(b.code || "");
      } else if (sortField === "occurrence_date") {
        const dateA = a.occurrence_date || "";
        const dateB = b.occurrence_date || "";
        comparison = dateA.localeCompare(dateB);
      }
      return sortDirection === "desc" ? -comparison : comparison;
    });
  }, [records, query, sortField, sortDirection]);

  function handleSort(field) {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  }

  function toggleExpand(id) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="criminal-page">
      <div className="criminal-page__header">
        <div>
          <span className="agency-label">Registros criminais</span>
          <h1>Fichas Criminais</h1>
        </div>
        <div className="counter">
          <FileSearch size={18} aria-hidden="true" />
          <strong>{filteredAndSorted.length}</strong>
        </div>
      </div>

      <label className="search-box">
        <Search size={18} aria-hidden="true" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por código, título, tipo, cidade..."
          type="search"
        />
      </label>

      <div className="criminal-sort-bar">
        <span className="criminal-sort-bar__label">Ordenar por:</span>
        <button
          className={`sort-btn${sortField === "code" ? " sort-btn--active" : ""}`}
          type="button"
          onClick={() => handleSort("code")}
        >
          Código
          {sortField === "code" && (
            sortDirection === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />
          )}
        </button>
        <button
          className={`sort-btn${sortField === "occurrence_date" ? " sort-btn--active" : ""}`}
          type="button"
          onClick={() => handleSort("occurrence_date")}
        >
          Data da ocorrência
          {sortField === "occurrence_date" && (
            sortDirection === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />
          )}
        </button>
      </div>

      {error && <StatusMessage type="error">{error}</StatusMessage>}

      <div className="criminal-list">
        {loading &&
          Array.from({ length: 5 }).map((_, i) => (
            <div className="criminal-row criminal-row--loading" key={i}>
              <div className="criminal-row__summary">
                <div className="skeleton-line" style={{ width: "80px" }} />
                <div className="skeleton-line skeleton-line--wide" />
                <div className="skeleton-line" style={{ width: "120px" }} />
              </div>
            </div>
          ))}

        {!loading &&
          filteredAndSorted.map((record) => (
            <CriminalRecordRow
              key={record.id}
              record={record}
              expanded={expandedId === record.id}
              onToggle={() => toggleExpand(record.id)}
            />
          ))}

        {!loading && filteredAndSorted.length === 0 && !error && (
          <div className="empty-list">
            <FileSearch size={32} aria-hidden="true" />
            <strong>Nenhum registro encontrado</strong>
            <span>Ajuste os termos da busca.</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================
   Criminal Records — Person-specific Page
   ================================================================ */

function PersonCriminalPage({ person, onBack }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (!person?.cpf) return;
    let active = true;
    setLoading(true);
    getCriminalRecordByCpf(person.cpf)
      .then((result) => {
        if (!active) return;
        setRecords(result);
        setError("");
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [person?.cpf]);

  function toggleExpand(id) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="criminal-page">
      <button className="back-button" type="button" onClick={onBack}>
        <ArrowLeft size={18} aria-hidden="true" />
        Voltar para consulta
      </button>

      <div className="person-criminal-header">
        <PersonPhoto compact />
        <div className="person-criminal-header__info">
          <span className="agency-label">Ficha criminal</span>
          <h1>{person?.name}</h1>
          <p>CPF {person?.cpf}</p>
        </div>
        <div className="counter">
          <FileSearch size={18} aria-hidden="true" />
          <strong>{records.length}</strong>
        </div>
      </div>

      {error && <StatusMessage type="error">{error}</StatusMessage>}

      <div className="criminal-list">
        {loading &&
          Array.from({ length: 3 }).map((_, i) => (
            <div className="criminal-row criminal-row--loading" key={i}>
              <div className="criminal-row__summary">
                <div className="skeleton-line" style={{ width: "80px" }} />
                <div className="skeleton-line skeleton-line--wide" />
                <div className="skeleton-line" style={{ width: "120px" }} />
              </div>
            </div>
          ))}

        {!loading &&
          records.map((record) => (
            <CriminalRecordRow
              key={record.id}
              record={record}
              expanded={expandedId === record.id}
              onToggle={() => toggleExpand(record.id)}
            />
          ))}

        {!loading && records.length === 0 && !error && (
          <div className="empty-list">
            <BadgeCheck size={32} aria-hidden="true" />
            <strong>Nenhum registro criminal</strong>
            <span>Esta pessoa não possui registros criminais.</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================
   App Shell
   ================================================================ */

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [peoplePageMounted, setPeoplePageMounted] = useState(false);
  const [criminalPerson, setCriminalPerson] = useState(null);

  function handleNavigate(page) {
    if (page === "people") setPeoplePageMounted(true);
    setCurrentPage(page);
    setSidebarOpen(false);
  }

  function handleViewCriminal(person) {
    setCriminalPerson(person);
    setCurrentPage("personCriminal");
  }

  function handleBackFromCriminal() {
    setCurrentPage("people");
  }

  return (
    <div className="app-layout">
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="app-content">
        <header className="topbar">
          <button
            className="topbar__menu-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu size={22} />
          </button>

          <div className="topbar__page-info">
            <strong>{PAGE_TITLES[currentPage] || ""}</strong>
          </div>

          <div className="topbar__meta">
            <span>Ambiente simulado</span>
          </div>
        </header>

        <main className="app-main">
          {currentPage === "home" && <HomePage onNavigate={handleNavigate} />}
          {peoplePageMounted && (
            <div style={currentPage !== "people" ? { display: "none" } : undefined}>
              <PeopleSearch onViewCriminal={handleViewCriminal} />
            </div>
          )}
          {currentPage === "criminal" && <CriminalRecordsPage />}
          {currentPage === "personCriminal" && criminalPerson && (
            <PersonCriminalPage person={criminalPerson} onBack={handleBackFromCriminal} />
          )}
        </main>

        <footer className="app-footer">
          <span>
            <Phone size={16} aria-hidden="true" />
            Central interna
          </span>
          <span>
            <Mail size={16} aria-hidden="true" />
            suporte.local@ssp.invalid
          </span>
        </footer>
      </div>
    </div>
  );
}

export default App;
