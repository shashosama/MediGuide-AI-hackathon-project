# Advanced Medical Information Assistant

## Team members - Teresa Nguyen, Bach Nguyen, Shaun Suandy and Shashota Saha
(so grateful to all the teammates) 

## Problem Statement
Navigating healthcare systems is often confusing and intimidating for patients. Many people struggle to determine which medical department they should visit based on their symptoms, leading to inefficient use of healthcare resources, longer wait times, and potentially delayed treatment. Traditional triage systems are manual, subjective, and don't leverage modern AI capabilities to provide personalized guidance.

## Solution
An intelligent medical information assistant that revolutionizes healthcare triage through advanced AI technologies. Built with Tavus's Conversational Video Interface, this application features real-time mask detection, natural language processing, risk assessment, comprehensive symptom analysis, and personalized medical guidance with persistent user data.

## Key Features

### AI-Powered Capabilities
- **Natural Language Processing**: Advanced symptom analysis using custom NLP engine
- **Risk Assessment Engine**: Intelligent scoring system (0-100) with urgency classification
- **Real-time Mask Detection**: Computer vision using TensorFlow.js for infection control
- **Voice Recognition**: Speech-to-text and text-to-speech integration
- **Personalized Recommendations**: Context-aware guidance based on medical history

### Smart Triage System
- **Multi-Modal Analysis**: Combines text, voice, video, and emotional indicators
- **Risk Stratification**: Critical, High, Medium, Low risk categories with automated routing
- **Red Flag Detection**: Automatic identification of emergency symptoms
- **Body Part Mapping**: Anatomical region identification and correlation
- **Severity Scoring**: Intelligent symptom severity assessment with medical context

### User Experience
- **Dual Interface**: Video consultation with mask detection OR advanced text chat
- **4-Tab Interface**: Chat, Analytics, Profile, History for comprehensive care
- **Privacy-First**: All AI processing happens locally in the browser
- **Real-time Analytics**: Live symptom analysis with visual dashboards
- **Persistent Data**: Cross-session memory for medical history tracking

## Medical Department Mapping

The system intelligently routes patients to the appropriate medical departments:

- **Cardiology**: Heart-related symptoms and chest pain
- **Pulmonology**: Respiratory issues and breathing difficulties
- **Neurology**: Headaches, dizziness, and neurological symptoms
- **Emergency Medicine**: Critical conditions requiring immediate attention
- **Dermatology**: Skin conditions and rashes
- **Orthopedics**: Bone, joint, and muscle issues
- **Gastroenterology**: Digestive system problems
- **Ophthalmology**: Eye-related symptoms
- **ENT**: Ear, nose, and throat conditions
- **Urology**: Urinary system issues
- **General Medicine**: Primary care and general health concerns

## What We Learned As A Team

### AI Integration and Development
- **Multi-Modal AI Architecture**: Designing systems that combine NLP, computer vision, and conversational AI
- **Browser-Based Machine Learning**: Implementing TensorFlow.js for client-side inference without server dependencies
- **Privacy-Preserving AI**: Developing AI systems that process sensitive medical data locally
- **Symptom Analysis Algorithms**: Creating custom NLP solutions for medical terminology extraction
- **Risk Assessment Logic**: Developing evidence-based algorithms for medical risk stratification

### Healthcare Technology
- **Medical Triage Workflows**: Understanding clinical decision-making processes and department routing
- **HIPAA-Compliant Design**: Implementing privacy-first architecture for healthcare applications
- **Medical UX Principles**: Designing interfaces for users experiencing health anxiety or distress
- **Symptom Classification**: Mapping natural language descriptions to medical terminology
- **Infection Control Integration**: Incorporating public health measures like mask detection

### Technical Skills
- **React Performance Optimization**: Building responsive interfaces for complex medical data
- **State Management Patterns**: Using Jotai for atomic state across multiple medical contexts
- **Responsive Medical Interfaces**: Creating accessible designs that work across all devices
- **Real-time Video Processing**: Implementing computer vision in browser environments
- **Local Storage Architecture**: Designing persistent data systems for medical history

### Project Management
- **Healthcare User Testing**: Gathering and implementing feedback from medical professionals
- **Accessibility Requirements**: Ensuring medical interfaces work for all users regardless of abilities
- **Cross-Browser Compatibility**: Testing and optimizing for various browser environments
- **Mobile-First Medical Design**: Creating interfaces that prioritize mobile users in healthcare settings
- **Documentation for Medical Systems**: Creating clear documentation for complex healthcare applications

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for responsive design
- **Framer Motion** for smooth animations
- **Jotai** for state management

### AI/ML
- **TensorFlow.js** for browser-based machine learning
- **Custom NLP Engine** for symptom analysis
- **Risk Assessment Algorithm** for medical triage

### Integration
- **Tavus CVI API** for conversational video interface
- **Daily.co** for real-time video
- **LocalStorage** for persistent user data

## Getting Started

### Prerequisites
- Node.js 18+
- Tavus API Key ([Get one here](https://platform.tavus.io/api-keys))
- Modern browser with WebRTC support

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/advanced-medical-ai.git
cd advanced-medical-ai

# Install dependencies
npm install

# Start development server
npm run dev
```

### Configuration
1. Get your Tavus API key from [platform.tavus.io](https://platform.tavus.io/api-keys)
2. Enter your API key in the application settings
3. Customize medical personas and replicas as needed

### Deployment
```bash
# Build for production
npm run build

# Deploy to your preferred platform
npm run deploy
```

## Medical Disclaimer

**Important**: This application is for informational and educational purposes only. It does not provide medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals for medical decisions. In case of medical emergencies, call emergency services immediately.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---



*Making healthcare navigation smarter, safer, and more accessible through responsible AI innovation.*
