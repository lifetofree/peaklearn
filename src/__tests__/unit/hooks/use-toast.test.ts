import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useToast } from '@/hooks/use-toast'

describe('useToast', () => {
  it('starts with no toast', () => {
    const { result } = renderHook(() => useToast())
    expect(result.current.toast).toBeNull()
  })

  it('showToast sets message and type', () => {
    const { result } = renderHook(() => useToast())
    act(() => {
      result.current.showToast('Saved successfully')
    })
    expect(result.current.toast).toEqual({ message: 'Saved successfully', type: 'success' })
  })

  it('showToast defaults type to success', () => {
    const { result } = renderHook(() => useToast())
    act(() => {
      result.current.showToast('Something happened')
    })
    expect(result.current.toast?.type).toBe('success')
  })

  it('showToast accepts error type', () => {
    const { result } = renderHook(() => useToast())
    act(() => {
      result.current.showToast('Something went wrong', 'error')
    })
    expect(result.current.toast).toEqual({ message: 'Something went wrong', type: 'error' })
  })

  it('dismiss clears the toast', () => {
    const { result } = renderHook(() => useToast())
    act(() => {
      result.current.showToast('Hello')
    })
    expect(result.current.toast).not.toBeNull()
    act(() => {
      result.current.dismiss()
    })
    expect(result.current.toast).toBeNull()
  })

  it('showToast replaces existing toast', () => {
    const { result } = renderHook(() => useToast())
    act(() => {
      result.current.showToast('First')
    })
    act(() => {
      result.current.showToast('Second', 'error')
    })
    expect(result.current.toast).toEqual({ message: 'Second', type: 'error' })
  })

  it('showToast and dismiss are stable references', () => {
    const { result, rerender } = renderHook(() => useToast())
    const { showToast, dismiss } = result.current
    rerender()
    expect(result.current.showToast).toBe(showToast)
    expect(result.current.dismiss).toBe(dismiss)
  })
})
