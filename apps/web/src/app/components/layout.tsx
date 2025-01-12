import { useReactiveVar } from '@apollo/client';
import { Box } from '@chakra-ui/layout';
import { useBreakpointValue } from '@chakra-ui/react';
import styled from '@emotion/styled';

import { LayoutConfig } from '@idleverse/models';
import { layoutVar } from '@idleverse/state';
import { useUiBackground } from '@idleverse/theme';
import { SideNav } from '../global-ui/sidenav/sidenav';
import { ToolBar } from '../global-ui/toolbar/toolbar';
import { Breadcrumb } from './breadcrumb';

export const SIDE_NAV_WIDTH = 450;
export const TOP_BAR_HEIGHT = 50;

export const ResponsiveGrid = styled.div`
  height: 100vh;

  display: grid;

  grid-template-rows: ${TOP_BAR_HEIGHT}px auto;

  grid-template-areas: ${({ sideNav }: LayoutConfig) =>
    sideNav
      ? `'toolbar'
         'side-nav'
         `
      : `'toolbar'
        ' main   '`};

  @media (min-width: 768px) {
    grid-template-areas: ${({ sideNav }: LayoutConfig) =>
      sideNav
        ? `'side-nav   toolbar'
           'side-nav   main   '
         `
        : `'toolbar'
        ' main   '`};

    grid-template-columns: ${({ sideNav }: LayoutConfig) =>
      sideNav ? `${SIDE_NAV_WIDTH}px auto` : `auto`};
  }

  div.sidenav {
    grid-area: side-nav;
  }
  div.toolbar {
    grid-area: toolbar;
  }

  main {
    grid-area: main;
    position: relative;

    .container {
      height: calc(100vh - ${TOP_BAR_HEIGHT}px);
    }
  }
`;

export const Layout = (props: { children?: JSX.Element }) => {
  const layoutConfig = useReactiveVar(layoutVar);

  const { bgDark } = useUiBackground();

  const bp: 'small' | 'medium' | 'large' = useBreakpointValue({
    base: 'small',
    md: 'medium',
    lg: 'large',
  });

  return (
    <ResponsiveGrid {...layoutConfig}>
      {layoutConfig.sideNav ? <SideNav></SideNav> : null}
      <ToolBar></ToolBar>
      {((bp === 'small' && !layoutConfig.sideNav) || bp !== 'small') && (
        <main>
          <Breadcrumb />
          <Box className="container" overflow="auto" bg={bgDark}>
            {props?.children}
          </Box>
        </main>
      )}
    </ResponsiveGrid>
  );
};
