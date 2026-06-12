const fs = require('fs');

let app = fs.readFileSync('src/app/App.tsx', 'utf8');

app = app.replace(/const isDeployAdmin = currentUser\?\.role === Role\.ADMIN;/g, 'const isDeployAdmin = false;');
app = app.replace(/if \(currentUser\?\.role === Role\.REVIEWER\) \{[\s\S]*?\}/g, '');
app = app.replace(/if \(isSuperAdmin\(currentUser\)\) return users\.filter\(u => u\.role === Role\.USER\);/g, '');
app = app.replace(/return users\.filter\(c => c\.role === Role\.USER && clientEmails\.includes\(c\.email\)\);/g, 'return [];');
app = app.replace(/if \(isSuperAdmin\(currentUser\)\) return users\.filter\(u => u\.role === Role\.REVIEWER\);/g, '');
app = app.replace(/\.filter\(om => om\.organizationId === currentOrgId && om\.role === Role\.REVIEWER && om\.status === 'Active'\)/g, '');
app = app.replace(/if \(currentUser\.role !== Role\.ADMIN\) return;/g, '');
app = app.replace(/if \(currentUser\?\.role === Role\.ADMIN\) return scopedLeases;/g, '');
app = app.replace(/if \(currentUser\?\.role === Role\.REVIEWER\) return leases\.filter\(lease => lease\.reviewer\?\.id === currentUser\.id \|\| lease\.reviewerR2\?\.id === currentUser\.id\);/g, '');
app = app.replace(/if \(currentUser\.role === Role\.ADMIN\) setActiveView\('admin-dashboard'\);\n\s*else if \(currentUser\.role === Role\.REVIEWER\) setActiveView\('reviewer-dashboard'\);\n\s*else /g, '');
app = app.replace(/const newMember: OrganizationMember = \{ id: `mem_\$\{Date\.now\(\)\}`, organizationId: currentOrgId, userId: user\.email, role: Role\.REVIEWER, status: 'Active' \};/g, '');
app = app.replace(/if \(currentUser\.role === Role\.ADMIN\) senderName = "Team Penaki";/g, '');
app = app.replace(/const adminMember: OrganizationMember = \{ id: `mem_\$\{Date\.now\(\)\}`, organizationId: newOrgId, userId: adminEmail, role: Role\.ADMIN, status: 'Active' \};/g, '');
app = app.replace(/const adminMember = orgMembers\.find\(m => m\.organizationId === org\.id && m\.role === Role\.ADMIN\);/g, '');

fs.writeFileSync('src/app/App.tsx', app);
