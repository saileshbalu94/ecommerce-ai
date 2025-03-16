import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  HStack,
  Flex,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Icon,
  Badge,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  SimpleGrid,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Checkbox,
  Skeleton,
  useColorModeValue,
  useToast,
  useBreakpointValue,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay
} from '@chakra-ui/react';
import {
  FiHome,
  FiChevronRight,
  FiList,
  FiSearch,
  FiChevronDown,
  FiTrash2,
  FiEdit,
  FiEye,
  FiDownload,
  FiMoreVertical,
  FiPlus
} from 'react-icons/fi';
import contentService from '../../services/content.service';
import { useNavigate } from 'react-router-dom';

/**
 * ContentHistoryPage - View and manage content history
 */
const ContentHistoryPage = () => {
  const toast = useToast();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const view = useBreakpointValue({ base: 'cards', lg: 'table' });
  const navigate = useNavigate();
  
  // Delete confirmation dialog
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();
  
  // State
  const [contentList, setContentList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedContent, setSelectedContent] = useState([]);
  const [contentToDelete, setContentToDelete] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });
  
  // Content status colors
  const statusColors = {
    'draft': 'blue',
    'published': 'green',
    'archived': 'gray'
  };
  
  // Content type display names
  const contentTypeNames = {
    'product-description': 'Product Description',
    'product-title': 'Product Title',
    'email': 'Email',
    'social-post': 'Social Post',
    'ad-copy': 'Ad Copy',
    'seo': 'SEO Content'
  };
  
  // Load content
  useEffect(() => {
    fetchContent();
  }, [typeFilter, statusFilter, pagination.currentPage]);
  
  // Fetch content from API
  const fetchContent = async () => {
    try {
      setIsLoading(true);
      
      const params = {
        page: pagination.currentPage,
        limit: 10
      };
      
      if (typeFilter) params.contentType = typeFilter;
      if (statusFilter) params.status = statusFilter;
      
      const result = await contentService.getUserContent(params);
      
      if (result.success) {
        setContentList(result.data.content);
        setPagination({
          currentPage: result.pagination.currentPage,
          totalPages: result.pagination.totalPages,
          totalItems: result.total
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load content history.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error loading content:', error);
      toast({
        title: 'Error',
        description: 'Failed to load content history. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter content based on search query
  const filteredContent = contentList.filter(content => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      content.title.toLowerCase().includes(query) ||
      (content.content_type && content.content_type.toLowerCase().includes(query)) ||
      (content.generated_content.text && content.generated_content.text.toLowerCase().includes(query))
    );
  });
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Handle select all checkbox
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedContent(filteredContent.map(content => content.id));
    } else {
      setSelectedContent([]);
    }
  };
  
  // Handle individual checkbox
  const handleSelectContent = (id) => {
    setSelectedContent(prev => {
      if (prev.includes(id)) {
        return prev.filter(itemId => itemId !== id);
      } else {
        return [...prev, id];
      }
    });
  };
  
  // Delete content
  const handleDeleteContent = async () => {
    try {
      if (!contentToDelete) return;
      
      const result = await contentService.deleteContent(contentToDelete);
      
      if (result.success) {
        // Remove deleted content from list
        setContentList(prev => prev.filter(item => item.id !== contentToDelete));
        
        // Remove from selected content if it was selected
        setSelectedContent(prev => prev.filter(id => id !== contentToDelete));
        
        toast({
          title: 'Content Deleted',
          description: 'The content has been deleted successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
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
      setContentToDelete(null);
      onClose();
    }
  };
  
  // Bulk delete selected content
  const handleBulkDelete = async () => {
    // This would require a backend endpoint for bulk operations
    // For now, we'll just show an informational message
    toast({
      title: 'Bulk Delete',
      description: `Selected ${selectedContent.length} items for deletion. This feature is coming soon.`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };
  
  // Change page
  const changePage = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    
    setPagination(prev => ({
      ...prev,
      currentPage: newPage
    }));
  };
  
  // Download content as text
  const downloadContent = (content) => {
    const element = document.createElement('a');
    const file = new Blob([content.generated_content.text], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${content.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: 'Downloaded',
      description: 'Content downloaded successfully.',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };
  
  // Handle view content click with validation
  const handleViewContent = (contentId) => {
    if (!contentId) {
      toast({
        title: "Error",
        description: "Invalid content ID",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    console.log(`Navigating to content: ${contentId}`);
    navigate(`/content/${contentId}`);
  };
  
  // Render content card view (mobile)
  const renderContentCards = () => {
    if (isLoading) {
      return Array(3).fill(0).map((_, index) => (
        <Box 
          key={index}
          bg={cardBg}
          p={4}
          borderRadius="md"
          boxShadow="sm"
        >
          <Skeleton height="24px" width="70%" mb={2} />
          <Skeleton height="16px" width="40%" mb={4} />
          <Skeleton height="60px" mb={3} />
          <Flex justify="space-between">
            <Skeleton height="30px" width="80px" />
            <Skeleton height="30px" width="80px" />
          </Flex>
        </Box>
      ));
    }
    
    if (filteredContent.length === 0) {
      return (
        <Box 
          bg={cardBg}
          p={6}
          borderRadius="md"
          boxShadow="sm"
          textAlign="center"
        >
          <Text mb={4}>No content found matching your filters.</Text>
          <Button 
            as={RouterLink} 
            to="/content/create" 
            colorScheme="blue"
            leftIcon={<Icon as={FiPlus} />}
          >
            Create New Content
          </Button>
        </Box>
      );
    }
    
    return filteredContent.map(content => (
      <Box 
        key={content.id}
        bg={cardBg}
        p={4}
        borderRadius="md"
        boxShadow="sm"
      >
        <Flex justify="space-between" align="flex-start" mb={2}>
          <Heading size="md" noOfLines={1}>{content.title}</Heading>
          <Menu>
            <MenuButton
              as={Button}
              variant="ghost"
              size="sm"
              rightIcon={<FiMoreVertical />}
            >
              Actions
            </MenuButton>
            <MenuList>
              <MenuItem 
                icon={<Icon as={FiEye} />}
                onClick={() => handleViewContent(content.id)}
              >
                View
              </MenuItem>
              <MenuItem 
                icon={<Icon as={FiEdit} />}
                onClick={() => handleViewContent(content.id)}
              >
                Edit
              </MenuItem>
              <MenuItem 
                icon={<Icon as={FiDownload} />}
                onClick={() => downloadContent(content)}
              >
                Download
              </MenuItem>
              <MenuDivider />
              <MenuItem 
                icon={<Icon as={FiTrash2} />}
                color="red.500"
                onClick={() => {
                  setContentToDelete(content.id);
                  onOpen();
                }}
              >
                Delete
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
        
        <HStack spacing={2} mb={3}>
          <Badge colorScheme={statusColors[content.status] || 'gray'}>
            {content.status.charAt(0).toUpperCase() + content.status.slice(1)}
          </Badge>
          <Badge colorScheme="purple">
            {contentTypeNames[content.content_type] || content.content_type}
          </Badge>
          <Text fontSize="xs" color="gray.500">
            {formatDate(content.created_at)}
          </Text>
        </HStack>
        
        <Text noOfLines={2} mb={3} fontSize="sm" color="gray.600">
          {content.generated_content.text}
        </Text>
        
        <HStack spacing={2}>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleViewContent(content.id)}
            aria-label="View"
            title="View"
          >
            <Icon as={FiEye} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            colorScheme="red"
            leftIcon={<Icon as={FiTrash2} />}
            onClick={() => {
              setContentToDelete(content.id);
              onOpen();
            }}
          >
            Delete
          </Button>
        </HStack>
      </Box>
    ));
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
              <Icon as={FiList} mr={1} />
              Content History
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
        
        {/* Page heading */}
        <Flex 
          justify="space-between" 
          align="center" 
          mb={6}
          direction={{ base: 'column', md: 'row' }}
          gap={4}
        >
          <Box>
            <Heading size="xl" mb={2}>Content History</Heading>
            <Text color="gray.600">
              {pagination.totalItems} total content items
            </Text>
          </Box>
          
          <Button
            as={RouterLink}
            to="/content/create"
            colorScheme="blue"
            leftIcon={<Icon as={FiPlus} />}
          >
            Create New Content
          </Button>
        </Flex>
        
        {/* Search and filters */}
        <Flex 
          mb={6} 
          gap={4}
          direction={{ base: 'column', md: 'row' }}
        >
          <InputGroup maxW={{ base: '100%', md: '300px' }}>
            <InputLeftElement pointerEvents="none">
              <Icon as={FiSearch} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
          
          <HStack>
            <Select
              placeholder="All Types"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              maxW={{ base: '100%', md: '180px' }}
            >
              <option value="product-description">Product Descriptions</option>
              <option value="product-title">Product Titles</option>
              <option value="email">Emails</option>
              <option value="social-post">Social Posts</option>
              <option value="ad-copy">Ad Copy</option>
              <option value="seo">SEO Content</option>
            </Select>
            
            <Select
              placeholder="All Statuses"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              maxW={{ base: '100%', md: '150px' }}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </Select>
          </HStack>
        </Flex>
        
        {/* Bulk actions */}
        {selectedContent.length > 0 && (
          <Flex mb={4} bg={cardBg} p={3} borderRadius="md" align="center">
            <Text fontWeight="medium" mr={4}>
              {selectedContent.length} items selected
            </Text>
            <Button
              size="sm"
              colorScheme="red"
              leftIcon={<Icon as={FiTrash2} />}
              onClick={handleBulkDelete}
            >
              Delete Selected
            </Button>
          </Flex>
        )}
        
        {/* Content listing */}
        {view === 'cards' ? (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
            {renderContentCards()}
          </SimpleGrid>
        ) : (
          <Box
            bg={cardBg}
            borderRadius="md"
            boxShadow="sm"
            overflow="hidden"
            mb={6}
          >
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th width="40px">
                    <Checkbox
                      isChecked={selectedContent.length === filteredContent.length && filteredContent.length > 0}
                      onChange={handleSelectAll}
                    />
                  </Th>
                  <Th>Title</Th>
                  <Th>Type</Th>
                  <Th>Status</Th>
                  <Th>Created</Th>
                  <Th width="150px">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {isLoading ? (
                  Array(5).fill(0).map((_, index) => (
                    <Tr key={index}>
                      <Td><Skeleton height="20px" width="20px" /></Td>
                      <Td><Skeleton height="20px" width="250px" /></Td>
                      <Td><Skeleton height="20px" width="100px" /></Td>
                      <Td><Skeleton height="20px" width="80px" /></Td>
                      <Td><Skeleton height="20px" width="80px" /></Td>
                      <Td><Skeleton height="20px" width="100px" /></Td>
                    </Tr>
                  ))
                ) : filteredContent.length === 0 ? (
                  <Tr>
                    <Td colSpan={6} textAlign="center" py={4}>
                      <Text mb={4}>No content found matching your filters.</Text>
                      <Button 
                        as={RouterLink} 
                        to="/content/create" 
                        colorScheme="blue"
                        leftIcon={<Icon as={FiPlus} />}
                        size="sm"
                      >
                        Create New Content
                      </Button>
                    </Td>
                  </Tr>
                ) : (
                  filteredContent.map(content => (
                    <Tr key={content.id}>
                      <Td>
                        <Checkbox
                          isChecked={selectedContent.includes(content.id)}
                          onChange={() => handleSelectContent(content.id)}
                        />
                      </Td>
                      <Td>
                        <Text fontWeight="medium" noOfLines={1}>
                          {content.title}
                        </Text>
                      </Td>
                      <Td>
                        <Badge colorScheme="purple">
                          {contentTypeNames[content.content_type] || content.content_type}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge colorScheme={statusColors[content.status] || 'gray'}>
                          {content.status.charAt(0).toUpperCase() + content.status.slice(1)}
                        </Badge>
                      </Td>
                      <Td>
                        {formatDate(content.created_at)}
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewContent(content.id)}
                            aria-label="View"
                            title="View"
                          >
                            <Icon as={FiEye} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => downloadContent(content)}
                            aria-label="Download"
                            title="Download"
                          >
                            <Icon as={FiDownload} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => {
                              setContentToDelete(content.id);
                              onOpen();
                            }}
                            aria-label="Delete"
                            title="Delete"
                          >
                            <Icon as={FiTrash2} />
                          </Button>
                        </HStack>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </Box>
        )}
        
        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <Flex justify="center" mb={6}>
            <HStack>
              <Button
                size="sm"
                onClick={() => changePage(pagination.currentPage - 1)}
                isDisabled={pagination.currentPage === 1}
              >
                Previous
              </Button>
              
              {[...Array(pagination.totalPages)].map((_, index) => {
                const pageNum = index + 1;
                return (
                  <Button
                    key={pageNum}
                    size="sm"
                    colorScheme={pageNum === pagination.currentPage ? 'blue' : 'gray'}
                    onClick={() => changePage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              
              <Button
                size="sm"
                onClick={() => changePage(pagination.currentPage + 1)}
                isDisabled={pagination.currentPage === pagination.totalPages}
              >
                Next
              </Button>
            </HStack>
          </Flex>
        )}
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
              <Button colorScheme="red" onClick={handleDeleteContent} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default ContentHistoryPage;