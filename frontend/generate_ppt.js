const pptxgen = require("pptxgenjs");

let pptx = new pptxgen();

// Slide 1: Title
let slide1 = pptx.addSlide();
slide1.addText("LocalSathi", { x: 1.5, y: 1.5, w: "70%", fontSize: 48, bold: true, color: "e05a76", align: "center" });
slide1.addText("Your Ultimate Local Travel Companion", { x: 1.5, y: 2.5, w: "70%", fontSize: 24, color: "666666", align: "center" });
slide1.addText("Project Presentation", { x: 1.5, y: 3.2, w: "70%", fontSize: 18, color: "999999", align: "center" });

// Slide 2: Problem
let slide2 = pptx.addSlide();
slide2.addText("The Challenge of Local Travel", { x: 0.5, y: 0.5, fontSize: 28, bold: true, color: "e05a76" });
slide2.addText([
    { text: "Navigation Complexity: Finding optimized routes through bustling cities is overwhelming.", options: { bullet: true } },
    { text: "Fragmented Information: Users juggle multiple apps for finding places and checking transit.", options: { bullet: true } },
    { text: "Budgeting Hurdles: Traveling costs get out of hand without proper expense estimators.", options: { bullet: true } },
    { text: "Lack of Personalization: Most apps lack a unified, personal touch for tracking trips.", options: { bullet: true } }
], { x: 0.5, y: 1.5, w: 9, h: 3, fontSize: 18, color: "363636" });

// Slide 3: Intro
let slide3 = pptx.addSlide();
slide3.addText("What is LocalSathi?", { x: 0.5, y: 0.5, fontSize: 28, bold: true, color: "e05a76" });
slide3.addText([
    { text: "LocalSathi is an all-in-one web application designed as your smart local travel companion.", options: { bullet: true } },
    { text: "It seamlessly integrates journey planning, local guides, fare calculation, and expense estimations.", options: { bullet: true } },
    { text: "Objective: Provide a premium, cohesive, and user-centric platform that simplifies transit.", options: { bullet: true } }
], { x: 0.5, y: 1.5, w: 9, h: 3, fontSize: 18, color: "363636" });

// Slide 4: Features
let slide4 = pptx.addSlide();
slide4.addText("Core Features", { x: 0.5, y: 0.5, fontSize: 28, bold: true, color: "e05a76" });
slide4.addText([
    { text: "Plan Journey: Real-time route discovery and accurate train/metro fare calculations.", options: { bullet: true } },
    { text: "Nearby Places: Discover local attractions, restaurants, and essential services instantly.", options: { bullet: true } },
    { text: "City Guide: Curated insights and essential information to explore like a local.", options: { bullet: true } },
    { text: "Expense Estimator: A built-in calculator to plan travel budgets efficiently.", options: { bullet: true } },
    { text: "Feedback & Suggestions: Users can share experiences and report issues in real-time.", options: { bullet: true } }
], { x: 0.5, y: 1.5, w: 9, h: 3.5, fontSize: 18, color: "363636" });

// Slide 5: Tech
let slide5 = pptx.addSlide();
slide5.addText("Tech Stack & Design", { x: 0.5, y: 0.5, fontSize: 28, bold: true, color: "e05a76" });
slide5.addText([
    { text: "Frontend: React.js (Vite) and React Router for a fast, component-based UI.", options: { bullet: true } },
    { text: "Backend: Node.js & Express.js for robust RESTful APIs.", options: { bullet: true } },
    { text: "Database: MongoDB for fast user, trip, and feedback management.", options: { bullet: true } },
    { text: "Design: Modern aesthetics with sleek light/dark themes, glassmorphism, and responsive navigation.", options: { bullet: true } }
], { x: 0.5, y: 1.5, w: 9, h: 3, fontSize: 18, color: "363636" });

// Slide 6: Future
let slide6 = pptx.addSlide();
slide6.addText("Future Enhancements", { x: 0.5, y: 0.5, fontSize: 28, bold: true, color: "e05a76" });
slide6.addText([
    { text: "AI Integration: A smart 'LocalSathi Bot' to provide conversational travel guidance.", options: { bullet: true } },
    { text: "Live Tracking: Real-time GPS integration for exact bus/train locations.", options: { bullet: true } },
    { text: "Native Mobility: Expanding the responsive web app into native iOS and Android apps.", options: { bullet: true } }
], { x: 0.5, y: 1.5, w: 9, h: 3, fontSize: 18, color: "363636" });

// Slide 7: Conclusion
let slide7 = pptx.addSlide();
slide7.addText("Thank You!", { x: 1.5, y: 2.0, w: "70%", fontSize: 48, bold: true, color: "e05a76", align: "center" });
slide7.addText("Questions?", { x: 1.5, y: 3.0, w: "70%", fontSize: 28, color: "666666", align: "center" });

pptx.writeFile({ fileName: "LocalSathi_Presentation.pptx" }).then(fileName => {
    console.log(`Successfully created presentation at ` + fileName);
});
