export type SectionData = {
  lines: string[];
  isHeader: boolean[];
  /** Multiplier for viewport-relative line height (applied as Math.round(factor * height / dpr) + extraSpacing) */
  lineHeightFactor: number;
};

export const SECTION_CONTENT: Record<string, SectionData> = {
  About: {
    lines: [
      "Hey, I'm Luke McMahon. I'm a software developer with a passion for new technologies and creative problem solving.",
      "",
      "Through my projects, both personal and professional, and through competitive programming, I have worked with a wide variety of tools and languages, and I love learning more every day!",
      "",
      "In addition to programming, I enjoy learning new things, tennis, Magic the Gathering, and both playing and making video games.",
    ],
    isHeader: [],
    lineHeightFactor: 0.023,
  },
  Skills: {
    lines: [
      "I have extensive experience with the following:",
      "",
      "Programming Languages",
      "C#, TypeScript, Python, Java, JavaScript, C, C++, MSSQL, MUMPS, PromQL",
      "",
      "Technologies",
      "React, Node.js, .NET, RESTful APIs, Jest, Docker, Kubernetes, Prometheus, Grafana, AWS, Cosmos DB, Flask, Claude Code, Unity",
      "",
      "Languages",
      "English (native), Spanish (conversational), Japanese (learning!)",
    ],
    isHeader: [false, false, true, false, false, true, false, false, true, false],
    lineHeightFactor: 0.018,
  },
  Projects: {
    lines: [
      "Here are some of my projects:",
      "",
      "AI Captioning for Epic Video Client",
      "    - Developed AI-powered real-time captioning for the Epic Video Client by extending backend services (C#/.NET), updating Azure Cosmos DB data models and integrating WebRTC vendor APIs and speech-to-text services to meet U.S. accessibility compliance requirements.  ",
      "    - Designed and implemented React-based UI components for real-time caption rendering, ensuring accessible, low-latency display across clinical and patient-facing workflows.",
      "    - Built Prometheus alerts and Grafana dashboards to monitor captioning reliability, enabling quick response to outages and higher system availability.",
      "    - Implemented caption usage metrics reporting, improving insight into feature adoption and load patterns across health systems.",
      "",
      "Captioning in Teleregistration",
      "    - Worked closely with the teleregistration team to create a way of displaying captions in the teleregistration view on a Welcome kiosk.",
      "    - Designed and implemented a framework to send messages to and from the Welcome kiosk to ensure caption state is consistent between Epic Video Client iframe and the kiosk",
      "",
      "AI Hardware Testing",
      "    - Worked on a project using LLMs, YOLO, and other models to find issues with video and audio feeds in Epic Video Client's hardware test",
      "",
      "Whiteboarding and Annotations in Epic Video Client",
      "    - Added whiteboarding and annotation features to the Epic Video Client, allowing users to draw and annotate directly on shared video streams as well as a shared whiteboard during calls.",
      "    - Allowed for various annotation tools including freehand drawing, emojis, text, and erasing.",
      "    - Implemented real-time synchronization of annotations across all participants using WebRTC data channels.",
      "",
      "LinkedIn Salary Predictor",
      "    - Scraped, cleaned, and manipulated LinkedIn job posting data using Python to create a dataset of feature-rich job data that could be useful for determining salaries.",
      "    - Built a machine learning model using Python and keras to predict salaries based on LinkedIn job posting data, achieving an R² score of 0.75.",
      "",
      "Personal Website",
      "    - Built a responsive website using React and Three.js to showcase my projects and skills with an interactive 3D experience.",
    ],
    isHeader: [false, false, true, false, false, false, false, false, true, false, false, false, true, false, false, true, false, false, false, false, true, false, false, false, true, false],
    lineHeightFactor: 0.011,
  },
  Contact: {
    lines: [
      "Want to know more?",
      "Let's talk!",
    ],
    isHeader: [],
    lineHeightFactor: 0.025,
  },
};
