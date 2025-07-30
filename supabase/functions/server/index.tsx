import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use("*", cors({
  origin: "*",
  allowHeaders: ["*"],
  allowMethods: ["*"],
}));

app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Content moderation filters
const CONTENT_FILTERS = {
  violence: ['wojna', 'bić', 'zabić', 'krzywdzić', 'bić się', 'walka', 'przemoc'],
  inappropriate: ['brzydkie słowo', 'przekleństwo', 'idiota', 'głupi'],
  politics: ['polityk', 'wybory', 'partia', 'rząd', 'prezydent'],
  adult: ['alkohol', 'piwo', 'wódka', 'narkotyk', 'seks'],
  scary: ['duch', 'potwór', 'straszny', 'horror', 'śmierć']
};

// Age-appropriate response templates
const RESPONSE_TEMPLATES = {
  'pre-reader': {
    maxLength: 80,
    language: 'simple',
    examples: 'Tak! To bardzo ciekawe pytanie!'
  },
  'early-reader': {
    maxLength: 120,
    language: 'normal', 
    examples: 'To świetne pytanie! Wyjaśnię ci to krok po kroku.'
  }
};

function checkContentFilter(question: string, userFilters: any = {}): { flagged: boolean, reason?: string } {
  const enabledFilters = { ...CONTENT_FILTERS, ...userFilters };
  
  for (const [category, keywords] of Object.entries(enabledFilters)) {
    if (Array.isArray(keywords)) {
      for (const keyword of keywords) {
        if (question.toLowerCase().includes(keyword.toLowerCase())) {
          return { 
            flagged: true, 
            reason: `Filtr: ${category === 'violence' ? 'przemoc' : 
                           category === 'inappropriate' ? 'nieodpowiednie' : 
                           category === 'politics' ? 'polityka' : 
                           category === 'adult' ? 'dla dorosłych' : 
                           'straszne treści'}` 
          };
        }
      }
    }
  }
  
  return { flagged: false };
}

async function generateAIResponse(question: string, childAge: number, language: string = 'pl'): Promise<string> {
  const ageGroup = childAge <= 6 ? 'pre-reader' : 'early-reader';
  const template = RESPONSE_TEMPLATES[ageGroup];
  
  // In a real implementation, this would call OpenAI API
  // For demo purposes, we'll create age-appropriate mock responses
  const mockResponses = {
    'pre-reader': {
      'dlaczego niebo jest niebieskie': 'Niebo jest niebieskie, bo światło słońca odbija się od powietrza! Jest bardzo piękne, prawda? 🌤️',
      'jak robi koza miau': 'Koty robią "miau" swoim głosem! Każde zwierzątko ma swój specjalny dźwięk. 🐱',
      'czy rybki śpią': 'Tak, rybki też śpią! Ale nie zamykają oczek jak my. Odpoczywają w wodzie. 🐟',
      'default': 'To bardzo ciekawe pytanie! Powiem ci o tym w prosty sposób. ✨'
    },
    'early-reader': {
      'jak działają rakiety': 'Rakiety kosmiczne działają jak bardzo potężne petardy! Spalają paliwo, które wypycha je w górę z wielką siłą, pozwalając im polecieć w kosmos. 🚀',
      'dlaczego dinozaury wyginęły': 'Naukowcy uważają, że wielka asteroida uderzyła w Ziemię 65 milionów lat temu. To spowodowało zmiany klimatu, które były zbyt trudne dla dinozaurów. 🦕',
      'jak powstają tęcze': 'Tęcza powstaje, gdy słońce świeci przez krople deszczu! Światło dzieli się na wszystkie kolory - czerwony, pomarańczowy, żółty, zielony, niebieski, indygo i fioletowy. 🌈',
      'default': 'Świetne pytanie! To zjawisko ma ciekawe wyjaśnienie naukowe, które postaram się przedstawić w zrozumiały sposób.'
    }
  };

  // Find best matching response
  const responses = mockResponses[ageGroup];
  const questionKey = question.toLowerCase();
  
  for (const [key, response] of Object.entries(responses)) {
    if (key !== 'default' && questionKey.includes(key)) {
      return response;
    }
  }
  
  return responses.default;
}

// Process question endpoint
app.post('/make-server-d8aca400/process-question', async (c) => {
  try {
    const { question, childId, childAge } = await c.req.json();
    
    if (!question || !childId) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Get user filters
    const userFilters = await kv.get(`filters:${childId}`) || {};
    
    // Check content filters
    const filterResult = checkContentFilter(question, userFilters.customKeywords);
    
    if (filterResult.flagged) {
      // Store flagged question for parent review
      await kv.set(`flagged:${childId}:${Date.now()}`, {
        question,
        childId,
        reason: filterResult.reason,
        timestamp: new Date().toISOString(),
        status: 'pending'
      });
      
      return c.json({ 
        flagged: true, 
        reason: filterResult.reason,
        message: 'Pytanie zostało wysłane do rodzica do sprawdzenia.'
      });
    }

    // Generate AI response
    const aiResponse = await generateAIResponse(question, childAge);
    
    // Store conversation
    const conversationId = `conversation:${childId}:${Date.now()}`;
    await kv.set(conversationId, {
      question,
      answer: aiResponse,
      childId,
      timestamp: new Date().toISOString(),
      approved: true
    });

    // Generate video suggestion
    const videoSuggestion = question.toLowerCase().includes('rakiet') ? 
      'Jak działają rakiety - YouTube Kids' :
      question.toLowerCase().includes('niebo') ?
      'Dlaczego niebo jest niebieskie - YouTube Kids' :
      'Ciekawy film na YouTube Kids';

    return c.json({
      success: true,
      answer: aiResponse,
      videoSuggestion,
      conversationId
    });

  } catch (error) {
    console.log(`Error processing question: ${error}`);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get conversation history
app.get('/make-server-d8aca400/history/:childId', async (c) => {
  try {
    const childId = c.req.param('childId');
    const conversations = await kv.getByPrefix(`conversation:${childId}:`);
    
    const sortedConversations = conversations
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50); // Limit to 50 most recent

    return c.json({ conversations: sortedConversations });
  } catch (error) {
    console.log(`Error fetching history: ${error}`);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get flagged questions for parent
app.get('/make-server-d8aca400/flagged/:childId', async (c) => {
  try {
    const childId = c.req.param('childId');
    const flagged = await kv.getByPrefix(`flagged:${childId}:`);
    
    const sortedFlagged = flagged
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return c.json({ flagged: sortedFlagged });
  } catch (error) {
    console.log(`Error fetching flagged questions: ${error}`);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Update content filters
app.post('/make-server-d8aca400/filters/:childId', async (c) => {
  try {
    const childId = c.req.param('childId');
    const filters = await c.req.json();
    
    await kv.set(`filters:${childId}`, filters);
    
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error updating filters: ${error}`);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Approve/reject flagged question
app.post('/make-server-d8aca400/moderate/:questionId', async (c) => {
  try {
    const questionId = c.req.param('questionId');
    const { action, childId } = await c.req.json(); // 'approve' or 'reject'
    
    const flaggedQuestion = await kv.get(questionId);
    if (!flaggedQuestion) {
      return c.json({ error: 'Question not found' }, 404);
    }

    if (action === 'approve') {
      // Generate AI response for approved question
      const childAge = 7; // Default age, should be passed from frontend
      const aiResponse = await generateAIResponse(flaggedQuestion.question, childAge);
      
      // Store approved conversation
      const conversationId = `conversation:${childId}:${Date.now()}`;
      await kv.set(conversationId, {
        question: flaggedQuestion.question,
        answer: aiResponse,
        childId,
        timestamp: new Date().toISOString(),
        approved: true,
        parentApproved: true
      });
    }

    // Update flagged question status
    await kv.set(questionId, {
      ...flaggedQuestion,
      status: action === 'approve' ? 'approved' : 'rejected',
      moderatedAt: new Date().toISOString()
    });

    return c.json({ success: true });
  } catch (error) {
    console.log(`Error moderating question: ${error}`);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Export user data (RODO compliance)
app.get('/make-server-d8aca400/export/:childId', async (c) => {
  try {
    const childId = c.req.param('childId');
    
    const conversations = await kv.getByPrefix(`conversation:${childId}:`);
    const flagged = await kv.getByPrefix(`flagged:${childId}:`);
    const filters = await kv.get(`filters:${childId}`) || {};
    
    const exportData = {
      childId,
      exportDate: new Date().toISOString(),
      conversations,
      flaggedQuestions: flagged,
      contentFilters: filters,
      totalQuestions: conversations.length,
      flaggedCount: flagged.length
    };

    return c.json(exportData);
  } catch (error) {
    console.log(`Error exporting data: ${error}`);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Delete all user data
app.delete('/make-server-d8aca400/delete/:childId', async (c) => {
  try {
    const childId = c.req.param('childId');
    
    // Get all keys for this child
    const conversations = await kv.getByPrefix(`conversation:${childId}:`);
    const flagged = await kv.getByPrefix(`flagged:${childId}:`);
    
    // Delete all data
    const keysToDelete = [
      ...conversations.map((_, i) => `conversation:${childId}:${i}`),
      ...flagged.map((_, i) => `flagged:${childId}:${i}`),
      `filters:${childId}`
    ];

    await kv.mdel(keysToDelete);
    
    return c.json({ success: true, deletedItems: keysToDelete.length });
  } catch (error) {
    console.log(`Error deleting user data: ${error}`);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Health check
app.get('/make-server-d8aca400/health', (c) => {
  return c.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

serve(app.fetch);