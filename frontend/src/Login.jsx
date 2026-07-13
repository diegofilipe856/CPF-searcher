import React, { useState } from "react";
import { Shield, Lock, Key, AlertCircle, Eye, EyeOff, HelpCircle } from "lucide-react";
import { login as loginApi } from "./api/people";

export default function Login({ onLogin }) {
  const [key, setKey] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgotModal, setShowForgotModal] = useState(false);

  function handleKeyChange(e) {
    const value = e.target.value;
    const digits = value.replace(/\D/g, "").slice(0, 4);
    setKey(digits);
    setError("");
  }

  function handlePasswordChange(e) {
    setPassword(e.target.value);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (key.length !== 4) {
      setError("A chave de acesso deve conter exatamente 4 dígitos.");
      return;
    }

    if (!password.trim()) {
      setError("Por favor, insira a senha.");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await loginApi(key, password);
      setIsLoading(false);
      
      // Map key to mock user info
      let userData = {
        name: "Inspetor Bezerra",
        badge: "SSP-48201",
        role: "Agente de Investigação",
        token: response.token
      };
      
      if (key === "7777") {
        userData = {
          name: "Delegado Silva",
          badge: "SSP-77777",
          role: "Delegado Titular",
          token: response.token
        };
      } else if (key === "0000") {
        userData = {
          name: "Administrador",
          badge: "SSP-00000",
          role: "Administrador",
          token: response.token
        };
      }
      
      onLogin(userData);
    } catch (err) {
      setIsLoading(false);
      setError(err.message || "Chave de acesso ou senha incorreta.");
    }
  }

  return (
    <div className="login-page">
      <div className="login-bg-glow login-bg-glow--1" />
      <div className="login-bg-glow login-bg-glow--2" />
      
      <div className="login-container">
        {/* Brand/Header */}
        <div className="login-brand">
          <div className="login-logo-container">
            <Shield size={38} className="login-logo-icon" />
            <div className="login-logo-glow" />
          </div>
          <span className="login-subbrand">SSP Digital</span>
          <h1 className="login-title">Sistema Integrado de Pessoas</h1>
          <p className="login-subtitle">Acesso restrito para consulta cadastral e criminal</p>
        </div>

        {/* Login Card */}
        <div className="login-card">
          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="login-error-message">
                <AlertCircle size={18} className="login-error-icon" />
                <span>{error}</span>
              </div>
            )}

            <div className="login-field-group">
              <label htmlFor="login-key">Chave de Acesso (4 dígitos)</label>
              <div className="login-input-wrapper">
                <Key className="login-input-icon" size={18} />
                <input
                  id="login-key"
                  type="text"
                  placeholder="Ex: 4820"
                  value={key}
                  onChange={handleKeyChange}
                  disabled={isLoading}
                  maxLength={4}
                  required
                />
              </div>
            </div>

            <div className="login-field-group">
              <div className="login-password-label-row">
                <label htmlFor="login-password">Senha de Acesso</label>
                <button
                  type="button"
                  className="login-forgot-link"
                  onClick={() => setShowForgotModal(true)}
                  disabled={isLoading}
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="login-input-wrapper">
                <Lock className="login-input-icon" size={18} />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={handlePasswordChange}
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  className="login-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? (
                <div className="login-spinner-container">
                  <div className="login-spinner" />
                  <span>Verificando credenciais...</span>
                </div>
              ) : (
                <span>Entrar no Sistema</span>
              )}
            </button>
          </form>
        </div>

        {/* Security Warning Disclaimer */}
        <div className="login-disclaimer">
          <AlertCircle size={14} />
          <span>
            <strong>Nota de Simulação:</strong> Este é um site demonstrativo para fins de portfólio. Todos os dados cadastrais, criminais e informações de servidores exibidos neste sistema são inteiramente fictícios e simulados.
          </span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="login-modal-overlay">
          <div className="login-modal-card">
            <div className="login-modal-header">
              <HelpCircle size={24} className="login-modal-icon" />
              <h3>Recuperação de Acesso</h3>
            </div>
            <div className="login-modal-body">
              <p>
                Por motivos de segurança e sigilo das informações do banco de dados da Segurança Pública, 
                as credenciais dos servidores são gerenciadas exclusivamente pelo setor de TI.
              </p>
              <div className="login-modal-instruction">
                <strong>Para redefinir sua chave ou solicitar acesso:</strong>
                <ul>
                  <li>Procure o departamento de informática da sua repartição;</li>
                  <li>Ligue para a Central de Suporte Interno no ramal <strong>4004</strong> ou <strong>8080</strong>;</li>
                  <li>Envie um e-mail para <code className="login-code">suporte.local@ssp.invalid</code> a partir do seu e-mail institucional.</li>
                </ul>
              </div>
            </div>
            <div className="login-modal-footer">
              <button className="login-modal-close-btn" onClick={() => setShowForgotModal(false)}>
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

