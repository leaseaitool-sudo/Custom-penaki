const fs = require('fs');

let app = fs.readFileSync('src/app/App.tsx', 'utf8');

// remove handleSelectClient
app = app.replace(/const handleSelectClient = [\s\S]*?;/g, '');

// remove handleAddReviewer
app = app.replace(/const handleAddReviewer = [\s\S]*?\};\n/g, '');

// remove handleUpdateReviewerSettings
app = app.replace(/const handleUpdateReviewerSettings = [\s\S]*?\};\n/g, '');

// remove handleCreateOrg
app = app.replace(/const handleCreateOrg = [\s\S]*?\};\n/g, '');

// remove handleManageOrg
app = app.replace(/const handleManageOrg = [\s\S]*?\};\n/g, '');

// remove imports
app = app.replace(/import \{.*?\} from '@\/features\/admin.*?';\n/g, '');

// remove isSuperAdmin usages
app = app.replace(/isSuperAdmin\(currentUser\)/g, 'false');

// remove admin-dashboard, org-detail, deploy-admins
app = app.replace(/setActiveView\('deploy-admins'\);/g, "setActiveView('home');");
app = app.replace(/setActiveView\('admin-client-detail'\);/g, "setActiveView('home');");
app = app.replace(/setActiveView\('org-detail'\);/g, "setActiveView('home');");
app = app.replace(/setActiveView\('admin-dashboard'\);/g, "setActiveView('home');");

// fix useWorkbench error in Workbench.tsx
let workbench = fs.readFileSync('src/features/leases/components/workbench/Workbench.tsx', 'utf8');
workbench = workbench.replace(/@\/features\/admin\/hooks\/useWorkbench/g, '@/features/leases/hooks/useWorkbench');
fs.writeFileSync('src/features/leases/components/workbench/Workbench.tsx', workbench);

// fix useNavigation error
let useNav = fs.readFileSync('src/shared/hooks/useNavigation.ts', 'utf8');
useNav = useNav.replace(/'client-chats': '\/chats',/g, '');
fs.writeFileSync('src/shared/hooks/useNavigation.ts', useNav);

// fix localHandleSubmitReview return type error
app = app.replace(/const localHandleSubmitReview = async \(leaseId: string, finalData: AbstractedData, notes\?: string, timeSpent\?: number, skipR2\?: boolean\) => \{/g, 'const localHandleSubmitReview = async (leaseId: string, finalData: AbstractedData, notes?: string, timeSpent?: number, skipR2?: boolean): Promise<{success: boolean}> => {');
app = app.replace(/setActiveView\('portfolio'\);\n        \}/g, "setActiveView('portfolio');\n        }\n        return { success };");

fs.writeFileSync('src/app/App.tsx', app);
