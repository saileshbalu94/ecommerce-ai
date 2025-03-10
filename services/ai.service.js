const OpenAI = require('openai');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize OpenAI configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Validate OpenAI configuration
if (!openai.apiKey) {
  throw new Error('OpenAI API key is not configured');
}

exports.generateProductDescription = async (productData, options = {}) => {
  try {
    console.log('\n=== AI Service: Starting Generation ===');
    console.log('Received Product Data:', JSON.stringify(productData, null, 2));
    console.log('Received Options:', JSON.stringify(options, null, 2));
    
    // Create the prompt
    const prompt = createProductDescriptionPrompt(productData, options);
    console.log('\n=== Generated Prompt ===');
    console.log(prompt);

    console.log('\n=== Making OpenAI API Call ===');
    // Make the API call
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional product description writer. Create compelling, accurate, and engaging product descriptions."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: getTemperatureForTone(options.tone),
      max_tokens: getLengthInTokens(options.length),
    });

    console.log('\n=== OpenAI Response ===');
    console.log('Response Status:', completion.choices ? 'Success' : 'No choices available');
    console.log('First Choice Available:', !!completion.choices?.[0]);
    console.log('Message Content Available:', !!completion.choices?.[0]?.message?.content);

    if (!completion.choices || !completion.choices[0]?.message?.content) {
      console.error('Invalid OpenAI response:', JSON.stringify(completion, null, 2));
      throw new Error('No valid completion generated from OpenAI');
    }

    const generatedText = completion.choices[0].message.content.trim();
    
    // Calculate usage
    const tokensUsed = completion.usage.total_tokens;
    const cost = calculateCost(completion.usage.prompt_tokens, completion.usage.completion_tokens, "gpt-3.5-turbo");

    console.log('\n=== Generation Results ===');
    console.log('Text Length:', generatedText.length);
    console.log('Tokens Used:', tokensUsed);
    console.log('Estimated Cost:', cost);

    return {
      success: true,
      text: generatedText,
      metadata: {
        model: "gpt-3.5-turbo",
        tokensUsed,
        cost,
        generationTime: new Date()
      }
    };
  } catch (error) {
    console.error('\n=== AI Service Error ===');
    console.error('Error Type:', error.constructor.name);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    throw new Error(`Failed to generate product description: ${error.message}`);
  }
};

/**
 * Helper function to create a detailed prompt for product description
 * @param {Object} productData - Product information
 * @param {Object} options - Generation options
 * @returns {String} - Formatted prompt
 */
function createProductDescriptionPrompt(productData, options) {
  console.log('\n=== Creating Prompt ===');
  console.log('Product Data for Prompt:', JSON.stringify(productData, null, 2));
  console.log('Options for Prompt:', JSON.stringify(options, null, 2));

  const {
    productName,
    productCategory,
    productFeatures,
    targetAudience,
    keywords,
    additionalInfo
  } = productData;

  const { tone = 'professional', style = 'balanced' } = options;

  let prompt = `Write a compelling product description for the following product:\n\n`;
  prompt += `Product: ${productName}\n`;
  if (productCategory) prompt += `Category: ${productCategory}\n`;
  
  if (productFeatures.length > 0) {
    prompt += `Key Features:\n${productFeatures.map(f => `- ${f}`).join('\n')}\n`;
  }
  
  if (targetAudience) prompt += `Target Audience: ${targetAudience}\n`;
  if (keywords.length > 0) prompt += `Keywords to include: ${keywords.join(', ')}\n`;
  if (additionalInfo) prompt += `Additional Information: ${additionalInfo}\n`;

  prompt += `\nTone: ${tone}\n`;
  prompt += `Style: ${style}\n`;
  prompt += `\nPlease write a compelling, SEO-friendly product description that highlights the key benefits and features.`;

  return prompt;
}

/**
 * Helper function to map tone to temperature setting
 * @param {String} tone - Desired tone
 * @returns {Number} - Appropriate temperature value
 */
function getTemperatureForTone(tone) {
  const temperatureMap = {
    'professional': 0.6,
    'friendly': 0.7,
    'luxury': 0.5,
    'technical': 0.4,
    'casual': 0.8,
    'persuasive': 0.7
  };
  
  return temperatureMap[tone] || 0.6; // Default to professional
}

/**
 * Helper function to map length preference to token count
 * @param {String} length - Desired length (short, medium, long)
 * @returns {Number} - Appropriate max tokens
 */
function getLengthInTokens(length) {
  const tokenMap = {
    'short': 150,
    'medium': 300,
    'long': 500,
    'very-long': 800
  };
  
  return tokenMap[length] || 300; // Default to medium
}

/**
 * Helper function to calculate approximate cost
 * @param {Number} promptTokens - Number of tokens in the prompt
 * @param {Number} completionTokens - Number of tokens in the completion
 * @param {String} model - Model used
 * @returns {Number} - Estimated cost in USD
 */
function calculateCost(promptTokens, completionTokens, model) {
  // These rates are approximate and subject to change
  // Check OpenAI's pricing page for current rates
  const rates = {
    'gpt-4-turbo': {
      promptRate: 0.00001, // $0.01 per 1K tokens
      completionRate: 0.00003 // $0.03 per 1K tokens
    },
    'gpt-3.5-turbo': {
      promptRate: 0.0000015, // $0.0015 per 1K tokens
      completionRate: 0.000002 // $0.002 per 1K tokens
    }
  };
  
  const modelRates = rates[model] || rates['gpt-3.5-turbo'];
  
  return (promptTokens * modelRates.promptRate) + 
         (completionTokens * modelRates.completionRate);
}

/**
 * Generate product title using OpenAI
 * @param {Object} productData - Information about the product
 * @param {Object} options - Generation options
 * @returns {Promise<Object>} - Generated title and metadata
 */
exports.generateProductTitle = async (productData, options) => {
  try {
    console.log('Generating product title...');
    console.log('Product data:', JSON.stringify(productData));

    const startTime = Date.now();

    // Create system prompt for title generation
    const systemPrompt = `You are an expert in creating compelling, SEO-friendly product titles 
    for e-commerce. Create titles that are attention-grabbing, include important keywords, 
    and are optimized for both conversion and search engines. Keep titles under 70 characters.`;

    // Create user prompt with product details
    const userPrompt = `
      Create 3 compelling product title options for the following product:
      
      Product Name: ${productData.productName || 'Product'}
      ${productData.productCategory ? `Product Category: ${productData.productCategory}` : ''}
      ${productData.productFeatures && productData.productFeatures.length > 0 
        ? `Key Features: ${productData.productFeatures.slice(0, 3).join(', ')}` 
        : ''}
      ${productData.keywords && productData.keywords.length > 0 
        ? `Keywords to Include: ${productData.keywords.join(', ')}` 
        : ''}
      
      Title Style: ${options.style || 'balanced'}
      
      Format your response as a numbered list with 3 title options.
      Each title should be unique in approach but all should be compelling and SEO-friendly.
    `;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const endTime = Date.now();
    const generationTime = endTime - startTime;

    // Check if response contains choices
    if (!response.choices || response.choices.length === 0) {
      console.error('Invalid OpenAI response:', JSON.stringify(response, null, 2));
      throw new Error('No valid completion generated from OpenAI');
    }

    // Extract the generated text
    const generatedText = response.choices[0].message.content;

    // Calculate tokens used
    const tokensUsed = {
      promptTokens: response.usage.prompt_tokens,
      completionTokens: response.usage.completion_tokens,
      totalTokens: response.usage.total_tokens
    };

    // Estimate cost
    const cost = calculateCost(tokensUsed.promptTokens, tokensUsed.completionTokens, "gpt-3.5-turbo");

    console.log(`✅ Product titles generated successfully (${tokensUsed.totalTokens} tokens, ${generationTime}ms)`);

    return {
      text: generatedText,
      metadata: {
        modelUsed: "gpt-3.5-turbo",
        tokensUsed: tokensUsed.totalTokens,
        generationTime,
        cost
      }
    };
  } catch (error) {
    console.error('❌ AI title generation error:', error);
    throw new Error(`Failed to generate product title: ${error.message}`);
  }
};

/**
 * Generate alternative versions of existing content
 * @param {String} originalContent - Original content to improve
 * @param {Object} instructions - Specific improvement instructions
 * @returns {Promise<Object>} - Generated alternatives and metadata
 */
exports.generateAlternatives = async (originalContent, instructions) => {
  try {
    console.log('Generating content alternatives...');
    
    const startTime = Date.now();
    
    // Create prompt for alternatives
    const prompt = `
      I have the following e-commerce content:
      
      "${originalContent}"
      
      Please generate 2 alternative versions with these specific instructions:
      ${instructions}
      
      For each alternative, explain briefly why it might perform better.
    `;
    
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert e-commerce copywriter who specializes in optimizing content for better conversion and engagement."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });
    
    const endTime = Date.now();
    const generationTime = endTime - startTime;
    
    // Extract the generated text
    const generatedText = response.data.choices[0].message.content;
    
    // Calculate tokens used
    const tokensUsed = {
      promptTokens: response.data.usage.prompt_tokens,
      completionTokens: response.data.usage.completion_tokens,
      totalTokens: response.data.usage.total_tokens
    };
    
    // Estimate cost
    const cost = calculateCost(tokensUsed.promptTokens, tokensUsed.completionTokens, "gpt-3.5-turbo");
    
    console.log(`✅ Content alternatives generated successfully (${tokensUsed.totalTokens} tokens, ${generationTime}ms)`);
    
    return {
      text: generatedText,
      metadata: {
        modelUsed: "gpt-3.5-turbo",
        tokensUsed: tokensUsed.totalTokens,
        generationTime,
        cost
      }
    };
  } catch (error) {
    console.error('❌ AI alternatives generation error:', error);
    throw new Error(`Failed to generate content alternatives: ${error.message}`);
  }
};