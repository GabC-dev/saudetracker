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
    }}>

      {/* Header do painel */}
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
          <button
            className="btn btn-outline"
            style={{ padding: '6px 14px', fontSize: 13 }}
            onClick={() => navigate('/registrar')}
          >
            + Registrar métrica
          </button>
          <button
            onClick={onFechar}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontSize: 20, color: 'var(--text-muted)', lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>Carregando...</p>
      ) : (
        <>
          {/* Cards de métricas */}
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

          {/* Alertas + Gráfico sono */}
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

          {/* Últimas métricas */}
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

export default function Dashboard() {
  const navigate = useNavigate()
  const [usuarios, setUsuarios]           = useState([])
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null)
  const [loading, setLoading]             = useState(true)
  const [erro, setErro]                   = useState(null)

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
  const handleExcluirUsuario = async (id) => {
  const confirmar = window.confirm(
    "Deseja realmente excluir este usuário?"
  )

  if (!confirmar) return

  try {
    await deletarUsuario(id)

    setUsuarios(usuarios =>
      usuarios.filter(u => u.usuarioId !== id)
    )

    if (usuarioSelecionado?.usuarioId === id) {
      setUsuarioSelecionado(null)
    }
  } catch (err) {
    alert("Erro ao excluir usuário")
    console.error(err)
  }
}
  const handleEditarUsuario = async (usuario) => {
  const nome = prompt("Nome:", usuario.nome)
  if (nome === null) return

  const idade = prompt("Idade:", usuario.idade)
  if (idade === null) return

  const altura = prompt("Altura:", usuario.altura)
  if (altura === null) return

  const email = prompt("E-mail:", usuario.email)
  if (email === null) return

  try {
    const atualizado = await atualizarUsuario(
      usuario.usuarioId,
      {
        usuarioId: usuario.usuarioId,
        nome,
        idade: parseInt(idade),
        altura: parseFloat(altura),
        email
      }
    )

    setUsuarios(usuarios =>
      usuarios.map(u =>
        u.usuarioId === usuario.usuarioId
          ? atualizado
          : u
      )
    )

    if (
      usuarioSelecionado?.usuarioId === usuario.usuarioId
    ) {
      setUsuarioSelecionado(atualizado)
    }

  } catch (err) {
    alert("Erro ao editar usuário")
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
                    transition: 'all 0.15s',
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
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditarUsuario(u)
                      }}
                      style={{
                        border: 'none',
                        borderRadius: 6,
                        padding: '6px 10px',
                        cursor: 'pointer',
                        background: '#2563eb',
                        color: '#fff',
                        fontSize: 12
                      }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleExcluirUsuario(u.usuarioId)
                      }}
                    style={{
                    border: 'none',
                    borderRadius: 6,
                    padding: '6px 10px',
                    cursor: 'pointer',
                    background: '#ef4444',
                    color: '#fff',
                    fontSize: 12
                  }}
                >
                    Excluir
                    </button>

                  <span style={{
                    fontSize: 12, color: selecionado ? 'var(--green-dark)' : 'var(--text-muted)',
                    fontWeight: 500,
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