# MediGuide AI - Intelligent Medical Triage Assistant

## Team members - Teresa Nguyen, Bach Nguyen, Shaun Suandy and Shashota Saha
(so grateful to all the teammates) 

## Problem Statement
Navigating healthcare systems is often confusing and intimidating for patients. Many people struggle to determine which medical department they should visit based on their symptoms, leading to inefficient use of healthcare resources, longer wait times, and potentially delayed treatment. Traditional triage systems are manual, subjective, and don't leverage modern AI capabilities to provide personalized guidance.

## Solution
MediGuide AI is an intelligent medical triage assistant that revolutionizes healthcare navigation through advanced AI technologies. Built with Tavus's Conversational Video Interface, this application features **real-time mask detection**, natural language processing, risk assessment, comprehensive symptom analysis, and personalized medical guidance with persistent user data.

## Key Features

### AI-Powered Capabilities
- **Natural Language Processing**: Advanced symptom analysis using custom NLP engine
- **Risk Assessment Engine**: Intelligent scoring system (0-100) with urgency classification
- **🎭 Real-time Mask Detection**: Computer vision using TensorFlow.js for infection control and safety
- **Voice Recognition & Transcription**: Speech-to-text with live transcription during video calls
- **Personalized Recommendations**: Context-aware guidance based on medical history

### Smart Triage System
- **Multi-Modal Analysis**: Combines text, voice, video, and emotional indicators
- **Risk Stratification**: Critical, High, Medium, Low risk categories with automated routing
- **Red Flag Detection**: Automatic identification of emergency symptoms
- **Body Part Mapping**: Anatomical region identification and correlation
- **Severity Scoring**: Intelligent symptom severity assessment with medical context

### 🎭 Advanced Mask Detection System
- **Real-Time Detection**: Continuous monitoring during video consultations
- **Visual Status Indicators**: Green badge for mask detected, red for no mask
- **Confidence Scoring**: Shows detection accuracy percentage (e.g., "85% confidence")
- **Smart Safety Warnings**: Contextual mask recommendations for contagious symptoms
- **Infection Control**: Promotes safety protocols in medical environments
- **Non-Intrusive Design**: Overlay positioned to not interfere with consultation

### User Experience
- **Dual Interface**: Video consultation with mask detection OR advanced text chat
- **4-Tab Interface**: Chat, Analytics, Profile, History for comprehensive care
- **Live Transcription**: Real-time speech-to-text during video consultations
- **Privacy-First**: All AI processing happens locally in the browser
- **Real-time Analytics**: Live symptom analysis with visual dashboards
- **Persistent Data**: Cross-session memory for medical history tracking

## Medical Department Mapping

The system intelligently routes patients to the appropriate medical departments:

- **Emergency Department**: Critical conditions requiring immediate attention (Ground Floor)
- **Cardiology**: Heart-related symptoms and chest pain (Third Floor)
- **Pulmonology**: Respiratory issues and breathing difficulties (Second Floor)
- **Neurology**: Headaches, dizziness, and neurological symptoms (Fifth Floor)
- **Dermatology**: Skin conditions and rashes (Fourth Floor)
- **Orthopedics**: Bone, joint, and muscle issues (Sixth Floor)
- **Gastroenterology**: Digestive system problems (Third Floor)
- **Ophthalmology**: Eye-related symptoms
- **ENT**: Ear, nose, and throat conditions
- **Urology**: Urinary system issues
- **General Medicine**: Primary care and general health concerns (First Floor)
- **Radiology**: Medical imaging services (Basement Level)
- **Laboratory Services**: Blood tests and diagnostic testing (Basement Level)
- **Pharmacy**: Medication dispensing and consultation (Ground Floor)

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for responsive design
- **Framer Motion** for smooth animations
- **Jotai** for state management

### AI/ML
- **TensorFlow.js** for browser-based machine learning and mask detection
- **Custom NLP Engine** for symptom analysis
- **Risk Assessment Algorithm** for medical triage
- **Computer Vision** for real-time mask detection

### Integration
- **Tavus CVI API** for conversational video interface
- **Daily.co** for real-time video and audio
- **Web Speech API** for voice recognition and transcription
- **LocalStorage** for persistent user data

## Getting Started

### Prerequisites
- **Node.js 20.x** (recommended: 20.12.2 or higher)
- **npm** (comes with Node.js)
- **Tavus API Key** ([Get one here](https://platform.tavus.io/api-keys))
- **Modern browser** with WebRTC support (Chrome, Firefox, Safari, Edge)
- **Camera and Microphone** for video consultations and mask detection

### Installation

#### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/mediguide-ai.git
cd mediguide-ai
```

#### Step 2: Install Dependencies

**Option A: Standard Installation (Try this first)**
```bash
npm install
```

**Option B: If you encounter dependency conflicts**
```bash
# Clear any existing cache and modules
npm cache clean --force
rm -rf node_modules package-lock.json

# Install with legacy peer dependencies (recommended for Vite projects)
npm install --legacy-peer-deps
```

**Option C: If Option B fails**
```bash
# Force installation (use as last resort)
npm install --force
```

#### Step 3: Environment Setup
1. Get your Tavus API key from [platform.tavus.io](https://platform.tavus.io/api-keys)
2. The application will prompt you to enter your API key when you first run it
3. No additional environment file setup is required

#### Step 4: Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Troubleshooting Common Issues

#### Dependency Conflicts
If you see errors like:
```
npm ERR! Conflicting peer dependency: @types/node@24.0.7
npm ERR! peer dep missing: @types/node@>=20.1.0 <22.0.0
```

**Solution:**
```bash
# Option 1: Use legacy peer deps (recommended)
npm install --legacy-peer-deps

# Option 2: Downgrade @types/node to compatible version
npm install @types/node@20.12.0 --save-dev

# Option 3: Clear everything and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install --legacy-peer-deps
```

#### Node.js Version Issues
- **Required**: Node.js 20.x or higher
- **Check your version**: `node --version`
- **Recommended**: Use Node Version Manager (nvm)
  ```bash
  # Install nvm (macOS/Linux)
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
  
  # Use the correct Node version
  nvm install 20.12.2
  nvm use 20.12.2
  ```

#### Camera/Microphone Access Issues
- **Chrome**: Go to Settings > Privacy and Security > Site Settings > Camera/Microphone
- **Firefox**: Click the camera/microphone icon in the address bar
- **Safari**: Safari > Preferences > Websites > Camera/Microphone
- **Note**: Camera access is required for mask detection functionality

#### Build Issues
```bash
# Clear build cache
npm run build --clean

# If TypeScript errors occur
npx tsc --noEmit

# Check for missing dependencies
npm audit fix
```

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint

# Type checking
npx tsc --noEmit
```

### Browser Compatibility

| Browser | Version | Video Chat | Text Chat | Mask Detection | Speech Recognition |
|---------|---------|------------|-----------|----------------|--------------------|
| Chrome  | 88+     | ✅         | ✅        | ✅             | ✅                 |
| Firefox | 85+     | ✅         | ✅        | ✅             | ✅                 |
| Safari  | 14+     | ✅         | ✅        | ✅             | ✅                 |
| Edge    | 88+     | ✅         | ✅        | ✅             | ✅                 |

### Configuration

#### Tavus API Setup
1. Create account at [platform.tavus.io](https://platform.tavus.io)
2. Generate API key from dashboard
3. Enter API key in the application when prompted
4. Customize medical personas and replicas as needed

#### Optional: Custom Personas
- Default Persona ID: `p6de07a7b017` (Medical Assistant)
- Default Replica ID: `rb17cf590e15` (Medical Replica)
- Override in Settings if you have custom personas

### Deployment

#### Build for Production
```bash
npm run build
```

#### Deploy to Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

#### Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components
│   ├── layout/         # Layout components
│   ├── MaskDetectionOverlay.tsx  # Mask detection display
│   └── ...             # Feature-specific components
├── screens/            # Main application screens
│   ├── auth/           # Authentication screens
│   ├── main/           # Core application screens
│   ├── status/         # Status and error screens
│   └── Conversation.tsx # Video consultation with mask detection
├── utils/              # Utility functions
│   ├── ai/             # AI-related utilities
│   ├── storage/        # Data storage utilities
│   ├── maskDetection.ts # Mask detection logic
│   └── ...             # Other utilities
├── store/              # State management (Jotai)
├── types/              # TypeScript type definitions
└── styles/             # Global styles and CSS
```

## 🎭 Mask Detection Features

### Real-Time Detection
- **Continuous Monitoring**: Analyzes video feed every 3 seconds during consultations
- **TensorFlow.js Integration**: Browser-based machine learning for privacy
- **Confidence Scoring**: Provides accuracy percentage for each detection

### Visual Indicators
- **Status Badges**: 
  - 🟢 Green: "Mask Detected (85%)"
  - 🔴 Red: "No Mask Detected (92%)"
- **Smart Positioning**: Top-right overlay that doesn't interfere with consultation
- **Responsive Design**: Adapts to different screen sizes

### Safety Features
- **Contextual Warnings**: Shows mask recommendations only when relevant
- **Symptom Analysis**: Detects contagious symptoms from speech transcription
- **Infection Control**: Promotes safety protocols in medical environments
- **Privacy-First**: All processing happens locally in the browser

### Integration with Medical Workflow
- **Symptom Correlation**: Links mask recommendations to respiratory/flu-like symptoms
- **Professional Messaging**: Provides clear, medical-appropriate safety guidance
- **Non-Disruptive**: Maintains focus on medical consultation while promoting safety

## What We Learned As A Team

### AI Integration and Development
- **Multi-Modal AI Architecture**: Designing systems that combine NLP, computer vision, and conversational AI
- **Browser-Based Machine Learning**: Implementing TensorFlow.js for client-side inference without server dependencies
- **Privacy-Preserving AI**: Developing AI systems that process sensitive medical data locally
- **Symptom Analysis Algorithms**: Creating custom NLP solutions for medical terminology extraction
- **Risk Assessment Logic**: Developing evidence-based algorithms for medical risk stratification
- **Real-Time Computer Vision**: Implementing mask detection with live video processing

### Healthcare Technology
- **Medical Triage Workflows**: Understanding clinical decision-making processes and department routing
- **HIPAA-Compliant Design**: Implementing privacy-first architecture for healthcare applications
- **Medical UX Principles**: Designing interfaces for users experiencing health anxiety or distress
- **Symptom Classification**: Mapping natural language descriptions to medical terminology
- **Infection Control Integration**: Incorporating public health measures like mask detection
- **Safety Protocol Implementation**: Balancing medical consultation with infection prevention

### Technical Skills
- **React Performance Optimization**: Building responsive interfaces for complex medical data
- **State Management Patterns**: Using Jotai for atomic state across multiple medical contexts
- **Responsive Medical Interfaces**: Creating accessible designs that work across all devices
- **Real-time Video Processing**: Implementing computer vision in browser environments
- **Local Storage Architecture**: Designing persistent data systems for medical history
- **WebRTC Integration**: Managing video calls with additional AI processing layers

### Project Management
- **Healthcare User Testing**: Gathering and implementing feedback from medical professionals
- **Accessibility Requirements**: Ensuring medical interfaces work for all users regardless of abilities
- **Cross-Browser Compatibility**: Testing and optimizing for various browser environments
- **Mobile-First Medical Design**: Creating interfaces that prioritize mobile users in healthcare settings
- **Documentation for Medical Systems**: Creating clear documentation for complex healthcare applications
- **Safety Feature Integration**: Balancing functionality with public health requirements

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Performance Tips

- **Enable hardware acceleration** in your browser for better TensorFlow.js performance
- **Use Chrome** for optimal WebRTC and AI performance
- **Close unnecessary tabs** when using video chat features
- **Ensure stable internet** connection for video consultations
- **Allow camera access** for mask detection functionality

### Security & Privacy

- **Local Processing**: All AI analysis happens in your browser
- **No Data Transmission**: Medical data never leaves your device
- **Secure Storage**: User data encrypted in browser storage
- **HIPAA Considerations**: Designed with healthcare privacy in mind
- **Mask Detection Privacy**: Computer vision processing stays local

## Medical Disclaimer

**Important**: This application is for informational and educational purposes only. It does not provide medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals for medical decisions. In case of medical emergencies, call emergency services immediately.

The mask detection feature is designed to promote safety awareness but should not replace professional medical judgment or official health guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**MediGuide AI** - *Making healthcare navigation smarter, safer, and more accessible through responsible AI innovation and advanced safety features.*