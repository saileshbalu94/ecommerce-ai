import React from 'react';
import { Box, Text, Flex, Link, Container } from '@chakra-ui/react';

/**
 * Footer - Application footer with copyright and links
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <Box as="footer" py={6} bg="white" borderTop="1px" borderColor="gray.200">
      <Container maxW="container.xl">
        <Flex
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align="center"
        >
          <Text color="gray.500" fontSize="sm">
            &copy; {currentYear} eContent AI. All rights reserved.
          </Text>
          
          <Flex mt={{ base: 4, md: 0 }} gap={4}>
            <Link fontSize="sm" color="gray.500" href="#" _hover={{ color: 'blue.500' }}>
              Terms of Service
            </Link>
            <Link fontSize="sm" color="gray.500" href="#" _hover={{ color: 'blue.500' }}>
              Privacy Policy
            </Link>
            <Link fontSize="sm" color="gray.500" href="#" _hover={{ color: 'blue.500' }}>
              Contact
            </Link>
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
};

export default Footer;