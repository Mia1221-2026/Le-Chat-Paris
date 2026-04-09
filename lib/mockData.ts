export interface MemoryCard {
  id: string;
  date: string; // YYYY-MM-DD
  image: string;
  caption: string;
  storyEn: string;
  storyFr: string;
  location?: string;
}

export const mockMemories: MemoryCard[] = [
  {
    id: "1",
    date: "2026-04-01",
    image: "https://picsum.photos/seed/paris-cafe/800/600",
    caption: "Morning coffee on Rue de Rivoli",
    storyEn:
      "A quiet Tuesday morning on Rue de Rivoli. I found a corner table at a small café, ordered a café crème, and watched the city wake up slowly. The waiter, an elderly man named Marcel, told me the secret to good café crème is patience — and a little bit of luck. I think he was right.",
    storyFr:
      "Un mardi matin tranquille sur la Rue de Rivoli. J'ai trouvé une table dans un coin d'un petit café, commandé un café crème, et regardé la ville se réveiller doucement. Le serveur, un vieil homme nommé Marcel, m'a dit que le secret d'un bon café crème, c'est la patience — et un peu de chance. Je crois qu'il avait raison.",
    location: "Rue de Rivoli, Paris",
  },
  {
    id: "2",
    date: "2026-04-03",
    image: "https://picsum.photos/seed/seine-bridge/800/600",
    caption: "Golden hour on Pont des Arts",
    storyEn:
      "The Seine glittered like hammered gold as I leaned on the railing of Pont des Arts. A street musician played something I didn't recognise — slow, melancholic, Parisian. Two pigeons argued over a fallen croissant. The light was perfect for exactly three minutes. I took one photo. I should have taken more.",
    storyFr:
      "La Seine scintillait comme de l'or battu lorsque je me suis appuyé sur le garde-corps du Pont des Arts. Un musicien de rue jouait quelque chose que je ne reconnaissais pas — lent, mélancolique, parisien. Deux pigeons se disputaient un croissant tombé. La lumière était parfaite pendant exactement trois minutes. J'ai pris une photo. J'aurais dû en prendre plus.",
    location: "Pont des Arts, Paris",
  },
  {
    id: "3",
    date: "2026-04-03",
    image: "https://picsum.photos/seed/montmartre/800/600",
    caption: "Afternoon in Montmartre",
    storyEn:
      "Climbed all 272 steps to Sacré-Cœur and felt entirely unprepared for the view. Paris spread out below like a soft watercolour, rooftops and chimneys and the faint line of the Eiffel Tower in the distance. A child nearby asked his mother why Paris was so beautiful. She shrugged and said, 'Elle a toujours été comme ça.' She always was.",
    storyFr:
      "J'ai gravi les 272 marches du Sacré-Cœur et me suis trouvé totalement impréparé pour la vue. Paris s'étendait en dessous comme une aquarelle douce, toits et cheminées et la silhouette lointaine de la Tour Eiffel. Un enfant demandait à sa mère pourquoi Paris était si belle. Elle a haussé les épaules et dit : 'Elle a toujours été comme ça.'",
    location: "Montmartre, Paris",
  },
  {
    id: "4",
    date: "2026-04-05",
    image: "https://picsum.photos/seed/marche-fleurs/800/600",
    caption: "Saturday at the flower market",
    storyEn:
      "Île de la Cité on a Saturday smells like spring and damp soil and something sugary from a nearby crêperie. I bought a single peony because I couldn't carry more, and walked back to the apartment with it tucked under my arm like a small, pink secret.",
    storyFr:
      "L'Île de la Cité un samedi sent le printemps, la terre humide et quelque chose de sucré venant d'une crêperie voisine. J'ai acheté une seule pivoine parce que je ne pouvais pas en porter plus, et je suis rentré à l'appartement avec elle sous le bras comme un petit secret rose.",
    location: "Marché aux Fleurs, Île de la Cité",
  },
  {
    id: "5",
    date: "2026-04-07",
    image: "https://picsum.photos/seed/bookshop/800/600",
    caption: "Shakespeare and Company",
    storyEn:
      "Spent an hour and a half inside Shakespeare and Company without buying anything, which felt both like a failure and a small triumph. The shop cat was asleep on a copy of Proust. A woman in the corner was reading Colette and laughing quietly to herself. I felt like I had wandered into a story.",
    storyFr:
      "J'ai passé une heure et demie chez Shakespeare and Company sans rien acheter, ce qui ressemblait à la fois à un échec et à un petit triomphe. Le chat de la librairie dormait sur un exemplaire de Proust. Une femme dans un coin lisait Colette et riait doucement pour elle-même. J'avais l'impression d'être entré dans une histoire.",
    location: "Shakespeare and Company, Paris",
  },
  {
    id: "6",
    date: "2026-04-07",
    image: "https://picsum.photos/seed/jardin-luxembourg/800/600",
    caption: "Chairs in the Jardin du Luxembourg",
    storyEn:
      "Found two empty iron chairs facing the fountain in the Jardin du Luxembourg and decided they were mine. I sat there for forty minutes eating a pain au chocolat and reading nothing, thinking nothing in particular. A man with a small dog passed three times. We never spoke but I felt we understood each other.",
    storyFr:
      "J'ai trouvé deux chaises en fer vides face à la fontaine du Jardin du Luxembourg et décidé qu'elles étaient les miennes. Je suis resté là quarante minutes à manger un pain au chocolat, sans lire, sans penser à rien en particulier. Un homme avec un petit chien est passé trois fois. Nous n'avons jamais parlé mais j'avais l'impression que nous nous comprenions.",
    location: "Jardin du Luxembourg, Paris",
  },
  {
    id: "7",
    date: "2026-04-07",
    image: "https://picsum.photos/seed/canal-saint-martin/800/600",
    caption: "Canal Saint-Martin at dusk",
    storyEn:
      "The Canal Saint-Martin turns amber at dusk. I watched a barge pass slowly under the iron footbridge, its wake spreading out in lazy circles. Someone on a nearby bench was playing guitar — badly, but earnestly. The trees had just started to bud. I took a photo and then put my phone away for the rest of the evening.",
    storyFr:
      "Le Canal Saint-Martin devient ambré au crépuscule. J'ai regardé une péniche passer lentement sous la passerelle en fer, son sillage se répandant en cercles paresseux. Quelqu'un sur un banc voisin jouait de la guitare — mal, mais sincèrement. Les arbres venaient tout juste de bourgeonner. J'ai pris une photo, puis j'ai rangé mon téléphone pour le reste de la soirée.",
    location: "Canal Saint-Martin, Paris",
  },
];

export const mockProfile = {
  name: "Sophie Laurent",
  avatarInitials: "SL",
  nativeLanguage: "English",
  targetLanguage: "French",
  languageLevel: "B1 — Intermediate",
  memoriesCount: mockMemories.length,
  streakDays: 12,
  location: "Paris, France",
};
