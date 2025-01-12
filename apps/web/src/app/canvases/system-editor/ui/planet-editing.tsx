import { useReactiveVar } from '@apollo/client';
import {
  Box,
  HStack,
  Icon,
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  RangeSlider,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  RangeSliderTrack,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Text,
  VStack,
} from '@chakra-ui/react';
import { generateCelestialName } from '@idleverse/galaxy-gen';
import { Terrain_Hex_Palette } from '@idleverse/galaxy-gql';
import { PlanetGenerationConfig } from '@idleverse/models';
import {
  celestialViewerSelectedPlanetVar,
  colorPalettesVar,
  colorsVar,
  planetGenerationColorDrawerVar,
  planetGenerationPresets,
  planetGeneratorConfigVar,
  systemEditorNewPlanetVar,
} from '@idleverse/state';
import { useUiBackground } from '@idleverse/theme';
import { RepeatPixelIcon } from '@idleverse/ui';
import { Fragment, useEffect, useState } from 'react';
import {
  responsiveFontProps,
  responsiveIconProps,
} from '../../../_responsive-utils/font-props';
import { ColorQuad } from '../../planet-generator/ui/color-quad';
import { planetGeneratorSlidersConfig } from '../../planet-generator/ui/sliders';

export const PlanetNameEditor = ({
  onNameChange,
}: {
  onNameChange: (string) => void;
}) => {
  const currentConfig = useReactiveVar(planetGeneratorConfigVar);

  const [localConfigValues, setLocalValues] = useState(
    planetGeneratorConfigVar()
  );

  useEffect(() => {
    setLocalValues(currentConfig);
  }, [currentConfig]);

  const { secondary } = useReactiveVar(colorsVar);

  return (
    <HStack>
      <Input
        placeholder="planet name"
        fontSize="2xs"
        value={localConfigValues.name}
        maxLength={25}
        flexGrow="1"
        onChange={(event) => {
          setLocalValues({
            ...localConfigValues,
            name: event.target.value,
          });
          onNameChange(event.target.value);
        }}
      />
      <IconButton
        marginLeft="0.3rem"
        colorScheme={secondary}
        aria-label="Generate new name"
        icon={<Icon as={RepeatPixelIcon} {...responsiveIconProps} />}
        onClick={() => {
          const name = generateCelestialName();

          setLocalValues({
            ...localConfigValues,
            name,
          });
          onNameChange(name);
        }}
      />
    </HStack>
  );
};

export const PlanetAppearanceEditor = ({
  onPaletteChange,
  onBiasChange,
}: {
  onPaletteChange: (palette: Terrain_Hex_Palette) => void;
  onBiasChange: (biases: [number, number, number, number]) => void;
}) => {
  const appearance = useReactiveVar(planetGenerationColorDrawerVar);

  const { bg, border } = useUiBackground();
  const { primary, secondary } = useReactiveVar(colorsVar);

  const palettePresets = useReactiveVar(colorPalettesVar);

  // set a default here because we need access to the useTheme hook to pull colors
  const [localPalette, setLocalPalette] = useState<Terrain_Hex_Palette>(
    palettePresets[0]
  );

  useEffect(() => {
    const existingPalette = palettePresets.find(
      ({ name }) => name === appearance.palettePresetName
    );

    if (existingPalette) {
      setLocalPalette(existingPalette);
    }
  }, [appearance, palettePresets]);

  return (
    <VStack w="100%">
      {/* Palette */}
      <Menu>
        <MenuButton
          w="100%"
          px={4}
          py={2}
          transition="all 0.2s"
          borderRadius="md"
          borderWidth="1px"
          _hover={{ bg: `${primary}.600` }}
          _expanded={{ bg: `${primary}.600` }}
          _focus={{ boxShadow: 'outline' }}
        >
          <HStack minWidth="200px" justifyContent="space-between">
            <Text>{localPalette.name}</Text> <ColorQuad {...localPalette} />
          </HStack>
        </MenuButton>
        <MenuList bg={bg} borderColor={border} zIndex={2}>
          {palettePresets.map(({ name, water, sand, grass, forest, id }, i) => (
            <Fragment key={id}>
              <MenuItem
                bg={bg}
                _hover={{ bg: `${primary}.600` }}
                onClick={() => {
                  const biasPreset = planetGenerationPresets.find(
                    (preset) => preset.name === name
                  )?.appearance.terrainBias;

                  if (!biasPreset) {
                    console.error(`Could not find terrain bias for: "${name}"`);
                    return;
                  }

                  setLocalPalette({
                    name,
                    water,
                    sand,
                    grass,
                    forest,
                    id,
                  });
                  planetGenerationColorDrawerVar({
                    panelOpen: appearance.panelOpen,
                    terrainBias: biasPreset,
                    palettePresetName: name,
                  });
                  onPaletteChange({
                    name,
                    water,
                    sand,
                    grass,
                    forest,
                    id,
                  });
                }}
              >
                <HStack
                  width="100%"
                  minWidth="205px"
                  justifyContent="space-between"
                >
                  <Text>{name}</Text>
                  <ColorQuad {...{ water, sand, grass, forest }} />
                </HStack>
              </MenuItem>
              {i !== palettePresets.length - 1 && <MenuDivider />}
            </Fragment>
          ))}
        </MenuList>
      </Menu>

      {/* Terrain Biases */}
      <Box padding={2} w="100%" zIndex={1}>
        <RangeSlider
          key={JSON.stringify(appearance.terrainBias)}
          defaultValue={appearance.terrainBias}
          min={0}
          max={1}
          minStepsBetweenThumbs={2}
          step={0.01}
          onChangeEnd={(biases: [number, number, number, number]) => {
            if (biases[0] !== 0) {
              setTimeout(() => {
                const newBiases: [number, number, number, number] = [
                  0,
                  biases[1],
                  biases[2],
                  biases[3],
                ];

                planetGenerationColorDrawerVar({
                  ...appearance,
                  terrainBias: newBiases,
                });
                onBiasChange(newBiases);
              }, 200);
            }

            const newBiases: [number, number, number, number] = [
              0,
              biases[1],
              biases[2],
              biases[3],
            ];

            planetGenerationColorDrawerVar({
              ...appearance,
              terrainBias: newBiases,
            });
            onBiasChange(newBiases);
          }}
        >
          <RangeSliderTrack>
            <RangeSliderFilledTrack />
          </RangeSliderTrack>
          {[
            localPalette.water,
            localPalette.sand,
            localPalette.grass,
            localPalette.forest,
          ].map((paletteColor, i) => (
            <RangeSliderThumb
              key={i}
              boxSize={6}
              index={i}
              bgColor={paletteColor}
              borderColor={`${secondary}.200`}
              borderWidth={2}
            />
          ))}
        </RangeSlider>
      </Box>
    </VStack>
  );
};

export const PlanetConfigEditor = ({
  onConfigChange,
}: {
  onConfigChange: (key: keyof PlanetGenerationConfig, value: number) => void;
}) => {
  const currentConfig = useReactiveVar(planetGeneratorConfigVar);

  const selectedPlanet = useReactiveVar(celestialViewerSelectedPlanetVar);
  const creatingNewPlanet = useReactiveVar(systemEditorNewPlanetVar);

  const [localConfigValues, setLocalValues] = useState<PlanetGenerationConfig>(
    planetGeneratorConfigVar()
  );

  useEffect(() => {
    setLocalValues(currentConfig);
  }, [currentConfig, selectedPlanet, creatingNewPlanet]);

  return (
    <VStack>
      {planetGeneratorSlidersConfig.map((slider, index) => (
        <HStack
          key={`${index}-container`}
          alignItems="center"
          justifyContent="space-between"
          gap={2}
          position="relative"
        >
          <Text position="absolute" top={-2} fontSize={['2xs', 'xs']}>
            {slider.displayName}
          </Text>
          <Slider
            key={`${index}-slider`}
            width="75%"
            aria-label={`${slider.name}-slider`}
            value={localConfigValues[slider.name] as number}
            min={slider.min}
            max={slider.max}
            step={slider.step}
            onChange={(event: number) => {
              setLocalValues({
                ...localConfigValues,
                [slider.name]: event,
              });

              onConfigChange(slider.name, event);
            }}
            focusThumbOnChange={false}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>

          <NumberInput
            width="45%"
            key={`${index}-number`}
            value={localConfigValues[slider.name] as number}
            min={slider.min}
            max={slider.max}
            step={slider.step}
            precision={0}
            onChange={(event: string) => {
              setLocalValues({
                ...localConfigValues,
                [slider.name]: parseFloat(event),
              });
              onConfigChange(slider.name, parseFloat(event));
            }}
          >
            <NumberInputField autoFocus {...responsiveFontProps} pl={1} />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </HStack>
      ))}
    </VStack>
  );
};
