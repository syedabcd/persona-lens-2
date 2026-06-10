
export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  publishDate: string;
  relatedSlugs: string[];
  image_url?: string;
  author?: string;
  meta_description?: string;
}

const AUTHOR_TEAM = "Mindlyt Psychology Team";

export const blogPosts: BlogPost[] = [
  {
    id: 'how-to-start-conversation',
    slug: 'how-to-start-conversation-with-crush',
    title: 'How to Start a Conversation With Someone You Like (Without Being Awkward)',
    summary: 'Freezing up when you see your crush? Learn the psychological tricks to break the ice, sending the perfect opening text, and avoiding the "Hey" trap.',
    category: 'Dating Advice',
    publishDate: '2024-06-10',
    relatedSlugs: ['red-flags-in-texting', 'psychology-of-ghosting', 'dry-texting-meaning'],
    image_url: 'https://images.unsplash.com/photo-1516575334481-f85287c2c81d?q=80&w=2000&auto=format&fit=crop',
    author: AUTHOR_TEAM,
    meta_description: 'Don\'t know what to say to your crush? Here are 10 conversation starters for texting and real life that actually work, backed by psychology.',
    content: `
      <p>We have all been there. You see someone you like across the room, or you match with someone on a dating app who seems perfect. You pick up your phone or take a step forward, and then you freeze. Your mind goes blank. The fear of rejection kicks in, and suddenly, saying "hello" feels like the hardest thing in the world.</p>
      
      <p>Knowing how to start a conversation with someone you like is a skill that intimidates almost everyone. The stakes feel high because you care about the outcome. You want to seem funny, smart, and confident, but you are worried you will come across as awkward or desperate.</p>
      
      <p>The good news is that starting a conversation doesn't require a perfect pickup line. In fact, rehearsed lines often fail because they feel unnatural. The best interactions are built on curiosity, context, and low-pressure communication.</p>
      
      <p>This guide will walk you through exactly how to talk to your crush, whether you are standing in a coffee shop, staring at a blank text window, or trying to reply to an Instagram story.</p>

      <h2>Why Is It So Hard to Just Say "Hi"?</h2>
      <p>Before we look at what to say, it helps to understand why this feels so difficult. When you like someone, your brain stops treating the interaction as a casual exchange and starts treating it as a performance.</p>
      <p>You are not just afraid of them saying nothing; you are afraid of being judged. This is often called the "spotlight effect." You feel like every word you say is being scrutinized under a microscope. In reality, the other person is likely just as preoccupied with their own thoughts—or their own awkwardness—as you are with yours.</p>
      <p>The pressure creates a paradox. The more you want to impress someone, the harder it becomes to act naturally. The key to learning how to not be awkward while texting or talking is to lower the stakes in your own mind. You aren't trying to make them fall in love with you in the first sentence. You are simply trying to open a door to see if they want to walk through it.</p>
      
      <h3>The "Hey" Trap</h3>
      <p>Sending a text that just says "Hey," "Hi," or "What’s up?" is the most common mistake in modern dating. While it seems safe, it is actually high-risk.</p>
      <p>It shifts the entire burden of the conversation onto the other person. You are essentially saying, "I want to talk to you, but I don't have anything to say, so you entertain me." Most people, especially attractive people on dating apps, ignore these messages because they are low-effort.</p>

      <h2>How to Keep the Conversation Going</h2>
      <p>If they reply, pivot immediately to a question or a story. Don't just say "cool." Ask them about their day, their opinions, or share a small detail about your own life that relates to the topic.</p>
      
      <p>Confidence comes from action. The more you practice starting conversations, the easier it gets.</p>
    `
  },
  {
    id: 'red-flags-texting',
    slug: 'red-flags-in-texting',
    title: 'Red Flags in Texting You Should Never Ignore',
    summary: 'Texting patterns reveal character. Spot the warning signs of hot-and-cold behavior, dry texting, love bombing, and other digital red flags early.',
    category: 'Red Flags',
    publishDate: '2024-06-11',
    relatedSlugs: ['how-to-start-conversation-with-crush', 'psychology-of-ghosting', 'love-bombing-guide'],
    image_url: 'https://images.unsplash.com/photo-1596766324296-1c609c25227d?q=80&w=2000&auto=format&fit=crop',
    author: AUTHOR_TEAM,
    meta_description: 'Is their texting style toxic? Learn to identify 8 major red flags in texting, from love bombing to the silent treatment.',
    content: `
      <p>Modern dating happens largely on our phones. Before you go on a first date, text messaging is the primary way you connect. Because so much of our interaction is digital, the way someone texts can tell you a lot about who they are.</p>
      
      <h2>The Hot and Cold Dynamic</h2>
      <p>This is one of the most psychologically damaging behaviors. One week, they are texting you constantly. The next week, they vanish. This inconsistency creates "intermittent reinforcement," making you addicted to the highs.</p>

      <h2>The "Dry Texter"</h2>
      <p>You send a paragraph, they send "lol." If you are carrying 90% of the conversation, it's a sign of low interest or low effort. Relationships should be reciprocal.</p>

      <h2>Love Bombing</h2>
      <p>Too much, too soon? If they are calling you "soulmate" after two days of texting, run. This is often a manipulation tactic to gain trust quickly before the mask slips.</p>

      <p>Trust your gut. If texting them makes you anxious rather than happy, it's a red flag.</p>
    `
  },
  {
    id: '3',
    slug: 'psychology-of-ghosting',
    title: 'The Psychology of Ghosting: Why They Vanished',
    summary: 'Ghosting isn’t about you; it’s about their inability to handle conflict. Explore the avoidant attachment style and the digital cowardice behind silence.',
    category: 'Psychology',
    publishDate: '2024-05-20',
    relatedSlugs: ['texting-signs-of-a-narcissist'],
    image_url: 'https://images.unsplash.com/photo-1516575334481-f85287c2c81d?q=80&w=2000&auto=format&fit=crop',
    author: AUTHOR_TEAM,
    meta_description: 'Why do people ghost? It usually has more to do with their fear of conflict than your worth.',
    content: `<p>Ghosting is the ultimate passive-aggressive exit. Instead of having a difficult conversation, the ghoster chooses silence. This often stems from an avoidant attachment style or a lack of emotional maturity.</p><p>Understanding this can help you stop blaming yourself. Their silence is an answer: they are not capable of the communication you deserve.</p>`
  },
  {
    id: '4',
    slug: 'anxious-attachment-texting',
    title: 'Anxious Attachment: 5 Texting Habits That Push People Away',
    summary: 'Double texting? Apologizing constantly? Analyzing every emoji? Learn how anxious attachment manifests in digital communication and how to self-soothe.',
    category: 'Self Improvement',
    publishDate: '2024-05-21',
    relatedSlugs: [],
    image_url: 'https://images.unsplash.com/photo-1616053351989-1064560d2d3e?q=80&w=2000',
    meta_description: 'Coming soon.',
    content: `<p>Coming soon...</p>`
  },
  {
    id: '5',
    slug: 'dry-texting-meaning',
    title: 'Dry Texting: Is It Disinterest or Just Their Personality?',
    summary: 'One-word replies can be frustrating. Learn the difference between a "bad texter" and someone who is simply quietly quitting the conversation.',
    category: 'Signal Decoders',
    publishDate: '2024-05-22',
    relatedSlugs: [],
    image_url: 'https://images.unsplash.com/photo-1512428559087-560fa5ce7829?q=80&w=2000',
    meta_description: 'Coming soon.',
    content: `<p>Coming soon...</p>`
  },
  {
    id: '6',
    slug: 'love-bombing-guide',
    title: 'Love Bombing vs. Genuine Interest: The Critical Difference',
    summary: 'It feels amazing to be adored, but when does it become dangerous? How to tell if their intense attention is real love or a manipulative trap.',
    category: 'Red Flags',
    publishDate: '2024-05-23',
    relatedSlugs: [],
    image_url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=2000',
    meta_description: 'Coming soon.',
    content: `<p>Coming soon...</p>`
  }
];
