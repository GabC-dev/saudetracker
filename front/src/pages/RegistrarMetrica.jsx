import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listarUsuarios } from '../services/usuarios'
import { criarMetrica } from '../services/metricas'

const METRICAS_CONFIG = {
  Peso:     { icon: '🏋️', bg: '#e8f8ef', label: 'Peso',     unit: 'kg' },
  Pressao:  { icon: '❤️',  bg: '#fef0f0', label: 'Pressão',  unit: 'mmHg' },
  Sono:     { icon: '🌙',  bg: '#eef2ff', label: 'Sono',     unit: 'h' },
  Humor:    { icon: '😊',  bg: '#fffbeb', label: 'Humor',    unit: '/10' },
  Glicemia: { icon: '🩸',  bg: '#f0f9ff', label: 'Glicemia', unit: 'mg/dL' },
}

const PLACEHOLDERS = {
  Peso:     { valor1: 'Ex: 72.5' },
  Pressao:  { valor1: 'Sistólica (Ex: 120)', valor2: 'Diastólica (Ex: 80)' },
  Sono:     { valor1: 'Ex: 7.5' },
  Humor:    { valor1: 'Nota de 1 a 10' },
  Glicemia: { valor1: 'Ex: 95' },
}

const LIMITES = {
  Peso:     { valor1: { min: 1,  max: 300 } },
  Pressao:  { valor1: { min: 50, max: 250 }, valor2: { min: 30, max: 150 } },
  Sono:     { valor1: { min: 0,  max: 24  } },
  Humor:    { valor1: { min: 1,  max: 10  } },
  Glicemia: { valor1: { min: 20, max: 600 } },
}

// ─── Funções de status em tempo real ─────────────────────────────────────────
function getPreview(tipo, v1, v2) {
  if (!v1 || isNaN(parseFloat(v1))) return null

  const val1 = parseFloat(v1)
  const val2 = v2 ? parseFloat(v2) : null

  if (tipo === 'Peso') {
    const imc = val1 / (1.75 * 1.75)
    if (imc < 18.5) return { label: `IMC ${imc.toFixed(1)} — Abaixo do peso`, tipo: 'warn',   icon: '⚠️' }
    if (imc < 25)   return { label: `IMC ${imc.toFixed(1)} — Normal`,          tipo: 'ok',     icon: '✅' }
    if (imc < 30)   return { label: `IMC ${imc.toFixed(1)} — Sobrepeso`,        tipo: 'warn',   icon: '⚠️' }
    if (imc < 35)   return { label: `IMC ${imc.toFixed(1)} — Obesidade grau 1`, tipo: 'danger', icon: '🔴' }
    return               { label: `IMC ${imc.toFixed(1)} — Obesidade grau 2+`,  tipo: 'danger', icon: '🔴' }
  }

  if (tipo === 'Pressao') {
    if (!val2 || isNaN(val2)) return { label: 'Informe a diastólica para ver o status', tipo: 'muted', icon: 'ℹ️' }
    if (val1 < 120 && val2 < 80) return { label: `${val1}/${val2} mmHg — Normal`,            tipo: 'ok',     icon: '✅' }
    if (val1 < 130 && val2 < 80) return { label: `${val1}/${val2} mmHg — Elevada`,            tipo: 'warn',   icon: '⚠️' }
    if (val1 < 140 || val2 < 90) return { label: `${val1}/${val2} mmHg — Hipertensão grau 1`, tipo: 'warn',   icon: '⚠️' }
    return                             { label: `${val1}/${val2} mmHg — Hipertensão grau 2`,  tipo: 'danger', icon: '🔴' }
  }

  if (tipo === 'Sono') {
    if (val1 < 6)  return { label: `${val1}h — Sono insuficiente`,  tipo: 'danger', icon: '🔴' }
    if (val1 <= 8) return { label: `${val1}h — Sono adequado`,      tipo: 'ok',     icon: '✅' }
    return               { label: `${val1}h — Sono excessivo`,      tipo: 'warn',   icon: '⚠️' }
  }

  if (tipo === 'Humor') {
    if (val1 <= 3) return { label: `Nota ${val1} — Humor muito baixo`, tipo: 'danger', icon: '😞' }
    if (val1 <= 5) return { label: `Nota ${val1} — Humor baixo`,       tipo: 'warn',   icon: '😐' }
    if (val1 <= 7) return { label: `Nota ${val1} — Humor moderado`,    tipo: 'ok',     icon: '🙂' }
    return               { label: `Nota ${val1} — Humor bom`,          tipo: 'ok',     icon: '😄' }
  }

  if (tipo === 'Glicemia') {
    if (val1 < 70)  return { label: `${val1} mg/dL — Hipoglicemia`,  tipo: 'danger', icon: '🔴' }
    if (val1 < 100) return { label: `${val1} mg/dL — Normal`,         tipo: 'ok',     icon: '✅' }
    if (val1 < 126) return { label: `${val1} mg/dL — Pré-diabetes`,   tipo: 'warn',   icon: '⚠️' }
    return                 { label: `${val1} mg/dL — Diabetes`,        tipo: 'danger', icon: '🔴' }
  }

  return null
}

const PREVIEW_COLORS = {
  ok:     { bg: 'var(--ok-bg,    #f0fdf4)', color: 'var(--ok-text,    #166534)', border: '#86efac' },
  warn:   { bg: 'var(--warn-bg,  #fffbeb)', color: 'var(--warn-text,  #92400e)', border: '#fcd34d' },
  danger: { bg: 'var(--danger-bg,#fef2f2)', color: 'var(--danger-text,#991b1b)', border: '#fca5a5' },
  muted:  { bg: 'var(--bg)',                color: 'var(--text-muted)',           border: 'var(--border)' },
}

function PreviewStatus({ tipo, valor1, valor2 }) {
  const preview = getPreview(tipo, valor1, valor2)
  if (!preview) return null

  const colors = PREVIEW_COLORS[preview.tipo] || PREVIEW_COLORS.muted

  return (
    <div style={{
      borderRadius: 10,
      padding: '10px 14px',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      fontSize: 13,
      fontWeight: 600,
      background: colors.bg,
      color: colors.color,
      border: `1.5px solid ${colors.border}`,
      transition: 'all 0.2s ease',
      animation: 'fadeIn 0.15s ease',
    }}>
      <span style={{ fontSize: 18 }}>{preview.icon}</span>
      <span>{preview.label}</span>
    </div>
  )
}

// ─── Página Principal ─────────────────────────────────────────────────────────
export default function RegistrarMetrica() {
  const navigate = useNavigate()
  const [usuarios, setUsuarios]         = useState([])
  const [usuarioId, setUsuarioId]       = useState('')
  const [tipo, setTipo]                 = useState('Peso')
  const [valor1, setValor1]             = useState('')
  const [valor2, setValor2]             = useState('')
  const [loading, setLoading]           = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [sucesso, setSucesso]           = useState(false)
  const [erro, setErro]                 = useState(null)

  useEffect(() => {
    listarUsuarios()
      .then(setUsuarios)
      .finally(() => setLoadingUsers(false))
  }, [])

  const tipoConfig = METRICAS_CONFIG[tipo]
  const precisaValor2 = tipo === 'Pressao'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro(null)
    setSucesso(false)

    if (!usuarioId) {
      setErro('Selecione um usuário.')
      return
    }

    const v1 = parseFloat(valor1)
    const v2 = valor2 ? parseFloat(valor2) : null

    if (isNaN(v1)) {
      setErro('Informe um valor numérico válido.')
      return
    }

    if (precisaValor2 && !v2) {
      setErro('Informe a pressão diastólica.')
      return
    }

    const limites = LIMITES[tipo]
    if (v1 < limites.valor1.min || v1 > limites.valor1.max) {
      setErro(`Valor fora do intervalo esperado (${limites.valor1.min} – ${limites.valor1.max}).`)
      return
    }

    if (precisaValor2 && v2 && (v2 < limites.valor2.min || v2 > limites.valor2.max)) {
      setErro(`Diastólica fora do intervalo esperado (${limites.valor2.min} – ${limites.valor2.max}).`)
      return
    }

    setLoading(true)
    try {
      await criarMetrica(parseInt(usuarioId), {
        metricaId: 0,
        metricaUsuarioId: parseInt(usuarioId),
        tipo,
        valor1: v1,
        valor2: v2,
        registradoEm: new Date().toISOString(),
      })
      setSucesso(true)
      setValor1('')
      setValor2('')
    } catch {
      setErro('Erro ao salvar. Verifique se o servidor está rodando.')
    } finally {
      setLoading(false)
    }
  }

  const usuarioSelecionado = usuarios.find(u => u.usuarioId === parseInt(usuarioId))

  return (
    <div className="page" style={{ maxWidth: 540 }}>

      <div className="page-header">
        <div>
          <h1 style={{ fontSize: 22 }}>Registrar métrica</h1>
          <p>Selecione o usuário e informe o valor</p>
        </div>
      </div>

      {/* Seletor de usuário */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="card-title">👤 Usuário</div>
        {loadingUsers ? (
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Carregando usuários...</p>
        ) : usuarios.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--danger-text)' }}>
            Nenhum usuário cadastrado.{' '}
            <span
              style={{ cursor: 'pointer', fontWeight: 600, color: 'var(--green-dark)' }}
              onClick={() => navigate('/cadastro')}
            >
              Cadastrar agora →
            </span>
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {usuarios.map(u => (
              <div
                key={u.usuarioId}
                onClick={() => setUsuarioId(u.usuarioId)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                  border: `1.5px solid ${parseInt(usuarioId) === u.usuarioId ? 'var(--green)' : 'var(--border)'}`,
                  background: parseInt(usuarioId) === u.usuarioId ? 'var(--green-light)' : 'var(--surface)',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'var(--green)', color: '#fff', fontWeight: 700, fontSize: 13,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {u.nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{u.nome}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {u.idade} anos · {u.altura}m · {u.email}
                  </p>
                </div>
                {parseInt(usuarioId) === u.usuarioId && (
                  <span style={{ marginLeft: 'auto', color: 'var(--green)', fontSize: 18 }}>✓</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Formulário de métrica */}
      {usuarioSelecionado && (
        <div className="card" style={{ animation: 'slideUp 0.2s ease' }}>
          <div className="card-title">
            📋 Métrica para <span style={{ color: 'var(--green-dark)' }}>{usuarioSelecionado.nome}</span>
          </div>

          {/* Seletor de tipo */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: '1.25rem' }}>
            {Object.entries(METRICAS_CONFIG).map(([t, cfg]) => (
              <button
                key={t}
                onClick={() => { setTipo(t); setValor1(''); setValor2(''); setErro(null); setSucesso(false) }}
                style={{
                  background: tipo === t ? 'var(--green)' : 'var(--surface)',
                  border: `1.5px solid ${tipo === t ? 'var(--green)' : 'var(--border)'}`,
                  borderRadius: 12, padding: '10px 6px', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ fontSize: 20 }}>{cfg.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: tipo === t ? '#fff' : 'var(--text-muted)' }}>
                  {cfg.label}
                </span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label>
                {tipo === 'Pressao' ? 'Pressão sistólica (mmHg)' :
                 tipo === 'Humor'   ? 'Nota (1 a 10)' :
                 `Valor em ${tipoConfig.unit}`}
              </label>
              <input
                type="number"
                step="0.1"
                value={valor1}
                onChange={e => { setValor1(e.target.value); setSucesso(false) }}
                placeholder={PLACEHOLDERS[tipo].valor1}
                required
              />
            </div>

            {precisaValor2 && (
              <div className="form-group">
                <label>Pressão diastólica (mmHg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={valor2}
                  onChange={e => { setValor2(e.target.value); setSucesso(false) }}
                  placeholder={PLACEHOLDERS[tipo].valor2}
                  required
                />
              </div>
            )}

            {/* Preview de status em tempo real */}
            <PreviewStatus tipo={tipo} valor1={valor1} valor2={valor2} />

            {erro && (
              <div style={{
                background: 'var(--danger-bg)', color: 'var(--danger-text)',
                borderRadius: 8, padding: '10px 14px',
                fontSize: 13, fontWeight: 500, marginBottom: '1rem'
              }}>
                ⚠️ {erro}
              </div>
            )}

            {sucesso && (
              <div style={{
                background: 'var(--ok-bg)', color: 'var(--ok-text)',
                borderRadius: 8, padding: '10px 14px',
                fontSize: 13, fontWeight: 500, marginBottom: '1rem',
                animation: 'fadeIn 0.2s ease',
              }}>
                ✅ Métrica salva com sucesso!
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button type="button" className="btn btn-outline" onClick={() => navigate('/')} style={{ flex: 1 }}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 2 }}>
                {loading ? 'Salvando...' : '+ Salvar métrica'}
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  )
}