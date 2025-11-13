# Detailed Issues & Code Examples

## Issue #1: Import Path Directory Mismatch
**Severity:** CRITICAL - Application will not run  
**Status:** BLOCKING BUILD  

### Problem
Files import from `./contexts/` (plural) but the directory is `./context/` (singular).

### Current Code
**File:** `src/App.jsx:2`
```javascript
import { AppProvider, useApp } from './contexts/AppContext'; // ❌ WRONG
```

**Actual Directory:** `src/context/AppContext.jsx` ✅

### Solution
```javascript
import { AppProvider, useApp } from './context/AppContext'; // ✅ CORRECT
```

---

## Issue #2: Nested Component Path Errors
**Severity:** CRITICAL - Application will not run  
**Status:** BLOCKING BUILD

### Problem
Components in subdirectories import utilities and context using `../` instead of `../../`.

### Current Code

**File:** `src/components/layout/Header.jsx:2`
```javascript
import { useApp } from '../contexts/AppContext'; // ❌ WRONG - goes to src/contexts/ (doesn't exist)
import { getDaysRemaining } from '../utils/dateUtils'; // ❌ WRONG - goes to src/utils/ from wrong place
```

**File Structure:**
```
src/
  components/
    layout/
      Header.jsx ← file is here
  context/          ← needs to go here (two levels up)
  utils/            ← needs to go here (two levels up)
```

### Solution
```javascript
import { useApp } from '../../context/AppContext'; // ✅ CORRECT - ../../../ won't work
import { getDaysRemaining } from '../../utils/dateUtils'; // ✅ CORRECT
```

### Affected Files (Complete List)

1. **src/components/layout/Header.jsx**
   - Line 2: `'../contexts/AppContext'` → `'../../context/AppContext'`
   - Line 15: `'../utils/dateUtils'` → `'../../utils/dateUtils'`

2. **src/components/layout/Sidebar.jsx**
   - Line 13: `'../contexts/AppContext'` → `'../../context/AppContext'`

3. **src/components/dashboard/Dashboard.jsx**
   - Line 18: `'../contexts/AppContext'` → `'../../context/AppContext'`
   - Line 25: `'../utils/dateUtils'` → `'../../utils/dateUtils'`

4. **src/components/calendar/Calendar.jsx**
   - Line 17: `'../contexts/AppContext'` → `'../../context/AppContext'`
   - Line 27: `'../utils/dateUtils'` → `'../../utils/dateUtils'`

5. **src/components/progress/ProgressView.jsx**
   - Line 17: `'../contexts/AppContext'` → `'../../context/AppContext'`

---

## Issue #3: Wrong Directory for SessionManager
**Severity:** HIGH - Component location inconsistent  
**Status:** IMPACTS MAINTAINABILITY

### Problem
SessionManager is imported as a component but located in `context/` directory.

### Current Structure
```
src/context/SessionManager.jsx ❌ Should be in components/
  └─ Should be either:
     - src/components/session/SessionManager.jsx
     - OR src/components/SessionManager.jsx
```

### Current Code
**File:** `src/context/SessionManager.jsx:23`
```javascript
import { useApp } from '../contexts/AppContext'; // ❌ WRONG (also has contexts vs context issue)
```

### Solution Option A: Move File
1. Create directory: `mkdir src/components/session`
2. Move file: `mv src/context/SessionManager.jsx src/components/session/SessionManager.jsx`
3. Update import: `import { useApp } from '../../context/AppContext';`
4. Update App.jsx: `import { SessionManager } from './components/session/SessionManager';`

### Solution Option B: Fix Import Only
If keeping in `context/`:
1. Update import in SessionManager: `import { useApp } from './AppContext';`
2. Update import in App.jsx: `import { SessionManager } from './context/SessionManager';`

**Recommendation:** Use Solution A (move to components) for better organization.

---

## Issue #4: Data File Import Path
**Severity:** CRITICAL - Runtime error on app initialization  
**Status:** BLOCKING BUILD

### Problem
AppContext imports from non-existent path.

### Current Code
**File:** `src/context/AppContext.jsx:2`
```javascript
import disciplinasData from '../assets/disciplinas.json'; // ❌ WRONG
```

**What exists:** `src/data/arquivo.json` ✓

### Solution
```javascript
import disciplinasData from '../data/arquivo.json'; // ✅ CORRECT
```

### Verification
After change, verify the data structure matches:
```javascript
console.log(disciplinasData); // Should have .disciplinas property
// Expected: { meta: {...}, disciplinas: [...] }
```

---

## Issue #5: Entry Point File Mismatch
**Severity:** CRITICAL - PWA won't load  
**Status:** BLOCKING BUILD

### Problem
HTML references wrong entry point file.

### Current Code
**File:** `public/index.html:13`
```html
<script type="module" src="/src/main.jsx"></script> <!-- File doesn't exist -->
```

**Actual file:** `src/index.jsx` ✓

### Solution Option A: Fix HTML
```html
<script type="module" src="/src/index.jsx"></script> <!-- ✅ CORRECT -->
```

### Solution Option B: Create Main File
Create `src/main.jsx`:
```javascript
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./App.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

And keep HTML as is. This is the more common pattern.

**Recommendation:** Use Solution B (Vite standard pattern).

---

## Issue #6: Missing UI Component Library
**Severity:** CRITICAL - Runtime error on component render  
**Status:** BLOCKING BUILD

### Problem
All components import from `@/components/ui/*` which don't exist.

### Current Code
**File:** `src/context/SessionManager.jsx:2-6`
```javascript
import { Button } from '@/components/ui/button'; // ❌ Not installed
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'; // ❌
import { Textarea } from '@/components/ui/textarea'; // ❌
import { Input } from '@/components/ui/input'; // ❌
import { Badge } from '@/components/ui/badge'; // ❌
import { Progress } from '@/components/ui/progress'; // ❌
```

### Affected Files
All these files have the same issue:
- src/context/SessionManager.jsx
- src/components/layout/Header.jsx
- src/components/layout/Sidebar.jsx (+ ScrollArea)
- src/components/dashboard/Dashboard.jsx
- src/components/calendar/Calendar.jsx
- src/components/progress/ProgressView.jsx

### Components Needed
- Button
- Card (with CardContent, CardDescription, CardHeader, CardTitle)
- Textarea
- Input
- Badge
- Progress
- ScrollArea

### Solution Option A: Install shadcn/ui (Recommended)
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add input
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add scroll-area
```

### Solution Option B: Headless UI + Custom Styling
Install:
```bash
npm install @headlessui/react
npm install classnames
```

Create component wrapper file, e.g. `src/components/ui/button.jsx`:
```javascript
import { forwardRef } from 'react';
import classnames from 'classnames';

export const Button = forwardRef(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={classnames(
      'px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700',
      className
    )}
    {...props}
  />
));
```

**Recommendation:** Use Solution A (shadcn/ui) - more mature and complete.

---

## Issue #7: Missing npm Dependencies
**Severity:** CRITICAL - Build fails  
**Status:** BLOCKING BUILD

### Current package.json
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "eslint": "^9.9.0",
    "vite": "^5.2.0",
    "workbox-build": "^7.0.0"
  }
}
```

### Missing Dependencies

**1. lucide-react** (CRITICAL - used in every component)
- Used in: Header, Sidebar, Dashboard, Calendar, SessionManager, ProgressView
- Examples: Menu, Sun, Moon, Download, Clock, Target, etc.

**2. UI Component Library** (CRITICAL)
- Either shadcn/ui or @radix-ui/*

**3. Tailwind CSS Tooling** (CRITICAL - App.css imports @tailwind)
- tailwindcss
- postcss
- autoprefixer

**4. vite-plugin-pwa** (CRITICAL - referenced in vite.config.js:3)

**5. classnames** (HIGH - for conditional CSS)

### Solution
```bash
npm install lucide-react
npm install -D tailwindcss postcss autoprefixer
npm install -D vite-plugin-pwa
npm install classnames

# Option A: If using shadcn/ui
npx shadcn-ui@latest init

# Option B: If using manual UI components
# (no additional install needed)
```

### Updated package.json
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^0.263.1",
    "classnames": "^2.3.2"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "eslint": "^9.9.0",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.3.6",
    "vite": "^5.2.0",
    "vite-plugin-pwa": "^0.19.0",
    "workbox-build": "^7.0.0"
  }
}
```

---

## Issue #8: CSS Import Errors
**Severity:** HIGH - Build fails or styles don't apply  
**Status:** BLOCKING BUILD

### Current Code
**File:** `src/App.css:1-2`
```css
@import "tailwindcss";
@import "tw-animate-css";
```

### Problems
1. `@import "tailwindcss"` - Wrong way to import Tailwind
2. `@import "tw-animate-css"` - Package doesn't exist

### Solution
```css
/* src/App.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@custom-variant dark (&:is(.dark *));

/* Rest of the file... */
```

### Verification
```bash
npm run build # Should compile without CSS errors
```

---

## Issue #9: Missing tailwind.config.js
**Severity:** HIGH - Tailwind won't work properly  
**Status:** BLOCKING BUILD

### Problem
No Tailwind configuration file exists.

### Solution
Create `tailwind.config.js` in project root:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  darkMode: 'class',
}
```

### Also Create: postcss.config.js
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

---

## Issue #10: Incorrect .deepsource.toml Configuration
**Severity:** MEDIUM - Wrong analysis type  
**Status:** WRONG LANGUAGE

### Current Code
**File:** `.deepsource.toml`
```toml
version = 1

[[analyzers]]
name = "java"

  [analyzers.meta]
  runtime_version = "11"
```

### Problem
This is a JavaScript project, not Java.

### Solution
```toml
version = 1

[[analyzers]]
name = "python"

[[analyzers]]
name = "javascript"
```

---

## Issue #11: No ESLint Configuration
**Severity:** MEDIUM - No code quality checking  
**Status:** MISSING FILE

### Problem
No `.eslintrc.json` or `.eslintrc.js` file.

### Solution
Create `.eslintrc.json`:
```json
{
  "env": {
    "browser": true,
    "es2021": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "plugins": [
    "react",
    "react-hooks"
  ],
  "rules": {
    "react/react-in-jsx-scope": "off"
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  }
}
```

---

## Issue #12: Hardcoded Development Date
**Severity:** MEDIUM - Will break after date passes  
**Status:** MAINTENANCE ISSUE

### Current Code
**File:** `src/utils/dateUtils.js:7-9`
```javascript
export const getCurrentDate = () => {
  // Para desenvolvimento, usar data fixa
  return new Date('2025-08-27'); // Quarta-feira, 27 de agosto de 2025
  
  // Para produção, descomentar a linha abaixo:
  // return new Date();
};
```

### Problem
- Fixed to 2025-08-27 for testing
- After this date passes, all calculations are wrong
- Must be changed manually for production

### Solution Option A: Environment Variable
Create `.env.development`:
```env
VITE_CURRENT_DATE=2025-08-27
```

Create `.env.production`:
```env
VITE_CURRENT_DATE=
```

Update dateUtils.js:
```javascript
export const getCurrentDate = () => {
  const overrideDate = import.meta.env.VITE_CURRENT_DATE;
  return overrideDate ? new Date(overrideDate) : new Date();
};
```

### Solution Option B: Environment Detection
```javascript
export const getCurrentDate = () => {
  // Only override in development
  if (import.meta.env.DEV) {
    return new Date('2025-08-27');
  }
  return new Date();
};
```

**Recommendation:** Use Option A for flexibility.

---

## Issue #13: Missing Null Checks
**Severity:** MEDIUM - Potential runtime errors  
**Status:** ERROR RISK

### Example #1: Dashboard.jsx Line 295
```javascript
// Current (unsafe)
style={{ 
  backgroundColor: state.disciplinas.find(d => d.id === currentSession.disciplinaId)?.color 
}}

// Better
const disciplina = state.disciplinas.find(d => d.id === currentSession.disciplinaId);
style={{ 
  backgroundColor: disciplina?.color || '#cccccc'
}}
```

### Example #2: SessionManager.jsx Line 290
```javascript
// Current (unsafe)
const disciplina = state.disciplinas.find(d => d.id === currentSession.disciplinaId);
const theme = disciplina?.themes.find(t => t.id === currentSession.themeId);

// Better
const disciplina = state.disciplinas?.find(d => d.id === currentSession?.disciplinaId);
const theme = disciplina?.themes?.find(t => t.id === currentSession?.themeId);
```

---

## Issue #14: localStorage Private Browsing Errors
**Severity:** MEDIUM - Will crash in private mode  
**Status:** ERROR HANDLING

### Current Code
**File:** `src/context/AppContext.jsx:368-376`
```javascript
useEffect(() => {
  const savedData = localStorage.getItem('gestao-estudos-data');
  if (savedData) {
    try {
      const parsedData = JSON.parse(savedData);
      dispatch({ type: actionTypes.LOAD_DATA, payload: parsedData });
    } catch (error) {
      console.error('Erro ao carregar dados salvos:', error);
    }
  }
}, []);
```

### Problem
In Private Browsing mode, localStorage throws error: "QuotaExceededError"

### Solution
```javascript
useEffect(() => {
  try {
    // Detect if localStorage is available
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    
    const savedData = localStorage.getItem('gestao-estudos-data');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      dispatch({ type: actionTypes.LOAD_DATA, payload: parsedData });
    }
  } catch (error) {
    console.error('localStorage not available:', error);
    // Continue with initialState
  }
}, []);
```

---

## Summary Table

| Issue | File(s) | Type | Fix Time | Impact |
|-------|---------|------|----------|--------|
| #1: contexts → context | App.jsx | Path | 1 min | BLOCKING |
| #2: Nested paths | 5 component files | Path | 5 min | BLOCKING |
| #3: SessionManager location | SessionManager.jsx | Structure | 5 min | HIGH |
| #4: Data file path | AppContext.jsx | Path | 1 min | BLOCKING |
| #5: Entry point | index.html | Config | 1 min | BLOCKING |
| #6: UI components | 6 files | Install | 10 min | BLOCKING |
| #7: npm deps | package.json | Install | 5 min | BLOCKING |
| #8: CSS imports | App.css | Fix | 1 min | BLOCKING |
| #9: tailwind.config.js | Create | Config | 2 min | BLOCKING |
| #10: .deepsource.toml | Fix | Config | 1 min | LOW |
| #11: .eslintrc.json | Create | Config | 2 min | LOW |
| #12: Date hardcoding | dateUtils.js | Fix | 5 min | MEDIUM |
| #13: Null checks | Multiple | Code | 10 min | MEDIUM |
| #14: localStorage | AppContext.jsx | Code | 5 min | MEDIUM |

**Total Estimated Time: ~1-2 hours**

---

## Recommended Fix Order

1. ✅ Fix import paths (15 min) - Unblocks everything
2. ✅ Update package.json + npm install (10 min)
3. ✅ Create config files (10 min)
4. ✅ Fix entry point & data path (5 min)
5. ✅ Fix CSS imports (5 min)
6. ✅ Test build (10 min)
7. ✅ Optional: Improve error handling (10 min)

---

## Testing After Fixes

```bash
# Install dependencies
npm install

# Check for build errors
npm run build

# Start dev server
npm run dev

# Run linter
npm run lint

# Check for remaining errors
# - Console should have no import errors
# - App should load successfully
# - All pages should be accessible
```
