const fs = require('fs');
const path = 'src/pages/home/components/HomePageWidgets.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add missing imports
const missingImports = `import { SpinnerIcon } from '@/shared/ui/Icons/SpinnerIcon';
import { ExclamationTriangleIcon } from '@/shared/ui/Icons/ExclamationTriangleIcon';
import { useScrollAnimation } from '@/shared/hooks/useScrollAnimation';
`;

content = content.replace("import { ScrollAnimatedSection } from '@/shared/ui/Animations/ScrollAnimatedSection';", 
    "import { ScrollAnimatedSection } from '@/shared/ui/Animations/ScrollAnimatedSection';\n" + missingImports);

fs.writeFileSync(path, content);
console.log("Fixed imports in HomePageWidgets.tsx");
