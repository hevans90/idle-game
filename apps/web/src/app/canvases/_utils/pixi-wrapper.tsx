import { useReactiveVar } from '@apollo/client';
import { Box } from '@chakra-ui/react';
import { hexStringToNumber, useUiBackground } from '@idleverse/theme';
import { Stage } from '@pixi/react';
import { ReactNode, useEffect, useRef, useState } from 'react';

import { galacticEmpireVar, myEmpireVar } from '@idleverse/state';
import { GameUI } from '../../game-ui/game-ui';
import { useDisableWheelZoom } from './use-disable-wheel-zoom.hook';
import { useContainerSize } from './use-resize.hook';

export const PixiWrapper = (props: {
  children?: ReactNode;
  ui?: JSX.Element;
  showGameUI?: boolean;
  bg?: 'dark' | 'darker';
}) => {
  const { disableZoomCallback } = useDisableWheelZoom();

  const { rawBgDarker, rawBgDark } = useUiBackground();

  const boxRef = useRef<HTMLDivElement>(null);
  const size = useContainerSize(boxRef);

  const galacticEmpire = useReactiveVar(galacticEmpireVar);
  const myEmpire = useReactiveVar(myEmpireVar);

  const [showGameUI, setShowGameUI] = useState<boolean>(props.showGameUI);

  useEffect(() => {
    if (props.showGameUI === undefined) {
      setShowGameUI(true);
    }
  }, [props]);

  return (
    <Box
      position="relative"
      width="100%"
      height="100%"
      overflow="hidden"
      flexGrow={1}
      ref={boxRef}
    >
      <Box ref={disableZoomCallback}>
        <Stage
          {...size}
          options={{
            backgroundColor: hexStringToNumber(
              props?.bg === 'darker' ? rawBgDarker : rawBgDark
            ),
            antialias: true,
            resizeTo: boxRef.current,
          }}
        >
          {props?.children}
        </Stage>
      </Box>
      {props?.ui}
      {galacticEmpire?.id && myEmpire && showGameUI && (
        <GameUI empireId={galacticEmpire.id} />
      )}
    </Box>
  );
};
