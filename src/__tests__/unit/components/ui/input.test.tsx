import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '@/components/ui/input'

describe('Input', () => {
  it('renders an input element', () => {
    render(<Input />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('displays placeholder text', () => {
    render(<Input placeholder="Enter value..." />)
    expect(screen.getByPlaceholderText('Enter value...')).toBeInTheDocument()
  })

  it('accepts typed input', async () => {
    render(<Input />)
    const input = screen.getByRole('textbox')
    await userEvent.type(input, 'hello world')
    expect(input).toHaveValue('hello world')
  })

  it('calls onChange handler', async () => {
    const onChange = vi.fn()
    render(<Input onChange={onChange} />)
    await userEvent.type(screen.getByRole('textbox'), 'a')
    expect(onChange).toHaveBeenCalled()
  })

  it('is disabled when disabled prop is set', () => {
    render(<Input disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('renders with a controlled value', () => {
    render(<Input value="controlled" onChange={vi.fn()} />)
    expect(screen.getByRole('textbox')).toHaveValue('controlled')
  })

  it('applies custom className', () => {
    render(<Input className="custom-class" />)
    expect(screen.getByRole('textbox')).toHaveClass('custom-class')
  })

  it('passes type attribute', () => {
    render(<Input type="email" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email')
  })

  it('passes id attribute', () => {
    render(<Input id="my-input" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('id', 'my-input')
  })

  it('clears on user interaction when controlled', async () => {
    const { rerender } = render(<Input value="initial" onChange={vi.fn()} />)
    rerender(<Input value="" onChange={vi.fn()} />)
    expect(screen.getByRole('textbox')).toHaveValue('')
  })
})
