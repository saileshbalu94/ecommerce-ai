import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { SimpleGrid } from '@chakra-ui/react';
import {
  Box,
  Container,
  Heading,
  Text,
  FormControl,
  FormLabel,
  FormHelperText,
  Select,
  Button,
  VStack,
  HStack,
  Flex,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Icon,
  Input,
  Textarea,
  Tag,
  TagLabel,
  TagCloseButton,
  Divider,
  useToast,
  useColorModeValue,
  Radio,
  RadioGroup,
  Stack,
  Card,
  CardHeader,
  CardBody,
  CardFooter
} from '@chakra-ui/react';
import {
  FiHome,
  FiChevronRight,
  FiUser,
  FiMessageSquare,
  FiSave,
  FiInfo
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

/**
 * BrandVoicePage - Manage brand voice settings
 */
const BrandVoicePage = () => {
  const { user, updateBrandVoice } = useAuth();
  const toast = useToast();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  
  // Brand voice form state
  const [brandVoice, setBrandVoice] = useState({
    tone: 'professional',
    style: 'balanced',
    examples: [],
    keywords: [],
    avoidWords: []
  });
  
  // Input state for tags
  const [exampleInput, setExampleInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [avoidWordInput, setAvoidWordInput] = useState('');
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize form with user data when available
  useEffect(() => {
    if (user?.brandVoice) {
      setBrandVoice({
        tone: user.brandVoice.tone || 'professional',
        style: user.brandVoice.style || 'balanced',
        examples: user.brandVoice.examples || [],
        keywords: user.brandVoice.keywords || [],
        avoidWords: user.brandVoice.avoidWords || []
      });
    }
  }, [user]);
  
  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBrandVoice(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Add example
  const addExample = () => {
    if (exampleInput.trim() && !brandVoice.examples.includes(exampleInput.trim())) {
      setBrandVoice(prev => ({
        ...prev,
        examples: [...prev.examples, exampleInput.trim()]
      }));
      setExampleInput('');
    }
  };
  
  // Remove example
  const removeExample = (example) => {
    setBrandVoice(prev => ({
      ...prev,
      examples: prev.examples.filter(item => item !== example)
    }));
  };
  
  // Add keyword
  const addKeyword = () => {
    if (keywordInput.trim() && !brandVoice.keywords.includes(keywordInput.trim())) {
      setBrandVoice(prev => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()]
      }));
      setKeywordInput('');
    }
  };
  
  // Remove keyword
  const removeKeyword = (keyword) => {
    setBrandVoice(prev => ({
      ...prev,
      keywords: prev.keywords.filter(item => item !== keyword)
    }));
  };
  
  // Add avoid word
  const addAvoidWord = () => {
    if (avoidWordInput.trim() && !brandVoice.avoidWords.includes(avoidWordInput.trim())) {
      setBrandVoice(prev => ({
        ...prev,
        avoidWords: [...prev.avoidWords, avoidWordInput.trim()]
      }));
      setAvoidWordInput('');
    }
  };
  
  // Remove avoid word
  const removeAvoidWord = (word) => {
    setBrandVoice(prev => ({
      ...prev,
      avoidWords: prev.avoidWords.filter(item => item !== word)
    }));
  };
  
  // Save brand voice settings
  const saveBrandVoice = async () => {
    try {
      setIsLoading(true);
      
      const result = await updateBrandVoice(brandVoice);
      
      if (result.success) {
        toast({
          title: 'Settings Saved',
          description: 'Your brand voice settings have been updated successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to update brand voice settings.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error saving brand voice:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Example text for different tones
  const toneExamples = {
    professional: "Our cutting-edge solution offers enhanced productivity and streamlined operations for businesses seeking to optimize their workflow.",
    friendly: "Hey there! Our super handy tool makes your work way easier and helps you get more done with less hassle!",
    luxury: "Indulge in the exquisite craftsmanship of our premium solution, meticulously designed for the discerning professional who accepts nothing but excellence.",
    technical: "The system implements a multi-threaded architecture with asynchronous processing capabilities, resulting in 43% reduced latency compared to conventional solutions.",
    casual: "This cool tool seriously cuts down on busywork so you can focus on the stuff that actually matters to you and your team.",
    persuasive: "Imagine reclaiming hours of your day while simultaneously boosting your team's output - that's the transformative power our solution delivers from day one."
  };
  
  // Example text for different styles
  const styleExamples = {
    balanced: "Our ergonomic office chair features lumbar support and breathable mesh. You'll experience reduced back pain and stay comfortable during long work sessions.",
    'benefit-focused': "Say goodbye to back pain! Our chair ensures you stay comfortable even after 8 hours, helping you focus on work instead of discomfort.",
    'feature-focused': "Built with reinforced lumbar support, 4D adjustable armrests, breathable mesh backing, and high-density foam cushioning with a weight capacity of 300 lbs.",
    emotional: "Imagine ending your workday feeling as refreshed as when you started. That's the difference our chair makes - turning hours of sitting into a genuinely comfortable experience.",
    minimalist: "Ergonomic design. Premium materials. All-day comfort. Backed by a 5-year warranty."
  };
  
  return (
    <Box bg={bgColor} minH="calc(100vh - 60px)" py={5}>
      <Container maxW="container.xl">
        {/* Breadcrumb navigation */}
        <Breadcrumb
          spacing="8px"
          separator={<Icon as={FiChevronRight} color="gray.500" />}
          mb={6}
        >
          <BreadcrumbItem>
            <BreadcrumbLink as={RouterLink} to="/dashboard">
              <Icon as={FiHome} mr={1} />
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>
              <Icon as={FiMessageSquare} mr={1} />
              Brand Voice
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
        
        {/* Page heading */}
        <Heading as="h1" size="xl" mb={2}>
          Brand Voice Settings
        </Heading>
        <Text color="gray.600" mb={6}>
          Customize how your AI-generated content sounds to match your brand's personality.
        </Text>
        
        {/* Brand voice form */}
        <Box 
          bg={cardBg} 
          p={6} 
          borderRadius="md" 
          boxShadow="sm"
          mb={8}
        >
          <VStack spacing={6} align="start">
            {/* Tone selection */}
            <FormControl id="tone">
              <FormLabel fontWeight="bold">Content Tone</FormLabel>
              <Select 
                name="tone" 
                value={brandVoice.tone} 
                onChange={handleInputChange}
              >
                <option value="professional">Professional</option>
                <option value="friendly">Friendly</option>
                <option value="luxury">Luxury / Premium</option>
                <option value="technical">Technical</option>
                <option value="casual">Casual</option>
                <option value="persuasive">Persuasive</option>
              </Select>
              <FormHelperText>
                The overall tone of voice for your generated content
              </FormHelperText>
            </FormControl>
            
            {/* Example of selected tone */}
            <Box 
              p={4} 
              bg="blue.50" 
              color="blue.800" 
              borderRadius="md" 
              width="100%"
              borderLeft="4px solid"
              borderColor="blue.400"
            >
              <Flex mb={2} align="center">
                <Icon as={FiInfo} mr={2} />
                <Text fontWeight="bold">Example of {brandVoice.tone} tone:</Text>
              </Flex>
              <Text fontStyle="italic">
                {toneExamples[brandVoice.tone] || "Example not available for this tone."}
              </Text>
            </Box>
            
            {/* Style selection */}
            <FormControl id="style">
              <FormLabel fontWeight="bold">Writing Style</FormLabel>
              <RadioGroup 
                name="style" 
                value={brandVoice.style} 
                onChange={(value) => setBrandVoice(prev => ({ ...prev, style: value }))}
              >
                <Stack direction="column" spacing={3}>
                  <Radio value="balanced">Balanced (equal focus on features and benefits)</Radio>
                  <Radio value="benefit-focused">Benefit-Focused (emphasizes customer outcomes)</Radio>
                  <Radio value="feature-focused">Feature-Focused (highlights technical details)</Radio>
                  <Radio value="emotional">Emotional (uses stories and emotional appeals)</Radio>
                  <Radio value="minimalist">Minimalist (concise, direct language)</Radio>
                </Stack>
              </RadioGroup>
              <FormHelperText>
                How your content should be structured and what it should emphasize
              </FormHelperText>
            </FormControl>
            
            {/* Example of selected style */}
            <Box 
              p={4} 
              bg="blue.50" 
              color="blue.800" 
              borderRadius="md" 
              width="100%"
              borderLeft="4px solid"
              borderColor="blue.400"
            >
              <Flex mb={2} align="center">
                <Icon as={FiInfo} mr={2} />
                <Text fontWeight="bold">Example of {brandVoice.style} style:</Text>
              </Flex>
              <Text fontStyle="italic">
                {styleExamples[brandVoice.style] || "Example not available for this style."}
              </Text>
            </Box>
            
            <Divider />
            
            {/* Brand voice examples */}
            <FormControl id="examples">
              <FormLabel fontWeight="bold">Brand Voice Examples</FormLabel>
              <Text mb={2} fontSize="sm">
                Add examples of your brand's voice that the AI can learn from
              </Text>
              
              <HStack mb={2}>
                <Input
                  value={exampleInput}
                  onChange={(e) => setExampleInput(e.target.value)}
                  placeholder="Enter an example sentence or phrase that represents your brand voice"
                  onKeyPress={(e) => e.key === 'Enter' && addExample()}
                />
                <Button onClick={addExample}>Add</Button>
              </HStack>
              
              <Box my={3}>
                {brandVoice.examples.length === 0 ? (
                  <Text fontSize="sm" color="gray.500" fontStyle="italic">
                    No examples added yet. Add some examples to help the AI understand your brand voice.
                  </Text>
                ) : (
                  <HStack spacing={2} flexWrap="wrap">
                    {brandVoice.examples.map((example, index) => (
                      <Tag
                        key={index}
                        size="lg"
                        borderRadius="full"
                        variant="solid"
                        colorScheme="blue"
                        m={1}
                      >
                        <TagLabel>{example}</TagLabel>
                        <TagCloseButton onClick={() => removeExample(example)} />
                      </Tag>
                    ))}
                  </HStack>
                )}
              </Box>
              
              <FormHelperText>
                Adding 3-5 examples greatly improves how well the AI matches your brand's voice
              </FormHelperText>
            </FormControl>
            
            {/* Keywords to include */}
            <FormControl id="keywords">
              <FormLabel fontWeight="bold">Key Phrases to Include</FormLabel>
              <Text mb={2} fontSize="sm">
                Words or phrases you want to appear frequently in your content
              </Text>
              
              <HStack mb={2}>
                <Input
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  placeholder="Enter a word or phrase to include"
                  onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                />
                <Button onClick={addKeyword}>Add</Button>
              </HStack>
              
              <Box my={3}>
                {brandVoice.keywords.length === 0 ? (
                  <Text fontSize="sm" color="gray.500" fontStyle="italic">
                    No key phrases added yet. Add words or phrases you want the AI to include.
                  </Text>
                ) : (
                  <HStack spacing={2} flexWrap="wrap">
                    {brandVoice.keywords.map((keyword, index) => (
                      <Tag
                        key={index}
                        size="md"
                        borderRadius="full"
                        variant="solid"
                        colorScheme="green"
                        m={1}
                      >
                        <TagLabel>{keyword}</TagLabel>
                        <TagCloseButton onClick={() => removeKeyword(keyword)} />
                      </Tag>
                    ))}
                  </HStack>
                )}
              </Box>
              
              <FormHelperText>
                These might include your brand name, product names, or important terms
              </FormHelperText>
            </FormControl>
            
            {/* Words to avoid */}
            <FormControl id="avoidWords">
              <FormLabel fontWeight="bold">Words to Avoid</FormLabel>
              <Text mb={2} fontSize="sm">
                Words or phrases you want to exclude from your content
              </Text>
              
              <HStack mb={2}>
                <Input
                  value={avoidWordInput}
                  onChange={(e) => setAvoidWordInput(e.target.value)}
                  placeholder="Enter a word or phrase to avoid"
                  onKeyPress={(e) => e.key === 'Enter' && addAvoidWord()}
                />
                <Button onClick={addAvoidWord}>Add</Button>
              </HStack>
              
              <Box my={3}>
                {brandVoice.avoidWords.length === 0 ? (
                  <Text fontSize="sm" color="gray.500" fontStyle="italic">
                    No words to avoid added yet. Add terms you want the AI to exclude.
                  </Text>
                ) : (
                  <HStack spacing={2} flexWrap="wrap">
                    {brandVoice.avoidWords.map((word, index) => (
                      <Tag
                        key={index}
                        size="md"
                        borderRadius="full"
                        variant="solid"
                        colorScheme="red"
                        m={1}
                      >
                        <TagLabel>{word}</TagLabel>
                        <TagCloseButton onClick={() => removeAvoidWord(word)} />
                      </Tag>
                    ))}
                  </HStack>
                )}
              </Box>
              
              <FormHelperText>
                These might include competitor names, negative terms, or industry jargon to avoid
              </FormHelperText>
            </FormControl>
            
            <Button
              colorScheme="blue"
              size="lg"
              leftIcon={<Icon as={FiSave} />}
              onClick={saveBrandVoice}
              isLoading={isLoading}
              loadingText="Saving..."
            >
              Save Brand Voice Settings
            </Button>
          </VStack>
        </Box>
        
        {/* Tips section */}
        <Box mb={8}>
          <Heading size="md" mb={4}>
            Tips for Effective Brand Voice
          </Heading>
          
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <Card>
              <CardHeader pb={0}>
                <Heading size="sm">Be Consistent</Heading>
              </CardHeader>
              <CardBody>
                <Text fontSize="sm">
                  Consistency across all content builds brand recognition. Your tone should remain recognizable whether in product descriptions, emails, or social posts.
                </Text>
              </CardBody>
            </Card>
            
            <Card>
              <CardHeader pb={0}>
                <Heading size="sm">Know Your Audience</Heading>
              </CardHeader>
              <CardBody>
                <Text fontSize="sm">
                  Match your brand voice to your target audience's expectations. Technical audiences may prefer detail-rich content, while general consumers might respond better to emotional appeals.
                </Text>
              </CardBody>
            </Card>
            
            <Card>
              <CardHeader pb={0}>
                <Heading size="sm">Provide Clear Examples</Heading>
              </CardHeader>
              <CardBody>
                <Text fontSize="sm">
                  The more examples you provide of your preferred voice, the better the AI will understand your brand's unique style and tone.
                </Text>
              </CardBody>
            </Card>
          </SimpleGrid>
        </Box>
      </Container>
    </Box>
  );
};

export default BrandVoicePage;