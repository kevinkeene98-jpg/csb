import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { redis } from '@/lib/redis';
import { Restaurant, Answer } from '@/lib/questions';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface OutputEntry {
  roast: string;
  secretWeapon: string;
}

async function getRecentOutputs(restaurant: Restaurant): Promise<OutputEntry[]> {
  try {
    const key = `corporateslopbowl:history:${restaurant.toLowerCase()}`;
    const outputs = await redis.lrange<OutputEntry>(key, 0, 4);
    return outputs || [];
  } catch (error) {
    console.error('Error getting recent outputs:', error);
    return [];
  }
}

async function saveOutput(restaurant: Restaurant, roast: string, secretWeapon: string): Promise<void> {
  try {
    const key = `corporateslopbowl:history:${restaurant.toLowerCase()}`;
    await redis.lpush(key, { roast, secretWeapon });
    await redis.ltrim(key, 0, 4); // Keep only last 5
  } catch (error) {
    console.error('Error saving output:', error);
  }
}

interface RequestBody {
  restaurant: Restaurant;
  answers: Answer[];
  name: string;
}

const restaurantContext: Record<Restaurant, { modifiers: string[]; secretWeapons: string[] }> = {
  Chipotle: {
    modifiers: [
      'burrito-brained',
      'foil-wrapped',
      'guac-adjacent',
      'double-meat',
      'bowl-maximizing',
      'queso-dependent',
      'extra-rice',
      'lime-wedge',
    ],
    secretWeapons: [
      'Extra guac',
      'Double-wrapped burrito',
      'Tabasco hoarding',
      'The online pickup shelf',
      'Free chips and queso',
      'Sofritas curiosity',
    ],
  },
  Sweetgreen: {
    modifiers: [
      'kale-driven',
      'harvest-bowl-coded',
      'locally-sourced',
      'warm-grain-based',
      'dressing-on-the-side',
      'plant-forward',
      'seasonal-menu-dependent',
      'crispy-rice-optimized',
    ],
    secretWeapons: [
      'Heaping globs of dressing',
      'Warm grain bowls',
      'The Harvest Bowl',
      'Crispy rice',
      'Sweetpass subscription',
      'Miso-glazed everything',
    ],
  },
  Cava: {
    modifiers: [
      'pita-chip-pilled',
      'harissa-drizzled',
      'feta-crumbled',
      'grain-bowl-adjacent',
      'tzatziki-based',
      'mediterranean-coded',
      'hummus-dependent',
      'spicy-lamb-optimized',
    ],
    secretWeapons: [
      'Crazy feta',
      'Extra pita chips',
      'Harissa drizzle',
      'Triple hummus',
      'Spicy lamb meatballs',
      'Garlic dressing overflow',
    ],
  },
};

export async function POST(request: Request) {
  const body: RequestBody = await request.json();
  const { restaurant, answers, name } = body;

  try {
    const context = restaurantContext[restaurant];
    
    // Get recent outputs to avoid repetition
    const recentOutputs = await getRecentOutputs(restaurant);
    
    // Build context about the user's choices
    const choicesSummary = answers.map(a => {
      const questionMap: Record<string, string> = {
        base: 'corporate archetype',
        protein: 'superpower',
        toppings: 'quirk',
        extras: 'when they\'re extra',
      };
      return `${questionMap[a.questionId]}: ${a.optionId}`;
    }).join(', ');

    // Build recent outputs section for the prompt
    let recentOutputsText = '';
    if (recentOutputs.length > 0) {
      recentOutputsText = `

IMPORTANT - Avoid repeating these recent outputs for ${restaurant}:
${recentOutputs.map((o, i) => `${i + 1}. Roast: "${o.roast}" | Secret weapon: "${o.secretWeapon}"`).join('\n')}

Do NOT reuse any of these roasts, modifiers, nouns, verbs, or secret weapons. Be completely different and original.`;
    }

    const prompt = `You are a satirical copywriter for CorporateSlopBowl.com, a personality test that assigns people a fast-casual restaurant identity. The tone is dry, observational, deadpan, and slightly judgmental but never cruel. Think corporate humor for tech workers who know what "all-hands" means.

The user "${name}" has been identified as: ${restaurant}

Their quiz answers: ${choicesSummary}

Example modifiers for ${restaurant}: ${context.modifiers.join(', ')}

Generate a roast in this EXACT format:
1. A sentence structured as: "You're a [modifier] [noun] who [verb] [adjective] [direct object]."
   - The modifier should be from or inspired but not directly-drawn by the list above, themed to ${restaurant}
   - The noun should describe their personality (Examples: "idealist", "pragmatist", "optimist", "realist", "strategist"). Use the examples as inspiration but don't draw from them directly.
   - The verb should reflect workplace behavior
   - The adjective should add color to the direct object
   - The direct object should be a corporate trope
   - Do NOT add a prepositional phrase - end the sentence after the direct object

Rules:
- Be creative, funny, and random with your outputs
- Reference their specific quiz choices subtly
- The humor should feel like an observation, not a punchline
- No exclamation points
- The roast must be 12 words or fewer - keep it tight and punchy
- Secret weapon must be 4 words or fewer - make it gross/sloppy sounding (e.g., "Leaky dressing packets", "Soggy grain overflow", "Lukewarm queso puddle", "Wilted kale residue")
${recentOutputsText}

Also include:
- A secret weapon (something commonly associated with ${restaurant}, max 4 words, gross/sloppy sounding)
- A personality blurb (3-4 words that summarize their vibe, like "Earnest, reflective, and conflicted" or "Loud, confident, and wrong")

Respond in JSON format:
{
  "roast": "Your roast sentence here",
  "secretWeapon": "Your secret weapon here",
  "blurb": "Your personality blurb here"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 1.2,
      max_tokens: 300,
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No content in response');
    }

    const result = JSON.parse(content);

    // Save to history
    await saveOutput(restaurant, result.roast, result.secretWeapon);

    return NextResponse.json({
      restaurant,
      roast: result.roast,
      secretWeapon: result.secretWeapon,
      blurb: result.blurb,
    });
  } catch (error) {
    console.error('Error generating result:', error);
    
    // Fallback responses if API fails
    const fallbacks: Record<Restaurant, { roast: string; secretWeapon: string; blurb: string }> = {
      Chipotle: {
        roast: "You're a foil-wrapped pragmatist who avoids uncomfortable eye contact.",
        secretWeapon: "Lukewarm queso puddle",
        blurb: "Practical, unbothered, and efficient",
      },
      Sweetgreen: {
        roast: "You're a kale-driven idealist who schedules unnecessary meetings.",
        secretWeapon: "Soggy grain residue",
        blurb: "Earnest, reflective, and conflicted",
      },
      Cava: {
        roast: "You're a harissa-drizzled opportunist who ignores passive-aggressive emails.",
        secretWeapon: "Leaky tzatziki spillage",
        blurb: "Bold, social, and slightly chaotic",
      },
    };

    const fallback = fallbacks[restaurant];

    return NextResponse.json({
      restaurant,
      roast: fallback.roast,
      secretWeapon: fallback.secretWeapon,
      blurb: fallback.blurb,
    });
  }
}
