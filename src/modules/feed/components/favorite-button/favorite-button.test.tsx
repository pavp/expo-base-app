import React from 'react';

import { fireEvent, renderWithProviders, screen } from '@/test/test-utils';

import { FavoriteButton } from './favorite-button';

describe('FavoriteButton', () => {
  it('renders the outlined icon and the "add" label when the post is not favorite', async () => {
    await renderWithProviders(<FavoriteButton isFavorite={false} onToggle={jest.fn()} />);

    expect(screen.getByLabelText('postDetail.favorite.add')).toBeTruthy();
  });

  it('renders the filled icon and the "remove" label when the post is favorite', async () => {
    await renderWithProviders(<FavoriteButton isFavorite onToggle={jest.fn()} />);

    expect(screen.getByLabelText('postDetail.favorite.remove')).toBeTruthy();
  });

  it('calls onToggle when pressed', async () => {
    const onToggle = jest.fn();

    await renderWithProviders(<FavoriteButton isFavorite={false} onToggle={onToggle} />);

    fireEvent(screen.getByLabelText('postDetail.favorite.add'), 'press');

    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
