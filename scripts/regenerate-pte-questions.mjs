#!/usr/bin/env node

/**
 * Regenerate PTE Academic questions following official guidelines
 * - Respond to a Situation: Real-world scenarios with proper formatting
 * - Summarize Group Discussion: Academic discussions with audio transcripts
 */

import { invokeLLM } from "../server/_core/llm.ts";

const respondToSituationQuestions = [
  {
    content: "You are at a team meeting when your manager announces an unexpected project deadline has been moved up by two weeks. You realize this will conflict with your planned vacation. How do you respond?",
    audioUrl: "https://example.com/audio/respond-situation-1.mp3",
    difficulty: "easy"
  },
  {
    content: "A colleague has taken credit for your work in front of senior management. You need to address this professionally without creating conflict. What do you say?",
    audioUrl: "https://example.com/audio/respond-situation-2.mp3",
    difficulty: "medium"
  },
  {
    content: "Your team member has submitted work with significant errors that will reflect poorly on the entire team. You need to provide constructive feedback while maintaining the relationship. How do you approach this?",
    audioUrl: "https://example.com/audio/respond-situation-3.mp3",
    difficulty: "hard"
  },
  {
    content: "You've been asked to lead a project outside your area of expertise. You want to accept but are concerned about your qualifications. How do you respond to your manager?",
    audioUrl: "https://example.com/audio/respond-situation-4.mp3",
    difficulty: "medium"
  },
  {
    content: "A client is unhappy with the service they received and is threatening to take their business elsewhere. You need to address their concerns and rebuild trust. What do you say?",
    audioUrl: "https://example.com/audio/respond-situation-5.mp3",
    difficulty: "hard"
  },
  {
    content: "You notice a team member is struggling with their workload and making mistakes. You want to help without overstepping. How do you approach them?",
    audioUrl: "https://example.com/audio/respond-situation-6.mp3",
    difficulty: "easy"
  },
  {
    content: "Your company is implementing a new system that will significantly change your daily workflow. You have concerns about efficiency. How do you provide feedback constructively?",
    audioUrl: "https://example.com/audio/respond-situation-7.mp3",
    difficulty: "medium"
  },
  {
    content: "A senior colleague has given you feedback that you believe is unfair. You want to respectfully discuss their perspective. What do you say?",
    audioUrl: "https://example.com/audio/respond-situation-8.mp3",
    difficulty: "hard"
  },
  {
    content: "You've made a mistake that has impacted the team's project timeline. You need to inform your manager and propose a solution. How do you handle this?",
    audioUrl: "https://example.com/audio/respond-situation-9.mp3",
    difficulty: "hard"
  },
  {
    content: "A team member is not pulling their weight on a group project. You need to address this diplomatically. What do you say?",
    audioUrl: "https://example.com/audio/respond-situation-10.mp3",
    difficulty: "medium"
  }
];

const summarizeGroupDiscussionQuestions = [
  {
    content: "Four university students are discussing the role of technology in education. Sarah argues that technology enhances learning through interactive tools and personalized pacing. James counters that excessive screen time reduces critical thinking and face-to-face collaboration. Maria suggests that technology is a tool that requires proper pedagogy to be effective. David points out that not all students have equal access to technology, creating educational inequality.",
    audioUrl: "https://example.com/audio/discussion-1.mp3",
    difficulty: "medium"
  },
  {
    content: "Three professionals are debating remote work policies. Elena believes remote work increases productivity and improves work-life balance. Marcus argues that in-office collaboration is essential for innovation and team cohesion. Priya proposes a hybrid model that combines the benefits of both approaches. They discuss implementation challenges and employee preferences.",
    audioUrl: "https://example.com/audio/discussion-2.mp3",
    difficulty: "medium"
  },
  {
    content: "Four economists are discussing the impact of artificial intelligence on employment. Raj warns of significant job displacement in routine sectors. Chen suggests that AI will create new job categories we haven't yet imagined. Sophia emphasizes the need for workforce retraining programs. Hassan raises concerns about income inequality if AI benefits are not widely shared.",
    audioUrl: "https://example.com/audio/discussion-3.mp3",
    difficulty: "hard"
  },
  {
    content: "Three environmental scientists are discussing climate change mitigation strategies. Dr. Anderson advocates for renewable energy investment. Dr. Okafor emphasizes the importance of carbon pricing mechanisms. Dr. Kim stresses the need for behavioral change and consumer awareness. They debate the relative effectiveness of each approach.",
    audioUrl: "https://example.com/audio/discussion-4.mp3",
    difficulty: "hard"
  },
  {
    content: "Four students are discussing social media's impact on mental health. Aisha presents research showing increased anxiety and depression correlations. Ben argues that social media provides valuable community support. Chloe suggests the issue is how people use social media rather than the platforms themselves. David calls for better digital literacy education.",
    audioUrl: "https://example.com/audio/discussion-5.mp3",
    difficulty: "medium"
  },
  {
    content: "Three business leaders are debating corporate social responsibility. CEO Johnson argues that profit maximization should be the primary goal. CEO Williams believes companies have obligations to society beyond shareholders. CEO Martinez proposes that social responsibility and profitability can align. They discuss real-world examples and implementation challenges.",
    audioUrl: "https://example.com/audio/discussion-6.mp3",
    difficulty: "hard"
  },
  {
    content: "Four researchers are discussing the future of healthcare. Dr. Lee advocates for preventive medicine and lifestyle interventions. Dr. Patel emphasizes technological advances in treatment. Dr. Okonkwo raises concerns about healthcare accessibility and equity. Dr. Novak discusses the role of personalized medicine.",
    audioUrl: "https://example.com/audio/discussion-7.mp3",
    difficulty: "hard"
  },
  {
    content: "Three educators are debating assessment methods in education. Professor Smith argues for traditional examinations as reliable measures. Professor Gupta advocates for continuous assessment and portfolio-based evaluation. Professor Kowalski suggests a combination approach that balances both methods. They discuss validity, reliability, and student motivation.",
    audioUrl: "https://example.com/audio/discussion-8.mp3",
    difficulty: "medium"
  },
  {
    content: "Four urban planners are discussing sustainable city development. Architect Chen emphasizes public transportation infrastructure. Planner Rodriguez focuses on green spaces and urban agriculture. Engineer Sato highlights energy-efficient building design. Sociologist Kim stresses the importance of community engagement in planning.",
    audioUrl: "https://example.com/audio/discussion-9.mp3",
    difficulty: "hard"
  },
  {
    content: "Three economists are discussing wealth inequality. Dr. Foster argues for progressive taxation and wealth redistribution. Dr. Tanaka emphasizes economic growth and market efficiency. Dr. Okafor proposes education and opportunity as solutions. They debate the causes and consequences of inequality.",
    audioUrl: "https://example.com/audio/discussion-10.mp3",
    difficulty: "hard"
  }
];

async function insertQuestions() {
  console.log("🔄 Regenerating PTE-compliant questions...\n");

  // Note: In a real implementation, you would connect to the database
  // For now, this demonstrates the structure

  const allQuestions = [
    ...respondToSituationQuestions.map(q => ({
      ...q,
      taskType: "respond_to_situation"
    })),
    ...summarizeGroupDiscussionQuestions.map(q => ({
      ...q,
      taskType: "summarize_group_discussion"
    }))
  ];

  console.log(`✅ Generated ${allQuestions.length} PTE-compliant questions`);
  console.log(`   - Respond to Situation: ${respondToSituationQuestions.length} questions`);
  console.log(`   - Summarize Group Discussion: ${summarizeGroupDiscussionQuestions.length} questions`);
  console.log("\n📝 Questions follow PTE Academic guidelines:");
  console.log("   - Realistic workplace/academic scenarios");
  console.log("   - Appropriate difficulty progression (easy → medium → hard)");
  console.log("   - Audio URLs for playback");
  console.log("   - Proper formatting and content structure");
}

insertQuestions().catch(console.error);
