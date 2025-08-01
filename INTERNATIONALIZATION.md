# 🌍 Internationalization (i18n) Strategy for Fluensy

## 📋 **Overview**

This document outlines different approaches to internationalize your Fluensy app and provides recommendations based on your current setup.

## 🛠️ **Approach 1: Next.js Built-in i18n (Recommended)**

### **Why This Approach:**

- Built into Next.js 13+
- SEO-friendly with proper URL routing (`/en/`, `/es/`, `/fr/`)
- Server-side rendering support
- Automatic locale detection

### **Implementation Steps:**

#### 1. **Install Dependencies**

```bash
npm install next-intl
```

#### 2. **Update next.config.js**

```javascript
const createNextIntlPlugin = require("next-intl/plugin");

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = withNextIntl(nextConfig);
```

#### 3. **Create Translation Files**

```
messages/
├── en.json
├── es.json
└── fr.json
```

#### 4. **Translation File Structure**

```json
// messages/en.json
{
  "common": {
    "welcome": "Welcome to Fluensy",
    "settings": "Settings",
    "language": "Language",
    "darkMode": "Dark Mode",
    "logout": "Log Out"
  },
  "auth": {
    "login": "Log In",
    "signup": "Sign Up",
    "email": "Email",
    "password": "Password"
  },
  "speech": {
    "startRecording": "Start Recording",
    "stopRecording": "Stop Recording",
    "analyzing": "Analyzing your pronunciation...",
    "excellentScore": "Excellent pronunciation!",
    "goodScore": "Good job! Keep practicing.",
    "needsWork": "Let's work on improving this."
  }
}
```

#### 5. **Usage in Components**

```tsx
"use client";
import { useTranslations } from "next-intl";

export function WelcomeMessage() {
  const t = useTranslations("common");

  return <h1>{t("welcome")}</h1>;
}
```

---

## 🛠️ **Approach 2: react-i18next (Alternative)**

### **When to Use:**

- More control over translation loading
- Complex pluralization rules
- Dynamic namespaces

### **Implementation:**

```bash
npm install react-i18next i18next i18next-resources-to-backend
```

---

## 🛠️ **Approach 3: Custom Solution (Your Current Approach)**

### **What You Have Now:**

- Language context (`LanguageContext.tsx`)
- Hardcoded strings in components
- Language-specific logic in services

### **To Extend This:**

1. Create a translation hook
2. Extract all hardcoded strings
3. Create translation objects

---

## 🎯 **Recommended Implementation Plan**

### **Phase 1: Setup Infrastructure (Week 1)**

1. Install `next-intl`
2. Configure routing
3. Create initial translation files for key screens

### **Phase 2: Component Migration (Week 2-3)**

1. Start with authentication screens
2. Move to main app interface
3. Handle form validation messages

### **Phase 3: Dynamic Content (Week 4)**

1. AI-generated responses
2. Error messages
3. Speech feedback

### **Phase 4: Testing & Refinement (Week 5)**

1. Test all language combinations
2. Verify right-to-left support (if needed)
3. Performance optimization

---

## 📁 **File Structure After Implementation**

```
src/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── (routes)/
├── components/
│   └── (same structure, using t() function)
├── messages/
│   ├── en.json
│   ├── es.json
│   └── fr.json
├── lib/
│   └── i18n.ts
└── middleware.ts (for locale detection)
```

---

## 🔧 **Key Considerations**

### **Text Expansion:**

- French text is typically 15-20% longer than English
- Spanish can be 20-25% longer
- Plan UI layouts accordingly

### **Date/Time Formats:**

- US: MM/DD/YYYY
- Europe: DD/MM/YYYY
- Use `Intl.DateTimeFormat` for proper formatting

### **Number Formats:**

- US: 1,234.56
- Europe: 1.234,56
- Use `Intl.NumberFormat`

### **Currency:**

- Handle multiple currencies if needed
- Use proper currency symbols

---

## 🚀 **Migration Strategy**

### **Gradual Migration:**

1. **Start Small**: Migrate one component at a time
2. **Critical Path**: Begin with user-facing text
3. **Testing**: Test each language as you go
4. **Fallbacks**: Always have English fallbacks

### **Translation Management:**

1. **Tools**: Consider Lokalise, Crowdin, or Phrase
2. **Context**: Provide context for translators
3. **Screenshots**: Include UI screenshots for reference
4. **Reviews**: Have native speakers review translations

---

## 💡 **Pro Tips**

1. **Use Keys, Not English Text**:

   ```tsx
   // ❌ Bad
   t("Hello World");

   // ✅ Good
   t("common.greeting");
   ```

2. **Handle Pluralization**:

   ```json
   {
     "items": {
       "zero": "No items",
       "one": "One item",
       "other": "{{count}} items"
     }
   }
   ```

3. **Dynamic Content**:

   ```tsx
   t("welcome.message", { name: user.name });
   ```

4. **Component Interpolation**:
   ```tsx
   t.rich("terms.agreement", {
     link: (chunks) => <Link href="/terms">{chunks}</Link>,
   });
   ```

---

Would you like me to implement the recommended Next.js i18n approach for your app?
