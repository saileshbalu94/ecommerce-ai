import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Image,
  SimpleGrid,
  Icon,
  useColorModeValue,
  Divider
} from '@chakra-ui/react';
import { FiEdit, FiBarChart2, FiClock, FiDollarSign } from 'react-icons/fi';

/**
 * FeatureCard - Component for displaying product features
 */
const FeatureCard = ({ icon, title, description }) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  
  return (
    <Box
      bg={cardBg}
      borderRadius="lg"
      boxShadow="md"
      p={6}
      transition="transform 0.3s, box-shadow 0.3s"
      _hover={{
        transform: 'translateY(-5px)',
        boxShadow: 'lg'
      }}
    >
      <Icon as={icon} boxSize={10} color="blue.500" mb={4} />
      <Heading size="md" mb={3}>{title}</Heading>
      <Text color="gray.600">{description}</Text>
    </Box>
  );
};

/**
 * PricingCard - Component for displaying pricing plans
 */
const PricingCard = ({ name, price, features, isPopular }) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const bordBg = useColorModeValue('gray.200', 'gray.600')
  const borderColor = isPopular ? 'blue.400' : bordBg;
  
  return (
    <Box
      bg={cardBg}
      borderWidth="2px"
      borderColor={borderColor}
      borderRadius="lg"
      boxShadow={isPopular ? 'lg' : 'md'}
      p={6}
      position="relative"
      transform={isPopular ? 'scale(1.05)' : 'scale(1)'}
      zIndex={isPopular ? 1 : 0}
    >
      {isPopular && (
        <Box
          position="absolute"
          top="-4"
          right="-4"
          bg="blue.500"
          color="white"
          px={3}
          py={1}
          borderRadius="full"
          fontSize="sm"
          fontWeight="bold"
        >
          Most Popular
        </Box>
      )}
      
      <Heading size="lg" mb={2}>{name}</Heading>
      <HStack align="baseline" mb={6}>
        <Text fontSize="3xl" fontWeight="bold">${price}</Text>
        <Text color="gray.500">/month</Text>
      </HStack>
      
      <Divider mb={6} />
      
      <VStack align="start" spacing={3} mb={6}>
        {features.map((feature, index) => (
          <HStack key={index} align="start">
            <Text color="green.500" fontWeight="bold">✓</Text>
            <Text>{feature}</Text>
          </HStack>
        ))}
      </VStack>
      
      <Button
        as={RouterLink}
        to="/register"
        colorScheme={isPopular ? 'blue' : 'gray'}
        size="lg"
        w="full"
        variant={isPopular ? 'solid' : 'outline'}
      >
        Get Started
      </Button>
    </Box>
  );
};

/**
 * TestimonialCard - Component for displaying testimonials
 */
const TestimonialCard = ({ text, name, role, company }) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  
  return (
    <Box
      bg={cardBg}
      borderRadius="lg"
      boxShadow="md"
      p={6}
    >
      <Text fontSize="lg" fontStyle="italic" mb={4}>
        "{text}"
      </Text>
      <HStack>
        <Box
          w={10}
          h={10}
          borderRadius="full"
          bg="gray.300"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontWeight="bold"
          color="gray.600"
        >
          {name.charAt(0)}
        </Box>
        <Box>
          <Text fontWeight="bold">{name}</Text>
          <Text fontSize="sm" color="gray.500">
            {role}, {company}
          </Text>
        </Box>
      </HStack>
    </Box>
  );
};

/**
 * HomePage - Landing page for unauthenticated users
 */
const HomePage = () => {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const heroBgColor = useColorModeValue('blue.50', 'blue.900');
  
  // Pricing plans data
  const pricingPlans = [
    {
      name: 'Starter',
      price: 99,
      features: [
        'Generate 50 product descriptions',
        'Generate 100 product titles',
        'Basic tone and style customization',
        'Content history',
        'Email support'
      ],
      isPopular: false
    },
    {
      name: 'Growth',
      price: 299,
      features: [
        'Generate 200 product descriptions',
        'Generate 400 product titles',
        'Advanced tone and style customization',
        'Brand voice profiles',
        'Content quality scoring',
        'Priority support'
      ],
      isPopular: true
    },
    {
      name: 'Scale',
      price: 999,
      features: [
        'Unlimited product descriptions',
        'Unlimited product titles',
        'Multiple brand voice profiles',
        'API access',
        'Content quality scoring',
        'Custom templates',
        '24/7 priority support'
      ],
      isPopular: false
    }
  ];
  
  return (
    <Box>
      {/* Hero Section */}
      <Box bg={heroBgColor} py={20}>
        <Container maxW="container.xl">
          <Flex
            direction={{ base: 'column', lg: 'row' }}
            align="center"
            justify="space-between"
            gap={10}
          >
            <Box maxW={{ base: 'full', lg: '50%' }}>
              <Heading
                as="h1"
                size="2xl"
                fontWeight="bold"
                mb={4}
                lineHeight="shorter"
              >
                AI-Powered Content Generation for eCommerce
              </Heading>
              <Text fontSize="xl" mb={8} color="gray.600">
                Create high-converting product descriptions and titles in seconds with the power of AI. Save time, increase conversions, and scale your business.
              </Text>
              <HStack spacing={4}>
                <Button
                  as={RouterLink}
                  to="/register"
                  colorScheme="blue"
                  size="lg"
                  height="60px"
                  px={8}
                >
                  Get Started Free
                </Button>
                <Button
                  as={RouterLink}
                  to="/login"
                  variant="outline"
                  colorScheme="blue"
                  size="lg"
                  height="60px"
                >
                  Sign In
                </Button>
              </HStack>
            </Box>
            
            <Box
              maxW={{ base: 'full', lg: '45%' }}
              borderRadius="lg"
              overflow="hidden"
              boxShadow="2xl"
            >
              <Image
                src="https://via.placeholder.com/600x400"
                alt="eContent AI Dashboard Preview"
              />
            </Box>
          </Flex>
        </Container>
      </Box>
      
      {/* Features Section */}
      <Box py={20} bg={bgColor}>
        <Container maxW="container.xl">
          <VStack spacing={4} mb={12} textAlign="center">
            <Heading as="h2" size="xl">
              Features That Make the Difference
            </Heading>
            <Text fontSize="lg" color="gray.600" maxW="container.md">
              Our AI content generator is designed specifically for eCommerce businesses to create compelling product content that converts.
            </Text>
          </VStack>
          
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={10}>
            <FeatureCard
              icon={FiEdit}
              title="AI Content Generation"
              description="Generate professional product descriptions and titles in seconds with just a few inputs."
            />
            <FeatureCard
              icon={FiBarChart2}
              title="Brand Voice Control"
              description="Maintain your brand's unique voice and style across all your product content."
            />
            <FeatureCard
              icon={FiClock}
              title="Time Saving"
              description="Create weeks worth of content in minutes, freeing you to focus on growing your business."
            />
            <FeatureCard
              icon={FiDollarSign}
              title="Increased Conversions"
              description="Professionally written content that highlights benefits and drives sales."
            />
          </SimpleGrid>
        </Container>
      </Box>
      
      {/* Pricing Section */}
      <Box py={20} bg={useColorModeValue('white', 'gray.800')}>
        <Container maxW="container.xl">
          <VStack spacing={4} mb={16} textAlign="center">
            <Heading as="h2" size="xl">
              Simple, Transparent Pricing
            </Heading>
            <Text fontSize="lg" color="gray.600" maxW="container.md">
              Choose the plan that's right for your business
            </Text>
          </VStack>
          
          <SimpleGrid
            columns={{ base: 1, lg: 3 }}
            spacing={{ base: 10, lg: 0 }}
            px={{ base: 0, lg: 10 }}
            py={10}
          >
            {pricingPlans.map((plan, index) => (
              <PricingCard key={index} {...plan} />
            ))}
          </SimpleGrid>
        </Container>
      </Box>
      
      {/* Testimonials Section */}
      <Box py={20} bg={bgColor}>
        <Container maxW="container.xl">
          <VStack spacing={4} mb={12} textAlign="center">
            <Heading as="h2" size="xl">
              What Our Customers Say
            </Heading>
            <Text fontSize="lg" color="gray.600" maxW="container.md">
              Thousands of eCommerce businesses trust our AI to create their product content
            </Text>
          </VStack>
          
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
            <TestimonialCard
              text="I used to spend hours writing product descriptions. Now I can create them in seconds, and they're even better than what I wrote myself!"
              name="Sarah Johnson"
              role="Founder"
              company="StyleHub"
            />
            <TestimonialCard
              text="The AI understands our brand voice perfectly. Our product listings are consistent and converting better than ever."
              name="Michael Chen"
              role="Marketing Director"
              company="TechGadgets"
            />
            <TestimonialCard
              text="We've been able to scale our product catalog from 100 to over 1,000 products without hiring any copywriters. This tool pays for itself."
              name="Jessica Williams"
              role="eCommerce Manager"
              company="HomeEssentials"
            />
          </SimpleGrid>
        </Container>
      </Box>
      
      {/* CTA Section */}
      <Box py={20} bg="blue.500" color="white">
        <Container maxW="container.xl" textAlign="center">
          <Heading as="h2" size="xl" mb={6}>
            Ready to Transform Your eCommerce Content?
          </Heading>
          <Text fontSize="xl" mb={10} maxW="container.md" mx="auto">
            Join thousands of successful eCommerce businesses using AI to create better content and drive more sales.
          </Text>
          <Button
            as={RouterLink}
            to="/register"
            colorScheme="white"
            size="lg"
            height="60px"
            px={8}
          >
            Get Started Free
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;