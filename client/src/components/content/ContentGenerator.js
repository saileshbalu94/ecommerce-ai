import React, { useState, useEffect } from 'react';
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
  AccordionIcon
} from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';
import contentService from '../../services/content.service';

/**
 * ContentGenerator - Form for generating product descriptions and titles
 */
const ContentGenerator = () => {
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  
  // Form state
  const [productData, setProductData] = useState({
    productName: '',
    productCategory: '',
    productFeatures: [],
    targetAudience: '',
    keywords: [],
    additionalInfo: ''
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
  
  // Generate product description
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
    
    // Validate form
    if (!productData.productName) {
      toast({
        title: 'Required Field Missing',
        description: 'Product name is required.',
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
      
      // Call content generation service
      const result = await contentService.generateDescription(productData, options);
      
      if (result.success) {
        setGeneratedContent(result.data.content);
        setContentMetadata(result.data.metadata);
        
        toast({
          title: 'Success',
          description: 'Product description generated successfully!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
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
    // Validate form
    if (!productData.productName) {
      toast({
        title: 'Required Field Missing',
        description: 'Product name is required.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
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
    if (!generatedContent) {
      toast({
        title: 'No Content',
        description: 'Generate content first before creating alternatives.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Call alternatives generation service
      const result = await contentService.generateAlternatives(
        generatedContent,
        `Make it more ${options.tone} with a ${options.style} style.`
      );
      
      if (result.success) {
        setGeneratedContent(result.data.content);
        setContentMetadata(result.data.metadata);
        
        toast({
          title: 'Success',
          description: 'Alternative content generated successfully!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
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
                <FormControl isRequired>
                  <FormLabel>Product Name</FormLabel>
                  <Input
                    name="productName"
                    value={productData.productName}
                    onChange={handleInputChange}
                    placeholder="Enter product name"
                  />
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
                
                <FormControl>
                  <FormLabel>Target Audience</FormLabel>
                  <Input
                    name="targetAudience"
                    value={productData.targetAudience}
                    onChange={handleInputChange}
                    placeholder="Who is this product for?"
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
                      
                      {isLoading ? (
                        <Flex justify="center" align="center" direction="column" py={10}>
                          <Spinner size="xl" color="blue.500" mb={4} />
                          <Text>Generating your content...</Text>
                        </Flex>
                      ) : generatedContent ? (
                        <>
                          <Box
                            p={4}
                            borderWidth="1px"
                            borderRadius="md"
                            mb={4}
                            whiteSpace="pre-line"
                          >
                            {generatedContent}
                          </Box>
                          
                          <HStack spacing={4}>
                            <Button
                              colorScheme="blue"
                              onClick={() => saveContent('product-description', generatedContent)}
                            >
                              Save Description
                            </Button>
                            
                            <Button
                              colorScheme="gray"
                              onClick={generateAlternative}
                            >
                              Generate Alternative
                            </Button>
                          </HStack>
                          
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