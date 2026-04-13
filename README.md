# Nexcove - React Native E-Commerce Application

**Shop on Nexcove and Start Saving**

Nexcove is a full-featured e-commerce mobile application built with React Native and Expo. It provides a seamless shopping experience across iOS, Android, and Web platforms, featuring product browsing, filtering, cart management, payment processing, and user authentication.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Architecture](#project-architecture)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [Configuration](#configuration)
- [Key Components & Containers](#key-components--containers)
- [State Management](#state-management)
- [API Integration](#api-integration)
- [Development Guidelines](#development-guidelines)
- [Building & Deployment](#building--deployment)
- [Contributing](#contributing)

---

## Overview

Nexcove is a modern e-commerce platform that leverages React Native and Expo to provide a native-like experience across multiple platforms. The application is built by SSOMAI and designed to handle complex e-commerce scenarios including product management, user authentication, cart operations, and payment processing.

**Version:** 5.0.1  
**Build System:** Expo 48  
**Latest Update:** Configured with React Native 0.71.14

---

## Key Features

### 🛍️ Shopping Experience
- **Product Catalog:** Browse extensive product collections with advanced filtering
- **Search & Discovery:** Full-text search with Algolia integration (React InstantSearch)
- **Product Details:** Comprehensive product information, image galleries, ratings, and reviews
- **Advanced Filters:** Price range, categories, tags, brands, and multiple property filters
- **Wishlist:** Save favorite items for later purchase

### 🛒 Cart & Checkout
- **Smart Cart Management:** Add/remove items, adjust quantities, persistent cart state
- **Multiple Shipping Methods:** Various delivery options with real-time cost calculation
- **Discount & Coupon Support:** Apply promotional codes and discounts
- **Multiple Payment Methods:** Stripe integration and other payment gateways
- **Order Tracking:** View order history and track deliveries

### 👤 User Management
- **Secure Authentication:** Email/password login with social authentication (Google, Facebook, Apple)
- **User Profiles:** Manage account information and preferences
- **Address Management:** Multiple delivery addresses with geolocation support
- **Order History:** Complete purchase history and past orders

### 🎨 Customization & Themes
- **Dark/Light Mode:** Dynamic theme support based on user preference
- **Multi-Language Support:** Support for multiple languages including RTL (Arabic)
- **Responsive Design:** Adaptive layouts for different device sizes
- **Customizable UI:** Theme-based styling system with easy color and font customization

### 📱 Platform Support
- **iOS:** Native iOS build with iPad support
- **Android:** Full Android support with custom adaptive icons
- **Web:** Web version for desktop browsers

### 📊 Additional Features
- **Analytics:** App analytics and user tracking
- **Notifications:** In-app toast notifications and alerts
- **Modals & Overlays:** Advanced UI components for user interactions
- **Image Optimization:** Image caching and lazy loading
- **Footer & Blog:** Blog integration with WordPress API

---

## Tech Stack

### Core Framework
- **React Native:** `0.71.14` - Cross-platform mobile development
- **Expo:** `~48.0.18` - Managed development platform
- **React:** `18.2.0` - UI library

### Navigation & Routing
- **@react-navigation/native:** `6.0.8` - Navigation framework
- **@react-navigation/bottom-tabs:** `6.2.0` - Bottom tab navigation
- **@react-navigation/stack:** `6.1.1` - Stack-based navigation

### State Management
- **Redux:** `4.1.2` - State container
- **Redux Thunk:** `2.4.1` - Async action middleware
- **Redux Persist:** `6.0.0` - State persistence
- **React-Redux:** `7.2.6` - React bindings for Redux
- **Redux Actions:** `2.6.5` - Action creators and handlers

### API & Data
- **api-ecommerce:** `^1.0.1` - E-commerce API wrapper (WooCommerce)
- **wpapi:** `^1.2.2` - WordPress REST API client
- **firebase:** `9.6.8` - Backend services
- **react-instantsearch:** `6.22.0` - Algolia search integration

### UI Components & Libraries
- **react-native-drawer:** Custom drawer navigation
- **react-native-snap-carousel:** Carousel component
- **react-native-swiper:** Swipe carousel
- **react-native-swipe-list-view:** Swipeable list items
- **react-native-scrollable-tab-view:** Scrollable tabs
- **react-native-modalbox:** Modal dialogs
- **react-native-image-zoom-viewer:** Image viewer with zoom
- **react-native-app-intro-slider:** App introduction slider
- **react-native-star-rating-widget:** Rating component
- **react-native-loading-spinner-overlay:** Loading indicator
- **expo-linear-gradient:** Gradient backgrounds

### Forms & Validation
- **react-hook-form:** `^7.35.0` - Performant form handling
- **@hookform/resolvers:** `^2.9.8` - Schema validation resolvers
- **yup:** `^1.1.1` - Schema validation
- **validate.js:** `^0.13.1` - Data validation

### Styling & Themes
- **@callstack/react-theme-provider:** `^3.0.8` - Theme management
- **expo-linear-gradient:** Gradient effects
- **react-native-svg:** SVG rendering

### Utilities
- **lodash:** `4.17.21` - Utility functions
- **moment:** `2.29.1` - Date/time manipulation
- **currency-formatter:** `1.5.9` - Currency formatting
- **crypto-js:** `4.1.1` - Cryptographic functions
- **base-64:** `1.0.0` - Base64 encoding/decoding
- **urijs:** `^1.19.11` - URI parsing and manipulation

### Authentication
- **expo-apple-authentication:** `~6.0.1` - Apple sign-in
- **expo-facebook:** `~12.2.0` - Facebook authentication
- **react-native-fbsdk-next:** `^11.2.1` - Facebook SDK

### Development Tools
- **react-native-reanimated:** `~2.14.4` - Animation library
- **babel:** Core JavaScript transpiler
- **eslint:** Code linting
- **prettier:** Code formatting
- **reactotron:** Debugging tool
- **jest:** Testing framework

---

## Project Architecture

The application follows a layered architecture pattern:

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│  (React Components & Screen Containers) │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│        State Management Layer           │
│   (Redux Store, Actions, Reducers)      │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│      Services & API Layer               │
│  (API Calls, Data Transformations)      │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│        External Services                │
│  (WordPress, Firebase, Stripe, etc.)    │
└─────────────────────────────────────────┘
```

### Layer Responsibilities:

1. **Presentation Layer** - Components, Containers, UI rendering
2. **State Management** - Redux for global state, local component state
3. **Services** - API calls, data transformation, business logic
4. **External Services** - Third-party integrations

---

## Project Structure

```
nexcove-app/
├── App.js                          # Main app entry point
├── app.json                        # Expo configuration
├── package.json                    # Dependencies & scripts
├── babel.config.js                 # Babel configuration
├── metro.config.js                 # Metro bundler configuration
├── eas.json                        # EAS (Expo Application Services) config
├── jsconfig.json                   # JavaScript path configuration
├── ReactotronConfig.js             # Reactotron debugging config
│
├── assets/                         # Static assets
│   ├── fonts/                      # Custom fonts
│   ├── icon.png                    # App icon
│   ├── splash.png                  # Splash screen
│   └── favicon.png                 # Web favicon
│
├── src/                            # Source code
│   ├── Omni.js                     # Omnibus utilities & helpers
│   ├── Router.js                   # App routing setup
│   │
│   ├── common/                     # Shared utilities & config
│   │   ├── AppConfig.json          # App configuration
│   │   ├── Color.js                # Color palette
│   │   ├── Config.js               # App settings (WooCommerce, APIs)
│   │   ├── Constants.js            # App constants
│   │   ├── Device.js               # Device info utilities
│   │   ├── Events.js               # Event emitter
│   │   ├── Icons.js                # Icon definitions
│   │   ├── Images.js               # Image imports & references
│   │   ├── Languages.js            # i18n translations
│   │   ├── Layout.js               # Layout utilities
│   │   ├── Styles.js               # Global styles
│   │   ├── Theme.js                # Theme definitions
│   │   ├── Tools.js                # Tool utilities
│   │   ├── Validator.js            # Validation utilities
│   │   └── AppConfigTheme/         # Theme configuration
│   │
│   ├── components/                 # Reusable UI components
│   │   ├── Accordion/              # Accordion component
│   │   ├── ActionSheets/           # Action sheet modals
│   │   ├── Button/                 # Button variants
│   │   ├── CartIcon/               # Shopping cart icon
│   │   ├── Chips/                  # Chip/tag components
│   │   ├── Empty/                  # Empty state
│   │   ├── Modal/                  # Modal dialogs
│   │   ├── ProductList/            # Product list component
│   │   ├── ProductItem/            # Product card item
│   │   ├── ProductPrice/           # Price display
│   │   ├── ProductColor/           # Color selector
│   │   ├── ProductSize/            # Size selector
│   │   ├── Rating/                 # Rating display
│   │   ├── Review/                 # Review component
│   │   ├── Search/                 # Search component
│   │   ├── TextInput/              # Custom text input
│   │   ├── Video/                  # Video player
│   │   ├── WebView/                # Web content viewer
│   │   ├── Spinner/                # Loading spinner
│   │   ├── TabBar/                 # Custom tab bar
│   │   └── ... (40+ additional components)
│   │
│   ├── containers/                 # Screen containers (pages)
│   │   ├── Home/                   # Home screen
│   │   ├── Product/                # Product detail screen
│   │   ├── Cart/                   # Shopping cart screen
│   │   ├── Checkout/               # Checkout flow
│   │   ├── Categories/             # Category listing
│   │   ├── Search/                 # Search results
│   │   ├── Detail/                 # Order/Product details
│   │   ├── MyOrders/               # Order history
│   │   ├── WishList/               # Saved items
│   │   ├── Profile/                # User profile
│   │   ├── Address/                # Address management
│   │   ├── Login/                  # Login screen
│   │   ├── SignUp/                 # Registration screen
│   │   ├── SplashScreen/           # App splash screen
│   │   ├── News/                   # Blog/news screen
│   │   └── ... (additional screens)
│   │
│   ├── navigation/                 # Navigation configuration
│   │   └── NavigationStack.js       # Navigation structure
│   │
│   ├── redux/                      # Redux state management
│   │   ├── AppRedux.js             # App state
│   │   ├── CartRedux.js            # Cart state
│   │   ├── ProductRedux.js         # Products state
│   │   ├── UserRedux.js            # User authentication state
│   │   ├── LangRedux.js            # Language state
│   │   ├── AddressRedux.js         # Address management
│   │   ├── WishListRedux.js        # Wishlist state
│   │   ├── CategoryRedux.js        # Categories state
│   │   ├── CurrencyRedux.js        # Currency state
│   │   ├── FilterRedux.js          # Product filters state
│   │   ├── LayoutRedux.js          # UI layouts state
│   │   ├── ToastRedux.js           # Toast notifications
│   │   └── ... (additional redux modules)
│   │
│   ├── selectors/                  # Redux selectors
│   │   └── Reselect-based selectors for optimized state access
│   │
│   ├── services/                   # API & business logic
│   │   ├── CustomAPI.js            # Custom API endpoints
│   │   ├── WPUserAPI.js            # WordPress user API
│   │   ├── PostAPI.js              # Blog/post API
│   │   ├── StripeAPI.js            # Stripe payment API
│   │   ├── FacebookAPI.js          # Facebook integration
│   │   ├── CountryWorker.js        # Country data service
│   │   ├── CurrencyWorker.js       # Currency conversion
│   │   ├── AppEventEmitter.js      # Event handling
│   │   └── Utils.js                # Service utilities
│   │
│   ├── store/                      # Redux store configuration
│   │   ├── configureStore.js       # Store initialization
│   │   └── middleware setup
│   │
│   ├── utils/                      # Utility functions
│   │   └── Helper functions and tools
│   │
│   ├── Expo/                       # Expo-specific modules
│   │   ├── Google.js               # Google authentication
│   │   ├── Facebook.js             # Facebook authentication
│   │   └── Custom vector icons
│   │
│   └── images/                     # App images & graphics
│
├── android/                        # Android-specific code
├── ios/                            # iOS-specific code
└── app/                            # Additional app configs
```

---

## Installation & Setup

### Prerequisites

- **Node.js:** v14 or higher
- **npm** or **yarn:** Package managers
- **Expo CLI:** `npm install -g expo-cli`
- **iOS:** Xcode (for iOS development)
- **Android:** Android Studio and Android SDK (for Android development)

### Step 1: Clone the Repository

```bash
git clone https://github.com/Lafa-Hackathon/nexcove-app.git
cd nexcove-app
```

### Step 2: Install Dependencies

```bash
npm install
# or
yarn install
```

### Step 3: Configure Environment

Update the configuration files as needed:

- **WooCommerce Setup:** Edit [src/common/Config.js](src/common/Config.js) with your store credentials:
  ```javascript
  WooCommerce: {
    url: 'https://your-store.com/',
    consumerKey: 'your_key',
    consumerSecret: 'your_secret',
  }
  ```

- **Firebase Setup:** Configure Firebase credentials in your environment or constants file

- **Stripe Integration:** Add Stripe publishable key to the configuration

- **Language/Localization:** Update [src/common/Languages.js](src/common/Languages.js) with your translations

### Step 4: Install Expo Dependencies

```bash
npx expo install
```

---

## Running the Application

### Development Mode

**Start the development server:**
```bash
npm start
# or
yarn start
```

The Expo CLI will display a QR code and options for running on different platforms.

### iOS Development

```bash
npm run ios
# or
yarn ios
```

- Requires Xcode and iOS Simulator installed
- Will launch the app on iOS simulator

### Android Development

```bash
npm run android
# or
yarn android
```

- Requires Android Emulator or connected Android device
- ADB (Android Debug Bridge) should be installed

### Web Development

```bash
npm run web
# or
yarn web
```

- Opens the app in your default web browser
- Hot reload enabled for development

### Production Build

Build for production using EAS:

```bash
eas build --platform ios
eas build --platform android
```

---

## Configuration

### App Configuration Files

#### `app.json` - Expo Configuration
Defines the app name, version, icon, splash screen, and platform-specific settings.

#### `src/common/Config.js` - API & Service Configuration
Main configuration for:
- WooCommerce API credentials
- Product display sizes
- Layout configurations
- Other third-party services

#### `src/common/AppConfig.json` - Feature Flags & UI Config
JSON-based configuration for:
- Homepage layouts
- Feature toggles
- UI preferences

#### `src/common/Constants.js` - App Constants
Defines:
- API endpoints
- Default values
- Application constants

#### `src/common/Theme.js` - Color Themes
Defines color schemes for light and dark modes

#### `src/common/Languages.js` - Internationalization
Multi-language support with all translation strings

### Environment Variables

Create a `.env` file or configure environment variables for:
- API keys
- Sensitive credentials
- Base URLs

---

## Key Components & Containers

### Major Components

| Component | Purpose |
|-----------|---------|
| **ProductList** | Displays grid/list of products |
| **ProductItem** | Individual product card |
| **ProductPrice** | Price display with discounts |
| **CartIcon** | Shopping cart badge icon |
| **Search** | Search functionality |
| **Modal** | Dialog/popup displays |
| **Rating** | Star rating display & input |
| **Review** | Product reviews component |
| **Button** | Reusable button variants |

### Major Containers (Screens)

| Container | Purpose |
|-----------|---------|
| **Home** | Application homepage |
| **Product** | Product detail page |
| **Cart** | Shopping cart screen |
| **Search** | Search results page |
| **Categories** | Category browsing |
| **Profile** | User profile management |
| **MyOrders** | Order history |
| **WishList** | Saved items |
| **Login/SignUp** | Authentication screens |

---

## State Management

### Redux Structure

The app uses Redux with thunk middleware for async actions and Redux Persist for state persistence.

```
Store Structure:
├── app (AppRedux)
│   ├── isDarkTheme
│   └── settings
├── user (UserRedux)
│   ├── authenticated
│   ├── profile
│   └── finishIntro
├── cart (CartRedux)
│   ├── items
│   ├── total
│   └── shippingMethod
├── products (ProductRedux)
│   ├── list
│   ├── filters
│   └── pagination
├── language (LangRedux)
│   └── current language
├── wishlist (WishListRedux)
│   └── saved items
└── ... (other modules)
```

### Using Redux

**Access state:**
```javascript
const isDarkTheme = useSelector(state => state.app.isDarkTheme);
```

**Dispatch actions:**
```javascript
const dispatch = useDispatch();
dispatch(UserRedux.actions.login(email, password));
```

### Redux Modules

Each Redux module follows the pattern:
- **Actions:** Async operations
- **Reducers:** State updates
- **Selectors:** Optimized state access via Reselect

---

## API Integration

### WooCommerce API

The app integrates with WooCommerce via the `api-ecommerce` package:

```javascript
import { WooWorker } from 'api-ecommerce';

// Get products
WooWorker.getProducts({ per_page: 10 });

// Get categories
WooWorker.getCategories();
```

### Custom APIs

**File:** [src/services/CustomAPI.js](src/services/CustomAPI.js)

Handles custom endpoints not provided by WooCommerce

### WordPress API

**File:** [src/services/WPUserAPI.js](src/services/WPUserAPI.js)

Integration with WordPress for user management, blog posts, and custom content

### Firebase Integration

- Authentication
- Real-time database operations
- Cloud messaging

### Stripe Payment

**File:** [src/services/StripeAPI.js](src/services/StripeAPI.js)

Handles payment processing and transactions

---

## Development Guidelines

### Code Style

- **ESLint:** Linting configuration in `.eslintrc`
- **Prettier:** Code formatting with `prettier.config.js`
- **Babel:** JavaScript transpilation via `babel.config.js`

### Naming Conventions

- **Components:** PascalCase (e.g., `ProductList.js`)
- **Containers:** PascalCase (e.g., `ProductDetail.js`)
- **Redux modules:** camelCase with Redux suffix (e.g., `ProductRedux.js`)
- **Functions/variables:** camelCase (e.g., `fetchProducts()`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `MAX_ITEMS`)

### Component Structure

```javascript
// Functional component with hooks
import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';

const MyComponent = (props) => {
  const [state, setState] = useState(null);

  useEffect(() => {
    // Effect logic
  }, []);

  return (
    <View>
      <Text>Component Content</Text>
    </View>
  );
};

export default MyComponent;
```

### Best Practices

1. **Use Redux for global state** - App-wide data
2. **Use component state for local UI state** - Input focus, animations
3. **Memoize components** with `React.memo` to prevent unnecessary re-renders
4. **Use useMemo** and **useCallback** for performance optimization
5. **Keep components focused** - Single responsibility principle
6. **Extract reusable logic** into custom hooks
7. **Use selectors** for optimized Redux state access
8. **Handle errors gracefully** - Try-catch, error boundaries

---

## Building & Deployment

### Local Build

Build locally using EAS CLI:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Build for both
eas build --platform all
```

### Submission

**iOS:**
```bash
eas submit --platform ios
```

**Android:**
```bash
eas submit --platform android
```

### EAS Configuration

See [eas.json](eas.json) for build and submit configuration

### App Store Requirements

- Version bumping in `app.json`
- Update `package.json` version
- Screenshots and descriptions
- Privacy policy documentation
- Permissions (Camera, Location, etc.) in `app.json`

---

## Contributing

### Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/feature-name
   ```

2. **Make your changes**
   - Follow code style guidelines
   - Write clear commit messages
   - Test on iOS and Android

3. **Commit and push**
   ```bash
   git commit -m "feat: description of changes"
   git push origin feature/feature-name
   ```

4. **Create a Pull Request**
   - Describe changes clearly
   - Link related issues
   - Request reviews

### Code Review Checklist

- [ ] Follows code style guidelines
- [ ] No console errors or warnings
- [ ] Tested on iOS and Android
- [ ] Redux state properly managed
- [ ] Performance optimized
- [ ] Documentation updated

### Testing

```bash
# Run Jest tests
npm test

# Watch mode
npm test -- --watch
```

---

## Debugging

### Reactotron

The app includes Reactotron for debugging. Configuration is in [ReactotronConfig.js](ReactotronConfig.js)

Features:
- Redux action monitoring
- Network request logging
- Performance measurements
- Custom commands

### React Native Debugger

- Install via: `brew install --cask react-native-debugger`
- Enable via Expo: `d` in dev server
- Inspect Redux state and actions

### Console Logging

Use `console.log()` for debugging (babel config removes logs in production)

---

## Performance Optimization

### Image Optimization

- Use **ImageCache** component for optimized image loading
- Implement lazy loading for product lists
- Optimize image sizes

### State Management

- Use selectors for memoized state access
- Split Redux modules by feature
- Use Redux middleware for async operations

### Component Optimization

- Use `React.memo` for expensive components
- Implement `useMemo` and `useCallback`
- Lazy load screens with `React.lazy`

### List Performance

- Use `FlatList` with `maxToRenderPerBatch`
- Implement pagination
- Virtual scroll optimization

---

## Troubleshooting

### Common Issues

**Issue:** Metro bundler cache issues
```bash
npm start -- --reset-cache
```

**Issue:** Module not found
```bash
npm install
rm -rf node_modules && npm install
```

**Issue:** Expo CLI issues
```bash
npm install -g expo-cli@latest
```

**Issue:** Android build fails
```bash
# Clear Android build cache
cd android && ./gradlew clean
```

---

## License

[Add your license information here]

## Contact

**Author:** SSOMAI  
**Project:** Nexcove E-Commerce App  
**Repository:** [Lafa-Hackathon/nexcove-app](https://github.com/Lafa-Hackathon/nexcove-app)

---

## Resources

- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [Redux Documentation](https://redux.js.org/)
- [WooCommerce REST API](https://woocommerce.github.io/woocommerce-rest-api-docs/)
- [React Navigation](https://reactnavigation.org/)

---

**Happy Coding! 🚀**
