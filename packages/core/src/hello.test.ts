import { hello } from './hello'

describe('hello', () => {
  it('should return "Hello, world!"', () => {
    expect(hello).toBe('Hello, world!')
  })
})
