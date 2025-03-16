import React from 'react';
import { Box, Heading, Container, useToast } from '@chakra-ui/react';
import BrandVoiceForm from '../components/brand-voice/BrandVoiceForm';
import brandVoiceService from '../services/brandVoice.service';

const CreateBrandVoicePage = () => {
  const toast = useToast();

  const handleSubmit = async (formData) => {
    try {
      await brandVoiceService.createBrandVoice(formData);
      return true;
    } catch (error) {
      console.error('Error creating brand voice:', error);
      throw error;
    }
  };

  return (
    <Box p={5}>
      <Container maxW="container.lg">
        <Heading size="lg" mb={6}>Create Brand Voice</Heading>
        <BrandVoiceForm onSubmit={handleSubmit} />
      </Container>
    </Box>
  );
};

export default CreateBrandVoicePage; 