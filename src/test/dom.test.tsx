import { expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

it('should render DOM elements in jsdom', () => {
  const { container } = render(
    <div data-testid="test-element">Hello jsdom</div>
  );
  expect(screen.getByTestId('test-element')).toBeInTheDocument();
  expect(container.querySelector('[data-testid="test-element"]')).toBeTruthy();
});
