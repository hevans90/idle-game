import { useReactiveVar } from '@apollo/client';

import {
  Box,
  HStack,
  Icon,
  IconButton,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Text,
} from '@chakra-ui/react';
import { WORLD_RADII, generateCelestialName } from '@idleverse/galaxy-gen';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { PlanetGenerationConfig } from '@idleverse/models';
import { colorsVar, planetGeneratorConfigVar } from '@idleverse/state';
import { useUiBackground } from '@idleverse/theme';
import { RepeatPixelIcon } from '@idleverse/ui';
import {
  responsiveFontProps,
  responsiveIconProps,
} from '../../../_responsive-utils/font-props';

export type PlanetGeneratorSliderType = {
  name: keyof PlanetGenerationConfig;
  displayName: string;
  min?: number;
  max: number;
  step: number;
};

export const planetGenerationControlsHeight = 200;

export const planetGeneratorSlidersConfig: PlanetGeneratorSliderType[] = [
  {
    name: 'radius',
    displayName: 'Radius',
    min: 0.25,
    max: 3,
    step: 0.25,
  },
  {
    name: 'atmosphericDistance',
    displayName: 'Atmosphere',
    min: 1,
    max: 16,
    step: 2,
  },
  {
    name: 'orbitalRadius',
    displayName: 'Orbit',
    min: WORLD_RADII['goldilocks-zone'].inner,
    max: WORLD_RADII['goldilocks-zone'].outer,
    step: 100,
  },
  {
    name: 'textureResolution',
    displayName: 'Resolution',
    min: 48,
    max: 256,
    step: 16,
  },
];

export const PlanetGeneratorSliders = () => {
  const { bg, border } = useUiBackground();
  const { secondary } = useReactiveVar(colorsVar);

  const initialPlanetGenerationConfig = planetGeneratorConfigVar();

  const [localConfigValues, setLocalValues] = useState(
    initialPlanetGenerationConfig
  );

  useEffect(() => {
    setLocalValues({ ...initialPlanetGenerationConfig });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <HStack
      className="footer"
      padding={3}
      bgColor={bg}
      borderStyle="solid"
      borderColor={border}
      borderTopWidth="1px"
      position="absolute"
      bottom="0"
      left="0"
      height={`${planetGenerationControlsHeight}px`}
      width="100%"
      alignItems="start"
      justifyContent="space-between"
    >
      <Box
        display={['none', 'none', 'none', 'flex']}
        maxWidth="600px"
        flexDirection="column"
        flexGrow={1}
        marginRight="2rem"
      >
        <HStack mb={1}>
          <Text minWidth="100px" fontSize={['2xs', 'xs']}>
            name
          </Text>
          <Input
            fontSize="2xs"
            value={localConfigValues.name}
            maxLength={25}
            flexGrow="1"
            onChange={(event) => {
              setLocalValues({
                ...localConfigValues,
                name: event.target.value,
              });

              planetGeneratorConfigVar({
                ...planetGeneratorConfigVar(),
                name: event.target.value,
              });
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

              planetGeneratorConfigVar({
                ...planetGeneratorConfigVar(),
                name,
              });
            }}
          />
        </HStack>
        <HStack>
          <Text minWidth="100px" fontSize={['2xs', 'xs']}>
            seed
          </Text>
          <Input
            fontSize="2xs"
            value={localConfigValues.seed}
            flexGrow="1"
            isReadOnly={true}
          />
          <IconButton
            marginLeft="0.3rem"
            colorScheme={secondary}
            aria-label="Generate new seed"
            icon={<Icon as={RepeatPixelIcon} {...responsiveIconProps} />}
            onClick={() => {
              const seed = uuidv4();

              setLocalValues({
                ...localConfigValues,
                seed,
              });
              planetGeneratorConfigVar({
                ...planetGeneratorConfigVar(),
                seed,
              });
            }}
          />
        </HStack>
      </Box>
      <Box
        display="flex"
        flexDirection="column"
        flexGrow={2}
        maxWidth={['unset', 'unset', 'unset', '60%', '50%', '40%']}
      >
        {planetGeneratorSlidersConfig.map((slider, index) => (
          <HStack
            key={`${index}-container`}
            alignItems="center"
            marginBottom="5px"
            justifyContent="space-between"
            spacing={5}
          >
            <Text minWidth="250px" fontSize={['2xs', 'xs']}>
              {slider.displayName}
            </Text>
            <Slider
              display={['none', 'none', 'none', 'block']}
              mr={10}
              key={`${index}-slider`}
              maxWidth={[200, 300, 400]}
              aria-label={`${slider.name}-slider`}
              value={localConfigValues[slider.name] as number}
              defaultValue={
                initialPlanetGenerationConfig[slider.name] as number
              }
              min={slider.min}
              max={slider.max}
              step={slider.step}
              onChange={(event: number) => {
                setLocalValues({ ...localConfigValues, [slider.name]: event });
                planetGeneratorConfigVar({
                  ...planetGeneratorConfigVar(),
                  [slider.name]: event,
                });
              }}
              focusThumbOnChange={false}
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>

            <NumberInput
              key={`${index}-number`}
              value={localConfigValues[slider.name] as number}
              defaultValue={
                initialPlanetGenerationConfig[slider.name] as number
              }
              min={slider.min}
              max={slider.max}
              step={slider.step}
              onChange={(event: string) => {
                setLocalValues({
                  ...localConfigValues,
                  [slider.name]: parseFloat(event),
                });
                planetGeneratorConfigVar({
                  ...planetGeneratorConfigVar(),
                  [slider.name]: parseFloat(event),
                });
              }}
            >
              <NumberInputField autoFocus {...responsiveFontProps} />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </HStack>
        ))}
      </Box>
    </HStack>
  );
};
