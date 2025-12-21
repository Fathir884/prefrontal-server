# 🧠 Prefrontal - The Productivity SuperApp

> **A unified cognitive operating system that consolidates Finance, Learning, Wellness, AI, and Gamification into one intelligent interface.**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-Android-green.svg)
![Version](https://img.shields.io/badge/version-1.0.0-orange.svg)
![React](https://img.shields.io/badge/React-18+-61dafb.svg)

---

## 🌟 About

**Prefrontal** is a revolutionary all-in-one productivity application designed to mitigate context-switching fatigue by consolidating essential cognitive tools into a single ecosystem. Named after the prefrontal cortex—responsible for executive functions like planning, decision-making, and impulse control—this app digitizes these capabilities to augment your biological brain.

### 🎯 Philosophy

Modern productivity tools fragment attention by forcing constant app-switching. Each context switch depletes glucose and reduces functional IQ by up to 10 points. Prefrontal eliminates this friction by unifying:
- 💰 **Financial Tracking**
- 📅 **Calendar & Task Management**
- 🎓 **Learning & Focus Tools**
- 🧘 **Mental Wellness**
- 🤖 **AI Intelligence**
- 🎮 **Gamification & Cognitive Training**

---

## ✨ Key Features

### 🏠 **Dashboard - Command Center**
- **Vital Signs Cards**: Real-time Net Balance, Task Load, Mental Streak
- **Quick Actions Grid**: One-tap access to all modules
- **Dynamic Greeting**: Time-aware personalized welcome

### 💰 **Financial Cortex**
- Frictionless transaction logging (< 3 seconds)
- Indonesian Rupiah (IDR) optimization
- Visual analytics (Donut Charts, Trend Lines, Bar Charts)
- Financial goals with progress tracking
- Category-based expense breakdown

### 📅 **Calendar & Tasks**
- **Dual-System Architecture**: Separate Events (hard landscape) and Tasks (soft landscape)
- Priority tagging (High/Medium/Low)
- Local push notifications (work even when app is closed)
- Haptic feedback on task completion

### 🤖 **Pref AI Intelligence**
- Powered by **Google Gemini 1.5 Pro**
- Contextual awareness of your app state
- **RAG Engine**: Upload PDFs for instant summarization & Q&A
- Acts as stoic accountability partner

### 🎓 **Learning Center**
- **Pomodoro Timer 2.0**: Customizable focus sessions (15/25/45/60 min)
- **Focus Soundscapes**: Rain, Forest, Ocean, White Noise, Binaural Beats
- **Flashcard System**: Active recall for effective learning
- Study task manager with percentage-based progress

### 🧠 **Mind & Wellness**
- Mood tracker with emotional pattern visualization
- Micro-journaling (1-2 sentence reflections)
- Daily Stoic affirmations
- 4-7-8 Breathing exercise with visual guide

### 🔥 **Atomic Habits**
- Seinfeld Strategy ("Don't Break the Chain")
- Custom habit icons and colors
- Streak psychology (Endowment Effect)
- Identity-based habit reinforcement

### 🎮 **Gamification & Arcade**
- **Memory Matrix**: Working memory training game
- **Trophy Room**: Achievement badges system
- Points and progression mechanics

### 🔒 **Privacy & Security**
- **Local-First Architecture**: All data stored on-device (SQLite)
- AES-256 encryption for sensitive fields
- No cloud syncing by default
- Export to PDF/JSON anytime
- Zero third-party tracking

---

## 🛠️ Tech Stack

### **Frontend**
- ⚛️ **React 18+** - UI framework
- 🎨 **CSS3** - Custom styling with glassmorphism
- 🎭 **Lucide React** - Icon library
- 📱 **React Router** - Navigation

### **Mobile Framework**
- ⚡ **Vite** - Build tool & dev server
- 📦 **Capacitor** - Native bridge for Android
- 🔔 **Local Notifications Plugin**
- 📁 **Filesystem Plugin**
- 🔗 **Share Plugin**

### **AI & PDF**
- 🤖 **Google Gemini 1.5 Pro API** - Conversational AI
- 📄 **jsPDF** - PDF generation
- 🎨 **html2canvas** - Screenshot to PDF conversion

### **Data & Storage**
- 💾 **LocalStorage** - Persistent state
- 🗃️ **IndexedDB** - Structured data (optional)

---

## 📦 Installation

### **Prerequisites**
- Node.js >= 18.x
- npm or yarn
- Android Studio (for APK build)
- Java 21 (for Gradle)

### **Setup**

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/prefrontal.git
cd prefrontal/client
```

2. **Install dependencies:**
```bash
npm install
```

3. **Run development server:**
```bash
npm run dev
```

4. **Build for production:**
```bash
npm run build
```

5. **Sync with Android:**
```bash
npx cap sync android
```

6. **Run on Android:**
```bash
npx cap run android
```

---

## 📱 Build APK

### **Debug Build**
```bash
cd android
./gradlew assembleDebug
```
APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

### **Release Build**
```bash
cd android
./gradlew assembleRelease
```
APK location: `android/app/build/outputs/apk/release/app-release.apk`

---

## 🎨 Design Principles

1. **Reduce Cognitive Load**: Present only essential information at the right time
2. **Create Frictionless Actions**: Minimize steps between intention and execution
3. **Leverage Psychology**: Use behavioral science to build sustainable habits

### **UI/UX Highlights**
- 🌌 **Midnight Blue/Neon Aesthetic**: Dark mode optimized
- 💎 **Glassmorphism**: Modern translucent cards
- 🎭 **Smooth Animations**: Micro-interactions for engagement
- 📐 **Responsive Layout**: Optimized for mobile screens

---

## 📄 Documentation

The app includes a **comprehensive PDF Codex** (25-30 pages) with:
- 📖 Philosophy & design rationale
- 🔍 Step-by-step feature tutorials
- 🧠 Neuroscience & psychology principles
- 💡 Best practices & tips

**Download the manual:** Available in-app via Module Guide → Download PDF

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Fathir Ramadhan**
- 🌐 Website: [prefrontal.neocities.org](https://prefrontal.neocities.org) *(coming soon)*
- 📧 Email: your.email@example.com
- 🐙 GitHub: [@yourhandle](https://github.com/yourhandle)

---

## 🙏 Acknowledgments

- **Google Gemini API** - AI intelligence
- **jsPDF Community** - PDF generation
- **Capacitor Team** - Mobile framework
- Inspired by James Clear's *Atomic Habits* and Francesco Cirillo's *Pomodoro Technique*

---

## 📊 Roadmap

- [ ] Cloud sync with end-to-end encryption
- [ ] Social leaderboards (optional)
- [ ] Recurring events automation
- [ ] Multi-language support (ID/EN)
- [ ] iOS version
- [ ] Desktop app (Electron)

---

## 📸 Screenshots

*Coming soon - Add screenshots of key features*

---

## 🆘 Support

If you encounter issues:
1. Check [Issues](https://github.com/yourusername/prefrontal/issues) page
2. Create a new issue with detailed description
3. Contact via email for critical bugs

---

<div align="center">

**⭐ If this project helps you, consider giving it a star! ⭐**

Made with 💙 and ☕ by Fathir Ramadhan

</div>
