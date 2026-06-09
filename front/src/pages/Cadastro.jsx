import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { criarUsuario } from '../services/usuarios'

export default function Cadastro() {
  const navigate = useNavigate()
  const [form, setForm]       = useState({ nome: '', idade: '', altura: '', email: '' })
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro]       = useState(null)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErro(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro(null)
    setSucesso(false)

    const idade  = parseInt(form.idade)
    const altura = parseFloat(form.altura)

    if (!form.nome.trim()) {
      setErro('Informe o nome completo.')
      return
    }
    if (isNaN(idade) || idade < 1 || idade > 120) {
      setErro('Informe uma idade válida (1 a 120).')
      return
    }
    if (isNaN(altura) || altura < 0.5 || altura > 2.5) {
      setErro('Informe a altura em metros (Ex: 1.75).')
      return
    }
    if (!form.email.includes('@')) {
      setErro('Informe um e-mail válido.')
      return
    }

    setLoading(true)
    try {
      await criarUsuario({
        usuarioId: 0,
        nome:   form.nome.trim(),
        idade,
        altura,
        email:  form.email.trim(),
      })
      setSucesso(true)
      setForm({ nome: '', idade: '', altura: '', email: '' })
      setTimeout(() => navigate('/'), 1500)
    } catch {
      setErro('Erro ao cadastrar. Verifique se o servidor está rodando.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page" style={{ maxWidth: 480 }}>

      <div className="page-header">
        <div>
          <h1 style={{ fontSize: 22 }}>Novo usuário</h1>
          <p>Preencha os dados para cadastrar</p>
        </div>
      </div>

      <div className="card">

        {/* Avatar preview */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: form.nome ? 'var(--green)' : 'var(--border)',
            color: '#fff', fontWeight: 700, fontSize: 22,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s',
          }}>
            {form.nome
              ? form.nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
              : '?'}
          </div>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Nome completo</label>
            <input
              type="text"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              placeholder="Ex: Gabriel Correa"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Idade</label>
              <input
                type="number"
                name="idade"
                value={form.idade}
                onChange={handleChange}
                placeholder="Ex: 21"
                min={1}
                max={120}
                required
              />
            </div>
            <div className="form-group">
              <label>Altura (m)</label>
              <input
                type="number"
                name="altura"
                value={form.altura}
                onChange={handleChange}
                placeholder="Ex: 1.75"
                step="0.01"
                min={0.5}
                max={2.5}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>E-mail</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Ex: gabriel@email.com"
              required
            />
          </div>

          {/* Preview do IMC se altura e peso forem informados */}
          {form.altura && parseFloat(form.altura) > 0.5 && (
            <div style={{
              background: 'var(--green-light)',
              borderRadius: 10,
              padding: '10px 14px',
              marginBottom: '1rem',
              fontSize: 12,
              color: 'var(--green-dark)',
              fontWeight: 500,
            }}>
              📏 Altura registrada: {form.altura}m — o IMC será calculado ao registrar o peso.
            </div>
          )}

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
              fontSize: 13, fontWeight: 500, marginBottom: '1rem'
            }}>
              ✅ Usuário cadastrado! Redirecionando...
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate('/')}
              style={{ flex: 1 }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ flex: 2 }}
            >
              {loading ? 'Cadastrando...' : '+ Cadastrar usuário'}
            </button>
          </div>

        </form>
      </div>

    </div>
  )
}