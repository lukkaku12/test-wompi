import { useAppDispatch, useAppSelector } from '../store/hooks'

describe('store hooks', () => {
  it('exports typed hooks', () => {
    expect(typeof useAppDispatch).toBe('function')
    expect(typeof useAppSelector).toBe('function')
  })
})
