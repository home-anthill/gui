import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { MemoryRouter, MemoryRouterProps } from 'react-router-dom';
import { theme } from './theme/theme';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  routerProps?: MemoryRouterProps;
}

function AllProviders({
  children,
  routerProps,
}: {
  children: ReactNode;
  routerProps?: MemoryRouterProps;
}) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <MemoryRouter {...routerProps}>{children}</MemoryRouter>
    </MantineProvider>
  );
}

function customRender(ui: ReactElement, options: CustomRenderOptions = {}) {
  const { routerProps, ...renderOptions } = options;
  return render(ui, {
    wrapper: ({ children }) => (
      <AllProviders {...(routerProps !== undefined ? { routerProps } : {})}>{children}</AllProviders>
    ),
    ...renderOptions,
  });
}

export * from '@testing-library/react';
export { customRender as render };
