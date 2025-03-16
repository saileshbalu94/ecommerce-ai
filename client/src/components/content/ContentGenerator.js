import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  VStack,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Tag,
  TagLabel,
  TagCloseButton,
  HStack,
  Heading,
  Text,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Flex,
  Spinner,
  Divider,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Switch,
  Avatar,
  IconButton,
  Badge,
  Tooltip
} from '@chakra-ui/react';
import { CheckIcon, DownloadIcon } from '@chakra-ui/icons';
import { useAuth } from '../../context/AuthContext';
import contentService from '../../services/content.service';
import brandVoiceService from '../../services/brandVoice.service';
import supabase from '../../services/supabase';
import axios from 'axios';
import { SaveIcon } from '@chakra-ui/icons';

/**
 * ContentGenerator - Form for generating product descriptions and titles
 * 
 * This component provides a user interface for generating product descriptions and titles.
 * The generated content is displayed in a chat-like interface, allowing users to
 * provide feedback and generate alternatives through a conversation flow.
 */
const ContentGenerator = () => {
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const chatEndRef = useRef(null);
  
  // Form state
  const [productData, setProductData] = useState({
    productName: '',
    productCategory: '',
    productFeatures: [],
    keywords: [],
    additionalInfo: '',
    productImage: null
  });
  
  // Feature and keyword input state
  const [featureInput, setFeatureInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  
  // Generation options
  const [options, setOptions] = useState({
    tone: user?.brandVoice?.tone || 'professional',
    style: user?.brandVoice?.style || 'balanced',
    length: 'medium'
  });
  
  // Content state
  const [generatedContent, setGeneratedContent] = useState('');
  const [generatedTitles, setGeneratedTitles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [contentMetadata, setContentMetadata] = useState(null);
  
  // Add conversation state for chat interface
  const [conversation, setConversation] = useState([]);
  const [feedbackText, setFeedbackText] = useState('');
  const [alternativeCount, setAlternativeCount] = useState(0);
  
  // Add state for brand voices
  const [brandVoices, setBrandVoices] = useState([]);
  const [selectedBrandVoice, setSelectedBrandVoice] = useState('');
  const [loadingBrandVoices, setLoadingBrandVoices] = useState(false);
  const [useBrandVoice, setUseBrandVoice] = useState(false);
  
  // Add a check for authentication
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to generate content.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [isAuthenticated, toast]);
  
  // Scroll to bottom when conversation updates
  useEffect(() => {
    if (conversation.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation]);
  
  // Fetch brand voices
  useEffect(() => {
    const fetchBrandVoices = async () => {
      if (!isAuthenticated) return;
      
      try {
        setLoadingBrandVoices(true);
        const response = await brandVoiceService.getBrandVoices();
        setBrandVoices(response.data || []);
        
        // If there's a default brand voice, select it
        const defaultVoice = response.data?.find(voice => voice.is_default);
        if (defaultVoice) {
          setSelectedBrandVoice(defaultVoice.id);
          setUseBrandVoice(true);
        }
      } catch (error) {
        console.error('Error fetching brand voices:', error);
      } finally {
        setLoadingBrandVoices(false);
      }
    };
    
    fetchBrandVoices();
  }, [isAuthenticated]);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle options changes
  const handleOptionsChange = (e) => {
    const { name, value } = e.target;
    setOptions((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Add feature
  const addFeature = () => {
    if (featureInput.trim() && !productData.productFeatures.includes(featureInput.trim())) {
      setProductData((prev) => ({
        ...prev,
        productFeatures: [...prev.productFeatures, featureInput.trim()]
      }));
      setFeatureInput('');
    }
  };
  
  // Remove feature
  const removeFeature = (feature) => {
    setProductData((prev) => ({
      ...prev,
      productFeatures: prev.productFeatures.filter((f) => f !== feature)
    }));
  };
  
  // Add keyword
  const addKeyword = () => {
    if (keywordInput.trim() && !productData.keywords.includes(keywordInput.trim())) {
      setProductData((prev) => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()]
      }));
      setKeywordInput('');
    }
  };
  
  // Remove keyword
  const removeKeyword = (keyword) => {
    setProductData((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((k) => k !== keyword)
    }));
  };
  
  // Handle brand voice selection
  const handleBrandVoiceChange = (e) => {
    setSelectedBrandVoice(e.target.value);
  };
  
  // Toggle between brand voice and manual tone/style
  const handleUseBrandVoiceChange = (e) => {
    setUseBrandVoice(e.target.checked);
  };
  
  // Handle file input changes
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Update product data to include the file
      setProductData(prev => ({
        ...prev,
        productImage: file
      }));
    }
  };
  
  // Helper function to clean generated alternative text
  const cleanGeneratedText = (text) => {
    // If the text contains multiple alternatives, extract only the latest one
    let cleanedText = text;
    
    // For debugging
    console.log("Original text to clean:", text);
    
    // Check if we have multiple alternatives by looking for patterns like "Alternative X" or numbered sections
    const alternativeMatches = text.match(/(Alternative|Alternate)(\s+Version)?\s+\d+:?/gi);
    
    if (alternativeMatches && alternativeMatches.length > 1) {
      console.log("Multiple alternatives found:", alternativeMatches);
      // Multiple alternatives found, extract only the last one
      const lastAlternativeMarker = alternativeMatches[alternativeMatches.length - 1];
      
      // Find the position of the last alternative
      const lastAlternativePos = text.lastIndexOf(lastAlternativeMarker);
      
      if (lastAlternativePos !== -1) {
        // Extract everything from the last alternative marker to the end
        cleanedText = text.substring(lastAlternativePos);
        console.log("Extracted last alternative:", cleanedText);
      }
    }
    
    // Now clean up the extracted text
    // Remove the "Alternative X:" header
    cleanedText = cleanedText.replace(/^(Alternative|Alternate)(\s+Version)?\s+\d+:?\s*/i, '');
    
    // Remove any "Reasoning:" section - we want to keep only the alternative content
    // Handle different formats of reasoning sections
    cleanedText = cleanedText.replace(/\n+Reasoning:.*$/is, '');
    cleanedText = cleanedText.replace(/\n+Reason:.*$/is, '');
    cleanedText = cleanedText.replace(/\n+Explanation:.*$/is, '');
    cleanedText = cleanedText.replace(/\n+Rationale:.*$/is, '');
    
    // Also handle numbered formats like "1. Reasoning:"
    cleanedText = cleanedText.replace(/\n+\d+\.\s+(Reasoning|Reason|Explanation|Rationale):.*$/is, '');
    
    console.log("Final cleaned text:", cleanedText);
    
    return cleanedText.trim();
  };
  
  // Generate product description with brand voice
  const generateDescription = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to generate content.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    try {
      setIsLoading(true);
      setGeneratedContent('');
      setContentMetadata(null);
      
      let generationOptions = { ...options };
      
      // If using brand voice, get the selected brand voice
      if (useBrandVoice && selectedBrandVoice) {
        const selectedVoice = brandVoices.find(voice => voice.id === selectedBrandVoice);
        if (selectedVoice) {
          // Use the tone and style from the selected brand voice
          generationOptions = {
            ...generationOptions,
            tone: selectedVoice.tone?.primary || options.tone,
            style: selectedVoice.style?.type || options.style,
            brandVoiceId: selectedVoice.id
          };
        }
      }
      
      // Call content generation service
      const result = await contentService.generateDescription(productData, generationOptions);
      
      if (result.success) {
        const content = cleanGeneratedText(result.data.content);
        setGeneratedContent(content);
        setContentMetadata(result.data.metadata);
        
        // Reset conversation and add first message
        setAlternativeCount(1);
        setConversation([
          {
            id: Date.now(),
            type: 'system',
            content: content,
            timestamp: new Date().toISOString(),
            metadata: result.data.metadata,
            label: 'Alternative 1'
          }
        ]);
        
        toast({
          title: 'Success',
          description: 'Product description generated successfully!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        // Scroll to the bottom of the chat
        setTimeout(() => {
          chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (error) {
      console.error('❌ Generate description error:', error);
      
      toast({
        title: 'Generation Failed',
        description: error.response?.data?.message || 'Failed to generate description. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate product title
  const generateTitle = async () => {
    try {
      setIsLoading(true);
      setGeneratedTitles([]);
      setContentMetadata(null);
      
      // Call title generation service
      const result = await contentService.generateTitle(productData, {
        style: options.style
      });
      
      if (result.success) {
        // Parse the numbered list of titles
        const titlesText = result.data.content;
        const titleMatches = titlesText.match(/\d+\.\s+(.*)/g);
        
        if (titleMatches && titleMatches.length > 0) {
          const parsedTitles = titleMatches.map(match => 
            match.replace(/^\d+\.\s+/, '').trim()
          );
          setGeneratedTitles(parsedTitles);
        } else {
          // Fallback if parsing fails
          setGeneratedTitles([titlesText]);
        }
        
        setContentMetadata(result.data.metadata);
        
        toast({
          title: 'Success',
          description: 'Product titles generated successfully!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('❌ Generate title error:', error);
      
      toast({
        title: 'Generation Failed',
        description: error.response?.data?.message || 'Failed to generate titles. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Save generated content
  const saveContent = async (contentType, text) => {
    try {
      // Prepare content data
      const contentData = {
        title: productData.productName,
        contentType: contentType,
        originalInput: productData,
        generationParameters: options,
        generatedContent: {
          text: text
        },
        metadata: contentMetadata
      };
      
      // Call save content service
      const result = await contentService.saveContent(contentData);
      
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Content saved successfully!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('❌ Save content error:', error);
      
      toast({
        title: 'Save Failed',
        description: error.response?.data?.message || 'Failed to save content. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Generate alternative content
  const generateAlternative = async () => {
    if (!generatedContent || conversation.length === 0) {
      toast({
        title: 'No Content',
        description: 'Generate content first before creating alternatives.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    if (!feedbackText.trim()) {
      toast({
        title: 'Feedback Required',
        description: 'Please provide feedback to generate an alternative.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Add user feedback to conversation immediately for better UX
      const userFeedbackMessage = {
        id: Date.now(),
        type: 'user',
        content: feedbackText,
        timestamp: new Date().toISOString()
      };
      
      setConversation(prev => [...prev, userFeedbackMessage]);
      
      // Get authentication session
      const { data: { session } } = await supabase.auth.getSession();
        
      if (!session) {
        throw new Error('No active session');
      }

      // Call OpenAI directly for unsaved content
      const response = await axios.post(
        '/api/content/ai/alternatives', 
        {
          originalContent: generatedContent,
          feedback: feedbackText
        },
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data) {
        // Update the latest content
        const cleanedText = cleanGeneratedText(response.data.text);
        setGeneratedContent(cleanedText);
        setContentMetadata(response.data.metadata);
        
        // Increment alternative count
        const newCount = alternativeCount + 1;
        setAlternativeCount(newCount);
        
        // Add AI response to conversation
        const aiResponseMessage = {
          id: Date.now() + 1,
          type: 'system',
          content: cleanedText,
          timestamp: new Date().toISOString(),
          metadata: response.data.metadata,
          label: `Alternative ${newCount}`
        };
        
        setConversation(prev => [...prev, aiResponseMessage]);
        
        // Clear feedback input
        setFeedbackText('');
        
        toast({
          title: 'Success',
          description: 'Alternative content generated successfully!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        // Scroll to the bottom of the chat
        setTimeout(() => {
          chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (error) {
      console.error('❌ Generate alternative error:', error);
      
      toast({
        title: 'Generation Failed',
        description: error.response?.data?.message || 'Failed to generate alternative. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle feedback input changes
  const handleFeedbackChange = (e) => {
    setFeedbackText(e.target.value);
  };
  
  // Handle feedback submission
  const handleSendFeedback = (e) => {
    e.preventDefault();
    if (feedbackText.trim()) {
      generateAlternative();
    }
  };
  
  // Handle selecting a specific alternative as the current content
  const selectAlternative = (content) => {
    setGeneratedContent(content);
    toast({
      title: 'Alternative Selected',
      description: 'This version is now the current content.',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };
  
  return (
    <Box>
      <Tabs variant="enclosed" colorScheme="blue">
        <TabList>
          <Tab>Product Information</Tab>
          <Tab>Generated Content</Tab>
        </TabList>
        
        <TabPanels>
          {/* Product Information Tab */}
          <TabPanel>
            <Box 
              bg="white" 
              p={5} 
              borderRadius="md" 
              boxShadow="sm"
            >
              <Heading size="md" mb={4}>Product Details</Heading>
              
              <VStack spacing={4} align="stretch">
                {/* Basic Product Information */}
                <FormControl>
                  <FormLabel>Product name (if any)</FormLabel>
                  <Input
                    name="productName"
                    value={productData.productName}
                    onChange={handleInputChange}
                    placeholder="Enter product name"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Product image (if any)</FormLabel>
                  <Input
                    type="file"
                    name="productImage"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={handleFileChange}
                    padding="1"
                  />
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Supported formats: PDF, JPG, JPEG, PNG, WEBP
                  </Text>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Product Category</FormLabel>
                  <Input
                    name="productCategory"
                    value={productData.productCategory}
                    onChange={handleInputChange}
                    placeholder="e.g., Electronics, Home Goods, Clothing"
                  />
                </FormControl>
                
                {/* Product Features */}
                <FormControl>
                  <FormLabel>Product Features</FormLabel>
                  <HStack mb={2}>
                    <Input
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      placeholder="Add a product feature"
                      onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                    />
                    <Button onClick={addFeature}>Add</Button>
                  </HStack>
                  
                  <HStack spacing={2} flexWrap="wrap">
                    {productData.productFeatures.map((feature, index) => (
                      <Tag
                        key={index}
                        size="md"
                        borderRadius="full"
                        variant="solid"
                        colorScheme="blue"
                        m={1}
                      >
                        <TagLabel>{feature}</TagLabel>
                        <TagCloseButton onClick={() => removeFeature(feature)} />
                      </Tag>
                    ))}
                  </HStack>
                </FormControl>
                
                {/* Keywords */}
                <FormControl>
                  <FormLabel>Keywords</FormLabel>
                  <HStack mb={2}>
                    <Input
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      placeholder="Add a keyword"
                      onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                    />
                    <Button onClick={addKeyword}>Add</Button>
                  </HStack>
                  
                  <HStack spacing={2} flexWrap="wrap">
                    {productData.keywords.map((keyword, index) => (
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
                </FormControl>
                
                <FormControl>
                  <FormLabel>Additional Information</FormLabel>
                  <Textarea
                    name="additionalInfo"
                    value={productData.additionalInfo}
                    onChange={handleInputChange}
                    placeholder="Any other details you'd like to include"
                    rows={3}
                  />
                </FormControl>
                
                <Divider my={4} />
                
                <Heading size="md" mb={4}>Generation Options</Heading>
                
                <FormControl display="flex" alignItems="center" mb={4}>
                  <FormLabel htmlFor="use-brand-voice" mb="0">
                    Use Brand Voice
                  </FormLabel>
                  <Switch 
                    id="use-brand-voice" 
                    isChecked={useBrandVoice} 
                    onChange={handleUseBrandVoiceChange}
                    colorScheme="blue"
                  />
                </FormControl>
                
                {useBrandVoice ? (
                  <FormControl mb={4}>
                    <FormLabel>Brand Voice</FormLabel>
                    {loadingBrandVoices ? (
                      <Spinner size="sm" />
                    ) : brandVoices.length > 0 ? (
                      <Select 
                        value={selectedBrandVoice} 
                        onChange={handleBrandVoiceChange}
                        placeholder="Select a brand voice"
                      >
                        {brandVoices.map(voice => (
                          <option key={voice.id} value={voice.id}>
                            {voice.name} {voice.is_default && '(Default)'}
                          </option>
                        ))}
                      </Select>
                    ) : (
                      <Flex alignItems="center">
                        <Text color="gray.500" mr={2}>No brand voices found.</Text>
                        <Button 
                          size="sm" 
                          colorScheme="blue" 
                          variant="link"
                          onClick={() => window.location.href = '/brand-voice/create'}
                        >
                          Create one
                        </Button>
                      </Flex>
                    )}
                  </FormControl>
                ) : (
                  <>
                    <FormControl>
                      <FormLabel>Tone</FormLabel>
                      <Select name="tone" value={options.tone} onChange={handleOptionsChange}>
                        <option value="professional">Professional</option>
                        <option value="friendly">Friendly</option>
                        <option value="luxury">Luxury</option>
                        <option value="technical">Technical</option>
                        <option value="casual">Casual</option>
                        <option value="persuasive">Persuasive</option>
                      </Select>
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Style</FormLabel>
                      <Select name="style" value={options.style} onChange={handleOptionsChange}>
                        <option value="balanced">Balanced</option>
                        <option value="benefit-focused">Benefit-Focused</option>
                        <option value="feature-focused">Feature-Focused</option>
                        <option value="emotional">Emotional</option>
                        <option value="minimalist">Minimalist</option>
                      </Select>
                    </FormControl>
                  </>
                )}
                
                <FormControl>
                  <FormLabel>Length</FormLabel>
                  <Select name="length" value={options.length} onChange={handleOptionsChange}>
                    <option value="short">Short</option>
                    <option value="medium">Medium</option>
                    <option value="long">Long</option>
                    <option value="very-long">Very Long</option>
                  </Select>
                </FormControl>
                
                <Flex gap={4} mt={4}>
                  <Button
                    colorScheme="blue"
                    size="lg"
                    onClick={generateDescription}
                    isLoading={isLoading}
                    loadingText="Generating..."
                    flex={1}
                  >
                    Generate Description
                  </Button>
                  
                  <Button
                    colorScheme="purple"
                    size="lg"
                    onClick={generateTitle}
                    isLoading={isLoading}
                    loadingText="Generating..."
                    flex={1}
                  >
                    Generate Titles
                  </Button>
                </Flex>
              </VStack>
            </Box>
          </TabPanel>
          
          {/* Generated Content Tab */}
          <TabPanel>
            <Box 
              bg="white" 
              p={5} 
              borderRadius="md" 
              boxShadow="sm"
            >
              <Tabs size="sm" variant="soft-rounded" colorScheme="green">
                <TabList>
                  <Tab>Description</Tab>
                  <Tab>Titles</Tab>
                </TabList>
                
                <TabPanels>
                  {/* Description Tab */}
                  <TabPanel>
                    <Box mb={4}>
                      <Heading size="md" mb={2}>Product Description</Heading>
                      
                      {isLoading && conversation.length === 0 ? (
                        <Flex justify="center" align="center" direction="column" py={10}>
                          <Spinner size="xl" color="blue.500" mb={4} />
                          <Text>Generating your content...</Text>
                        </Flex>
                      ) : conversation.length > 0 ? (
                        <>
                          {/* Chat messages container */}
                          <Box
                            borderWidth="1px"
                            borderRadius="md"
                            height="500px"
                            overflow="auto"
                            mb={4}
                            p={4}
                          >
                            <VStack spacing={4} align="stretch">
                              {conversation.map((message) => (
                                <Box
                                  key={message.id}
                                  alignSelf={message.type === 'user' ? 'flex-end' : 'flex-start'}
                                  maxWidth="80%"
                                  position="relative"
                                >
                                  {message.type === 'system' && message.label && (
                                    <Badge 
                                      colorScheme="blue" 
                                      position="absolute" 
                                      top="-8px" 
                                      left="45px"
                                      zIndex={1}
                                    >
                                      {message.label}
                                    </Badge>
                                  )}
                                  
                                  <Flex
                                    direction="row"
                                    alignItems="start"
                                  >
                                    {message.type === 'system' && (
                                      <Avatar 
                                        size="sm" 
                                        name="AI Assistant" 
                                        bg="blue.500" 
                                        color="white"
                                        mr={2}
                                      />
                                    )}
                                    
                                    <Box
                                      bg={message.type === 'user' ? 'blue.500' : 'gray.100'}
                                      color={message.type === 'user' ? 'white' : 'black'}
                                      borderRadius={message.type === 'user' ? 'lg lg lg 0' : '0 lg lg lg'}
                                      px={4}
                                      py={3}
                                      position="relative"
                                      whiteSpace="pre-line"
                                      boxShadow="sm"
                                    >
                                      {message.content}
                                      
                                      <Text
                                        fontSize="xs"
                                        color={message.type === 'user' ? 'blue.100' : 'gray.500'}
                                        mt={1}
                                      >
                                        {new Date(message.timestamp).toLocaleTimeString()}
                                      </Text>
                                      
                                      {message.type === 'system' && (
                                        <Tooltip 
                                          label="Select this version as the current working content" 
                                          placement="top"
                                        >
                                          <Button
                                            size="xs"
                                            colorScheme="teal"
                                            leftIcon={<CheckIcon />}
                                            mt={2}
                                            onClick={() => selectAlternative(message.content)}
                                          >
                                            Select as Current
                                          </Button>
                                        </Tooltip>
                                      )}
                                    </Box>
                                    
                                    {message.type === 'user' && (
                                      <Avatar 
                                        size="sm" 
                                        name={user?.email || 'User'} 
                                        ml={2}
                                      />
                                    )}
                                  </Flex>
                                  
                                  {message.type === 'system' && message.metadata && (
                                    <Text 
                                      fontSize="xs" 
                                      color="gray.500" 
                                      mt={1} 
                                      ml={10}
                                    >
                                      Model: {message.metadata.modelUsed} | 
                                      Tokens: {message.metadata.tokensUsed} | 
                                      Time: {message.metadata.generationTime}ms
                                    </Text>
                                  )}
                                </Box>
                              ))}
                              
                              {/* Loading indicator for new message */}
                              {isLoading && conversation.length > 0 && (
                                <Box alignSelf="flex-start" maxWidth="80%" ml={10}>
                                  <Flex 
                                    alignItems="center" 
                                    bg="gray.50" 
                                    p={2} 
                                    borderRadius="md"
                                  >
                                    <Spinner size="sm" mr={2} color="blue.500" />
                                    <Text fontSize="sm">AI is writing...</Text>
                                  </Flex>
                                </Box>
                              )}
                              
                              {/* Reference for scrolling to bottom */}
                              <div ref={chatEndRef} />
                            </VStack>
                          </Box>
                          
                          {/* Feedback input and controls */}
                          <Box>
                            <HStack spacing={4} mb={4}>
                              <Button
                                colorScheme="blue"
                                onClick={() => saveContent('product-description', generatedContent)}
                                leftIcon={<DownloadIcon />}
                              >
                                Save to Library
                              </Button>
                              <Text fontSize="sm" color="gray.500">
                                Save the current version to your content library
                              </Text>
                            </HStack>
                            
                            <form onSubmit={handleSendFeedback}>
                              <Flex>
                                <Tooltip 
                                  label="Describe how you want the content to be changed" 
                                  placement="top"
                                  hasArrow
                                >
                                  <Textarea
                                    value={feedbackText}
                                    onChange={handleFeedbackChange}
                                    placeholder="Provide feedback to generate an alternative version..."
                                    resize="none"
                                    height="40px"
                                    minHeight="40px"
                                    pt="8px"
                                    mr={2}
                                    disabled={isLoading}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' && e.ctrlKey) {
                                        e.preventDefault();
                                        handleSendFeedback(e);
                                      }
                                    }}
                                  />
                                </Tooltip>
                                
                                <Button
                                  type="submit"
                                  colorScheme="blue"
                                  isLoading={isLoading}
                                  loadingText="Generating..."
                                  alignSelf="flex-end"
                                  height="40px"
                                >
                                  Generate Alternative
                                </Button>
                              </Flex>
                              <Text fontSize="xs" color="gray.500" mt={1}>
                                Press Ctrl+Enter to send feedback and generate alternative.
                              </Text>
                              
                              <Box mt={2}>
                                <Text fontSize="xs" color="gray.500" fontWeight="medium">Examples of effective feedback:</Text>
                                <HStack mt={1} spacing={2} flexWrap="wrap">
                                  {['Make it more concise', 'Add more emotional appeal', 'Emphasize benefits more', 'Use simpler language', 'Make it more persuasive'].map(example => (
                                    <Tag 
                                      key={example} 
                                      size="sm" 
                                      colorScheme="blue" 
                                      variant="outline"
                                      cursor="pointer"
                                      onClick={() => setFeedbackText(example)}
                                    >
                                      {example}
                                    </Tag>
                                  ))}
                                </HStack>
                              </Box>
                            </form>
                          </Box>
                        </>
                      ) : (
                        <Box
                          p={6}
                          borderWidth="1px"
                          borderRadius="md"
                          borderStyle="dashed"
                          textAlign="center"
                        >
                          <Text color="gray.500">
                            Fill out the product information and click "Generate Description" to create content.
                          </Text>
                        </Box>
                      )}
                    </Box>
                  </TabPanel>
                  
                  {/* Titles Tab */}
                  <TabPanel>
                    <Box mb={4}>
                      <Heading size="md" mb={2}>Product Titles</Heading>
                      
                      {isLoading ? (
                        <Flex justify="center" align="center" direction="column" py={10}>
                          <Spinner size="xl" color="blue.500" mb={4} />
                          <Text>Generating your titles...</Text>
                        </Flex>
                      ) : generatedTitles.length > 0 ? (
                        <>
                          <VStack spacing={3} align="stretch" mb={4}>
                            {generatedTitles.map((title, index) => (
                              <Box
                                key={index}
                                p={3}
                                borderWidth="1px"
                                borderRadius="md"
                                position="relative"
                              >
                                <Text fontWeight="medium">{title}</Text>
                                <Button
                                  size="xs"
                                  colorScheme="blue"
                                  position="absolute"
                                  right={2}
                                  top={2}
                                  onClick={() => saveContent('product-title', title)}
                                >
                                  Save
                                </Button>
                              </Box>
                            ))}
                          </VStack>
                          
                          <Button
                            colorScheme="gray"
                            onClick={generateTitle}
                          >
                            Generate More Titles
                          </Button>
                          
                          {contentMetadata && (
                            <Accordion allowToggle mt={4}>
                              <AccordionItem>
                                <h2>
                                  <AccordionButton>
                                    <Box flex="1" textAlign="left">
                                      Generation Metadata
                                    </Box>
                                    <AccordionIcon />
                                  </AccordionButton>
                                </h2>
                                <AccordionPanel pb={4}>
                                  <Text fontSize="sm">Model: {contentMetadata.modelUsed}</Text>
                                  <Text fontSize="sm">Tokens Used: {contentMetadata.tokensUsed}</Text>
                                  <Text fontSize="sm">Generation Time: {contentMetadata.generationTime}ms</Text>
                                </AccordionPanel>
                              </AccordionItem>
                            </Accordion>
                          )}
                        </>
                      ) : (
                        <Box
                          p={6}
                          borderWidth="1px"
                          borderRadius="md"
                          borderStyle="dashed"
                          textAlign="center"
                        >
                          <Text color="gray.500">
                            Fill out the product information and click "Generate Titles" to create title options.
                          </Text>
                        </Box>
                      )}
                    </Box>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default ContentGenerator;