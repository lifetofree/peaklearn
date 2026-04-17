import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { Toast } from '@/components/ui/toast'

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the message', () => {
    render(<Toast message="Saved successfully" onDismiss={vi.fn()} />)
    expect(screen.getByText('Saved successfully')).toBeInTheDocument()
  })

  it('has role=alert for accessibility', () => {
    render(<Toast message="Test" onDismiss={vi.fn()} />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('applies success styles by default', () => {
    render(<Toast message="Success" onDismiss={vi.fn()} />)
    expect(screen.getByRole('alert')).toHaveClass('text-green-800')
  })

  it('applies error styles when type is error', () => {
    render(<Toast message="Error" type="error" onDismiss={vi.fn()} />)
    expect(screen.getByRole('alert')).toHaveClass('text-destructive')
  })

  it('calls onDismiss when X button is clicked', () => {
    const onDismiss = vi.fn()
    render(<Toast message="Hello" onDismiss={onDismiss} />)
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('auto-dismisses after 3500ms', () => {
    const onDismiss = vi.fn()
    render(<Toast message="Auto dismiss" onDismiss={onDismiss} />)
    expect(onDismiss).not.toHaveBeenCalled()
    act(() => { vi.advanceTimersByTime(3500) })
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('does not dismiss before 3500ms', () => {
    const onDismiss = vi.fn()
    render(<Toast message="Not yet" onDismiss={onDismiss} />)
    act(() => { vi.advanceTimersByTime(3000) })
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('clears timer on unmount', () => {
    const onDismiss = vi.fn()
    const { unmount } = render(<Toast message="Unmount" onDismiss={onDismiss} />)
    unmount()
    act(() => { vi.advanceTimersByTime(5000) })
    expect(onDismiss).not.toHaveBeenCalled()
  })
})
