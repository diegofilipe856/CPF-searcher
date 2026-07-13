import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Check,
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
  Pencil,
  Phone,
  Plus,
  Save,
  Search,
  Server,
  Shield,
  UserCircle,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import defaultProfile from "./assets/default-profile.svg";
import Login from "./Login";
import {
  API_BASE_URL,
  createCriminalRecord,
  getAllCriminalRecords,
  getCriminalRecordByCpf,
  getPersonById,
  getPeople,
  getPersonByCpf,
  updateCriminalRecord,
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
   Criminal Records — Form Modal (create & edit)
   ================================================================ */

const EMPTY_FORM = {
  person_id: "",
  title: "",
  crime_type: "",
  crime_category: "",
  crime_status: "",
  crime_severity: "",
  occurrence_date: "",
  occurrence_time: "",
  occurrence_location: "",
  occurrence_city: "",
  occurrence_state: "",
  victim_name: "",
  victim_cpf: "",
  victim_type: "",
  crime_description: "",
  responsible_authority: "",
  responsible_unit: "",
  notes: "",
};

const BRAZILIAN_STATES = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

function CriminalRecordFormModal({ open, onClose, onSaved, record, fixedPersonId }) {
  const isEditing = Boolean(record);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!open) return;
    setApiError("");
    setErrors({});
    setSuccess(false);
    setSaving(false);

    if (record) {
      setForm({
        person_id: record.person_id || "",
        title: record.title || "",
        crime_type: record.crime_type || "",
        crime_category: record.crime_category || "",
        crime_status: record.crime_status || "",
        crime_severity: record.crime_severity || "",
        occurrence_date: record.occurrence_date || "",
        occurrence_time: record.occurrence_time ? record.occurrence_time.slice(0, 5) : "",
        occurrence_location: record.occurrence_location || "",
        occurrence_city: record.occurrence_city || "",
        occurrence_state: record.occurrence_state || "",
        victim_name: record.victim_name || "",
        victim_cpf: record.victim_cpf || "",
        victim_type: record.victim_type || "",
        crime_description: record.crime_description || "",
        responsible_authority: record.responsible_authority || "",
        responsible_unit: record.responsible_unit || "",
        notes: record.notes || "",
      });
    } else {
      setForm({ ...EMPTY_FORM, person_id: fixedPersonId || "" });
    }
  }, [open, record, fixedPersonId]);

  if (!open) return null;

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
    }
  }

  function validate() {
    const errs = {};
    if (!isEditing && !form.person_id.trim()) errs.person_id = "ID da pessoa é obrigatório.";
    if (!form.title.trim()) errs.title = "Título é obrigatório.";
    if (!form.crime_type.trim()) errs.crime_type = "Tipo do crime é obrigatório.";
    if (!form.crime_status.trim()) errs.crime_status = "Status é obrigatório.";
    return errs;
  }

  function buildPayload() {
    const payload = {};
    for (const [key, value] of Object.entries(form)) {
      if (isEditing && key === "person_id") continue;
      const trimmed = typeof value === "string" ? value.trim() : value;
      if (trimmed !== "" && trimmed !== null && trimmed !== undefined) {
        payload[key] = trimmed;
      } else if (!isEditing && (key === "person_id" || key === "title" || key === "crime_type" || key === "crime_status")) {
        payload[key] = trimmed;
      } else {
        payload[key] = null;
      }
    }
    return payload;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    setApiError("");

    try {
      const payload = buildPayload();
      if (isEditing) {
        await updateCriminalRecord(record.id, payload);
      } else {
        await createCriminalRecord(payload);
      }
      setSuccess(true);
      setTimeout(() => {
        onSaved();
        onClose();
      }, 800);
    } catch (err) {
      setApiError(err.message || "Erro ao salvar o registro.");
    } finally {
      setSaving(false);
    }
  }

  function RequiredMark() {
    return <span className="required-mark">*</span>;
  }

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-container">
        <div className="modal-header">
          <div className="modal-header__info">
            <span className="agency-label">{isEditing ? "Editar registro" : "Novo registro"}</span>
            <h2>{isEditing ? "Editar Registro Criminal" : "Criar Registro Criminal"}</h2>
            {isEditing && <p>Código: {record.code}</p>}
          </div>
          <button className="modal-close-btn" type="button" onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {apiError && <StatusMessage type="error">{apiError}</StatusMessage>}
            {success && <StatusMessage type="info">Registro salvo com sucesso!</StatusMessage>}

            {/* Person ID — only for creation */}
            {!isEditing && !fixedPersonId && (
              <div className="form-section">
                <h4 className="form-section__title"><Fingerprint size={16} aria-hidden="true" /> Pessoa</h4>
                <div className="form-grid">
                  <div className={`form-field form-field--full${errors.person_id ? " form-field--error" : ""}`}>
                    <label>ID da Pessoa <RequiredMark /></label>
                    <input
                      type="text"
                      value={form.person_id}
                      onChange={(e) => handleChange("person_id", e.target.value)}
                      placeholder="UUID da pessoa cadastrada"
                    />
                    {errors.person_id && <span className="form-field__error-text">{errors.person_id}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Crime Info */}
            <div className="form-section">
              <h4 className="form-section__title"><FileSearch size={16} aria-hidden="true" /> Informações do Crime</h4>
              <div className="form-grid">
                <div className={`form-field form-field--full${errors.title ? " form-field--error" : ""}`}>
                  <label>Título <RequiredMark /></label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="Ex: Furto qualificado"
                  />
                  {errors.title && <span className="form-field__error-text">{errors.title}</span>}
                </div>
                <div className={`form-field${errors.crime_type ? " form-field--error" : ""}`}>
                  <label>Tipo <RequiredMark /></label>
                  <input
                    type="text"
                    value={form.crime_type}
                    onChange={(e) => handleChange("crime_type", e.target.value)}
                    placeholder="Ex: Crime contra o patrimônio"
                  />
                  {errors.crime_type && <span className="form-field__error-text">{errors.crime_type}</span>}
                </div>
                <div className="form-field">
                  <label>Categoria</label>
                  <input
                    type="text"
                    value={form.crime_category}
                    onChange={(e) => handleChange("crime_category", e.target.value)}
                    placeholder="Ex: Furto"
                  />
                </div>
                <div className={`form-field${errors.crime_status ? " form-field--error" : ""}`}>
                  <label>Status <RequiredMark /></label>
                  <select value={form.crime_status} onChange={(e) => handleChange("crime_status", e.target.value)}>
                    <option value="">Selecione...</option>
                    <option value="Under Investigation">Em investigação</option>
                    <option value="Convicted">Condenado</option>
                    <option value="Acquitted">Absolvido</option>
                    <option value="Pending">Pendente</option>
                    <option value="Closed">Encerrado</option>
                  </select>
                  {errors.crime_status && <span className="form-field__error-text">{errors.crime_status}</span>}
                </div>
                <div className="form-field">
                  <label>Gravidade</label>
                  <select value={form.crime_severity} onChange={(e) => handleChange("crime_severity", e.target.value)}>
                    <option value="">Selecione...</option>
                    <option value="High">Alta</option>
                    <option value="Medium">Média</option>
                    <option value="Low">Baixa</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Occurrence */}
            <div className="form-section">
              <h4 className="form-section__title"><MapPin size={16} aria-hidden="true" /> Ocorrência</h4>
              <div className="form-grid form-grid--three">
                <div className="form-field">
                  <label>Data</label>
                  <input
                    type="date"
                    value={form.occurrence_date}
                    onChange={(e) => handleChange("occurrence_date", e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label>Hora</label>
                  <input
                    type="time"
                    value={form.occurrence_time}
                    onChange={(e) => handleChange("occurrence_time", e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label>Estado</label>
                  <select value={form.occurrence_state} onChange={(e) => handleChange("occurrence_state", e.target.value)}>
                    <option value="">UF</option>
                    {BRAZILIAN_STATES.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label>Cidade</label>
                  <input
                    type="text"
                    value={form.occurrence_city}
                    onChange={(e) => handleChange("occurrence_city", e.target.value)}
                    placeholder="Ex: São Paulo"
                  />
                </div>
                <div className="form-field form-field--full">
                  <label>Local</label>
                  <input
                    type="text"
                    value={form.occurrence_location}
                    onChange={(e) => handleChange("occurrence_location", e.target.value)}
                    placeholder="Ex: Rua das Flores, 123"
                  />
                </div>
              </div>
            </div>

            {/* Victim */}
            <div className="form-section">
              <h4 className="form-section__title"><UserRound size={16} aria-hidden="true" /> Vítima</h4>
              <div className="form-grid form-grid--three">
                <div className="form-field">
                  <label>Nome</label>
                  <input
                    type="text"
                    value={form.victim_name}
                    onChange={(e) => handleChange("victim_name", e.target.value)}
                    placeholder="Nome da vítima"
                  />
                </div>
                <div className="form-field">
                  <label>CPF/CNPJ</label>
                  <input
                    type="text"
                    value={form.victim_cpf}
                    onChange={(e) => handleChange("victim_cpf", e.target.value)}
                    placeholder="000.000.000-00"
                  />
                </div>
                <div className="form-field">
                  <label>Tipo</label>
                  <input
                    type="text"
                    value={form.victim_type}
                    onChange={(e) => handleChange("victim_type", e.target.value)}
                    placeholder="Ex: Pessoa física"
                  />
                </div>
              </div>
            </div>

            {/* Responsible */}
            <div className="form-section">
              <h4 className="form-section__title"><Shield size={16} aria-hidden="true" /> Responsável</h4>
              <div className="form-grid">
                <div className="form-field">
                  <label>Autoridade</label>
                  <input
                    type="text"
                    value={form.responsible_authority}
                    onChange={(e) => handleChange("responsible_authority", e.target.value)}
                    placeholder="Ex: Delegado João Silva"
                  />
                </div>
                <div className="form-field">
                  <label>Unidade</label>
                  <input
                    type="text"
                    value={form.responsible_unit}
                    onChange={(e) => handleChange("responsible_unit", e.target.value)}
                    placeholder="Ex: 1ª Delegacia de Polícia"
                  />
                </div>
              </div>
            </div>

            {/* Description & Notes */}
            <div className="form-section">
              <h4 className="form-section__title"><FileSearch size={16} aria-hidden="true" /> Descrição e Observações</h4>
              <div className="form-grid">
                <div className="form-field form-field--full">
                  <label>Descrição do crime</label>
                  <textarea
                    value={form.crime_description}
                    onChange={(e) => handleChange("crime_description", e.target.value)}
                    placeholder="Descreva os detalhes do crime..."
                    rows={3}
                  />
                </div>
                <div className="form-field form-field--full">
                  <label>Observações</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    placeholder="Observações adicionais..."
                    rows={2}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn--secondary" onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button type="submit" className={`btn ${success ? "btn--success" : "btn--primary"}`} disabled={saving || success}>
              {success ? <><Check size={18} /> Salvo!</> : saving ? "Salvando..." : isEditing ? <><Save size={18} /> Salvar alterações</> : <><Plus size={18} /> Criar registro</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ================================================================
   Criminal Records — Row (for the listing page)
   ================================================================ */

function CriminalRecordRow({ record, expanded, onToggle, onEdit }) {
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
          {onEdit && (
            <div className="criminal-row__actions">
              <button className="edit-btn" type="button" onClick={() => onEdit(record)}>
                <Pencil size={14} aria-hidden="true" />
                Editar registro
              </button>
            </div>
          )}
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
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  function fetchRecords() {
    setLoading(true);
    getAllCriminalRecords()
      .then((result) => {
        setRecords(result);
        setError("");
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    fetchRecords();
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

  function handleEdit(record) {
    setEditingRecord(record);
    setModalOpen(true);
  }

  function handleCreate() {
    setEditingRecord(null);
    setModalOpen(true);
  }

  function handleModalClose() {
    setModalOpen(false);
    setEditingRecord(null);
  }

  return (
    <div className="criminal-page">
      <div className="criminal-page__header">
        <div>
          <span className="agency-label">Registros criminais</span>
          <h1>Fichas Criminais</h1>
        </div>
        <div className="criminal-page__actions">
          <button className="btn btn--primary" type="button" onClick={handleCreate}>
            <Plus size={18} aria-hidden="true" />
            Novo registro
          </button>
          <div className="counter">
            <FileSearch size={18} aria-hidden="true" />
            <strong>{filteredAndSorted.length}</strong>
          </div>
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
              onEdit={handleEdit}
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

      <CriminalRecordFormModal
        open={modalOpen}
        onClose={handleModalClose}
        onSaved={fetchRecords}
        record={editingRecord}
      />
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
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  function fetchRecords() {
    if (!person?.cpf) return;
    setLoading(true);
    getCriminalRecordByCpf(person.cpf)
      .then((result) => {
        setRecords(result);
        setError("");
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    fetchRecords();
  }, [person?.cpf]);

  function toggleExpand(id) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  function handleEdit(record) {
    setEditingRecord(record);
    setModalOpen(true);
  }

  function handleCreate() {
    setEditingRecord(null);
    setModalOpen(true);
  }

  function handleModalClose() {
    setModalOpen(false);
    setEditingRecord(null);
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
        <div className="criminal-page__actions">
          <button className="btn btn--primary" type="button" onClick={handleCreate}>
            <Plus size={18} aria-hidden="true" />
            Novo registro
          </button>
          <div className="counter">
            <FileSearch size={18} aria-hidden="true" />
            <strong>{records.length}</strong>
          </div>
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
              onEdit={handleEdit}
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

      <CriminalRecordFormModal
        open={modalOpen}
        onClose={handleModalClose}
        onSaved={fetchRecords}
        record={editingRecord}
        fixedPersonId={person?.id}
      />
    </div>
  );
}

/* ================================================================
   App Shell
   ================================================================ */

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("ssp_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [currentPage, setCurrentPage] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [peoplePageMounted, setPeoplePageMounted] = useState(false);
  const [criminalPerson, setCriminalPerson] = useState(null);

  function handleLogin(userData) {
    setUser(userData);
    localStorage.setItem("ssp_user", JSON.stringify(userData));
  }

  function handleLogout() {
    setUser(null);
    localStorage.removeItem("ssp_user");
    setCurrentPage("home");
  }

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

  if (!user) {
    return <Login onLogin={handleLogin} />;
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

          <div className="topbar__user">
            <div className="topbar__user-info">
              <span className="topbar__user-name">{user.name}</span>
              <span className="topbar__user-badge">{user.role} ({user.badge})</span>
            </div>
            <button className="topbar__logout-btn" onClick={handleLogout} title="Sair do sistema">
              <Lock size={14} aria-hidden="true" />
              <span>Sair</span>
            </button>
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
