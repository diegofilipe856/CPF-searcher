const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");

async function request(path, options) {
  const userJson = localStorage.getItem("ssp_user");
  const user = userJson ? JSON.parse(userJson) : null;
  const token = user?.token;

  const authHeaders = token ? { "Authorization": `Bearer ${token}` } : {};

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const contentType = response.headers.get("Content-Type") || "";
    const body = contentType.includes("application/json") ? await response.json() : await response.text();
    const message = typeof body === "string" ? body : body.detail;

    throw new Error(
      message === "Person not found" ? "Pessoa não encontrada." : message || "Não foi possível consultar a API.",
    );
  }

  return response.json();
}

export function getPeople() {
  return request("/person");
}

export function getPersonByCpf(cpf) {
  return request(`/person/${encodeURIComponent(cpf)}`);
}

export function getAllCriminalRecords() {
  return request("/criminal-records");
}

export function getCriminalRecordByCpf(cpf) {
  return request(`/criminal-records/${encodeURIComponent(cpf)}`);
}

export function getPersonById(id) {
  return request(`/person/id/${encodeURIComponent(id)}`);
}

export function updateCriminalRecord(recordId, data) {
  return request(`/criminal-records/${encodeURIComponent(recordId)}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function createCriminalRecord(data) {
  return request("/criminal-records", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function login(loginVal, password) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ login: loginVal, password }),
  });
}

export { API_BASE_URL };

