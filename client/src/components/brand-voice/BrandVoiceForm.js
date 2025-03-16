import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Switch,
  Stack,
  Heading,
  Divider,
  SimpleGrid,
  Flex,
  Text,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useToast,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Tag,
  TagLabel,
  TagCloseButton,
  HStack,
  IconButton,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';

const BrandVoiceForm = ({ initialData = {}, onSubmit, isEditing = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    is_default: false,
    brand_identity: {
      brandName: '',
      tagline: '',
      mission: '',
      values: [],
      industryCategory: '',
      targetMarket: [],
      competitivePosition: ''
    },
    tone: {
      primary: '',
      secondary: '',
      formality: 5,
      emotion: 5
    },
    style: {
      type: '',
      humorLevel: 5
    },
    language: {
      locale: '',
      spelling: '',
      useOfEmojis: false,
      useOfSymbols: false,
      useOfHashtags: false,
      useOfAbbreviations: false,
      dateFormat: '',
      currencyFormat: ''
    },
    content_structure: {
      productTitles: {
        format: '',
        maxLength: 0,
        keyAttributes: []
      },
      productDescriptions: {
        format: '',
        preferredLength: '',
        keyElements: [],
        callToAction: ''
      }
    },
    vocabulary: {
      keyPhrases: [],
      powerWords: [],
      avoidWords: []
    },
    ...initialData
  });

  // Separate state variables for different array inputs
  const [coreValueInput, setCoreValueInput] = useState('');
  const [targetMarketInput, setTargetMarketInput] = useState('');
  const [keyPhraseInput, setKeyPhraseInput] = useState('');
  const [powerWordInput, setPowerWordInput] = useState('');
  const [avoidWordInput, setAvoidWordInput] = useState('');
  
  const toast = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData({
        ...formData,
        [section]: {
          ...formData[section],
          [field]: type === 'checkbox' ? checked : value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  const handleNestedChange = (section, subsection, field, value) => {
    setFormData({
      ...formData,
      [section]: {
        ...formData[section],
        [subsection]: {
          ...formData[section]?.[subsection],
          [field]: value
        }
      }
    });
  };

  const handleNumberChange = (name, value) => {
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData({
        ...formData,
        [section]: {
          ...formData[section],
          [field]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSliderChange = (name, value) => {
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData({
        ...formData,
        [section]: {
          ...formData[section],
          [field]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleCoreValueAdd = () => {
    if (!coreValueInput.trim()) return;
    
    setFormData({
      ...formData,
      brand_identity: {
        ...formData.brand_identity,
        values: [...(formData.brand_identity?.values || []), coreValueInput.trim()]
      }
    });
    
    setCoreValueInput('');
  };

  const handleTargetMarketAdd = () => {
    if (!targetMarketInput.trim()) return;
    
    setFormData({
      ...formData,
      brand_identity: {
        ...formData.brand_identity,
        targetMarket: [...(formData.brand_identity?.targetMarket || []), targetMarketInput.trim()]
      }
    });
    
    setTargetMarketInput('');
  };

  const handleKeyPhraseAdd = () => {
    if (!keyPhraseInput.trim()) return;
    
    setFormData({
      ...formData,
      vocabulary: {
        ...formData.vocabulary,
        keyPhrases: [...(formData.vocabulary?.keyPhrases || []), keyPhraseInput.trim()]
      }
    });
    
    setKeyPhraseInput('');
  };

  const handlePowerWordAdd = () => {
    if (!powerWordInput.trim()) return;
    
    setFormData({
      ...formData,
      vocabulary: {
        ...formData.vocabulary,
        powerWords: [...(formData.vocabulary?.powerWords || []), powerWordInput.trim()]
      }
    });
    
    setPowerWordInput('');
  };

  const handleAvoidWordAdd = () => {
    if (!avoidWordInput.trim()) return;
    
    setFormData({
      ...formData,
      vocabulary: {
        ...formData.vocabulary,
        avoidWords: [...(formData.vocabulary?.avoidWords || []), avoidWordInput.trim()]
      }
    });
    
    setAvoidWordInput('');
  };

  const handleArrayRemove = (section, field, index) => {
    if (field) {
      const newArray = [...formData[section][field]];
      newArray.splice(index, 1);
      
      setFormData({
        ...formData,
        [section]: {
          ...formData[section],
          [field]: newArray
        }
      });
    } else {
      const newArray = [...formData[section]];
      newArray.splice(index, 1);
      
      setFormData({
        ...formData,
        [section]: newArray
      });
    }
  };

  const handleNestedArrayRemove = (section, subsection, field, index) => {
    const newArray = [...formData[section][subsection][field]];
    newArray.splice(index, 1);
    
    setFormData({
      ...formData,
      [section]: {
        ...formData[section],
        [subsection]: {
          ...formData[section][subsection],
          [field]: newArray
        }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await onSubmit(formData);
      toast({
        title: `Brand voice ${isEditing ? 'updated' : 'created'} successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/brand-voice');
    } catch (error) {
      toast({
        title: `Error ${isEditing ? 'updating' : 'creating'} brand voice`,
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleCancel = () => {
    navigate('/brand-voice');
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <Stack spacing={6}>
        <Box>
          <Heading size="md" mb={4}>Basic Information</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl isRequired>
              <FormLabel>Brand Voice Name</FormLabel>
              <Input 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="E.g., Professional Tech Voice"
              />
            </FormControl>
            
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="is_default" mb="0">
                Set as Default
              </FormLabel>
              <Switch 
                id="is_default" 
                name="is_default" 
                isChecked={formData.is_default} 
                onChange={handleChange} 
              />
            </FormControl>
          </SimpleGrid>
        </Box>

        <Divider />

        <Accordion allowMultiple defaultIndex={[0]}>
          {/* Brand Identity Section */}
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <Heading size="md">Brand Identity</Heading>
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <Stack spacing={4}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel>Brand Name</FormLabel>
                    <Input 
                      name="brand_identity.brandName" 
                      value={formData.brand_identity?.brandName || ''} 
                      onChange={handleChange} 
                      placeholder="Your brand name"
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Tagline/Slogan</FormLabel>
                    <Input 
                      name="brand_identity.tagline" 
                      value={formData.brand_identity?.tagline || ''} 
                      onChange={handleChange} 
                      placeholder="Your brand tagline"
                    />
                  </FormControl>
                </SimpleGrid>
                
                <FormControl>
                  <FormLabel>Mission Statement</FormLabel>
                  <Textarea 
                    name="brand_identity.mission" 
                    value={formData.brand_identity?.mission || ''} 
                    onChange={handleChange} 
                    placeholder="Your brand mission"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Industry/Category</FormLabel>
                  <Input 
                    name="brand_identity.industryCategory" 
                    value={formData.brand_identity?.industryCategory || ''} 
                    onChange={handleChange} 
                    placeholder="E.g., Fashion, Technology, Health"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Competitive Position</FormLabel>
                  <Input 
                    name="brand_identity.competitivePosition" 
                    value={formData.brand_identity?.competitivePosition || ''} 
                    onChange={handleChange} 
                    placeholder="How your brand positions against competitors"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Core Values</FormLabel>
                  <Flex mb={2}>
                    <Input 
                      value={coreValueInput} 
                      onChange={(e) => setCoreValueInput(e.target.value)} 
                      placeholder="Add a core value"
                      mr={2}
                      onKeyPress={(e) => e.key === 'Enter' && handleCoreValueAdd()}
                    />
                    <Button 
                      onClick={handleCoreValueAdd}
                      leftIcon={<AddIcon />}
                    >
                      Add
                    </Button>
                  </Flex>
                  <HStack spacing={2} flexWrap="wrap">
                    {formData.brand_identity?.values?.map((value, index) => (
                      <Tag key={index} size="md" borderRadius="full" variant="solid" colorScheme="blue" my={1}>
                        <TagLabel>{value}</TagLabel>
                        <TagCloseButton onClick={() => handleArrayRemove('brand_identity', 'values', index)} />
                      </Tag>
                    ))}
                  </HStack>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Target Market</FormLabel>
                  <Flex mb={2}>
                    <Input 
                      value={targetMarketInput} 
                      onChange={(e) => setTargetMarketInput(e.target.value)} 
                      placeholder="Add a target market segment"
                      mr={2}
                      onKeyPress={(e) => e.key === 'Enter' && handleTargetMarketAdd()}
                    />
                    <Button 
                      onClick={handleTargetMarketAdd}
                      leftIcon={<AddIcon />}
                    >
                      Add
                    </Button>
                  </Flex>
                  <HStack spacing={2} flexWrap="wrap">
                    {formData.brand_identity?.targetMarket?.map((market, index) => (
                      <Tag key={index} size="md" borderRadius="full" variant="solid" colorScheme="green" my={1}>
                        <TagLabel>{market}</TagLabel>
                        <TagCloseButton onClick={() => handleArrayRemove('brand_identity', 'targetMarket', index)} />
                      </Tag>
                    ))}
                  </HStack>
                </FormControl>
              </Stack>
            </AccordionPanel>
          </AccordionItem>

          {/* Tone & Style Section */}
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <Heading size="md">Tone & Style</Heading>
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <Stack spacing={4}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel>Primary Tone</FormLabel>
                    <Select 
                      name="tone.primary" 
                      value={formData.tone?.primary || ''} 
                      onChange={handleChange}
                      placeholder="Select primary tone"
                    >
                      <option value="professional">Professional</option>
                      <option value="friendly">Friendly</option>
                      <option value="casual">Casual</option>
                      <option value="formal">Formal</option>
                      <option value="enthusiastic">Enthusiastic</option>
                      <option value="authoritative">Authoritative</option>
                      <option value="technical">Technical</option>
                      <option value="conversational">Conversational</option>
                      <option value="luxury">Luxury</option>
                      <option value="persuasive">Persuasive</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Secondary Tone</FormLabel>
                    <Select 
                      name="tone.secondary" 
                      value={formData.tone?.secondary || ''} 
                      onChange={handleChange}
                      placeholder="Select secondary tone"
                    >
                      <option value="professional">Professional</option>
                      <option value="friendly">Friendly</option>
                      <option value="casual">Casual</option>
                      <option value="formal">Formal</option>
                      <option value="enthusiastic">Enthusiastic</option>
                      <option value="authoritative">Authoritative</option>
                      <option value="technical">Technical</option>
                      <option value="conversational">Conversational</option>
                      <option value="luxury">Luxury</option>
                      <option value="persuasive">Persuasive</option>
                    </Select>
                  </FormControl>
                </SimpleGrid>
                
                <FormControl>
                  <FormLabel>Formality Level (1-10)</FormLabel>
                  <Flex align="center">
                    <Text mr={2}>Casual</Text>
                    <Slider
                      min={1}
                      max={10}
                      step={1}
                      value={formData.tone?.formality || 5}
                      onChange={(value) => handleSliderChange('tone.formality', value)}
                      flex="1"
                      colorScheme="blue"
                    >
                      <SliderTrack>
                        <SliderFilledTrack />
                      </SliderTrack>
                      <SliderThumb boxSize={6} />
                    </Slider>
                    <Text ml={2}>Formal</Text>
                    <Text ml={4} fontWeight="bold">{formData.tone?.formality || 5}</Text>
                  </Flex>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Emotional Level (1-10)</FormLabel>
                  <Flex align="center">
                    <Text mr={2}>Neutral</Text>
                    <Slider
                      min={1}
                      max={10}
                      step={1}
                      value={formData.tone?.emotion || 5}
                      onChange={(value) => handleSliderChange('tone.emotion', value)}
                      flex="1"
                      colorScheme="blue"
                    >
                      <SliderTrack>
                        <SliderFilledTrack />
                      </SliderTrack>
                      <SliderThumb boxSize={6} />
                    </Slider>
                    <Text ml={2}>Emotive</Text>
                    <Text ml={4} fontWeight="bold">{formData.tone?.emotion || 5}</Text>
                  </Flex>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Writing Style</FormLabel>
                  <Select 
                    name="style.type" 
                    value={formData.style?.type || ''} 
                    onChange={handleChange}
                    placeholder="Select writing style"
                  >
                    <option value="minimalist">Minimalist</option>
                    <option value="detailed">Detailed</option>
                    <option value="benefit-focused">Benefit-focused</option>
                    <option value="feature-focused">Feature-focused</option>
                    <option value="storytelling">Storytelling</option>
                    <option value="direct">Direct</option>
                    <option value="educational">Educational</option>
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Humor Level (1-10)</FormLabel>
                  <Flex align="center">
                    <Text mr={2}>Serious</Text>
                    <Slider
                      min={1}
                      max={10}
                      step={1}
                      value={formData.style?.humorLevel || 5}
                      onChange={(value) => handleSliderChange('style.humorLevel', value)}
                      flex="1"
                      colorScheme="blue"
                    >
                      <SliderTrack>
                        <SliderFilledTrack />
                      </SliderTrack>
                      <SliderThumb boxSize={6} />
                    </Slider>
                    <Text ml={2}>Humorous</Text>
                    <Text ml={4} fontWeight="bold">{formData.style?.humorLevel || 5}</Text>
                  </Flex>
                </FormControl>
              </Stack>
            </AccordionPanel>
          </AccordionItem>

          {/* Language Preferences Section */}
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <Heading size="md">Language Preferences</Heading>
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <Stack spacing={4}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel>Locale</FormLabel>
                    <Select 
                      name="language.locale" 
                      value={formData.language?.locale || ''} 
                      onChange={handleChange}
                      placeholder="Select locale"
                    >
                      <option value="en-US">English (US)</option>
                      <option value="en-UK">English (UK)</option>
                      <option value="en-AU">English (Australia)</option>
                      <option value="en-CA">English (Canada)</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Spelling Convention</FormLabel>
                    <Select 
                      name="language.spelling" 
                      value={formData.language?.spelling || ''} 
                      onChange={handleChange}
                      placeholder="Select spelling convention"
                    >
                      <option value="American">American</option>
                      <option value="British">British</option>
                      <option value="Australian">Australian</option>
                      <option value="Canadian">Canadian</option>
                    </Select>
                  </FormControl>
                </SimpleGrid>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="useOfEmojis" mb="0">
                      Use Emojis
                    </FormLabel>
                    <Switch 
                      id="useOfEmojis" 
                      name="language.useOfEmojis" 
                      isChecked={formData.language?.useOfEmojis || false} 
                      onChange={handleChange} 
                    />
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="useOfSymbols" mb="0">
                      Use Symbols (™, ®, etc.)
                    </FormLabel>
                    <Switch 
                      id="useOfSymbols" 
                      name="language.useOfSymbols" 
                      isChecked={formData.language?.useOfSymbols || false} 
                      onChange={handleChange} 
                    />
                  </FormControl>
                </SimpleGrid>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="useOfHashtags" mb="0">
                      Use Hashtags
                    </FormLabel>
                    <Switch 
                      id="useOfHashtags" 
                      name="language.useOfHashtags" 
                      isChecked={formData.language?.useOfHashtags || false} 
                      onChange={handleChange} 
                    />
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="useOfAbbreviations" mb="0">
                      Use Abbreviations
                    </FormLabel>
                    <Switch 
                      id="useOfAbbreviations" 
                      name="language.useOfAbbreviations" 
                      isChecked={formData.language?.useOfAbbreviations || false} 
                      onChange={handleChange} 
                    />
                  </FormControl>
                </SimpleGrid>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel>Date Format</FormLabel>
                    <Input 
                      name="language.dateFormat" 
                      value={formData.language?.dateFormat || ''} 
                      onChange={handleChange} 
                      placeholder="E.g., MM/DD/YYYY"
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Currency Format</FormLabel>
                    <Input 
                      name="language.currencyFormat" 
                      value={formData.language?.currencyFormat || ''} 
                      onChange={handleChange} 
                      placeholder="E.g., $X.XX"
                    />
                  </FormControl>
                </SimpleGrid>
              </Stack>
            </AccordionPanel>
          </AccordionItem>

          {/* Vocabulary Section */}
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <Heading size="md">Vocabulary</Heading>
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <Stack spacing={4}>
                <FormControl>
                  <FormLabel>Key Phrases</FormLabel>
                  <Flex mb={2}>
                    <Input 
                      value={keyPhraseInput} 
                      onChange={(e) => setKeyPhraseInput(e.target.value)} 
                      placeholder="Add a key phrase"
                      mr={2}
                      onKeyPress={(e) => e.key === 'Enter' && handleKeyPhraseAdd()}
                    />
                    <Button 
                      onClick={handleKeyPhraseAdd}
                      leftIcon={<AddIcon />}
                    >
                      Add
                    </Button>
                  </Flex>
                  <HStack spacing={2} flexWrap="wrap">
                    {formData.vocabulary?.keyPhrases?.map((phrase, index) => (
                      <Tag key={index} size="md" borderRadius="full" variant="solid" colorScheme="blue" my={1}>
                        <TagLabel>{phrase}</TagLabel>
                        <TagCloseButton onClick={() => handleArrayRemove('vocabulary', 'keyPhrases', index)} />
                      </Tag>
                    ))}
                  </HStack>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Power Words</FormLabel>
                  <Flex mb={2}>
                    <Input 
                      value={powerWordInput} 
                      onChange={(e) => setPowerWordInput(e.target.value)} 
                      placeholder="Add a power word"
                      mr={2}
                      onKeyPress={(e) => e.key === 'Enter' && handlePowerWordAdd()}
                    />
                    <Button 
                      onClick={handlePowerWordAdd}
                      leftIcon={<AddIcon />}
                    >
                      Add
                    </Button>
                  </Flex>
                  <HStack spacing={2} flexWrap="wrap">
                    {formData.vocabulary?.powerWords?.map((word, index) => (
                      <Tag key={index} size="md" borderRadius="full" variant="solid" colorScheme="green" my={1}>
                        <TagLabel>{word}</TagLabel>
                        <TagCloseButton onClick={() => handleArrayRemove('vocabulary', 'powerWords', index)} />
                      </Tag>
                    ))}
                  </HStack>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Words to Avoid</FormLabel>
                  <Flex mb={2}>
                    <Input 
                      value={avoidWordInput} 
                      onChange={(e) => setAvoidWordInput(e.target.value)} 
                      placeholder="Add a word to avoid"
                      mr={2}
                      onKeyPress={(e) => e.key === 'Enter' && handleAvoidWordAdd()}
                    />
                    <Button 
                      onClick={handleAvoidWordAdd}
                      leftIcon={<AddIcon />}
                    >
                      Add
                    </Button>
                  </Flex>
                  <HStack spacing={2} flexWrap="wrap">
                    {formData.vocabulary?.avoidWords?.map((word, index) => (
                      <Tag key={index} size="md" borderRadius="full" variant="solid" colorScheme="red" my={1}>
                        <TagLabel>{word}</TagLabel>
                        <TagCloseButton onClick={() => handleArrayRemove('vocabulary', 'avoidWords', index)} />
                      </Tag>
                    ))}
                  </HStack>
                </FormControl>
              </Stack>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>

        <Flex justifyContent="flex-end" mt={4}>
          <Button variant="outline" mr={3} onClick={handleCancel}>
            Cancel
          </Button>
          <Button colorScheme="blue" type="submit">
            {isEditing ? 'Update' : 'Create'} Brand Voice
          </Button>
        </Flex>
      </Stack>
    </Box>
  );
};

export default BrandVoiceForm; 