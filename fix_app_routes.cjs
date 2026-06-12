const fs = require('fs');
let content = fs.readFileSync('src/app/App.tsx', 'utf8');

const target1 = `<Route path="/templates/choose" element={<ChooseTemplatePage onSelectTemplate={handleSelectBaseTemplate} onProceedToReview={() => setActiveView('review-template')} />} />`;
const new1 = `<Route path="/templates/choose" element={<ChooseTemplatePage onSelectTemplate={handleSelectTemplate} onSelectSavedTemplate={handleSelectSavedTemplate} savedTemplates={currentUser?.savedTemplates} onBack={() => setActiveView('abstract')} />} />`;
content = content.replace(target1, new1);

const target2 = `<Route path="/templates/review" element={<ReviewTemplatePage baseTemplate={selectedBaseTemplate} onProceedToConfigure={() => setActiveView('configure-templates')} onBack={() => setActiveView('choose-template')} />} />`;
const new2 = `<Route path="/templates/review" element={pendingLease ? <ReviewTemplatePage pendingLease={pendingLease as any} initialTemplateData={prefilledTemplateData} existingTemplateId={pendingTemplateId} onSubmit={handleFinalSubmit} onSaveTemplate={handleSaveTemplate} onUpdateTemplate={handleUpdateTemplate} onBack={() => setActiveView('choose-template')} /> : null} />`;
content = content.replace(target2, new2);

const target3 = `<Route path="/templates/configure" element={<ConfigureTemplatesPage prefilledData={prefilledTemplateData} onSave={handleSaveTemplate} onBack={() => setActiveView('review-template')} />} />`;
const new3 = `<Route path="/templates/configure" element={<ConfigureTemplatesPage initialLeases={pendingIndividualLeases!} savedTemplates={currentUser?.savedTemplates} onContinue={handleProceedToBatchReview} onBack={() => setActiveView('abstract')} />} />`;
content = content.replace(target3, new3);

const target4 = `<Route path="/templates/batch-review" element={<BatchReviewTemplatesPage batchData={pendingBatchTemplates!} onConfirm={handleConfirmBatchTemplates} onBack={() => setActiveView('abstract')} />} />`;
const new4 = `<Route path="/templates/batch-review" element={<BatchReviewTemplatesPage initialTemplates={pendingBatchTemplates!} leaseCount={pendingIndividualLeases?.length || 0} onSubmit={handleFinalBatchSubmit} onBack={() => setActiveView('abstract')} />} />`;
content = content.replace(target4, new4);

const target5 = `<Route path="/history" element={<HistoryTable leases={leasesForCurrentUser} onViewSubmission={handleViewSubmission} onEditLease={handleEditLease} onGenerateExcel={handleDownloadExcel} onViewInsights={(lease) => { setLeaseForInsights(lease); setActiveView('lease-insights'); }} />} />`;
const new5 = `<Route path="/history" element={<HistoryTable leases={leasesForCurrentUser} onView={handleViewLease} onDownloadExcel={handleDownloadExcel} onDownloadAllExcel={handleDownloadAllExcel} onDownloadPdf={handleDownloadPdf} onChat={handleOpenChat} onRetry={handleRetryLease} onAddAmendment={handleAddAmendment} onOpenInsights={handleOpenLeaseInsights} />} />`;
content = content.replace(target5, new5);

fs.writeFileSync('src/app/App.tsx', content);
console.log('App routes fixed.');
