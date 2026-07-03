// @vitest-environment jsdom

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Button from './Button'

describe('Button', () => {
  it('uses button type by default', () => {
    render(<Button>Action</Button>)
    expect(screen.getByRole('button', { name: 'Action' }).getAttribute('type')).toBe('button')
  })

  it('combines visual options with a custom class', () => {
    render(<Button className="custom-button" fullWidth shape="pill" size="large" variant="primary">Continue</Button>)
    expect([...screen.getByRole('button', { name: 'Continue' }).classList]).toEqual(expect.arrayContaining([
      'ui-button--primary',
      'ui-button--large',
      'ui-button--pill',
      'ui-button--full-width',
      'custom-button',
    ]))
  })
})
