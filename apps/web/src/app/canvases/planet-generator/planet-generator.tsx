import { useReactiveVar } from '@apollo/client';
import { Box } from '@chakra-ui/react';
import { rgbToHex } from '@idleverse/theme';

import { useEffect, useMemo, useRef, useState } from 'react';
import { DataTexture } from 'three';

import { RingConfig } from '@idleverse/models';
import {
  colorPalettesVar,
  planetGenerationColorDrawerVar,
  planetGenerationRingDrawerVar,
  planetGeneratorConfigVar,
} from '@idleverse/state';
import { deepCompareRings } from './_utils/deep-compare-rings';
import { runTextureGenOnWorker } from './texture-generation/run-texture-gen-on-worker';

import { Planet } from '../_rendering/planet';

export const PlanetGenerator = ({
  stars = true,
  fullUI = true,
  pixelShaderSize,
}: {
  stars?: boolean;
  fullUI?: boolean;
  pixelShaderSize?: number;
}) => {
  const containerRef = useRef<HTMLDivElement>();

  const { ui, seed, atmosphericDistance, textureResolution, radius } =
    useReactiveVar(planetGeneratorConfigVar);

  const { palettePresetName, terrainBias } = useReactiveVar(
    planetGenerationColorDrawerVar
  );

  const palettes = useReactiveVar(colorPalettesVar);

  const currentPalette = useMemo(
    () => palettes.find(({ name }) => name === palettePresetName),
    [palettePresetName, palettes]
  );

  const { rings } = useReactiveVar(planetGenerationRingDrawerVar);

  const prevRingsRef = useRef<RingConfig[]>([]);

  const [ringDataTextures, setRingDataTextures] = useState<{
    [ringId: string]: DataTexture;
  }>(undefined);

  useEffect(() => {
    const { updates, additions, deletions } = deepCompareRings(
      [...prevRingsRef.current],
      [...rings]
    );

    // processing deletions first makes more sense
    deletions.forEach((id) => delete ringDataTextures[id]);

    const updatesToRegen = updates
      .filter(({ regenTexture }) => regenTexture === true)
      .map(({ config }) => config);

    [...updatesToRegen, ...additions].forEach(
      ({ type, id, resolution, colors: ringColors, terrainBias }) => {
        runTextureGenOnWorker(
          type === 'rocky'
            ? 'perlin'
            : type === 'banded'
            ? 'banded'
            : 'simplex',
          resolution,
          ringColors,
          terrainBias,
          id
        ).then((texture) =>
          setRingDataTextures((prev) => ({ ...prev, [id]: texture }))
        );
      }
    );

    prevRingsRef.current = [...rings];
  }, [JSON.stringify(rings)]);

  return (
    <Box ref={containerRef} position="relative" width="100%" height="100%">
      <Planet
        pixelShaderSize={pixelShaderSize}
        stars={stars}
        data={{
          id: seed,
          atmospheric_distance: atmosphericDistance,
          texture_resolution: textureResolution,
          radius,
          terrain_bias: terrainBias,
          terrain_hex_palette: currentPalette,
          rings: rings.map((ring) => ({
            ...ring,
            id: ring.id ?? '',
            inner_radius: ring.innerRadius,
            outer_radius: ring.outerRadius,
            terrain_bias: ring.terrainBias,
            colors: ring.colors.map((color) => rgbToHex(color)),
          })),
        }}
      />
    </Box>
  );
};
