import React from 'react';
import { screen } from '@testing-library/react-native';

import { renderWithProviders } from '@/test/test-utils';

import { HomeView } from './HomeView';

describe('HomeView', () => {
  it('should render correctly', () => {
    renderWithProviders(<HomeView />);

    expect(screen.getByTestId('home-container')).toBeTruthy();
  });
});
