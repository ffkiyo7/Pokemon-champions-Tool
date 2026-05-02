// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { PokemonAvatar } from './ui';

describe('PokemonAvatar', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders local asset paths as images', () => {
    render(<PokemonAvatar iconRef="/assets/items/choice-scarf.png" label="讲究围巾" />);

    const image = screen.getByAltText('讲究围巾') as HTMLImageElement;
    expect(image.tagName).toBe('IMG');
    expect(image.getAttribute('src')).toBe('/assets/items/choice-scarf.png');
  });

  it('falls back to the label initial after an image load error', () => {
    render(<PokemonAvatar iconRef="/assets/items/missing.png" label="讲究围巾" />);

    fireEvent.error(screen.getByAltText('讲究围巾'));

    expect(screen.queryByAltText('讲究围巾')).toBeNull();
    expect(screen.getByText('讲')).toBeTruthy();
  });
});
