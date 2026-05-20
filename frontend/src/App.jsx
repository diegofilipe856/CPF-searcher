import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BadgeCheck,
  CalendarDays,
  ChevronRight,
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
import { API_BASE_URL, getCriminalRecord, getPeople, getPersonByCpf } from "./api/people";

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
      ["Data de nascimento", "data_nasc", "date"],
      ["Sexo", "sexo"],
      ["Idade", "idade", "years"],
      ["Signo", "signo"],
    ],
  },
  {
    title: "Filiação",
    icon: UsersRound,
    fields: [
      ["Mãe", "mae"],
      ["Pai", "pai"],
    ],
  },
  {
    title: "Contato",
    icon: Contact,
    fields: [
      ["E-mail", "email"],
      ["Telefone fixo", "telefone_fixo"],
      ["Celular", "celular"],
    ],
  },
  {
    title: "Características",
    icon: Gauge,
    fields: [
      ["Altura", "altura"],
      ["Peso", "peso", "weight"],
      ["Tipo sanguíneo", "tipo_sanguineo"],
    ],
  },
];

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });

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

  if (type === "weight") {
    return `${Number(value).toLocaleString("pt-BR")} kg`;
  }

  return String(value);
}

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/* ================================================================
   Navigation Config
   ================================================================ */

const NAV_ITEMS = [
  { id: "home", label: "Início", icon: LayoutDashboard },
  { id: "people", label: "Consulta de Pessoas", icon: Search },
  { id: "criminal", label: "Ficha Criminal", icon: FileSearch, disabled: true },
  { id: "profile", label: "Perfil do Servidor", icon: UserCircle, disabled: true },
];

const PAGE_TITLES = {
  home: "Início",
  people: "Consulta de Pessoas",
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

          <div className="module-card module-card--disabled" aria-disabled="true">
            <div className="module-card__icon">
              <FileSearch size={28} />
            </div>
            <div className="module-card__body">
              <strong>Ficha Criminal</strong>
              <p>Consulte antecedentes e registros criminais de pessoas cadastradas.</p>
            </div>
            <div className="module-card__arrow">
              <span className="module-card__badge">Em breve</span>
            </div>
          </div>

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
        <strong>{person.nome}</strong>
        <small>CPF {person.cpf}</small>
        <span>
          RG {person.rg} · {person.idade} anos
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
    <aside className="detail-panel" aria-label={`Dados de ${person.nome}`}>
      {error && <StatusMessage type="error">{error}</StatusMessage>}
      <div className="profile-header">
        <PersonPhoto />
        <div className="profile-header__content">
        <span className="agency-label">Registro individual</span>
          <h2>{person.nome}</h2>
          <p>CPF {person.cpf}</p>
          <div className="profile-tags" aria-label="Resumo cadastral">
            <span>{person.sexo}</span>
            <span>{person.tipo_sanguineo}</span>
            <span>{person.idade} anos</span>
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

function PeopleSearch() {
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

    if (!search) {
      return people;
    }

    return people.filter((person) =>
      [person.nome, person.cpf, person.rg, person.mae, person.pai].some((value) =>
        normalize(value).includes(search),
      ),
    );
  }, [people, query]);

  function handleSelect(person) {
    setSelectedCpf(person.cpf);
    setNotice("");
  }

  function handleCriminalRecord(person) {
    getCriminalRecord(person.cpf).catch((err) => {
      setNotice(err.message);
    });
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
   App Shell
   ================================================================ */

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [peoplePageMounted, setPeoplePageMounted] = useState(false);

  function handleNavigate(page) {
    if (page === "people") setPeoplePageMounted(true);
    setCurrentPage(page);
    setSidebarOpen(false);
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
              <PeopleSearch />
            </div>
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
