import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import Sidebar from '@/components/Sidebar'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const router = {
  replace: jest.fn(),
}
jest.mock('next/router', () => ({
  useRouter: () => router,
}))

const api = {
  fetch: jest.fn(),
  setUser: jest.fn(),
  setTokenExpiresAt: jest.fn(),
  setUek: jest.fn(),
}
jest.mock('@/utils/frontend/api', () => ({
  useApi: () => api,
}))

describe('Sidebar', () => {
  it('contains a logout button', () => {
    render(<Sidebar navItems={[]} />)
    const logoutButton = screen.getByRole('button', { name: /logout/i })
    expect(logoutButton).toBeInTheDocument()
  })

  it('logout button triggers DELETE /auth/logout', async () => {
    render(<Sidebar navItems={[]} />)
    const logoutButton = screen.getByRole('button', { name: /logout/i })
    expect(logoutButton).toBeInTheDocument()

    api.fetch.mockResolvedValueOnce({ ok: true })
    fireEvent.click(logoutButton)
    await sleep(0) // wait for async logoutHandler to finish
    expect(api.fetch).toHaveBeenCalledWith('/auth/logout', { method: 'DELETE' })
    expect(api.setUser).toHaveBeenCalledWith(undefined)
    expect(api.setTokenExpiresAt).toHaveBeenCalledWith(undefined)
    expect(api.setUek).toHaveBeenCalledWith(undefined)
    expect(router.replace).toHaveBeenCalledWith('/')
  })

  it('logout button triggers DELETE /auth/logout, but logout failed', async () => {
    render(<Sidebar navItems={[]} />)
    const logoutButton = screen.getByRole('button', { name: /logout/i })
    expect(logoutButton).toBeInTheDocument()

    api.fetch.mockResolvedValueOnce({ ok: false })
    fireEvent.click(logoutButton)
    await sleep(0) // wait for async logoutHandler to finish
    expect(api.fetch).toHaveBeenCalledWith('/auth/logout', { method: 'DELETE' })
    expect(api.setUser).not.toHaveBeenCalled()
    expect(api.setTokenExpiresAt).not.toHaveBeenCalled()
    expect(api.setUek).not.toHaveBeenCalled()
    expect(router.replace).not.toHaveBeenCalled()
  })
})
