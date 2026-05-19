import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BadgeCheck,
  CalendarDays,
  Contact,
  FileSearch,
  Fingerprint,
  Gauge,
  Mail,
  MapPin,
  Phone,
  Search,
  Shield,
  UserRound,
  UsersRound,
} from "lucide-react";
import defaultProfile from "./assets/default-profile.svg";
import { API_BASE_URL, getCriminalRecord, getPeople, getPersonByCpf } from "./api/people";

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

function App() {
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
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar__brand">
          <div className="brand-mark" aria-hidden="true">
            <Shield size={26} />
          </div>
          <div>
            <span>SSP Digital</span>
            <strong>Sistema Integrado de Pessoas</strong>
          </div>
        </div>

        <div className="topbar__meta">
          <span>Ambiente simulado</span>
          <strong>API: {API_BASE_URL}</strong>
        </div>
      </header>

      <main className="workspace">
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
  );
}

export default App;
