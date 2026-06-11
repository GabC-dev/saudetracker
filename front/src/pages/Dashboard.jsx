import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  listarUsuarios,
  deletarUsuario,
  atualizarUsuario
} from '../services/usuarios'
import { listarMetricas } from '../services/metricas'
import { listarAlertas } from '../services/alertas'

const METRICAS_CONFIG = {
  Peso:     { icon: '🏋️', bg: '#e8f8ef', label: 'Peso',     unit: 'kg' },
  Pressao:  { icon: '❤️',  bg: '#fef0f0', label: 'Pressão',  unit: 'mmHg' },
  Sono:     { icon: '🌙',  bg: '#eef2ff', label: 'Sono',     unit: 'h' },
  Humor:    { icon: '😊',  bg: '#fffbeb', label: 'Humor',    unit: '/10' },
  Glicemia: { icon: '🩸',  bg: '#f0f9ff', label: 'Glicemia', unit: 'mg/dL' },
}

function calcularIMC(peso)    {
  const imc = peso / (1.75 * 1.75)
  if (imc < 18.5) return { label: 'Abaixo do peso', tipo: 'warn' }
  if (imc < 25)   return { label: 'Normal',          tipo: 'ok' }
  if (imc < 30)   return { label: 'Sobrepeso',        tipo: 'warn' }
  return                 { label: 'Obesidade',         tipo: 'danger' }
}

function statusPressao(v1, v2) {
  if (!v2)                        return { label: 'Sem diastólica', tipo: 'warn' }
  if (v1 < 120 && v2 < 80)       return { label: 'Normal',         tipo: 'ok' }
  if (v1 < 130 && v2 < 80)       return { label: 'Elevada',        tipo: 'warn' }
  return                                 { label: 'Hipertensão',    tipo: 'danger' }
}

function statusSono(h) {
  if (h < 6)  return { label: 'Insuficiente', tipo: 'danger' }
  if (h <= 8) return { label: 'Adequado',     tipo: 'ok' }
  return             { label: 'Excessivo',    tipo: 'warn' }
}

function statusHumor(v) {
  if (v <= 3) return { label: 'Muito baixo', tipo: 'danger' }
  if (v <= 5) return { label: 'Baixo',       tipo: 'warn' }
  if (v <= 7) return { label: 'Moderado',    tipo: 'ok' }
  return             { label: 'Bom',         tipo: 'ok' }
}

function statusGlicemia(v) {
  if (v < 70)  return { label: 'Hipoglicemia',  tipo: 'danger' }
  if (v < 100) return { label: 'Normal',         tipo: 'ok' }
  if (v < 126) return { label: 'Pré-diabetes',   tipo: 'warn' }
  return              { label: 'Diabetes',        tipo: 'danger' }
}

function getStatus(metrica) {
  switch (metrica.tipo) {
    case 'Peso':     return calcularIMC(metrica.valor1)
    case 'Pressao':  return statusPressao(metrica.valor1, metrica.valor2)
    case 'Sono':     return statusSono(metrica.valor1)
    case 'Humor':    return statusHumor(metrica.valor1)
    case 'Glicemia': return statusGlicemia(metrica.valor1)
    default:         return { label: '-', tipo: 'ok' }
  }
}

function formatarValor(metrica) {
  if (metrica.tipo === 'Pressao' && metrica.valor2)
    return `${metrica.valor1}/${metrica.valor2}`
  return metrica.valor1
}

function formatarData(iso) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

function diaDaSemana(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', { weekday: 'short' })
}

function getIniciais(nome) {
  if (!nome) return '?'
  return nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

// ─── Modal de Edição ──────────────────────────────────────────────────────────
function ModalEditar({ usuario, onSalvar, onFechar }) {
  const [form, setForm] = useState({
    nome:   usuario.nome,
    idade:  usuario.idade,
    altura: usuario.altura,
    email:  usuario.email,
  })
  const [salvando, setSalvando] = useState(false)

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async () => {
    setSalvando(true)
    await onSalvar({
      usuarioId: usuario.usuarioId,
      nome:   form.nome,
      idade:  parseInt(form.idade),
      altura: parseFloat(form.altura),
      email:  form.email,
    })
    setSalvando(false)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 0.15s ease',
    }}>
      <div style={{
        background: 'var(--surface)',
        borderRadius: 16,
        padding: '2rem',
        width: '100%',
        maxWidth: 420,
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        animation: 'slideUp 0.2s ease',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="navbar-avatar" style={{ width: 38, height: 38, fontSize: 13 }}>
              {getIniciais(usuario.nome)}
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 15 }}>Editar usuário</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{usuario.email}</p>
            </div>
          </div>
          <button onClick={onFechar} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            fontSize: 20, color: 'var(--text-muted)', lineHeight: 1,
          }}>✕</button>
        </div>

        {/* Campos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'Nome',   name: 'nome',   type: 'text',   placeholder: 'Nome completo' },
            { label: 'Idade',  name: 'idade',  type: 'number', placeholder: 'Ex: 22' },
            { label: 'Altura (m)', name: 'altura', type: 'number', placeholder: 'Ex: 1.75', step: '0.01' },
            { label: 'E-mail', name: 'email',  type: 'email',  placeholder: 'email@exemplo.com' },
          ].map(({ label, name, type, placeholder, step }) => (
            <div key={name}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                {label}
              </label>
              <input
                name={name}
                type={type}
                step={step}
                value={form[name]}
                onChange={handleChange}
                placeholder={placeholder}
                style={{
                  width: '100%', padding: '9px 12px', borderRadius: 8, fontSize: 14,
                  border: '1.5px solid var(--border)', background: 'var(--bg)',
                  color: 'var(--text)', outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--green)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          ))}
        </div>

        {/* Botões */}
        <div style={{ display: 'flex', gap: 10, marginTop: '1.5rem' }}>
          <button onClick={onFechar} style={{
            flex: 1, padding: '10px', borderRadius: 8, fontSize: 14, fontWeight: 600,
            border: '1.5px solid var(--border)', background: 'var(--bg)',
            color: 'var(--text)', cursor: 'pointer',
          }}>
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={salvando} style={{
            flex: 1, padding: '10px', borderRadius: 8, fontSize: 14, fontWeight: 600,
            border: 'none', background: 'var(--green)', color: '#fff',
            cursor: salvando ? 'not-allowed' : 'pointer', opacity: salvando ? 0.7 : 1,
          }}>
            {salvando ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Modal de Confirmação de Exclusão ─────────────────────────────────────────
function ModalConfirmar({ usuario, onConfirmar, onFechar }) {
  const [excluindo, setExcluindo] = useState(false)

  const handleConfirmar = async () => {
    setExcluindo(true)
    await onConfirmar()
    setExcluindo(false)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 0.15s ease',
    }}>
      <div style={{
        background: 'var(--surface)',
        borderRadius: 16,
        padding: '2rem',
        width: '100%',
        maxWidth: 380,
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        textAlign: 'center',
        animation: 'slideUp 0.2s ease',
      }}>
        <div style={{ fontSize: 40, marginBottom: '1rem' }}>🗑️</div>
        <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Excluir usuário?</p>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Você está prestes a excluir <strong>{usuario.nome}</strong> e todos os seus dados. Essa ação não pode ser desfeita.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onFechar} style={{
            flex: 1, padding: '10px', borderRadius: 8, fontSize: 14, fontWeight: 600,
            border: '1.5px solid var(--border)', background: 'var(--bg)',
            color: 'var(--text)', cursor: 'pointer',
          }}>
            Cancelar
          </button>
          <button onClick={handleConfirmar} disabled={excluindo} style={{
            flex: 1, padding: '10px', borderRadius: 8, fontSize: 14, fontWeight: 600,
            border: 'none', background: '#ef4444', color: '#fff',
            cursor: excluindo ? 'not-allowed' : 'pointer', opacity: excluindo ? 0.7 : 1,
          }}>
            {excluindo ? 'Excluindo...' : 'Sim, excluir'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Painel do Usuário ────────────────────────────────────────────────────────
function PainelUsuario({ usuario, onFechar, navigate }) {
  const [metricas, setMetricas] = useState([])
  const [alertas, setAlertas]   = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      listarMetricas(usuario.usuarioId),
      listarAlertas(usuario.usuarioId),
    ]).then(([m, a]) => {
      setMetricas(m)
      setAlertas(a)
    }).finally(() => setLoading(false))
  }, [usuario.usuarioId])

  const ultimasPorTipo = Object.keys(METRICAS_CONFIG).reduce((acc, tipo) => {
    const found = metricas
      .filter(m => m.tipo === tipo)
      .sort((a, b) => new Date(b.registradoEm) - new Date(a.registradoEm))[0]
    if (found) acc[tipo] = found
    return acc
  }, {})

  const sonoSemana = metricas
    .filter(m => m.tipo === 'Sono')
    .sort((a, b) => new Date(a.registradoEm) - new Date(b.registradoEm))
    .slice(-7)

  const maxSono = Math.max(...sonoSemana.map(m => m.valor1), 10)

  const ultimasMetricas = [...metricas]
    .sort((a, b) => new Date(b.registradoEm) - new Date(a.registradoEm))
    .slice(0, 5)

  return (
    <div style={{
      marginTop: '1.5rem',
      border: '2px solid var(--green)',
      borderRadius: 'var(--radius)',
      padding: '1.5rem',
      background: 'var(--surface)',
      boxShadow: '0 4px 20px rgba(46,204,113,0.12)',
      animation: 'slideUp 0.2s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="navbar-avatar" style={{ width: 44, height: 44, fontSize: 15 }}>
            {getIniciais(usuario.nome)}
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>{usuario.nome}</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {usuario.idade} anos · {usuario.altura}m · {usuario.email}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: 13 }}
            onClick={() => navigate('/registrar')}>
            + Registrar métrica
          </button>
          <button onClick={onFechar} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            fontSize: 20, color: 'var(--text-muted)', lineHeight: 1,
          }}>✕</button>
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>Carregando...</p>
      ) : (
        <>
          <div className="metrics-grid" style={{ marginBottom: '1.25rem' }}>
            {Object.entries(METRICAS_CONFIG).map(([tipo, cfg]) => {
              const m = ultimasPorTipo[tipo]
              const status = m ? getStatus(m) : null
              return (
                <div className="metric-card" key={tipo}>
                  <div className="metric-icon" style={{ background: cfg.bg }}>{cfg.icon}</div>
                  <div className="metric-label">{cfg.label}</div>
                  {m ? (
                    <>
                      <div className="metric-value">
                        {formatarValor(m)}<span> {cfg.unit}</span>
                      </div>
                      <span className={`badge badge-${status.tipo}`}>{status.label}</span>
                    </>
                  ) : (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>Sem dados</div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="section-grid" style={{ marginBottom: '1.25rem' }}>
            <div className="card">
              <div className="card-title">
                Alertas
                {alertas.length > 0 && (
                  <span className="badge badge-danger">{alertas.length} ativos</span>
                )}
              </div>
              {alertas.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '0.5rem 0' }}>
                  ✅ Nenhum alerta!
                </p>
              ) : (
                alertas.slice(0, 3).map(a => {
                  const isDanger = a.mensagem.toLowerCase().includes('diabetes') ||
                    a.mensagem.toLowerCase().includes('hipertensao grau 2') ||
                    a.mensagem.toLowerCase().includes('hipoglicemia')
                  return (
                    <div className="alerta-item" key={a.alertaId}>
                      <div className={`alerta-dot ${isDanger ? 'danger' : 'warn'}`} />
                      <div>
                        <p className="alerta-msg">{a.mensagem}</p>
                        <p className="alerta-date">{formatarData(a.geradoEm)}</p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <div className="card">
              <div className="card-title">Sono — últimos 7 dias</div>
              {sonoSemana.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '0.5rem 0' }}>
                  Sem registros de sono.
                </p>
              ) : (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80 }}>
                  {sonoSemana.map((m, i) => {
                    const pct = (m.valor1 / maxSono) * 100
                    const s = statusSono(m.valor1)
                    const cor = s.tipo === 'ok' ? '#2ecc71' : s.tipo === 'warn' ? '#f59e0b' : '#ef4444'
                    return (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <div style={{
                          width: '100%', height: `${pct}%`, background: cor,
                          borderRadius: '4px 4px 0 0', minHeight: 6,
                        }} title={`${m.valor1}h`} />
                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                          {diaDaSemana(m.registradoEm)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {ultimasMetricas.length > 0 && (
            <div className="card">
              <div className="card-title">Últimas métricas</div>
              <table className="st-table">
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Valor</th>
                    <th>Data</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ultimasMetricas.map(m => {
                    const cfg = METRICAS_CONFIG[m.tipo] || { icon: '📋', bg: '#f5f5f5', unit: '' }
                    const status = getStatus(m)
                    return (
                      <tr key={m.metricaId}>
                        <td>
                          <div className="td-icon">
                            <div className="td-icon-wrap" style={{ background: cfg.bg }}>{cfg.icon}</div>
                            {m.tipo}
                          </div>
                        </td>
                        <td>{formatarValor(m)} {cfg.unit}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{formatarData(m.registradoEm)}</td>
                        <td><span className={`badge badge-${status.tipo}`}>{status.label}</span></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── Dashboard Principal ──────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate()
  const [usuarios, setUsuarios]                   = useState([])
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null)
  const [modalEditar, setModalEditar]             = useState(null)
  const [modalExcluir, setModalExcluir]           = useState(null)
  const [loading, setLoading]                     = useState(true)
  const [erro, setErro]                           = useState(null)

  useEffect(() => {
    listarUsuarios()
      .then(setUsuarios)
      .catch(() => setErro('Não foi possível conectar ao servidor.'))
      .finally(() => setLoading(false))
  }, [])

  const hoje = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  const handleSelecionar = (u) => {
    if (usuarioSelecionado?.usuarioId === u.usuarioId) {
      setUsuarioSelecionado(null)
    } else {
      setUsuarioSelecionado(u)
    }
  }

  const handleExcluirConfirmado = async () => {
    try {
      await deletarUsuario(modalExcluir.usuarioId)
      setUsuarios(us => us.filter(u => u.usuarioId !== modalExcluir.usuarioId))
      if (usuarioSelecionado?.usuarioId === modalExcluir.usuarioId) {
        setUsuarioSelecionado(null)
      }
      setModalExcluir(null)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSalvarEdicao = async (dados) => {
    try {
      const atualizado = await atualizarUsuario(dados.usuarioId, dados)
      setUsuarios(us => us.map(u => u.usuarioId === dados.usuarioId ? atualizado : u))
      if (usuarioSelecionado?.usuarioId === dados.usuarioId) {
        setUsuarioSelecionado(atualizado)
      }
      setModalEditar(null)
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="page" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>Carregando...</p>
      </div>
    )
  }

  if (erro) {
    return (
      <div className="page" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <p style={{ color: 'var(--danger-text)', fontWeight: 600 }}>{erro}</p>
      </div>
    )
  }

  return (
    <div className="page">

      {/* Modais */}
      {modalEditar && (
        <ModalEditar
          usuario={modalEditar}
          onSalvar={handleSalvarEdicao}
          onFechar={() => setModalEditar(null)}
        />
      )}
      {modalExcluir && (
        <ModalConfirmar
          usuario={modalExcluir}
          onConfirmar={handleExcluirConfirmado}
          onFechar={() => setModalExcluir(null)}
        />
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Visão Geral</h1>
          <p style={{ textTransform: 'capitalize' }}>{hoje}</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/cadastro')}>
          + Novo usuário
        </button>
      </div>

      {/* Lista de usuários */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-title">
          Usuários cadastrados
          <span className="badge badge-ok">{usuarios.length} no total</span>
        </div>

        {usuarios.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Nenhum usuário cadastrado ainda.{' '}
              <span
                style={{ color: 'var(--green-dark)', cursor: 'pointer', fontWeight: 600 }}
                onClick={() => navigate('/cadastro')}
              >
                Cadastrar agora →
              </span>
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {usuarios.map(u => {
              const selecionado = usuarioSelecionado?.usuarioId === u.usuarioId
              return (
                <div
                  key={u.usuarioId}
                  onClick={() => handleSelecionar(u)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '12px 16px', borderRadius: 10, cursor: 'pointer',
                    border: `1.5px solid ${selecionado ? 'var(--green)' : 'var(--border)'}`,
                    background: selecionado ? 'var(--green-light)' : 'var(--bg)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div className="navbar-avatar" style={{ width: 40, height: 40, fontSize: 14, flexShrink: 0 }}>
                    {getIniciais(u.nome)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{u.nome}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {u.idade} anos · {u.altura}m · {u.email}
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setModalEditar(u) }}
                    style={{
                      border: 'none', borderRadius: 6, padding: '6px 14px',
                      cursor: 'pointer', background: '#2563eb', color: '#fff',
                      fontSize: 12, fontWeight: 600, transition: 'opacity 0.15s',
                    }}
                    onMouseOver={e => e.target.style.opacity = '0.85'}
                    onMouseOut={e => e.target.style.opacity = '1'}
                  >
                    Editar
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setModalExcluir(u) }}
                    style={{
                      border: 'none', borderRadius: 6, padding: '6px 14px',
                      cursor: 'pointer', background: '#ef4444', color: '#fff',
                      fontSize: 12, fontWeight: 600, transition: 'opacity 0.15s',
                    }}
                    onMouseOver={e => e.target.style.opacity = '0.85'}
                    onMouseOut={e => e.target.style.opacity = '1'}
                  >
                    Excluir
                  </button>
                  <span style={{
                    fontSize: 12, color: selecionado ? 'var(--green-dark)' : 'var(--text-muted)',
                    fontWeight: 500, minWidth: 80, textAlign: 'right',
                  }}>
                    {selecionado ? '▲ Fechar' : '▼ Ver índices'}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Painel do usuário selecionado */}
      {usuarioSelecionado && (
        <PainelUsuario
          usuario={usuarioSelecionado}
          onFechar={() => setUsuarioSelecionado(null)}
          navigate={navigate}
        />
      )}

    </div>
  )
}
