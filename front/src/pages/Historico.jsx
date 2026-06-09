import { useEffect, useState, useMemo } from 'react'
import { listarUsuarios } from '../services/usuarios'
import { listarMetricas } from '../services/metricas'

const METRICAS_CONFIG = {
  Peso:     { icon: '🏋️', bg: '#e8f8ef', unit: 'kg' },
  Pressao:  { icon: '❤️',  bg: '#fef0f0', unit: 'mmHg' },
  Sono:     { icon: '🌙',  bg: '#eef2ff', unit: 'h' },
  Humor:    { icon: '😊',  bg: '#fffbeb', unit: '/10' },
  Glicemia: { icon: '🩸',  bg: '#f0f9ff', unit: 'mg/dL' },
}

const POR_PAGINA = 10

function getStatus(metrica) {
  const { tipo, valor1, valor2 } = metrica
  if (tipo === 'Peso') {
    const imc = valor1 / (1.75 * 1.75)
    if (imc < 18.5) return { label: 'Abaixo do peso', tipo: 'warn' }
    if (imc < 25)   return { label: 'Normal',          tipo: 'ok' }
    if (imc < 30)   return { label: 'Sobrepeso',        tipo: 'warn' }
    return                 { label: 'Obesidade',         tipo: 'danger' }
  }
  if (tipo === 'Pressao') {
    if (!valor2)                     return { label: 'Sem diastólica', tipo: 'warn' }
    if (valor1 < 120 && valor2 < 80) return { label: 'Normal',         tipo: 'ok' }
    if (valor1 < 130 && valor2 < 80) return { label: 'Elevada',        tipo: 'warn' }
    return                                  { label: 'Hipertensão',     tipo: 'danger' }
  }
  if (tipo === 'Sono') {
    if (valor1 < 6)  return { label: 'Insuficiente', tipo: 'danger' }
    if (valor1 <= 8) return { label: 'Adequado',     tipo: 'ok' }
    return                  { label: 'Excessivo',    tipo: 'warn' }
  }
  if (tipo === 'Humor') {
    if (valor1 <= 3) return { label: 'Muito baixo', tipo: 'danger' }
    if (valor1 <= 5) return { label: 'Baixo',       tipo: 'warn' }
    if (valor1 <= 7) return { label: 'Moderado',    tipo: 'ok' }
    return                  { label: 'Bom',         tipo: 'ok' }
  }
  if (tipo === 'Glicemia') {
    if (valor1 < 70)  return { label: 'Hipoglicemia', tipo: 'danger' }
    if (valor1 < 100) return { label: 'Normal',        tipo: 'ok' }
    if (valor1 < 126) return { label: 'Pré-diabetes',  tipo: 'warn' }
    return                   { label: 'Diabetes',       tipo: 'danger' }
  }
  return { label: '-', tipo: 'ok' }
}

function formatarValor(m) {
  if (m.tipo === 'Pressao' && m.valor2) return `${m.valor1}/${m.valor2}`
  return m.valor1
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

function Th({ label, campo, ordenacao, onOrdenar }) {
  const ativo = ordenacao.campo === campo
  return (
    <th
      onClick={() => onOrdenar(campo)}
      style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {label}
        <span style={{ fontSize: 10, color: ativo ? 'var(--green-dark)' : 'var(--border)' }}>
          {ativo ? (ordenacao.direcao === 'asc' ? '▲' : '▼') : '⇅'}
        </span>
      </span>
    </th>
  )
}

export default function Historico() {
  const [usuarios, setUsuarios]     = useState([])
  const [metricas, setMetricas]     = useState([])
  const [filtroTipo, setFiltroTipo] = useState('Todos')
  const [filtroUser, setFiltroUser] = useState('Todos')
  const [ordenacao, setOrdenacao]   = useState({ campo: 'registradoEm', direcao: 'desc' })
  const [pagina, setPagina]         = useState(1)
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    listarUsuarios().then(async (users) => {
      setUsuarios(users)
      const todas = await Promise.all(
        users.map(u =>
          listarMetricas(u.usuarioId).then(ms =>
            ms.map(m => ({ ...m, _nomeUsuario: u.nome }))
          )
        )
      )
      setMetricas(todas.flat())
    }).finally(() => setLoading(false))
  }, [])

  const handleOrdenar = (campo) => {
    setOrdenacao(prev => ({
      campo,
      direcao: prev.campo === campo && prev.direcao === 'asc' ? 'desc' : 'asc'
    }))
    setPagina(1)
  }

  const filtradas = useMemo(() => {
    return [...metricas]
      .filter(m => filtroTipo === 'Todos' || m.tipo === filtroTipo)
      .filter(m => filtroUser === 'Todos' || m._nomeUsuario === filtroUser)
      .sort((a, b) => {
        let va, vb
        if (ordenacao.campo === 'registradoEm') {
          va = new Date(a.registradoEm)
          vb = new Date(b.registradoEm)
        } else if (ordenacao.campo === 'usuario') {
          va = a._nomeUsuario
          vb = b._nomeUsuario
        } else if (ordenacao.campo === 'tipo') {
          va = a.tipo
          vb = b.tipo
        } else if (ordenacao.campo === 'valor') {
          va = a.valor1
          vb = b.valor1
        } else {
          return 0
        }
        if (va < vb) return ordenacao.direcao === 'asc' ? -1 : 1
        if (va > vb) return ordenacao.direcao === 'asc' ? 1 : -1
        return 0
      })
  }, [metricas, filtroTipo, filtroUser, ordenacao])

  const totalPaginas = Math.ceil(filtradas.length / POR_PAGINA)
  const paginadas = filtradas.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)

  const tipos = ['Todos', ...Object.keys(METRICAS_CONFIG)]

  return (
    <div className="page">

      <div className="page-header">
        <div>
          <h1 style={{ fontSize: 22 }}>Histórico de métricas</h1>
          <p>{filtradas.length} registro{filtradas.length !== 1 ? 's' : ''} encontrado{filtradas.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: '1.5rem', alignItems: 'center' }}>

        {/* Filtro por tipo */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {tipos.map(t => {
            const cfg = METRICAS_CONFIG[t]
            return (
              <button
                key={t}
                onClick={() => { setFiltroTipo(t); setPagina(1) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.15s',
                  border: `1.5px solid ${filtroTipo === t ? 'var(--green)' : 'var(--border)'}`,
                  background: filtroTipo === t ? 'var(--green)' : 'var(--surface)',
                  color: filtroTipo === t ? '#fff' : 'var(--text-muted)',
                }}
              >
                {cfg ? cfg.icon : '📋'} {t}
              </button>
            )
          })}
        </div>

        {/* Filtro por usuário */}
        {usuarios.length > 1 && (
          <select
            value={filtroUser}
            onChange={e => { setFiltroUser(e.target.value); setPagina(1) }}
            style={{
              padding: '7px 12px', borderRadius: 99, fontSize: 13, fontWeight: 600,
              border: `1.5px solid ${filtroUser !== 'Todos' ? 'var(--green)' : 'var(--border)'}`,
              background: filtroUser !== 'Todos' ? 'var(--green-light)' : 'var(--surface)',
              color: filtroUser !== 'Todos' ? 'var(--green-dark)' : 'var(--text-muted)',
              outline: 'none', cursor: 'pointer',
            }}
          >
            <option value="Todos"> 🧑 Todos os usuários</option>
            {usuarios.map(u => (
              <option key={u.usuarioId} value={u.nome}>{u.nome}</option>
            ))}
          </select>
        )}
      </div>

      {/* Tabela */}
      <div className="card">
        {loading ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
            Carregando...
          </p>
        ) : filtradas.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
            Nenhuma métrica encontrada.
          </p>
        ) : (
          <>
            <table className="st-table">
              <thead>
                <tr>
                  <Th label="Usuário"  campo="usuario"      ordenacao={ordenacao} onOrdenar={handleOrdenar} />
                  <Th label="Tipo"     campo="tipo"         ordenacao={ordenacao} onOrdenar={handleOrdenar} />
                  <Th label="Valor"    campo="valor"        ordenacao={ordenacao} onOrdenar={handleOrdenar} />
                  <Th label="Data"     campo="registradoEm" ordenacao={ordenacao} onOrdenar={handleOrdenar} />
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {paginadas.map(m => {
                  const cfg = METRICAS_CONFIG[m.tipo] || { icon: '📋', bg: '#f5f5f5', unit: '' }
                  const status = getStatus(m)
                  return (
                    <tr key={m.metricaId}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: '50%',
                            background: 'var(--green)', color: '#fff',
                            fontSize: 11, fontWeight: 700, flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {getIniciais(m._nomeUsuario)}
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 500 }}>{m._nomeUsuario}</span>
                        </div>
                      </td>
                      <td>
                        <div className="td-icon">
                          <div className="td-icon-wrap" style={{ background: cfg.bg }}>{cfg.icon}</div>
                          {m.tipo}
                        </div>
                      </td>
                      <td>{formatarValor(m)} {m.tipo !== 'Pressao' ? cfg.unit : 'mmHg'}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{formatarData(m.registradoEm)}</td>
                      <td><span className={`badge badge-${status.tipo}`}>{status.label}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Paginação */}
            {totalPaginas > 1 && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)',
              }}>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Página {pagina} de {totalPaginas} · {filtradas.length} registros
                </p>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => setPagina(p => Math.max(1, p - 1))}
                    disabled={pagina === 1}
                    style={{
                      padding: '5px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                      border: '1.5px solid var(--border)', background: 'var(--surface)',
                      color: pagina === 1 ? 'var(--border)' : 'var(--text)',
                      cursor: pagina === 1 ? 'default' : 'pointer',
                    }}
                  >
                    ← Anterior
                  </button>

                  {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPaginas || Math.abs(p - pagina) <= 1)
                    .reduce((acc, p, i, arr) => {
                      if (i > 0 && p - arr[i - 1] > 1) acc.push('...')
                      acc.push(p)
                      return acc
                    }, [])
                    .map((p, i) =>
                      p === '...' ? (
                        <span key={`dots-${i}`} style={{ padding: '5px 4px', color: 'var(--text-muted)', fontSize: 13 }}>...</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setPagina(p)}
                          style={{
                            padding: '5px 10px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                            border: `1.5px solid ${pagina === p ? 'var(--green)' : 'var(--border)'}`,
                            background: pagina === p ? 'var(--green)' : 'var(--surface)',
                            color: pagina === p ? '#fff' : 'var(--text)',
                            cursor: 'pointer',
                          }}
                        >
                          {p}
                        </button>
                      )
                    )
                  }

                  <button
                    onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                    disabled={pagina === totalPaginas}
                    style={{
                      padding: '5px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                      border: '1.5px solid var(--border)', background: 'var(--surface)',
                      color: pagina === totalPaginas ? 'var(--border)' : 'var(--text)',
                      cursor: pagina === totalPaginas ? 'default' : 'pointer',
                    }}
                  >
                    Próxima →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  )
}