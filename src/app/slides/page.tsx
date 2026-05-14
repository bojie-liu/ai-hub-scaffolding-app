import { getSlides } from '@/lib/actions/slides';
import { SlidesClient } from './SlidesClient';

export default async function SlidesPage() {
  const result = await getSlides();
  const slides = result.success ? result.data : [];

  // If no slides in DB, use default slides from lesson plan
  const defaultSlides = slides && slides.length > 0 ? slides : [
    { id: 1, slideOrder: 0, title: 'The Modern Software Developer', content: 'University Lesson Plan\nExploring AI in Software Engineering', slideType: 'title', backgroundColor: null },
    { id: 2, slideOrder: 1, title: 'Learning Outcomes (ILOs)', content: '1. Analyze - Evolution of AI-augmented workflows vs traditional methods\n2. Evaluate - Ethical, technical & accessibility implications\n3. Apply - AI-powered tools to solve programming challenges\n4. Create - Prototype using iterative plan-generate-modify cycles', slideType: 'content', backgroundColor: null },
    { id: 3, slideOrder: 2, title: 'Pre-Class Preparation', content: 'Pre-Reading/Video (15 mins):\n• Watch "The State of Software Development in 2024" (YouTube)\n• Skim "Democratizing Code" article (Medium)\n\nPre-Test: 5 questions on AI workflows, ethics, and tools', slideType: 'content', backgroundColor: null },
    { id: 4, slideOrder: 3, title: 'Introduction (20 mins)', content: 'Hook (5 min): "Will AI replace developers?"\n- Live Mentimeter poll\n\nPre-Test Discussion (10 min):\n- Review misconceptions\n- Show aggregate results\n\nReal-World Connection (5 min):\n- Netflix AI testing frameworks', slideType: 'content', backgroundColor: null },
    { id: 5, slideOrder: 4, title: 'Activity 1: Interactive Lecture (30 min)', content: 'Topic: Evolution of Workflows\n\n0-1 Coding (Traditional):\n• Hand-written code (1990s-2010s)\n• Manual debugging & testing\n\nIterative Plan/Generate/Modify:\n• AI-assisted code generation\n• Rapid prototyping cycles\n\nThink-Pair-Share:\n"How might iterative workflows impact timelines?"', slideType: 'content', backgroundColor: null },
    { id: 6, slideOrder: 5, title: 'Activity 2: Group Case Study (30 min)', content: '18 groups of 5 students\n\nScenario: A non-technical entrepreneur builds an MVP with no-code tools\n\nTask:\n1. Analyze the scenario\n2. Identify pros & cons\n3. Post summaries to Padlet\n\nKey Debate: Speed vs. Security Risks', slideType: 'content', backgroundColor: null },
    { id: 7, slideOrder: 6, title: 'Activity 3: AI Tool Demo (30 min)', content: 'Live Demo: GitHub Copilot for Python\n\nScaffolded Task:\nStep 1: Instructor shows basic code completion\nStep 2: Students generate Fibonacci sequence\nStep 3: Peer pair-check for logical errors\n\nAccess: GitHub Copilot Free Trial', slideType: 'content', backgroundColor: null },
    { id: 8, slideOrder: 7, title: 'Activity 4: Ethics Role-Play (30 min)', content: 'Roles: Developer, End-User, Company Manager, Cybersecurity Expert\n\nScenario: AI-generated code introduces a privacy violation\n\nDiscussion Points:\n• Who is responsible?\n• How to mitigate risks?\n• Who owns AI-generated code?\n\nMentimeter Poll on ownership', slideType: 'content', backgroundColor: null },
    { id: 9, slideOrder: 8, title: 'Assessment Methods', content: 'Formative:\n• Mentimeter Polls - Real-time understanding\n• Padlet Submissions - Case study quality\n• Exit Ticket - 1-minute paper\n\nSummative:\nTake-Home Assignment (1 week):\n• Build a simple web app with AI tools\n• Rubric: Functionality (30%), Code quality (30%), Ethical reflection (40%)', slideType: 'content', backgroundColor: null },
    { id: 10, slideOrder: 9, title: 'Key Takeaways', content: '1. AI augments developers, not replaces them\n2. Ethical considerations are paramount\n3. Iterative workflows enable faster prototyping\n4. Accessibility & inclusivity drive innovation\n\nNext Session: Prompt Engineering for Code Generation\n\nPadlet: padlet.com/bojieliu711/agile-nnwo314w5anmx0ep', slideType: 'content', backgroundColor: null },
  ];

  return <SlidesClient slides={defaultSlides} />;
}
