import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import {
  Box,
  Button,
  Link,
  Text,
  VStack,
  useDisclosure,
} from '@chakra-ui/react';
import { dbGalaxyToGalaxyConfig } from '@idleverse/galaxy-gen';
import {
  CreateEmpireOriginCelestialDocument,
  CreateEmpireOriginCelestialMutation,
  CreateEmpireOriginCelestialMutationVariables,
  CreateGalacticEmpireDocument,
  CreateGalacticEmpireMutation,
  CreateGalacticEmpireMutationVariables,
  CreatePlanetDocument,
  CreatePlanetMutation,
  CreatePlanetMutationVariables,
  GalaxyByNameDocument,
  GalaxyByNameQuery,
  GalaxyByNameQueryVariables,
} from '@idleverse/galaxy-gql';
import { Stage } from '@pixi/react';
import { useEffect, useRef, useState } from 'react';
import {
  Link as ReactRouterLink,
  useNavigate,
  useParams,
} from 'react-router-dom';

import {
  characterCreationVar,
  colorsVar,
  galaxyConfigVar,
  selfVar,
} from '@idleverse/state';
import { GalaxyThumbnail } from '../canvases/galaxy-thumbnail/galaxy-thumbnail';
import { randomisePlanetSeedAndName } from '../canvases/planet-generator/_utils/randomise-planet-seed-and-name';
import { generatePlanetInsertionVars } from '../canvases/planet-generator/generate-planet-input-vars';
import { Loading } from '../components/loading';
import { PixelateSVGFilter } from './components/pixelate-svg-filter';
import { creationStep } from './creation-types';
import { CreationWorkflow } from './creation-workflow';
import { BackgroundSelectionModal } from './workflow-step-modals/background-selection-modal';
import { FactionSelectionModal } from './workflow-step-modals/faction-selection-modal';
import { RaceSelectionModal } from './workflow-step-modals/race-selection-modal';
import { SystemGenerationModal } from './workflow-step-modals/system-generation-modal';

export const JoinGalaxy = () => {
  const characterCreationState = useReactiveVar(characterCreationVar);

  const { secondary } = useReactiveVar(colorsVar);

  const { id: userId } = useReactiveVar(selfVar);

  const { name } = useParams<{ name: string }>();

  const navigate = useNavigate();

  const { data: galaxyData, loading } = useQuery<
    GalaxyByNameQuery,
    GalaxyByNameQueryVariables
  >(GalaxyByNameDocument, {
    variables: { name },
  });

  const [alreadyJoinedGalaxy, setalreadyJoinedGalaxy] =
    useState<boolean>(false);

  const [readyToCreateEmpire, setReadyToCreateEmpire] =
    useState<boolean>(false);

  const [empireCreationStatus, setEmpireCreationStatus] = useState<
    'origin system' | 'homesystem' | 'empire' | 'done'
  >(undefined);

  const [readyToTransition, setReadyToTransition] = useState<boolean>(false);

  const [createEmpire] = useMutation<
    CreateGalacticEmpireMutation,
    CreateGalacticEmpireMutationVariables
  >(CreateGalacticEmpireDocument);

  const [createEmpireOriginCelestial] = useMutation<
    CreateEmpireOriginCelestialMutation,
    CreateEmpireOriginCelestialMutationVariables
  >(CreateEmpireOriginCelestialDocument);

  const [createHomeworld] = useMutation<
    CreatePlanetMutation,
    CreatePlanetMutationVariables
  >(CreatePlanetDocument);

  const {
    isOpen: raceSelectionOpen,
    onOpen: onRaceSelectionOpen,
    onClose: onRaceSelectionClose,
  } = useDisclosure();

  const {
    isOpen: backgroundSelectionOpen,
    onOpen: onBackgroundSelectionOpen,
    onClose: onBackgroundSelectionClose,
  } = useDisclosure();

  const {
    isOpen: factionSelectionOpen,
    onOpen: onFactionSelectionOpen,
    onClose: onFactionSelectionClose,
  } = useDisclosure();

  const {
    isOpen: homeworldGenerationOpen,
    onOpen: onHomeworldGenerationOpen,
    onClose: onHomeworldGenerationClose,
  } = useDisclosure();

  const tileContainerRef = useRef<HTMLDivElement>();

  const [tileWidth, setTileWidth] = useState<number>(0);
  const [tileHeight, setTileHeight] = useState<number>(0);

  const runCreationMutations = async () => {
    setEmpireCreationStatus('empire');

    const { data: empireData } = await createEmpire({
      variables: {
        input: {
          user_id: userId,
          galaxy_id: galaxyData.galaxy?.[0].id,
          playable_race_id: characterCreationState.race.id,
          background_id: characterCreationState.background.id,
          faction_id: characterCreationState.faction.id,
        },
      },
    });

    setEmpireCreationStatus('origin system');
    const celestial = await createEmpireOriginCelestial({
      variables: {
        galaxy_id: galaxyData.galaxy?.[0].id,
        galacticEmpireId: empireData.insert_galactic_empire_one.id,
      },
    });
    setEmpireCreationStatus('homesystem');

    await createHomeworld({
      variables: {
        input: {
          ...characterCreationState.homeworld,
          celestial_id:
            celestial.data.createEmpireOriginCelestial.insertedCelestialId,
        },
      },
    });
  };

  useEffect(() => {
    return () => {
      characterCreationVar({
        ...characterCreationVar(),
        homeworld: undefined,
      });
    };
  }, []);

  useEffect(() => {
    if (galaxyData?.galaxy?.[0]) {
      galaxyConfigVar(dbGalaxyToGalaxyConfig(galaxyData.galaxy[0]));

      const userAlreadyHasAnEmpireHere =
        galaxyData.galaxy[0].galactic_empires.find(
          ({ user_id }) => user_id === userId
        );

      if (userAlreadyHasAnEmpireHere) {
        setalreadyJoinedGalaxy(true);
      }
    }
  }, [galaxyData, userId]);

  useEffect(() => {
    if (readyToCreateEmpire) {
      setTimeout(() => {
        runCreationMutations().then(() => {
          setEmpireCreationStatus('done');
          /**
           * After a successful creation, randomise the planet id & seed.
           * Since this is a persisted reactive var (in local storage),
           * without this the user will likely, upon trying to join another galaxy,
           * try to insert a planet that breaks db constraints (dupe ids/names).
           */
          randomisePlanetSeedAndName();
          navigate(`/galaxies/${galaxyData.galaxy[0].name}`);
        });
      }, 2000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readyToCreateEmpire]);

  useEffect(() => {
    if (!loading) {
      const resizeObserver = new ResizeObserver((event) => {
        setTileWidth(event[0].contentBoxSize[0].inlineSize);
        setTileHeight(event[0].contentBoxSize[0].blockSize);
      });

      if (tileContainerRef && tileContainerRef.current) {
        resizeObserver.observe(tileContainerRef.current);
      }
    }
  }, [loading, tileContainerRef]);

  if (loading) {
    return (
      <Loading width="100%" height="100%" text="Loading Galaxy info"></Loading>
    );
  }

  if (alreadyJoinedGalaxy) {
    return (
      <VStack height="100%" justify="center" spacing={10}>
        <Text textAlign="center">
          You already have an empire in this galaxy.
        </Text>
        <Link
          as={ReactRouterLink}
          unstable_viewTransition
          to={`/galaxies/${galaxyData.galaxy[0].name}`}
        >
          <Button>Galaxy View</Button>
        </Link>
      </VStack>
    );
  }

  if (empireCreationStatus && empireCreationStatus !== 'done') {
    return (
      <Loading
        width="100%"
        height="100%"
        text={`Creating ${empireCreationStatus}`}
      ></Loading>
    );
  }

  if (empireCreationStatus === 'done') {
    return (
      <VStack height="100%" justify="center" spacing={10}>
        <Text>Your empire was founded successfully.</Text>
        <Link
          as={ReactRouterLink}
          unstable_viewTransition
          to={`/galaxies/${galaxyData.galaxy[0].name}`}
        >
          <Button>Begin</Button>
        </Link>
      </VStack>
    );
  }

  if (!galaxyData.galaxy.length) {
    return (
      <Box h="100%" display="flex" alignItems="center" justifyContent="center">
        Something went wrong. There is no galaxy to join.
      </Box>
    );
  }

  return (
    <>
      <RaceSelectionModal
        selectedRace={characterCreationState.race}
        isOpen={raceSelectionOpen}
        onClose={({ race, progress }) => {
          characterCreationVar({ ...characterCreationVar(), race });
          onRaceSelectionClose();

          // open background
          if (progress === 'next') onBackgroundSelectionOpen();
        }}
      />

      <BackgroundSelectionModal
        selectedBackground={characterCreationState.background}
        isOpen={backgroundSelectionOpen}
        onClose={({ background, progress }) => {
          characterCreationVar({ ...characterCreationVar(), background });
          onBackgroundSelectionClose();

          if (progress === 'next') onFactionSelectionOpen();
          if (progress === 'prev') onRaceSelectionOpen();
        }}
      />

      <FactionSelectionModal
        selectedFaction={characterCreationState.faction}
        isOpen={factionSelectionOpen}
        onClose={({ faction, progress }) => {
          characterCreationVar({ ...characterCreationVar(), faction });
          onFactionSelectionClose();

          // open homeworld gen
          if (progress === 'next') onHomeworldGenerationOpen();
          if (progress === 'prev') onBackgroundSelectionOpen();
        }}
      />

      <SystemGenerationModal
        isOpen={homeworldGenerationOpen}
        onClose={() => {
          characterCreationVar({
            ...characterCreationVar(),
            // make sure to set a celestial ID once a celestial is claimed at the end of the flow
            homeworld: generatePlanetInsertionVars('', userId),
          });
          onHomeworldGenerationClose();
        }}
      />

      <VStack
        height="100%"
        justify="center"
        spacing={10}
        filter={'url(#pixelate)'}
      >
        <VStack spacing={3}>
          <Text textAlign="center">It's time to begin your journey in:</Text>
          <Text textAlign="center" fontWeight="bold" color={`${secondary}.500`}>
            {galaxyData.galaxy[0].name}
          </Text>
        </VStack>

        <Box
          ref={tileContainerRef}
          height="30vw"
          width="30vw"
          minHeight={['75vw', '75vw', '50vw', 250]}
          minWidth={['75vw', '75vw', '50vw', 250]}
          maxHeight={[200, 350]}
          maxWidth={[200, 350]}
        >
          <Stage
            height={tileHeight}
            width={tileWidth}
            options={{
              backgroundAlpha: 0,
              antialias: true,
            }}
          >
            <GalaxyThumbnail
              galaxyConfig={dbGalaxyToGalaxyConfig(galaxyData.galaxy[0])}
            />
          </Stage>
        </Box>

        <CreationWorkflow
          onStepClicked={(creationStep) => {
            const stepFunctions: {
              [key in creationStep]: () => void;
            } = {
              race: () => onRaceSelectionOpen(),
              background: () => onBackgroundSelectionOpen(),
              faction: () => onFactionSelectionOpen(),
              homeworld: () => onHomeworldGenerationOpen(),
              start: () => setReadyToCreateEmpire(true),
            };

            stepFunctions[creationStep]();
          }}
          value={characterCreationState}
        />

        <PixelateSVGFilter
          start={readyToCreateEmpire}
          reversed={false}
          minDistortion={1}
          maxDistortion={100}
        />
      </VStack>
    </>
  );
};
