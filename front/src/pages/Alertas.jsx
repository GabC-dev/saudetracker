import { useEffect, useState } from 'react'
import { listarUsuarios } from '../services/usuarios'
import { listarAlertas } from '../services/alertas'

function severidade(msg) {
  const m = msg.toLowerCase()
  if (
    m.includes('diabetes') ||
    m.includes('hipoglicemia') ||
    m.includes('hipertensao grau 2') ||
    m.includes('obesidade grau 3')
  ) return 'danger'
  return 'warn'
}

function formatarData(iso) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

function getIniciais(nome) {
  if (!nome) return '?'
  return nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

function PainelAlertas({ usuario, alertas }) {
  const [filtro, setFiltro] = useState('Todos')

  const graves = alertas.filter(a => severidade(a.mensagem) === 'danger')
  const avisos = alertas.filter(a => severidade(a.mensagem) === 'warn')

  const filtrados = filtro === 'Graves' ? graves
                  : filtro === 'Avisos' ? avisos
                  : alertas

  return (
    <div style={{
      marginTop: 8,
      borderTop: '1px solid var(--border)',
      paddingTop: '1rem',
    }}>

      {/* Resumo */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem' }}>
        <div style={{
          background: 'var(--bg)', borderRadius: 8, padding: '6px 14px',
          fontSize: 12, fontWeight: 600, color: 'var(--text-muted)',
        }}>
          Total: <span style={{ color: 'var(--text)' }}>{alertas.length}</span>
        </div>
        {graves.length > 0 && (
          <div style={{
            background: 'var(--danger-bg)', borderRadius: 8, padding: '6px 14px',
            fontSize: 12, fontWeight: 600, color: 'var(--danger-text)',
          }}>
            🔴 Graves: {graves.length}
          </div>
        )}
        {avisos.length > 0 && (
          <div style={{
            background: 'var(--warn-bg)', borderRadius: 8, padding: '6px 14px',
            fontSize: 12, fontWeight: 600, color: 'var(--warn-text)',
          }}>
            ⚠️ Avisos: {avisos.length}
          </div>
        )}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 6, marginBottom: '1rem' }}>
        {['Todos', 'Graves', 'Avisos'].map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            style={{
              padding: '5px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.15s',
              border: `1.5px solid ${filtro === f ? 'var(--green)' : 'var(--border)'}`,
              background: filtro === f ? 'var(--green)' : 'var(--surface)',
              color: filtro === f ? '#fff' : 'var(--text-muted)',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Lista de alertas */}
      {filtrados.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--text-muted)', padding: '0.5rem 0' }}>
          Nenhum alerta do tipo "{filtro}".
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {filtrados.map((a, i) => {
            const isDanger = severidade(a.mensagem) === 'danger'
            return (
              <div
                key={a.alertaId}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  padding: '10px 0',
                  borderBottom: i < filtrados.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: isDanger ? 'var(--danger-bg)' : 'var(--warn-bg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                }}>
                  {isDanger ? '🔴' : '⚠️'}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                    {a.mensagem}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    {formatarData(a.geradoEm)}
                  </p>
                </div>
                <span className={`badge badge-${isDanger ? 'danger' : 'warn'}`}>
                  {isDanger ? 'Grave' : 'Aviso'}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function Alertas() {
  const [dados, setDados]                   = useState([]) // [{ usuario, alertas }]
  const [aberto, setAberto]                 = useState(null)
  const [loading, setLoading]               = useState(true)

  useEffect(() => {
    listarUsuarios().then(async (users) => {
      const resultado = await Promise.all(
        users.map(async u => ({
          usuario: u,
          alertas: await listarAlertas(u.usuarioId).then(a =>
            a.sort((x, y) => new Date(y.geradoEm) - new Date(x.geradoEm))
          ),
        }))
      )
      // ordena: usuários com alertas primeiro, depois por quantidade
      resultado.sort((a, b) => b.alertas.length - a.alertas.length)
      setDados(resultado)
    }).finally(() => setLoading(false))
  }, [])

  const totalAlertas = dados.reduce((acc, d) => acc + d.alertas.length, 0)
  const totalGraves  = dados.reduce((acc, d) => acc + d.alertas.filter(a => severidade(a.mensagem) === 'danger').length, 0)
  const comAlertas   = dados.filter(d => d.alertas.length > 0).length

  return (
    <div className="page" style={{ maxWidth: 720 }}>

      <div className="page-header">
        <div>
          <h1 style={{ fontSize: 22 }}>Alertas</h1>
          <p>{dados.length} usuário{dados.length !== 1 ? 's' : ''} · {totalAlertas} alerta{totalAlertas !== 1 ? 's' : ''} no total</p>
        </div>
      </div>

      {/* Resumo geral */}
      {!loading && totalAlertas > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: '1.5rem' }}>
          <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
            <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)' }}>{totalAlertas}</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total de alertas</p>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
            <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--danger-text)' }}>{totalGraves}</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Alertas graves</p>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
            <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--warn-text)' }}>{comAlertas}</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Usuários com alertas</p>
          </div>
        </div>
      )}

      {/* Lista de usuários */}
      {loading ? (
        <div className="card">
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>Carregando...</p>
        </div>
      ) : dados.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>✅</p>
          <p style={{ color: 'var(--text-muted)' }}>Nenhum usuário cadastrado ainda.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {dados.map(({ usuario, alertas }) => {
            const estaAberto = aberto === usuario.usuarioId
            const graves = alertas.filter(a => severidade(a.mensagem) === 'danger').length
            const semAlertas = alertas.length === 0

            return (
              <div
                key={usuario.usuarioId}
                className="card"
                style={{
                  borderLeft: `3px solid ${semAlertas ? 'var(--green)' : graves > 0 ? '#ef4444' : '#f59e0b'}`,
                  padding: '1rem 1.25rem',
                }}
              >
                {/* Header do usuário */}
                <div
                  onClick={() => !semAlertas && setAberto(estaAberto ? null : usuario.usuarioId)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    cursor: semAlertas ? 'default' : 'pointer',
                  }}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                    background: semAlertas ? 'var(--green)' : graves > 0 ? '#ef4444' : '#f59e0b',
                    color: '#fff', fontWeight: 700, fontSize: 13,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {getIniciais(usuario.nome)}
                  </div>

                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>
                      {usuario.nome}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {usuario.idade} anos · {usuario.email}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {semAlertas ? (
                      <span className="badge badge-ok">✅ Sem alertas</span>
                    ) : (
                      <>
                        {graves > 0 && (
                          <span className="badge badge-danger">{graves} grave{graves !== 1 ? 's' : ''}</span>
                        )}
                        <span className="badge badge-warn">{alertas.length} total</span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>
                          {estaAberto ? '▲' : '▼'}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Painel expansível */}
                {estaAberto && (
                  <PainelAlertas usuario={usuario} alertas={alertas} />
                )}
              </div>
            )
          })}
        </div>
      )}

    </div>
  )
}