import { Container } from '@pixi/react';
import { Viewport } from 'pixi-viewport';
import { Container as PixiContainer, Rectangle } from 'pixi.js';
import { useRef, useState } from 'react';
import { StarRenderer } from '../../showreel/star-editor/star-renderer';
import { StarField } from '../_rendering/starfield';
import { PixiWrapper } from '../_utils/pixi-wrapper';
import { useResize } from '../_utils/use-resize.hook';
import { PixiViewport } from '../_utils/viewport';
import { SystemEditorInteractions } from './system-editor-interactions';

import { useReactiveVar } from '@apollo/client';
import { HStack, useBreakpointValue } from '@chakra-ui/react';
import {
  CelestialAudioName,
  dialogVar,
  systemEditorConfigVar,
  systemEditorFocusVar,
} from '@idleverse/state';
import { Dialog } from '../../game-ui/dialog';
import { Asteroids } from '../_rendering/asteroids';

import {
  CELESTIAL_RADIUS,
  CENTER,
  WORLD_RADII,
  WORLD_SIZE,
} from '@idleverse/galaxy-gen';
import { useEditablePlanets } from './hooks/use-editable-planets';
import { PlanetContainer } from './planet.container';
import { SystemEditorFocusUI } from './ui/focus-ui/focus-ui';
import { SystemEditorOverview } from './ui/overview';
import { useCelestialAudio } from './use-celestial-audio.hook';

export const SystemEditorContainer = () => {
  const viewportRef = useRef<Viewport>(null);
  const containerRef = useRef<PixiContainer>();

  const dataURICanvasRef = useRef<HTMLCanvasElement>(null);

  const { open: dialogOpen } = useReactiveVar(dialogVar);

  const size = useResize(dialogOpen ? 'dialog' : 'none');

  const [locallySelectedAudioName, setLocallySelectedAudioName] =
    useState<CelestialAudioName>('welcome');

  const { audioRef } = useCelestialAudio({
    locallySelectedName: locallySelectedAudioName,
    isOpen: true,
  });

  useEditablePlanets();

  const focus = useReactiveVar(systemEditorFocusVar);

  const { celestial, mode, formingPoints } = useReactiveVar(
    systemEditorConfigVar
  );

  const bp: 'small' | 'medium' | 'large' = useBreakpointValue({
    base: 'small',
    md: 'medium',
    lg: 'large',
  });

  const isMobile = bp === 'small';
  const initialScale = isMobile ? 0.05 : 0.1;

  return (
    <>
      <PixiWrapper showGameUI={false} bg="darker">
        <PixiViewport
          size={size}
          ref={viewportRef}
          screenWidth={size.width}
          screenHeight={size.height}
          worldHeight={WORLD_SIZE.height}
          worldWidth={WORLD_SIZE.width}
          initialZoom={initialScale}
        >
          <StarField
            center={CENTER}
            dimensions={WORLD_SIZE}
            initialScale={initialScale}
            numberOfStars={5000}
            radius={WORLD_SIZE.width * 4}
          />

          <Asteroids
            center={CENTER}
            dimensions={{
              innerRadius: WORLD_RADII['asteroid-belt'].inner,
              outerRadius: WORLD_RADII['asteroid-belt'].outer,
            }}
          />

          <PlanetContainer
            canvasRef={dataURICanvasRef}
            viewportRef={viewportRef}
            center={CENTER}
          />

          <SystemEditorInteractions
            viewportRef={viewportRef}
            worldRadii={WORLD_RADII}
            center={CENTER}
            isMobile={isMobile}
            canvasHeight={size.height}
          />
          <Container
            ref={containerRef}
            filterArea={new Rectangle(0, 0, size.width, size.height)}
            zIndex={1}
          >
            <StarRenderer
              config={celestial.config}
              containerRef={containerRef}
              viewportRef={viewportRef}
              starRadius={CELESTIAL_RADIUS}
              size={size}
            />
          </Container>
        </PixiViewport>
      </PixiWrapper>
      <canvas style={{ visibility: 'hidden' }} ref={dataURICanvasRef} />
      <audio ref={audioRef} />

      <SystemEditorOverview
        onHelpClicked={(help) => {
          setLocallySelectedAudioName(help);
          audioRef.current.play().catch((e) => {
            //
          });
          dialogVar({ ...dialogVar(), open: true });
        }}
        onDirectFocusClicked={() => dialogVar({ ...dialogVar(), open: false })}
      />
      <HStack
        position="absolute"
        bottom={0}
        justifyContent="end"
        alignItems="end"
        gap={0}
      >
        {focus && (
          <SystemEditorFocusUI
            display={isMobile && dialogOpen ? 'none' : 'block'}
          />
        )}
        <Dialog
          position="static"
          onDialogEnded={() => {
            audioRef.current.currentTime = 0;
            audioRef.current.pause();
          }}
        />
      </HStack>
    </>
  );
};
