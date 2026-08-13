import React from 'react';

import { renderWithProviders, screen } from '@/test/test-utils';

import { HomeView } from './home-view';

describe('HomeView', () => {
  it('should render correctly', async () => {
    await renderWithProviders(<HomeView />);

    expect(screen.getByTestId('home-container')).toBeTruthy();
  });
});
