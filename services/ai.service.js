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
    
    // Check if we have a product image
    if (productData.productImage) {
      console.log('\n=== Image URL Detected, Using GPT-4o with Vision ===');
      console.log('Image URL:', productData.productImage);
      
      try {
        // Make the API call with the image
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are a professional product description writer with expertise in visual analysis. Create compelling, accurate, and engaging product descriptions based on both textual information and product images."
            },
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                {
                  type: "image_url",
                  image_url: {
                    url: productData.productImage,
                  },
                }
              ]
            }
          ],
          temperature: getTemperatureForTone(options.tone),
          max_tokens: getLengthInTokens(options.length),
        });

        console.log('\n=== OpenAI Vision Response ===');
        console.log('Response Status:', completion.choices ? 'Success' : 'No choices available');
        
        const generatedText = completion.choices[0]?.message?.content || '';
        const promptTokens = completion.usage?.prompt_tokens || 0;
        const completionTokens = completion.usage?.completion_tokens || 0;
        
        // Calculate cost
        const estimatedCost = calculateCost(promptTokens, completionTokens, "gpt-4o");
        
        return {
          text: generatedText,
          metadata: {
            modelUsed: "gpt-4o",
            tokensUsed: promptTokens + completionTokens,
            promptTokens,
            completionTokens,
            estimatedCost,
            generationTime: Math.round(completion.created * 1000) // approx time in ms
          }
        };
      } catch (imageError) {
        console.error('\n=== Error using GPT-4o Vision ===');
        console.error('Error:', imageError);
        console.log('Falling back to standard text model...');
        
        // Fall back to standard model without image
        const standardCompletion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a professional product description writer. Create compelling, accurate, and engaging product descriptions."
            },
            {
              role: "user",
              content: prompt + "\n\nNote: There was a product image provided but it could not be analyzed."
            }
          ],
          temperature: getTemperatureForTone(options.tone),
          max_tokens: getLengthInTokens(options.length),
        });
        
        const generatedText = standardCompletion.choices[0]?.message?.content || '';
        const promptTokens = standardCompletion.usage?.prompt_tokens || 0;
        const completionTokens = standardCompletion.usage?.completion_tokens || 0;
        
        // Calculate cost
        const estimatedCost = calculateCost(promptTokens, completionTokens, "gpt-3.5-turbo");
        
        return {
          text: generatedText,
          metadata: {
            modelUsed: "gpt-3.5-turbo (image fallback)",
            tokensUsed: promptTokens + completionTokens,
            promptTokens,
            completionTokens,
            estimatedCost,
            generationTime: Math.round(standardCompletion.created * 1000),
            imageProcessingError: "Failed to process image. Used text-only generation."
          }
        };
      }
    } else {
      // Standard text-only generation
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
      
      const generatedText = completion.choices[0]?.message?.content || '';
      const promptTokens = completion.usage?.prompt_tokens || 0;
      const completionTokens = completion.usage?.completion_tokens || 0;
      
      // Calculate cost
      const estimatedCost = calculateCost(promptTokens, completionTokens, "gpt-3.5-turbo");
      
      return {
        text: generatedText,
        metadata: {
          modelUsed: "gpt-3.5-turbo",
          tokensUsed: promptTokens + completionTokens,
          promptTokens,
          completionTokens,
          estimatedCost,
          generationTime: Math.round(completion.created * 1000)
        }
      };
    }
  } catch (error) {
    console.error('\n=== AI Service Error ===');
    console.error('Error:', error);
    throw error;
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
    additionalInfo,
    keyPhrases,
    powerWords,
    avoidWords
  } = productData;

  const { tone = 'professional', style = 'balanced', brandVoiceId } = options;

  let prompt = `Write a compelling product description for the following product:\n\n`;
  prompt += `Product: ${productName}\n`;
  if (productCategory) prompt += `Category: ${productCategory}\n`;
  
  if (productFeatures.length > 0) {
    prompt += `Key Features:\n${productFeatures.map(f => `- ${f}`).join('\n')}\n`;
  }
  
  if (targetAudience) prompt += `Target Audience: ${targetAudience}\n`;
  if (keywords.length > 0) prompt += `Keywords to include: ${keywords.join(', ')}\n`;
  if (additionalInfo) prompt += `Additional Information: ${additionalInfo}\n`;

  // Add brand voice vocabulary if available
  if (keyPhrases && keyPhrases.length > 0) {
    prompt += `\nKey Phrases to Include: ${keyPhrases.join(', ')}\n`;
  }
  
  if (powerWords && powerWords.length > 0) {
    prompt += `\nPower Words to Include: ${powerWords.join(', ')}\n`;
  }
  
  if (avoidWords && avoidWords.length > 0) {
    prompt += `\nWords to Avoid: ${avoidWords.join(', ')}\n`;
  }

  prompt += `\nTone: ${tone}\n`;
  prompt += `Style: ${style}\n`;
  
  // Add brand voice ID if available
  if (brandVoiceId) {
    prompt += `\nUsing Brand Voice ID: ${brandVoiceId}\n`;
  }
  
  prompt += `\nPlease write a compelling, SEO-friendly product description that highlights the key benefits and features.`;

  // Add mention of image if provided
  if (productData.productImage) {
    prompt += `\nA product image has been provided and will be analyzed. Please describe the visual aspects of the product in the description.\n`;
  }

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
    'gpt-4o': {
      promptRate: 0.000005, // $0.005 per 1K tokens
      completionRate: 0.000015 // $0.015 per 1K tokens
    },
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
    
    console.log('OpenAI Response:', JSON.stringify(response, null, 2));
    
    if (!response || !response.choices || !response.choices[0]) {
      throw new Error('Invalid response from OpenAI API');
    }
    
    const generatedText = response.choices[0].message.content;
    
    const endTime = Date.now();
    const generationTime = endTime - startTime;
    
    // Calculate tokens used
    const tokensUsed = {
      promptTokens: response.usage.prompt_tokens,
      completionTokens: response.usage.completion_tokens,
      totalTokens: response.usage.total_tokens
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
    console.error('Error in OpenAI API call:', error);
    throw new Error(`Failed to generate content alternatives: ${error.message}`);
  }
};