import React, { useState, useEffect } from 'react';
import { Box, Heading, Container, Spinner, useToast } from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import BrandVoiceForm from '../components/brand-voice/BrandVoiceForm';
import brandVoiceService from '../services/brandVoice.service';

const EditBrandVoicePage = () => {
  const { id } = useParams();
  const [brandVoice, setBrandVoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBrandVoice = async () => {
      try {
        setLoading(true);
        const response = await brandVoiceService.getBrandVoiceById(id);
        setBrandVoice(response.data);
      } catch (error) {
        toast({
          title: 'Error fetching brand voice',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        navigate('/brand-voice');
      } finally {
        setLoading(false);
      }
    };

    fetchBrandVoice();
  }, [id, toast, navigate]);

  const handleSubmit = async (formData) => {
    try {
      await brandVoiceService.updateBrandVoice(id, formData);
      return true;
    } catch (error) {
      console.error('Error updating brand voice:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <Box p={5} textAlign="center">
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box p={5}>
      <Container maxW="container.lg">
        <Heading size="lg" mb={6}>Edit Brand Voice</Heading>
        {brandVoice && (
          <BrandVoiceForm 
            initialData={brandVoice} 
            onSubmit={handleSubmit} 
            isEditing={true} 
          />
        )}
      </Container>
    </Box>
  );
};

export default EditBrandVoicePage; 