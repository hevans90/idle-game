import { useReactiveVar } from '@apollo/client';

import {
  Button,
  HStack,
  Icon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Switch,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  TabProps,
  Tabs,
  Text,
} from '@chakra-ui/react';

import { colorsVar, questDetailVar, questJournalVar } from '@idleverse/state';
import { useUiBackground } from '@idleverse/theme';
import { ChevronLeftPixelIcon } from '@idleverse/ui';
import { responsiveIconProps } from '../../_responsive-utils/font-props';
import { QuestDetail } from './quest-detail';
import { QuestList } from './quest-list';

export const QuestJournal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => unknown;
}) => {
  const { bg, border, bgDark, bgLight } = useUiBackground();

  const { secondary } = useReactiveVar(colorsVar);
  const { showCompleted, state } = useReactiveVar(questJournalVar);
  const { quest } = useReactiveVar(questDetailVar);

  const tabProps: TabProps = {
    _selected: { bg: bgLight },
    flexGrow: '1',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={['full', '6xl']} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader
          bg={bgDark}
          borderTopRightRadius={6}
          borderTopLeftRadius={6}
          borderBottom="1px solid"
          borderBottomColor={border}
        >
          <HStack justifyContent="space-between">
            <Text>{state === 'home' ? 'Quest Journal' : quest?.name}</Text>
            <HStack paddingRight={6} display={['none', 'flex']}>
              {state === 'home' && (
                <>
                  <Text flexGrow={1} fontSize="sm">
                    Show completed
                  </Text>
                  <Switch
                    isChecked={showCompleted}
                    onChange={() => {
                      questJournalVar({
                        ...questJournalVar(),
                        showCompleted: !showCompleted,
                      });
                    }}
                    colorScheme={secondary}
                    size="md"
                  />
                </>
              )}
              {state === 'detail' && (
                <Button
                  onClick={() => {
                    questJournalVar({
                      ...questJournalVar(),
                      state: 'home',
                    });

                    questDetailVar({
                      quest: undefined,
                      questStepId: undefined,
                      empireQuestId: undefined,
                      completed: undefined,
                    });
                  }}
                  leftIcon={
                    <Icon as={ChevronLeftPixelIcon} {...responsiveIconProps} />
                  }
                >
                  Back to Journal
                </Button>
              )}
            </HStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody
          bg={bg}
          padding={0}
          borderRight="1px solid"
          borderRightColor={border}
          borderBottomRightRadius={6}
          borderBottomLeftRadius={6}
        >
          {state === 'home' ? (
            <Tabs orientation="horizontal" minHeight="40vh">
              <TabList justifyContent="stretch" borderColor={border}>
                <Tab {...tabProps}>Main</Tab>
                <Tab {...tabProps}>Race</Tab>
                <Tab {...tabProps} isDisabled>
                  Misc
                </Tab>
              </TabList>

              <TabPanels>
                <TabPanel padding={0}>
                  <QuestList showCompleted={showCompleted} />
                </TabPanel>
                <TabPanel>
                  <p>Coming soon.</p>
                </TabPanel>
                <TabPanel>
                  <p>three!</p>
                </TabPanel>
              </TabPanels>
            </Tabs>
          ) : (
            <QuestDetail />
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
