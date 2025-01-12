import { useReactiveVar } from '@apollo/client';
import { RefObject, useCallback, useEffect, useState } from 'react';
import { SIDE_NAV_WIDTH, TOP_BAR_HEIGHT } from '../../components/layout';

import { generatorControlsHeight } from '../galaxy-generator/ui/generator-controls';

import { layoutVar } from '@idleverse/state';
import { DIALOG_HEIGHT } from '../../game-ui/dialog';
import { galaxySimControlsHeight } from '../../showreel/gravity-simulation/ui/gravity-simulation-controls';
import { planetGenerationControlsHeight } from '../planet-generator/ui/sliders';

export const MODAL_HEADER_HEIGHT = 60;

export type controls =
  | 'galaxy-gen'
  | 'gravity-sim'
  | 'planet-gen'
  | 'dialog'
  | 'none';

const controlValue = (controls: controls) => {
  const map: { [key in controls]: number } = {
    'galaxy-gen': generatorControlsHeight,
    'gravity-sim': galaxySimControlsHeight,
    'planet-gen': planetGenerationControlsHeight,
    dialog: DIALOG_HEIGHT,
    none: 0,
  };

  return map[controls];
};

const getScreenSize = (
  controls: controls = 'none',
  sideNav: boolean,
  inModal?: boolean
) => ({
  width: window.innerWidth - (sideNav ? SIDE_NAV_WIDTH : 0),
  height:
    window.innerHeight -
    controlValue(controls) -
    (inModal ? MODAL_HEADER_HEIGHT : TOP_BAR_HEIGHT),
});

export const useResize = (
  controls: controls = 'none',
  options?: { sidenavOverride: boolean },
  inModal?: boolean
) => {
  const { sideNav } = useReactiveVar(layoutVar);

  const screenSizeGetter = useCallback(
    () =>
      options?.sidenavOverride
        ? getScreenSize(controls, false, inModal)
        : getScreenSize(controls, sideNav, inModal),
    [controls, options?.sidenavOverride, sideNav, inModal]
  );

  const [screenSize, setScreenSize] = useState(screenSizeGetter());

  useEffect(() => {
    const onResize = () => setScreenSize(screenSizeGetter());
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [controls, screenSizeGetter]);

  useEffect(() => {
    setScreenSize(screenSizeGetter());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sideNav]);

  return screenSize;
};

export const useContainerSize = (
  ref: RefObject<HTMLElement>
): { width: number; height: number } | null => {
  const [size, setSize] = useState<{ width: number; height: number } | null>(
    null
  );

  useEffect(() => {
    if (!ref.current) return;
    const resizeObserver = new ResizeObserver(() => {
      setSize(
        ref.current
          ? {
              width: ref.current.offsetWidth,
              height: ref.current.offsetHeight,
            }
          : null
      );
    });
    resizeObserver.observe(ref.current);
    return () => resizeObserver.disconnect(); // clean up
  }, [ref]);

  return size;
};
