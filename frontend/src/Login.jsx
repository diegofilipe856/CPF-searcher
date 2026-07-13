import React, { useState } from "react";
import { Shield, Lock, Fingerprint, AlertCircle, Eye, EyeOff, Check, HelpCircle } from "lucide-react";

export default function Login({ onLogin }) {
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgotModal, setShowForgotModal] = useState(false);

  function handleCpfChange(e) {
    const value = e.target.value;
    const digits = value.replace(/\D/g, "").slice(0, 11);
    
    // Format CPF: 000.000.000-00
    let formatted = digits;
    if (digits.length > 3) {
      formatted = `${digits.slice(0, 3)}.${digits.slice(3)}`;
    }
    if (digits.length > 6) {
      formatted = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    }
    if (digits.length > 9) {
      formatted = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
    }
    
    setCpf(formatted);
    setError("");
  }

  function handlePasswordChange(e) {
    setPassword(e.target.value);
    setError("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    
    const rawCpf = cpf.replace(/\D/g, "");
    if (rawCpf.length !== 11) {
      setError("Por favor, insira um CPF válido com 11 dígitos.");
      return;
    }
    
    if (password.trim().length < 4) {
      setError("A senha deve conter no mínimo 4 caracteres.");
      return;
    }

    setIsLoading(true);
    
    // Simulate API request to backend (to be implemented later by user)
    setTimeout(() => {
      setIsLoading(false);
      // Hardcoded mock user details for demonstration
      onLogin({
        cpf: rawCpf,
        name: "Inspetor Bezerra",
        badge: "SSP-48201",
        role: "Agente de Investigação"
      });
    }, 1500);
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
              <label htmlFor="login-cpf">CPF do Servidor</label>
              <div className="login-input-wrapper">
                <Fingerprint className="login-input-icon" size={18} />
                <input
                  id="login-cpf"
                  type="text"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={handleCpfChange}
                  disabled={isLoading}
                  autoComplete="username"
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
                  autoComplete="current-password"
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
                <strong>Para redefinir sua senha ou solicitar acesso:</strong>
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
