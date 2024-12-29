import React from 'react';
import { Box, VStack, Text, List, ListItem, Tooltip, Tag, TagLabel, Spinner, Flex } from '@chakra-ui/react';

const StationList = ({ stations, onStationSelect, currentStation }) => {
  if (!stations.length) {
    return (
      <Box 
        position="absolute" 
        top="80px" 
        right="20px" 
        bg="rgba(0,0,0,0.8)" 
        p={4} 
        borderRadius="md" 
        color="white"
        maxW="300px"
      >
        <Text>İstasyon bulunamadı.</Text>
      </Box>
    );
  }

  return (
    <Box
      position="absolute"
      top="80px"
      right="20px"
      bg="rgba(0,0,0,0.8)"
      p={4}
      borderRadius="md"
      maxH="70vh"
      overflowY="auto"
      maxW="300px"
      css={{
        '&::-webkit-scrollbar': {
          width: '4px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(255,255,255,0.1)',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#1ed760',
          borderRadius: '2px',
        },
      }}
    >
      <List spacing={2}>
        {stations.map((station) => (
          <Tooltip
            key={station.stationuuid}
            label={
              <Box p={2}>
                <Text fontWeight="bold">{station.name}</Text>
                <Text fontSize="sm" opacity={0.8}>{station.country}</Text>
                {station.tags && (
                  <Flex gap={1} mt={2} flexWrap="wrap">
                    {station.tags.split(',').slice(0,3).map((tag, index) => (
                      <Tag size="sm" key={index} colorScheme="green" variant="subtle">
                        <TagLabel>{tag.trim()}</TagLabel>
                      </Tag>
                    ))}
                  </Flex>
                )}
              </Box>
            }
            placement="left"
            hasArrow
          >
            <ListItem
              p={3}
              borderRadius="md"
              cursor="pointer"
              bg={currentStation?.stationuuid === station.stationuuid ? 'rgba(30,215,96,0.2)' : 'transparent'}
              _hover={{
                bg: 'rgba(255,255,255,0.1)',
              }}
              onClick={() => onStationSelect(station)}
              display="flex"
              alignItems="center"
              gap={3}
            >
              <Box
                w="40px"
                h="40px"
                borderRadius="md"
                bg="#282828"
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
              >
                {station.favicon ? (
                  <img
                    src={station.favicon}
                    alt=""
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: 'inherit',
                    }}
                  />
                ) : (
                  <Text fontSize="xl">📻</Text>
                )}
              </Box>
              <Box flex={1} minW={0}>
                <Text
                  color="white"
                  fontWeight={currentStation?.stationuuid === station.stationuuid ? 'bold' : 'normal'}
                  noOfLines={1}
                >
                  {station.name}
                </Text>
                <Text fontSize="sm" color="whiteAlpha.700" noOfLines={1}>
                  {station.country}
                </Text>
              </Box>
            </ListItem>
          </Tooltip>
        ))}
      </List>
    </Box>
  );
};

export default StationList;
