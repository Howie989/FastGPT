import { eventBus, EventNameEnum } from '@/web/common/utils/eventbus';
import {
  Button,
  Link,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  Box,
  Flex,
  useDisclosure
} from '@chakra-ui/react';
import MyIcon from '@fastgpt/web/components/common/Icon';
import MyTooltip from '@fastgpt/web/components/common/MyTooltip';
import { useRequest2 } from '@fastgpt/web/hooks/useRequest';
import { useTranslation } from 'next-i18next';
import React, { useMemo } from 'react';
import { getQuoteData } from '@/web/core/dataset/api';
import MyBox from '@fastgpt/web/components/common/MyBox';
import { getCollectionSourceData } from '@fastgpt/global/core/dataset/collection/utils';
import Markdown from '.';
import { getSourceNameIcon } from '@fastgpt/global/core/dataset/utils';

const A = ({ children, ...props }: any) => {
  const { t } = useTranslation();

  const {
    data: quoteData,
    loading,
    runAsync
  } = useRequest2(getQuoteData, {
    manual: true
  });

  const { isOpen, onOpen, onClose } = useDisclosure();

  // empty href link
  if (!props.href && typeof children?.[0] === 'string') {
    const text = useMemo(() => String(children), [children]);

    return (
      <MyTooltip label={t('common:core.chat.markdown.Quick Question')}>
        <Button
          variant={'whitePrimary'}
          size={'xs'}
          borderRadius={'md'}
          my={1}
          onClick={() => eventBus.emit(EventNameEnum.sendQuestion, { text })}
        >
          {text}
        </Button>
      </MyTooltip>
    );
  }

  // Quote
  if (props.href?.startsWith('QUOTE') && typeof children?.[0] === 'string') {
    const indexMatch = props.href.match(/QUOTE(\d+)/);
    const index = indexMatch ? indexMatch[1] : '1';

    const sourceData = useMemo(
      () => getCollectionSourceData(quoteData?.collection),
      [quoteData?.collection]
    );
    const icon = useMemo(
      () => getSourceNameIcon({ sourceId: sourceData.sourceId, sourceName: sourceData.sourceName }),
      [sourceData]
    );

    return (
      <Popover
        isLazy
        direction="rtl"
        placement="bottom"
        strategy={'fixed'}
        isOpen={isOpen}
        onClose={onClose}
        onOpen={() => {
          onOpen();
          runAsync(String(children));
        }}
        gutter={4}
      >
        <PopoverTrigger>
          <Button variant={'unstyled'} minH={0} minW={0} h={'auto'}>
            <MyTooltip label={t('common:read_quote')}>
              <Box
                w={'14px'}
                h={'14px'}
                borderRadius={'full'}
                bg={'rgba(0, 0, 0, 0.08)'}
                color={'myGray.600'}
                fontSize={'10px'}
                display={'flex'}
                alignItems={'center'}
                justifyContent={'center'}
                ml={0.5}
                transform={'translateY(-3px)'}
              >
                {index}
              </Box>
            </MyTooltip>
          </Button>
        </PopoverTrigger>
        <PopoverContent boxShadow={'lg'} w={'500px'} py={4}>
          <MyBox isLoading={loading}>
            <PopoverArrow />
            <PopoverBody py={0} px={0} fontSize={'sm'}>
              <Flex px={4} pb={1} justifyContent={'space-between'}>
                <Box
                  alignItems={'center'}
                  fontSize={'xs'}
                  border={'sm'}
                  borderRadius={'sm'}
                  overflow={'hidden'}
                  display={'inline-flex'}
                  height={6}
                  mr={1}
                >
                  <Flex
                    color={'myGray.500'}
                    bg={'myGray.150'}
                    w={4}
                    justifyContent={'center'}
                    fontSize={'10px'}
                    h={'full'}
                    alignItems={'center'}
                    mr={1}
                    flexShrink={0}
                  >
                    {index}
                  </Flex>
                  <Flex px={1.5}>
                    <MyIcon name={icon as any} mr={1} flexShrink={0} w={'12px'} />
                    <Box
                      className={'textEllipsis'}
                      wordBreak={'break-all'}
                      flex={'1 0 0'}
                      fontSize={'mini'}
                      color={'myGray.900'}
                    >
                      {sourceData.sourceName}
                    </Box>
                  </Flex>
                </Box>
                <Button
                  variant={'ghost'}
                  color={'primary.600'}
                  size={'xs'}
                  onClick={() => {
                    onClose();
                    eventBus.emit(EventNameEnum.openQuoteReader, {
                      // quoteId: String(children),
                      sourceId: sourceData.sourceId,
                      sourceName: sourceData.sourceName,
                      datasetId: quoteData?.collection.datasetId,
                      collectionId: quoteData?.collection._id
                    });
                  }}
                >
                  {t('common:all_quotes')}
                </Button>
              </Flex>
              <Box h={'300px'} overflow={'auto'} px={4}>
                <Markdown source={quoteData?.q} />
                {quoteData?.a && <Markdown source={quoteData?.a} />}
              </Box>
            </PopoverBody>
          </MyBox>
        </PopoverContent>
      </Popover>
    );
  }

  return <Link {...props}>{children}</Link>;
};

export default A;
