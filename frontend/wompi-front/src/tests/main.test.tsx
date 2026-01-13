
const renderMock = jest.fn()
const createRootMock = jest.fn(() => ({ render: renderMock }))

jest.mock('react-dom/client', () => ({
  createRoot: createRootMock,
}))

jest.mock('../App', () => ({
  default: () => null,
}))

describe('main entry', () => {
  it('creates the root and renders the app', async () => {
    document.body.innerHTML = '<div id="root"></div>'

    await import('../main')

    const rootElement = document.getElementById('root')
    expect(createRootMock).toHaveBeenCalledWith(rootElement)
    expect(renderMock).toHaveBeenCalled()
  })
})
