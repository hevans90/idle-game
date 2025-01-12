import { useMutation, useReactiveVar } from '@apollo/client';
import { Box, Button, Input, useBreakpointValue } from '@chakra-ui/react';
import {
  SendNewMessageDocument,
  SendNewMessageMutation,
} from '@idleverse/galaxy-gql';
import React from 'react';

import { colorsVar } from '@idleverse/state';
import { useUiBackground } from '@idleverse/theme';
import { SIDE_NAV_WIDTH } from './layout';

export const ChatSubmit = () => {
  const [message, setMessage] = React.useState('');

  const [sendNewMessage] = useMutation<SendNewMessageMutation>(
    SendNewMessageDocument,
    {
      variables: { message },
    }
  );

  const submit = () => {
    sendNewMessage();
    setMessage('');
  };

  const bp: 'small' | 'medium' | 'large' = useBreakpointValue({
    base: 'small',
    md: 'medium',
    lg: 'large',
  });

  const { bg, border } = useUiBackground();
  const { secondary } = useReactiveVar(colorsVar);

  return (
    <Box
      marginTop="auto"
      display="flex"
      position="absolute"
      bottom="0"
      padding="1"
      width={bp === 'small' ? '100%' : SIDE_NAV_WIDTH}
      borderColor={border}
      borderStyle="solid"
      borderTopWidth="1px"
      borderRightWidth="1px"
      bgColor={bg}
    >
      <Input
        bg={bg}
        placeholder="Type to chat..."
        value={message}
        onChange={(event) => {
          setMessage(event.target.value);
        }}
        onKeyUp={(e) => {
          if (e.key === 'Enter') submit();
        }}
      />
      <Button
        colorScheme={secondary}
        size="xs"
        height="40px"
        marginLeft={1}
        paddingLeft="1rem"
        paddingRight="1rem"
        onClick={(e) => {
          submit();
        }}
      >
        Send
      </Button>
    </Box>
  );
};
