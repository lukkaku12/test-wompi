import { describe, expect, it } from 'vitest'
import formReducer, {
  clearFieldError,
  setErrors,
  setField,
  setSheetOpen,
} from '../store/slices/formSlice'

describe('formSlice', () => {
  it('returns the initial state', () => {
    const state = formReducer(undefined, { type: 'unknown' })
    expect(state.values.cardName).toBe('')
    expect(state.errors).toEqual({})
    expect(state.isSheetOpen).toBe(false)
  })

  it('updates fields and clears field errors', () => {
    const stateWithError = formReducer(undefined, setErrors({ cardName: 'Error' }))
    const nextState = formReducer(
      stateWithError,
      setField({ field: 'cardName', value: 'Jane Doe' }),
    )

    const clearedState = formReducer(nextState, clearFieldError('cardName'))

    expect(clearedState.values.cardName).toBe('Jane Doe')
    expect(clearedState.errors.cardName).toBeUndefined()
  })

  it('opens and closes the sheet', () => {
    const state = formReducer(undefined, setSheetOpen(true))
    const closedState = formReducer(state, setSheetOpen(false))

    expect(state.isSheetOpen).toBe(true)
    expect(closedState.isSheetOpen).toBe(false)
  })
})
