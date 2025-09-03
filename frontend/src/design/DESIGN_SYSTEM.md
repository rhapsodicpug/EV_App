# EV Charging App Design System

## 🎨 **Stage 1: Foundation & Visual Identity**

This document outlines the comprehensive design system implemented for the EV Charging App, focusing on establishing a cohesive visual identity and foundation for all UI components.

## 📋 **Table of Contents**

1. [Design System Overview](#design-system-overview)
2. [Color System](#color-system)
3. [Typography System](#typography-system)
4. [Spacing System](#spacing-system)
5. [Component Library](#component-library)
6. [Theme System](#theme-system)
7. [Brand Identity](#brand-identity)
8. [Usage Guidelines](#usage-guidelines)

## 🏗️ **Design System Overview**

The design system is built on **Material Design 3** principles, providing a modern, accessible, and scalable foundation for the EV Charging App. It includes:

- **Comprehensive color palette** with semantic color mapping
- **Typography scale** following Material Design 3 guidelines
- **Spacing system** with consistent 4px base unit
- **Component library** with reusable UI elements
- **Theme system** supporting light/dark mode
- **Brand identity** with consistent visual elements

## 🎨 **Color System**

### **Primary Colors**
```typescript
primary: {
  50: '#F3E8FF',   // Lightest
  100: '#E1BEE7',
  200: '#CE93D8',
  300: '#BA68C8',
  400: '#AB47BC',
  500: '#9C27B0',  // Main brand color
  600: '#8E24AA',
  700: '#7B1FA2',
  800: '#6A1B9A',
  900: '#4A148C',  // Darkest
}
```

### **Secondary Colors**
```typescript
secondary: {
  50: '#F5F5F5',   // Lightest
  500: '#757575',  // Main secondary
  900: '#000000',  // Darkest
}
```

### **Semantic Colors**
- **Success**: `#4CAF50` (Green)
- **Warning**: `#FF9800` (Orange)
- **Error**: `#F44336` (Red)
- **Info**: `#2196F3` (Blue)

### **Usage Guidelines**
- Use primary colors for main actions and brand elements
- Use secondary colors for supporting elements
- Use semantic colors for status indicators and feedback
- Ensure sufficient contrast ratios for accessibility

## 📝 **Typography System**

### **Font Scale (Material Design 3)**
```typescript
fontSize: {
  display: { large: 57, medium: 45, small: 36 },
  headline: { large: 32, medium: 28, small: 24 },
  title: { large: 22, medium: 16, small: 14 },
  body: { large: 16, medium: 14, small: 12 },
  label: { large: 14, medium: 12, small: 11 },
}
```

### **Font Weights**
- **Light**: 300
- **Regular**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700

### **Typography Components**
```typescript
// Display variants
<DisplayLarge>Large Display Text</DisplayLarge>
<DisplayMedium>Medium Display Text</DisplayMedium>
<DisplaySmall>Small Display Text</DisplaySmall>

// Headline variants
<HeadlineLarge>Large Headline</HeadlineLarge>
<HeadlineMedium>Medium Headline</HeadlineMedium>
<HeadlineSmall>Small Headline</HeadlineSmall>

// Title variants
<TitleLarge>Large Title</TitleLarge>
<TitleMedium>Medium Title</TitleMedium>
<TitleSmall>Small Title</TitleSmall>

// Body variants
<BodyLarge>Large Body Text</BodyLarge>
<BodyMedium>Medium Body Text</BodyMedium>
<BodySmall>Small Body Text</BodySmall>

// Label variants
<LabelLarge>Large Label</LabelLarge>
<LabelMedium>Medium Label</LabelMedium>
<LabelSmall>Small Label</LabelSmall>
```

## 📏 **Spacing System**

### **Base Unit: 4px**
```typescript
Spacing: {
  xs: 4,    // 4px
  sm: 8,    // 8px
  md: 16,   // 16px
  lg: 24,   // 24px
  xl: 32,   // 32px
  xxl: 48,  // 48px
  xxxl: 64, // 64px
}
```

### **Component Spacing**
```typescript
component: {
  padding: { small: 8, medium: 16, large: 24 },
  margin: { small: 8, medium: 16, large: 24 },
  gap: { small: 8, medium: 16, large: 24 },
}
```

### **Usage Guidelines**
- Use consistent spacing throughout the app
- Prefer the spacing scale over arbitrary values
- Use component-specific spacing for UI elements

## 🧩 **Component Library**

### **Button Component**
```typescript
<Button 
  variant="primary" 
  size="medium" 
  onPress={handlePress}
>
  Click Me
</Button>
```

**Variants**: `primary`, `secondary`, `outline`, `ghost`, `danger`
**Sizes**: `small`, `medium`, `large`

### **Card Component**
```typescript
<Card elevation="level1" padding="medium">
  <TitleMedium>Card Title</TitleMedium>
  <BodyMedium>Card content goes here</BodyMedium>
</Card>
```

**Elevation**: `level0` to `level5`
**Padding**: `small`, `medium`, `large`

### **Badge Component**
```typescript
<Badge variant="success" size="medium">
  Available
</Badge>
```

**Variants**: `primary`, `secondary`, `success`, `warning`, `error`, `info`
**Sizes**: `small`, `medium`, `large`

### **Spacer Component**
```typescript
<Spacer size="md" />
<Spacer size="lg" horizontal />
```

### **Divider Component**
```typescript
<Divider color="#E0E0E0" thickness={1} margin="md" />
```

## 🌓 **Theme System**

### **Light/Dark Mode Support**
The app supports automatic theme switching based on system preferences with manual override options.

### **Theme Toggle Component**
```typescript
<ThemeToggle size="medium" showLabel={false} />
```

### **Theme Hooks**
```typescript
const { theme, isDark, colors, toggleTheme } = useTheme();
const colors = useThemeColors();
const isDark = useIsDark();
```

### **Theme Colors**
```typescript
// Light theme
light: {
  colors: {
    primary: '#9C27B0',
    secondary: '#757575',
    background: '#FFFFFF',
    surface: '#FFFFFF',
    text: { primary: '#000000', secondary: '#757575' },
    border: '#E0E0E0',
  }
}

// Dark theme
dark: {
  colors: {
    primary: '#CE93D8',
    secondary: '#BDBDBD',
    background: '#000000',
    surface: '#212121',
    text: { primary: '#FFFFFF', secondary: '#BDBDBD' },
    border: '#424242',
  }
}
```

## 🏷️ **Brand Identity**

### **Logo & Iconography**
- **Primary Icon**: Lightning bolt (flash) representing EV charging
- **Color**: Purple (#9C27B0) as the primary brand color
- **Typography**: Clean, modern sans-serif fonts

### **Splash Screen**
```typescript
<SplashScreen 
  onAnimationComplete={handleComplete}
  duration={2000}
/>
```

Features:
- Smooth logo animation with scale and fade effects
- Brand-consistent color scheme
- Loading indicator with animated dots
- Configurable duration and completion callback

### **Brand Guidelines**
- Use the lightning bolt icon consistently for charging-related features
- Maintain purple as the primary brand color
- Ensure high contrast for accessibility
- Use consistent spacing and typography

## 📖 **Usage Guidelines**

### **Best Practices**
1. **Consistency**: Always use design system components over custom styles
2. **Accessibility**: Ensure sufficient contrast ratios and readable font sizes
3. **Responsiveness**: Use the spacing system for consistent layouts
4. **Theming**: Leverage the theme system for light/dark mode support

### **Component Usage**
```typescript
import { 
  Button, 
  Card, 
  HeadlineLarge, 
  BodyMedium,
  useTheme 
} from '../design';

const MyComponent = () => {
  const { colors } = useTheme();
  
  return (
    <Card>
      <HeadlineLarge>Component Title</HeadlineLarge>
      <BodyMedium>Component description</BodyMedium>
      <Button variant="primary">Action</Button>
    </Card>
  );
};
```

### **Theme Integration**
```typescript
import { ThemeProvider } from '../design/ThemeContext';

const App = () => {
  return (
    <ThemeProvider>
      <YourApp />
    </ThemeProvider>
  );
};
```

## 🚀 **Next Steps**

This design system foundation enables:

1. **Consistent UI**: All components follow the same design principles
2. **Scalability**: Easy to add new components following established patterns
3. **Accessibility**: Built-in support for different user needs
4. **Theming**: Seamless light/dark mode switching
5. **Brand Identity**: Consistent visual representation across the app

The next stages will build upon this foundation to create enhanced user experiences with animations, advanced interactions, and sophisticated UI patterns.
