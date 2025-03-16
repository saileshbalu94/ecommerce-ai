import React from 'react';
import { Box, Heading, Text, Badge, Button, Flex, useColorModeValue } from '@chakra-ui/react';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';

const BrandVoiceCard = ({ brandVoice, onEdit, onDelete }) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box 
      borderWidth="1px" 
      borderRadius="lg" 
      overflow="hidden" 
      p={4} 
      bg={cardBg}
      borderColor={borderColor}
      boxShadow="sm"
      transition="all 0.3s"
      _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
    >
      <Flex justifyContent="space-between" alignItems="center" mb={2}>
        <Heading size="md" isTruncated>{brandVoice.name || 'Unnamed Brand Voice'}</Heading>
        {brandVoice.is_default && (
          <Badge colorScheme="green">Default</Badge>
        )}
      </Flex>

      <Box mb={4}>
        {brandVoice.brand_identity?.brandName && (
          <Text fontSize="sm" color="gray.500" isTruncated>
            Brand: {brandVoice.brand_identity.brandName}
          </Text>
        )}
        {brandVoice.tone?.primary && (
          <Text fontSize="sm" color="gray.500" isTruncated>
            Tone: {brandVoice.tone.primary}
          </Text>
        )}
        {brandVoice.style?.type && (
          <Text fontSize="sm" color="gray.500" isTruncated>
            Style: {brandVoice.style.type}
          </Text>
        )}
      </Box>

      <Flex justifyContent="flex-end" mt={2}>
        <Button 
          size="sm" 
          leftIcon={<EditIcon />} 
          mr={2} 
          onClick={onEdit}
          variant="outline"
        >
          Edit
        </Button>
        <Button 
          size="sm" 
          leftIcon={<DeleteIcon />} 
          colorScheme="red" 
          variant="outline"
          onClick={onDelete}
        >
          Delete
        </Button>
      </Flex>
    </Box>
  );
};

export default BrandVoiceCard; 