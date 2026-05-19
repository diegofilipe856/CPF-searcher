const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");

async function request(path, options) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Não foi possível consultar a API.");
  }

  return response.json();
}

export function getPeople() {
  return request("/person/");
}

export function getPersonByCpf(cpf) {
  return request(`/person/${encodeURIComponent(cpf)}`);
}

export function getCriminalRecord(cpf) {
  return Promise.reject(
    new Error(`Módulo de ficha criminal ainda não implementado para o CPF ${cpf}.`),
  );
}

export { API_BASE_URL };
