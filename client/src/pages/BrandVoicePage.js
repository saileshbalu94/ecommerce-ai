import React, { useState, useEffect } from 'react';
import { Box, Heading, SimpleGrid, Button, useToast, Flex, Spinner, Text } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import BrandVoiceCard from '../components/brand-voice/BrandVoiceCard';
import brandVoiceService from '../services/brandVoice.service';

const BrandVoicePage = () => {
  const [brandVoices, setBrandVoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBrandVoices();
  }, []);

  const fetchBrandVoices = async () => {
    try {
      setLoading(true);
      const response = await brandVoiceService.getBrandVoices();
      setBrandVoices(response.data || []);
    } catch (error) {
      toast({
        title: 'Error fetching brand voices',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    navigate('/brand-voice/create');
  };

  const handleEdit = (id) => {
    navigate(`/brand-voice/edit/${id}`);
  };

  const handleDelete = async (id) => {
    try {
      await brandVoiceService.deleteBrandVoice(id);
      toast({
        title: 'Brand voice deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchBrandVoices();
    } catch (error) {
      toast({
        title: 'Error deleting brand voice',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={5}>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">Brand Voices</Heading>
        <Button 
          leftIcon={<AddIcon />} 
          colorScheme="blue" 
          onClick={handleCreateNew}
        >
          Create New
        </Button>
      </Flex>

      {loading ? (
        <Flex justifyContent="center" alignItems="center" height="200px">
          <Spinner size="xl" />
        </Flex>
      ) : brandVoices.length === 0 ? (
        <Box textAlign="center" p={10} borderWidth={1} borderRadius="lg">
          <Text fontSize="lg" mb={4}>You don't have any brand voices yet.</Text>
          <Button colorScheme="blue" onClick={handleCreateNew}>Create Your First Brand Voice</Button>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {brandVoices.map((brandVoice) => (
            <BrandVoiceCard
              key={brandVoice.id}
              brandVoice={brandVoice}
              onEdit={() => handleEdit(brandVoice.id)}
              onDelete={() => handleDelete(brandVoice.id)}
            />
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
};

export default BrandVoicePage; 