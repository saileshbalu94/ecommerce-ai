import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Flex,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Icon,
  Badge,
  Divider,
  useToast,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Textarea,
  Radio,
  RadioGroup,
  Stack,
  Skeleton,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure
} from '@chakra-ui/react';
import {
  FiEdit,
  FiTrash2,
  FiCopy,
  FiDownload,
  FiChevronRight,
  FiHome,
  FiFileText,
  FiList,
  FiStar,
  FiClock,
  FiCheck
} from 'react-icons/fi';
import contentService from '../../services/content.service';

/**
 * ContentDetailPage - View and manage a specific content piece
 */
const ContentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  
  // Delete confirmation dialog
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();
  
  // State
  const [content, setContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [feedbackRating, setFeedbackRating] = useState('5');
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  
  // Content status options
  const statusColors = {
    'draft': 'blue',
    'published': 'green',
    'archived': 'gray'
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Load content data
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        const result = await contentService.getContentById(id);
        
        if (result.success) {
          setContent(result.data.content);
          setEditedContent(result.data.content.generated_content.text);
        } else {
          toast({
            title: 'Error',
            description: 'Failed to load content.',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
          navigate('/content/history');
        }
      } catch (error) {
        console.error('Error loading content:', error);
        toast({
          title: 'Error',
          description: 'Failed to load content. Please try again.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        navigate('/content/history');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchContent();
  }, [id, navigate, toast]);
  
  // Copy content to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(content.generated_content.text);
    toast({
      title: 'Copied!',
      description: 'Content copied to clipboard.',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };
  
  // Download content as text file
  const downloadContent = () => {
    const element = document.createElement('a');
    const file = new Blob([content.generated_content.text], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${content.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  // Save edited content
  const saveContent = async () => {
    try {
      setIsSaving(true);
      
      const result = await contentService.updateContent(content.id, {
        generatedContent: {
          text: editedContent
        }
      });
      
      if (result.success) {
        setContent(result.data.content);
        setIsEditing(false);
        
        toast({
          title: 'Success',
          description: 'Content updated successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to update content.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error updating content:', error);
      toast({
        title: 'Error',
        description: 'Failed to update content. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Submit feedback
  const submitFeedback = async () => {
    try {
      setIsSubmittingFeedback(true);
      
      const result = await contentService.addFeedback(
        content.id,
        parseInt(feedbackRating),
        feedbackComment
      );
      
      if (result.success) {
        setContent(result.data.content);
        setFeedbackComment('');
        
        toast({
          title: 'Feedback Submitted',
          description: 'Thank you for your feedback!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to submit feedback.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit feedback. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmittingFeedback(false);
    }
  };
  
  // Update status
  const updateStatus = async (newStatus) => {
    try {
      setIsSaving(true);
      
      const result = await contentService.updateContent(content.id, {
        status: newStatus
      });
      
      if (result.success) {
        setContent(result.data.content);
        
        toast({
          title: 'Status Updated',
          description: `Content status changed to ${newStatus}.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to update status.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update status. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Delete content
  const deleteContent = async () => {
    try {
      const result = await contentService.deleteContent(content.id);
      
      if (result.success) {
        toast({
          title: 'Content Deleted',
          description: 'The content has been deleted successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        navigate('/content/history');
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete content.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error deleting content:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete content. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      onClose();
    }
  };
  
  // Display loading skeleton
  if (isLoading) {
    return (
      <Box bg={bgColor} minH="calc(100vh - 60px)" py={5}>
        <Container maxW="container.xl">
          <Skeleton height="30px" width="250px" mb={4} />
          <Skeleton height="20px" width="400px" mb={10} />
          
          <Skeleton height="300px" mb={6} />
          
          <HStack spacing={4} mb={6}>
            <Skeleton height="40px" width="120px" />
            <Skeleton height="40px" width="120px" />
            <Skeleton height="40px" width="120px" />
          </HStack>
          
          <Skeleton height="150px" />
        </Container>
      </Box>
    );
  }
  
  if (!content) {
    return (
      <Box bg={bgColor} minH="calc(100vh - 60px)" py={5}>
        <Container maxW="container.xl" textAlign="center">
          <Heading size="lg" mb={4}>Content Not Found</Heading>
          <Text mb={6}>This content may have been deleted or doesn't exist.</Text>
          <Button 
            as={RouterLink} 
            to="/content/history" 
            colorScheme="blue"
            leftIcon={<Icon as={FiList} />}
          >
            View Content History
          </Button>
        </Container>
      </Box>
    );
  }
  
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
          <BreadcrumbItem>
            <BreadcrumbLink as={RouterLink} to="/content/history">
              <Icon as={FiList} mr={1} />
              Content History
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>
              <Icon as={FiFileText} mr={1} />
              {content.title}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
        
        {/* Header section */}
        <Flex 
          justify="space-between" 
          align="flex-start" 
          mb={6}
          direction={{ base: 'column', md: 'row' }}
          gap={4}
        >
          <Box>
            <Heading size="xl" mb={2}>{content.title}</Heading>
            <HStack spacing={3} mb={2}>
              <Badge colorScheme={statusColors[content.status] || 'gray'}>
                {content.status.charAt(0).toUpperCase() + content.status.slice(1)}
              </Badge>
              <Badge colorScheme="purple">
                {content.content_type === 'product-description' 
                  ? 'Product Description' 
                  : content.content_type === 'product-title'
                    ? 'Product Title'
                    : content.content_type}
              </Badge>
              <Text fontSize="sm" color="gray.500">
                <Icon as={FiClock} mr={1} />
                {formatDate(content.created_at)}
              </Text>
            </HStack>
          </Box>
          
          <HStack spacing={3}>
            {isEditing ? (
              <>
                <Button
                  colorScheme="green"
                  leftIcon={<Icon as={FiCheck} />}
                  onClick={saveContent}
                  isLoading={isSaving}
                  loadingText="Saving..."
                >
                  Save
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setEditedContent(content.generated_content.text);
                  }}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  leftIcon={<Icon as={FiEdit} />}
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
                <Button
                  leftIcon={<Icon as={FiCopy} />}
                  onClick={copyToClipboard}
                >
                  Copy
                </Button>
                <Button
                  leftIcon={<Icon as={FiDownload} />}
                  onClick={downloadContent}
                >
                  Download
                </Button>
                <Button
                  colorScheme="red"
                  variant="ghost"
                  leftIcon={<Icon as={FiTrash2} />}
                  onClick={onOpen}
                >
                  Delete
                </Button>
              </>
            )}
          </HStack>
        </Flex>
        
        <Tabs colorScheme="blue" mb={8}>
          <TabList>
            <Tab>Content</Tab>
            <Tab>Versions</Tab>
            <Tab>Details</Tab>
          </TabList>
          
          <TabPanels>
            {/* Content Tab */}
            <TabPanel>
              <Box
                bg={cardBg}
                p={6}
                borderRadius="md"
                boxShadow="sm"
                mb={6}
              >
                {isEditing ? (
                  <Textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    placeholder="Edit your content here..."
                    size="lg"
                    rows={12}
                    mb={4}
                  />
                ) : (
                  <Text whiteSpace="pre-line" fontSize="md">
                    {content.generated_content.text}
                  </Text>
                )}
              </Box>
              
              {!isEditing && (
                <Box
                  bg={cardBg}
                  p={6}
                  borderRadius="md"
                  boxShadow="sm"
                >
                  <Heading size="md" mb={4}>Provide Feedback</Heading>
                  
                  <VStack spacing={4} align="stretch">
                    <Box>
                      <Text fontWeight="medium" mb={2}>How would you rate this content?</Text>
                      <RadioGroup onChange={setFeedbackRating} value={feedbackRating}>
                        <Stack direction="row" spacing={4}>
                          <Radio value="1">1</Radio>
                          <Radio value="2">2</Radio>
                          <Radio value="3">3</Radio>
                          <Radio value="4">4</Radio>
                          <Radio value="5">5</Radio>
                        </Stack>
                      </RadioGroup>
                    </Box>
                    
                    <Box>
                      <Text fontWeight="medium" mb={2}>Comments (optional)</Text>
                      <Textarea
                        value={feedbackComment}
                        onChange={(e) => setFeedbackComment(e.target.value)}
                        placeholder="What did you like or dislike about this content?"
                        rows={3}
                      />
                    </Box>
                    
                    <Box>
                      <Button
                        colorScheme="blue"
                        leftIcon={<Icon as={FiStar} />}
                        onClick={submitFeedback}
                        isLoading={isSubmittingFeedback}
                        loadingText="Submitting..."
                      >
                        Submit Feedback
                      </Button>
                    </Box>
                  </VStack>
                </Box>
              )}
            </TabPanel>
            
            {/* Versions Tab */}
            <TabPanel>
              <Box
                bg={cardBg}
                p={6}
                borderRadius="md"
                boxShadow="sm"
              >
                <Heading size="md" mb={4}>Content Versions</Heading>
                
                {content.generated_content.versions && content.generated_content.versions.length > 0 ? (
                  <VStack spacing={4} align="stretch">
                    {content.generated_content.versions.map((version, index) => (
                      <Box 
                        key={index} 
                        p={4} 
                        borderWidth="1px" 
                        borderRadius="md"
                      >
                        <Flex justify="space-between" align="center" mb={2}>
                          <Text fontWeight="bold">
                            Version {index + 1}
                            {index === content.generated_content.versions.length - 1 && 
                              <Badge ml={2} colorScheme="green">Latest</Badge>
                            }
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            Created: {formatDate(version.created_at)}
                          </Text>
                        </Flex>
                        
                        <Text 
                          whiteSpace="pre-line" 
                          noOfLines={3} 
                          mb={2}
                        >
                          {version.text}
                        </Text>
                        
                        <Flex justify="space-between" align="center" mt={2}>
                          <Button size="sm" onClick={() => {
                            setEditedContent(version.text);
                            setIsEditing(true);
                          }}>
                            Use This Version
                          </Button>
                          
                          {version.feedback && (
                            <HStack>
                              <Text fontSize="sm">Feedback:</Text>
                              <HStack>
                                {[...Array(5)].map((_, i) => (
                                  <Icon 
                                    key={i}
                                    as={FiStar}
                                    color={i < version.feedback.rating ? "yellow.400" : "gray.300"}
                                  />
                                ))}
                              </HStack>
                            </HStack>
                          )}
                        </Flex>
                      </Box>
                    ))}
                  </VStack>
                ) : (
                  <Text color="gray.500">No version history available.</Text>
                )}
              </Box>
            </TabPanel>
            
            {/* Details Tab */}
            <TabPanel>
              <Box
                bg={cardBg}
                p={6}
                borderRadius="md"
                boxShadow="sm"
              >
                <Heading size="md" mb={4}>Content Details</Heading>
                
                <VStack spacing={4} align="stretch" mb={6}>
                  <Flex>
                    <Text fontWeight="bold" width="150px">Status:</Text>
                    <Box>
                      <Badge colorScheme={statusColors[content.status] || 'gray'} mb={2}>
                        {content.status.charAt(0).toUpperCase() + content.status.slice(1)}
                      </Badge>
                      
                      <HStack spacing={2} mt={1}>
                        <Button 
                          size="xs" 
                          colorScheme="blue" 
                          onClick={() => updateStatus('draft')}
                          isDisabled={content.status === 'draft'}
                        >
                          Set as Draft
                        </Button>
                        <Button 
                          size="xs" 
                          colorScheme="green" 
                          onClick={() => updateStatus('published')}
                          isDisabled={content.status === 'published'}
                        >
                          Publish
                        </Button>
                        <Button 
                          size="xs" 
                          colorScheme="gray" 
                          onClick={() => updateStatus('archived')}
                          isDisabled={content.status === 'archived'}
                        >
                          Archive
                        </Button>
                      </HStack>
                    </Box>
                  </Flex>
                  
                  <Flex>
                    <Text fontWeight="bold" width="150px">Content Type:</Text>
                    <Text>{content.content_type === 'product-description' 
                      ? 'Product Description' 
                      : content.content_type === 'product-title'
                        ? 'Product Title'
                        : content.content_type}
                    </Text>
                  </Flex>
                  
                  <Flex>
                    <Text fontWeight="bold" width="150px">Created:</Text>
                    <Text>{formatDate(content.created_at)}</Text>
                  </Flex>
                  
                  <Flex>
                    <Text fontWeight="bold" width="150px">Last Updated:</Text>
                    <Text>{formatDate(content.updated_at)}</Text>
                  </Flex>
                  
                  {content.metadata && (
                    <>
                      <Divider />
                      <Heading size="sm" mb={2}>Generation Details</Heading>
                      
                      <Flex>
                        <Text fontWeight="bold" width="150px">Model Used:</Text>
                        <Text>{content.metadata.modelUsed}</Text>
                      </Flex>
                      
                      <Flex>
                        <Text fontWeight="bold" width="150px">Tokens Used:</Text>
                        <Text>{content.metadata.tokensUsed}</Text>
                      </Flex>
                      
                      <Flex>
                        <Text fontWeight="bold" width="150px">Generation Time:</Text>
                        <Text>{content.metadata.generationTime} ms</Text>
                      </Flex>
                    </>
                  )}
                  
                  {content.generation_parameters && (
                    <>
                      <Divider />
                      <Heading size="sm" mb={2}>Generation Parameters</Heading>
                      
                      {content.generation_parameters.tone && (
                        <Flex>
                          <Text fontWeight="bold" width="150px">Tone:</Text>
                          <Text>{content.generation_parameters.tone}</Text>
                        </Flex>
                      )}
                      
                      {content.generation_parameters.style && (
                        <Flex>
                          <Text fontWeight="bold" width="150px">Style:</Text>
                          <Text>{content.generation_parameters.style}</Text>
                        </Flex>
                      )}
                      
                      {content.generation_parameters.length && (
                        <Flex>
                          <Text fontWeight="bold" width="150px">Length:</Text>
                          <Text>{content.generation_parameters.length}</Text>
                        </Flex>
                      )}
                    </>
                  )}
                  
                  {content.original_input && (
                    <>
                      <Divider />
                      <Heading size="sm" mb={2}>Original Input</Heading>
                      
                      {content.original_input.productName && (
                        <Flex>
                          <Text fontWeight="bold" width="150px">Product Name:</Text>
                          <Text>{content.original_input.productName}</Text>
                        </Flex>
                      )}
                      
                      {content.original_input.productCategory && (
                        <Flex>
                          <Text fontWeight="bold" width="150px">Category:</Text>
                          <Text>{content.original_input.productCategory}</Text>
                        </Flex>
                      )}
                      
                      {content.original_input.targetAudience && (
                        <Flex>
                          <Text fontWeight="bold" width="150px">Target Audience:</Text>
                          <Text>{content.original_input.targetAudience}</Text>
                        </Flex>
                      )}
                      
                      {content.original_input.productFeatures && content.original_input.productFeatures.length > 0 && (
                        <Flex>
                          <Text fontWeight="bold" width="150px">Features:</Text>
                          <Text>{content.original_input.productFeatures.join(', ')}</Text>
                        </Flex>
                      )}
                      
                      {content.original_input.keywords && content.original_input.keywords.length > 0 && (
                        <Flex>
                          <Text fontWeight="bold" width="150px">Keywords:</Text>
                          <Text>{content.original_input.keywords.join(', ')}</Text>
                        </Flex>
                      )}
                    </>
                  )}
                </VStack>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
      
      {/* Delete confirmation dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Content
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this content? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={deleteContent} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default ContentDetailPage;