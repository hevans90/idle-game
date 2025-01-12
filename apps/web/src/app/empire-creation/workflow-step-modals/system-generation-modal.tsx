import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';

import { useUiBackground } from '@idleverse/theme';
import { AnimatedText } from '@idleverse/ui';
import {
  headerResponsiveFontProps,
  responsiveFontProps,
} from '../../_responsive-utils/font-props';
import { MODAL_HEADER_HEIGHT } from '../../canvases/_utils/use-resize.hook';
import { SystemEditorContainer } from '../../canvases/system-editor/system-editor.container';

export const SystemGenerationModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { bg, border, bgDark } = useUiBackground();

  return (
    <Modal isOpen={isOpen} onClose={() => onClose()} size={['full']} isCentered>
      <ModalOverlay />
      <ModalContent overflow="hidden">
        <ModalHeader
          minH={`${MODAL_HEADER_HEIGHT}px`}
          px={4}
          py={2}
          borderBottom="1px solid"
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          bg={bg}
          borderTopRightRadius={6}
          borderTopLeftRadius={6}
          borderBottomColor={border}
          {...headerResponsiveFontProps}
        >
          <AnimatedText
            content="Create your system"
            duration={{ enter: 0.3 }}
            animationType="decipher"
            textAlign="center"
            fontSize="xl"
          ></AnimatedText>

          <Button {...responsiveFontProps} onClick={onClose}>
            Confirm
          </Button>
        </ModalHeader>
        <ModalBody
          bg={bgDark}
          padding={0}
          display="flex"
          flexDir="column"
          position="relative"
          flexGrow={1}
        >
          <SystemEditorContainer inModal={true} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
