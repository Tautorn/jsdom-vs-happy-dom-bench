import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm, TodoList, DataTable, Modal, Tabs } from '../../src/components.jsx'

const cities = ['São Paulo', 'Recife', 'Curitiba', 'Belém', 'Natal']
const rows = Array.from({ length: 300 }, (_, i) => ({ id: i, name: `Pessoa ${String(i).padStart(3, '0')}`, age: 18 + ((i * 7) % 60), city: cities[i % 5] }))

describe('LoginForm', () => {
  it('valida e-mail', async () => {
    const user = userEvent.setup()
    render(<LoginForm onSubmit={vi.fn()} />)
    await user.type(screen.getByLabelText('E-mail'), 'bruno')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(screen.getByRole('alert')).toHaveTextContent('E-mail inválido')
  })
  it('envia com dados válidos', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<LoginForm onSubmit={onSubmit} />)
    await user.type(screen.getByLabelText('E-mail'), 'bruno@tautorn.com.br')
    await user.type(screen.getByLabelText('Senha'), 'segredo123')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(onSubmit).toHaveBeenCalledWith({ email: 'bruno@tautorn.com.br', password: 'segredo123' })
  })
})

describe('TodoList', () => {
  it('adiciona, conclui e filtra', async () => {
    const user = userEvent.setup()
    render(<TodoList initial={Array.from({ length: 50 }, (_, i) => ({ id: i, text: `t${i}`, done: i % 2 === 0 }))} />)
    await user.type(screen.getByLabelText('nova tarefa'), 'escrever post')
    await user.click(screen.getByRole('button', { name: 'Adicionar' }))
    expect(screen.getByText('escrever post')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'done' }))
    expect(screen.getAllByRole('listitem')).toHaveLength(25)
    expect(screen.getByText('26 pendentes')).toBeInTheDocument()
  })
  it('remove item', async () => {
    const user = userEvent.setup()
    render(<TodoList initial={[{ id: 1, text: 'a', done: false }, { id: 2, text: 'b', done: false }]} />)
    await user.click(screen.getByRole('button', { name: 'remover a' }))
    expect(screen.queryByText('a')).not.toBeInTheDocument()
  })
})

describe('DataTable', () => {
  it('renderiza 300 linhas e ordena', async () => {
    const user = userEvent.setup()
    render(<DataTable rows={rows} />)
    expect(screen.getAllByRole('row')).toHaveLength(301)
    await user.click(screen.getByRole('button', { name: 'Idade' }))
    const first = within(screen.getAllByRole('row')[1]).getAllByRole('cell')[1]
    expect(first).toHaveTextContent('18')
  })
  it('filtra pela busca', async () => {
    const user = userEvent.setup()
    render(<DataTable rows={rows} />)
    await user.type(screen.getByLabelText('buscar'), 'Pessoa 29')
    expect(screen.getByText('10 resultados')).toBeInTheDocument()
  })
})

describe('Modal', () => {
  it('abre, foca e fecha com Escape', async () => {
    const user = userEvent.setup()
    render(<Modal title="Confirmar">Tem certeza?</Modal>)
    await user.click(screen.getByRole('button', { name: 'Abrir' }))
    expect(screen.getByRole('dialog', { name: 'Confirmar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Fechar' })).toHaveFocus()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

describe('Tabs', () => {
  it('navega pelo teclado', async () => {
    const user = userEvent.setup()
    render(<Tabs tabs={[{ label: 'Um', content: 'c1' }, { label: 'Dois', content: 'c2' }, { label: 'Três', content: 'c3' }]} />)
    await user.click(screen.getByRole('tab', { name: 'Um' }))
    await user.keyboard('{ArrowRight}{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'Três' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('c3')
  })
})
