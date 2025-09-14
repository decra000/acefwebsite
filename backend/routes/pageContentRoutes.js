const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();

// Cache to store scraped content (optional - helps with performance)
let contentCache = {
  data: null,
  lastUpdated: null,
  cacheExpiry: 5 * 60 * 1000 // 5 minutes cache
};

// Define your public pages to scrape
const PUBLIC_PAGES = [
  {
    path: '/',
    name: 'homepage',
    description: 'Main landing page with ACEF overview'
  },
  {
    path: '/about-us',
    name: 'about-us', 
    description: 'About ACEF mission, vision, and values'
  },
  {
    path: '/contact-us',
    name: 'contact-us',
    description: 'Contact information and form'
  },
  {
    path: '/get-involved',
    name: 'get-involved',
    description: 'Ways to get involved with ACEF'
  },
  {
    path: '/impact',
    name: 'impact',
    description: 'ACEF impact and achievements'
  },
  {
    path: '/insights',
    name: 'insights',
    description: 'Blog and news insights'
  },
  {
    path: '/projects',
    name: 'projects',
    description: 'Current and completed projects'
  }
];

// Helper function to clean and extract meaningful text
const cleanText = (text) => {
  return text
    .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
    .replace(/\n+/g, ' ') // Replace newlines with space
    .trim()
    .substring(0, 2000); // Limit to 2000 characters per section
};

// Helper function to extract structured content from HTML
const extractPageContent = ($, url, pageName) => {
  const content = {
    page: pageName,
    url: url,
    title: $('title').text() || '',
    metaDescription: $('meta[name="description"]').attr('content') || '',
    
    // Extract main content areas
    mainContent: '',
    headings: [],
    links: [],
    images: [],
    
    // Specific sections
    hero: '',
    features: [],
    testimonials: [],
    cta: '',
    
    lastScraped: new Date().toISOString()
  };

  // Extract main content (try multiple selectors)
  const mainSelectors = [
    'main', 
    '.main-content', 
    '#main', 
    '.content', 
    'article',
    '.container',
    '.page-content'
  ];
  
  let mainText = '';
  for (const selector of mainSelectors) {
    const element = $(selector);
    if (element.length > 0) {
      mainText = cleanText(element.text());
      if (mainText.length > 100) break; // Use the first substantial content found
    }
  }
  
  // Fallback: extract from body if no main content found
  if (!mainText || mainText.length < 100) {
    mainText = cleanText($('body').text());
  }
  
  content.mainContent = mainText;

  // Extract headings (h1, h2, h3)
  $('h1, h2, h3').each((i, elem) => {
    const heading = cleanText($(elem).text());
    if (heading && heading.length > 0) {
      content.headings.push({
        level: elem.tagName.toLowerCase(),
        text: heading.substring(0, 200)
      });
    }
  });

  // Extract hero section (common patterns)
  const heroSelectors = [
    '.hero', 
    '.banner', 
    '.jumbotron', 
    '.intro',
    '.hero-section',
    '.landing-hero'
  ];
  
  for (const selector of heroSelectors) {
    const heroElement = $(selector);
    if (heroElement.length > 0) {
      content.hero = cleanText(heroElement.text()).substring(0, 500);
      break;
    }
  }

  // Extract features/services
  $('.feature, .service, .benefit, .card').each((i, elem) => {
    const featureText = cleanText($(elem).text());
    if (featureText && featureText.length > 20 && featureText.length < 300) {
      content.features.push(featureText);
    }
  });

  // Extract testimonials
  $('.testimonial, .review, .quote').each((i, elem) => {
    const testimonialText = cleanText($(elem).text());
    if (testimonialText && testimonialText.length > 20) {
      content.testimonials.push(testimonialText.substring(0, 300));
    }
  });

  // Extract call-to-action text
  const ctaSelectors = ['.cta, .call-to-action, .action-button, .btn-primary'];
  for (const selector of ctaSelectors) {
    const ctaElement = $(selector);
    if (ctaElement.length > 0) {
      content.cta = cleanText(ctaElement.text()).substring(0, 200);
      break;
    }
  }

  // Extract important links
  $('a').each((i, elem) => {
    const linkText = cleanText($(elem).text());
    const href = $(elem).attr('href');
    if (linkText && href && linkText.length > 3 && linkText.length < 100) {
      content.links.push({
        text: linkText,
        href: href
      });
    }
  });

  return content;
};

// Main scraping function
const scrapePageContent = async (baseUrl) => {
  const results = [];
  const errors = [];

  console.log(`🕷️ Starting to scrape ${PUBLIC_PAGES.length} pages from ${baseUrl}`);

  for (const page of PUBLIC_PAGES) {
    try {
      const fullUrl = `${baseUrl}${page.path}`;
      console.log(`📄 Scraping: ${fullUrl}`);

      const response = await axios.get(fullUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'ACEF-Content-Scraper/1.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });

      if (response.status === 200) {
        const $ = cheerio.load(response.data);
        const pageContent = extractPageContent($, fullUrl, page.name);
        
        // Add page metadata
        pageContent.description = page.description;
        pageContent.scrapedAt = new Date().toISOString();
        
        results.push(pageContent);
        console.log(`✅ Successfully scraped: ${page.name} (${pageContent.mainContent.length} chars)`);
      }

    } catch (error) {
      console.error(`❌ Error scraping ${page.name}:`, error.message);
      errors.push({
        page: page.name,
        url: `${baseUrl}${page.path}`,
        error: error.message
      });
    }

    // Small delay between requests to be respectful
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return {
    success: true,
    pages: results,
    errors: errors,
    totalPages: PUBLIC_PAGES.length,
    successfulPages: results.length,
    failedPages: errors.length,
    scrapedAt: new Date().toISOString()
  };
};

// GET /api/page-content - Main endpoint
router.get('/', async (req, res) => {
  try {
    // Check cache first
    const now = Date.now();
    if (contentCache.data && 
        contentCache.lastUpdated && 
        (now - contentCache.lastUpdated) < contentCache.cacheExpiry) {
      
      console.log('📋 Serving cached page content');
      return res.json({
        ...contentCache.data,
        fromCache: true,
        cacheAge: Math.round((now - contentCache.lastUpdated) / 1000)
      });
    }

    // Determine the base URL for scraping
    const protocol = req.get('X-Forwarded-Proto') || req.protocol || 'http';
    const host = req.get('Host') || 'localhost:3000';
    const baseUrl = process.env.FRONTEND_URL || `${protocol}://${host.replace(':5000', ':3000')}`;
    
    console.log(`🌐 Base URL for scraping: ${baseUrl}`);

    // Scrape fresh content
    const scrapedData = await scrapePageContent(baseUrl);
    
    // Update cache
    contentCache.data = scrapedData;
    contentCache.lastUpdated = now;

    res.json({
      ...scrapedData,
      fromCache: false,
      baseUrl: baseUrl
    });

  } catch (error) {
    console.error('❌ Error in page-content endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to scrape page content',
      error: error.message,
      pages: [],
      totalPages: 0,
      successfulPages: 0,
      failedPages: PUBLIC_PAGES.length
    });
  }
});

// GET /api/page-content/refresh - Force refresh cache
router.get('/refresh', async (req, res) => {
  try {
    // Clear cache
    contentCache.data = null;
    contentCache.lastUpdated = null;

    // Get fresh data
    const protocol = req.get('X-Forwarded-Proto') || req.protocol || 'http';
    const host = req.get('Host') || 'localhost:3000';
    const baseUrl = process.env.FRONTEND_URL || `${protocol}://${host.replace(':5000', ':3000')}`;
    
    const scrapedData = await scrapePageContent(baseUrl);
    
    // Update cache
    contentCache.data = scrapedData;
    contentCache.lastUpdated = Date.now();

    res.json({
      ...scrapedData,
      message: 'Content refreshed successfully',
      fromCache: false
    });

  } catch (error) {
    console.error('❌ Error refreshing page content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh page content',
      error: error.message
    });
  }
});

// GET /api/page-content/pages - Get list of pages being scraped
router.get('/pages', (req, res) => {
  res.json({
    success: true,
    pages: PUBLIC_PAGES,
    totalPages: PUBLIC_PAGES.length,
    message: 'List of pages configured for scraping'
  });
});

// GET /api/page-content/status - Get scraping status
router.get('/status', (req, res) => {
  const now = Date.now();
  const hasCache = contentCache.data !== null;
  const cacheAge = hasCache ? Math.round((now - contentCache.lastUpdated) / 1000) : null;
  const cacheExpired = hasCache ? (now - contentCache.lastUpdated) > contentCache.cacheExpiry : true;

  res.json({
    success: true,
    status: {
      hasCache: hasCache,
      cacheAge: cacheAge,
      cacheExpired: cacheExpired,
      cacheExpiry: Math.round(contentCache.cacheExpiry / 1000),
      lastUpdated: contentCache.lastUpdated ? new Date(contentCache.lastUpdated).toISOString() : null,
      totalPagesConfigured: PUBLIC_PAGES.length,
      lastScrapedPages: contentCache.data ? contentCache.data.successfulPages : 0
    }
  });
});

module.exports = router;