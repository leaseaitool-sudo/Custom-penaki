
import React, { useState, useEffect } from 'react';
import { User, SavedTemplate, SelectionSection } from '@/shared/types';
import { ScrollAnimatedSection } from '@/shared/ui/Animations/ScrollAnimatedSection';
import { UserCircleIcon } from '@/shared/ui/Icons/UserCircleIcon';
import { KeyIcon } from '@/shared/ui/Icons/KeyIcon';
import { DocumentTextIcon } from '@/shared/ui/Icons/DocumentTextIcon';
import { TrashIcon } from '@/shared/ui/Icons/TrashIcon';
import { PencilSquareIcon } from '@/shared/ui/Icons/PencilSquareIcon';
import { TemplateEditor } from '@/features/templates/components/TemplateEditor';
import { ConfirmationModal } from '@/shared/ui/Modal/ConfirmationModal';
import { ArrowLeftIcon } from '@/shared/ui/Icons/ArrowLeftIcon';
import { OptionalSectionsAdder } from '@/features/templates/components/OptionalSectionsAdder';
import { generateTemplateData, getCanonicalSectionOrder } from '@/features/templates/types/templates';
import * as authService from '@/features/auth/api/authService';

interface ProfilePageProps {
  user: User;
  onUpdateUser: (user: User) => void;
  onDeleteTemplate: (templateId: string) => void;
  onUpdateTemplate: (template: SavedTemplate) => void;
}

const commonInputClasses = "mt-2 block w-full px-3 py-2 bg-surface-muted border-border focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md shadow-sm";
const commonButtonClasses = "flex justify-center py-2.5 px-5 text-sm font-medium text-white focus:outline-none bg-gradient-to-r from-primary to-accent rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md btn-gradient";

// Simple Modal for Template Editing - Full Screen Look
const EditTemplateModal: React.FC<{
  template: SavedTemplate;
  onClose: () => void;
  onSave: (template: SavedTemplate) => void;
}> = ({ template, onClose, onSave }) => {
  const [name, setName] = useState(template.name);
  const [sections, setSections] = useState<SelectionSection[]>(template.sections);
  const [availableOptionalSections, setAvailableOptionalSections] = useState<SelectionSection[]>([]);

  useEffect(() => {
    // Calculate available optional sections (All possible for type - current sections)
    const { main: allMain, optional: allOptional } = generateTemplateData(template.type);
    const allPossible = [...allMain, ...allOptional];

    const currentIds = new Set(sections.map(s => s.id));
    const available = allPossible.filter(s => !currentIds.has(s.id));

    setAvailableOptionalSections(available);
  }, [template.type, sections]); // Re-calc when sections change

  const handleSave = () => {
    onSave({
      ...template,
      name,
      sections,
      lastModified: new Date(),
    });
    onClose();
  };

  const handleAddSection = (sectionId: string) => {
    const sectionToAdd = availableOptionalSections.find(s => s.id === sectionId);
    if (sectionToAdd) {
      // Sort upon adding
      const canonicalOrder = getCanonicalSectionOrder(template.type);

      setSections(prev => {
        const next = [...prev, sectionToAdd];
        return next.sort((a, b) => {
          const idxA = canonicalOrder.indexOf(a.id);
          const idxB = canonicalOrder.indexOf(b.id);
          const posA = idxA === -1 ? 9999 : idxA;
          const posB = idxB === -1 ? 9999 : idxB;
          return posA - posB;
        });
      });
    }
  };

  const handleRemoveSection = (sectionId: string) => {
    setSections(prev => prev.filter(s => s.id !== sectionId));
    // Logic to add back to available is handled by useEffect
  };

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto animate-fade-in">
      <div className="min-h-screen flex flex-col">
        <div className="p-4 sm:p-8">
          <div className="max-w-3xl mx-auto flex flex-col gap-8">
            {/* Header Area */}
            <div className="text-center relative">
              <button
                onClick={onClose}
                className="absolute left-0 top-1/2 -translate-y-1/2 inline-flex items-center px-4 py-2 border border-border text-sm font-medium rounded-md text-text-light bg-surface hover:bg-surface-muted transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Back
              </button>
              <h2 className="text-3xl md:text-4xl font-extrabold text-text-main mb-2">
                Edit Template
              </h2>
              <p className="max-w-2xl mx-auto text-lg text-text-light">
                Customize your saved configuration.
              </p>
            </div>

            {/* Name Input */}
            <div className="bg-surface p-6 rounded-xl border border-border shadow-sm">
              <label className="block text-sm font-medium text-text-light mb-1">Template Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary text-lg bg-surface-muted"
                placeholder="Enter template name..."
              />
            </div>

            <TemplateEditor
              title="Included Sections"
              templateData={sections}
              onTemplateDataChange={setSections}
              onRemoveOptionalSection={handleRemoveSection}
            />

            <OptionalSectionsAdder
              sections={availableOptionalSections}
              onAdd={handleAddSection}
            />

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4 border-t border-border">
              <button
                onClick={onClose}
                className="px-6 py-3 border border-border rounded-lg text-text-light bg-surface hover:bg-surface-muted font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-8 py-3 bg-gradient-to-r from-primary via-accent to-secondary text-white rounded-lg hover:shadow-lg font-medium transition-all duration-300 transform hover:scale-105 btn-gradient"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, onUpdateUser, onDeleteTemplate, onUpdateTemplate }) => {
  // Personal info state
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [infoMessage, setInfoMessage] = useState({ type: '', text: '' });
  const [isSavingInfo, setIsSavingInfo] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Template State
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [templateToEdit, setTemplateToEdit] = useState<SavedTemplate | null>(null);

  useEffect(() => {
    setUsername(user.username);
    setEmail(user.email);
  }, [user]);

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfoMessage({ type: '', text: '' });

    // Client-side validation
    if (!username.trim() || !email.trim()) {
      setInfoMessage({ type: 'error', text: 'Name and email cannot be empty.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setInfoMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    // Check if anything actually changed
    const usernameChanged = username.trim() !== user.username;
    const emailChanged = email.trim() !== user.email;
    if (!usernameChanged && !emailChanged) {
      setInfoMessage({ type: 'info', text: 'No changes to save.' });
      setTimeout(() => setInfoMessage({ type: '', text: '' }), 3000);
      return;
    }

    // If no user ID, fall back to local-only update (non-authenticated demo mode)
    if (!user.id) {
      onUpdateUser({ ...user, username: username.trim(), email: email.trim() });
      setInfoMessage({ type: 'success', text: 'Profile updated locally.' });
      setTimeout(() => setInfoMessage({ type: '', text: '' }), 3000);
      return;
    }

    setIsSavingInfo(true);
    try {
      const updates: { username?: string; email?: string } = {};
      if (usernameChanged) updates.username = username.trim();
      if (emailChanged) updates.email = email.trim();

      const result = await authService.updateProfile(user.id, updates);

      if (!result.success) {
        setInfoMessage({ type: 'error', text: result.error || 'Update failed.' });
        return;
      }

      // Update local state
      onUpdateUser({ ...user, username: username.trim(), email: emailChanged ? email.trim() : user.email });

      if (result.emailConfirmationRequired) {
        setInfoMessage({
          type: 'success',
          text: 'Profile updated! A confirmation email has been sent to your new email address. Please verify it to complete the change.'
        });
      } else {
        setInfoMessage({ type: 'success', text: 'Profile updated successfully!' });
      }
      setTimeout(() => setInfoMessage({ type: '', text: '' }), 5000);
    } catch {
      setInfoMessage({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setIsSavingInfo(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });

    // Client-side validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Please fill all password fields.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }
    if (currentPassword === newPassword) {
      setPasswordMessage({ type: 'error', text: 'New password must be different from current password.' });
      return;
    }

    // If no user ID, cannot change password (demo mode)
    if (!user.id) {
      setPasswordMessage({ type: 'error', text: 'Password change is not available in demo mode.' });
      return;
    }

    setIsSavingPassword(true);
    try {
      // Step 1: Verify current password
      const verification = await authService.verifyCurrentPassword(user.email, currentPassword);
      if (!verification.valid) {
        setPasswordMessage({ type: 'error', text: verification.error || 'Current password is incorrect.' });
        return;
      }

      // Step 2: Update to new password
      const result = await authService.updatePassword(newPassword);
      if (!result.success) {
        setPasswordMessage({ type: 'error', text: result.error || 'Password update failed.' });
        return;
      }

      setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMessage({ type: '', text: '' }), 5000);
    } catch {
      setPasswordMessage({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setIsSavingPassword(false);
    }
  };

  const Message: React.FC<{ message: { type: string; text: string } }> = ({ message }) => {
    if (!message.text) return null;
    const isError = message.type === 'error';
    const isInfo = message.type === 'info';
    const classes = isError
      ? 'bg-red-100 border-red-300 text-red-800'
      : isInfo
        ? 'bg-blue-100 border-blue-300 text-blue-800'
        : 'bg-green-100 border-green-300 text-green-800';
    return (
      <div className={`my-4 p-3 rounded-md text-sm ${classes}`}>
        {message.text}
      </div>
    );
  };

  return (
    <ScrollAnimatedSection className="max-w-4xl mx-auto space-y-12">
      {/* Saved Templates Section */}
      <div className="bg-surface p-8 rounded-2xl border border-border shadow-lg">
        <div className="flex items-center border-b border-border pb-4 mb-6">
          <DocumentTextIcon className="w-8 h-8 text-primary mr-4" />
          <div>
            <h2 className="text-2xl font-bold text-text-main">Saved Templates</h2>
            <p className="text-sm text-text-light">Manage your custom lease configuration templates.</p>
          </div>
        </div>

        {!user.savedTemplates || user.savedTemplates.length === 0 ? (
          <div className="text-center py-8 bg-surface-muted rounded-xl border border-dashed border-border">
            <p className="text-text-light">You haven't saved any templates yet.</p>
            <p className="text-xs text-text-light mt-1">Save a template during your next lease submission.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {user.savedTemplates.map(template => (
              <div key={template.id} className="flex items-center justify-between p-4 bg-white border border-border rounded-lg shadow-sm hover:border-primary transition-colors">
                <div>
                  <h4 className="font-bold text-text-main">{template.name}</h4>
                  <div className="flex items-center gap-3 mt-1 text-xs text-text-light">
                    <span className="uppercase bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">{template.type}</span>
                    <span>Modified: {template.lastModified.toLocaleDateString()}</span>
                    <span>{template.sections.reduce((acc, s) => acc + s.fields.filter(f => f.isSelected).length, 0)} Fields</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTemplateToEdit(template)}
                    className="p-2 text-text-light hover:text-primary hover:bg-blue-50 rounded-md transition-colors"
                    title="Edit Template"
                  >
                    <PencilSquareIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setTemplateToDelete(template.id)}
                    className="p-2 text-text-light hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete Template"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>


      {/* Personal Info Section */}
      <div className="bg-surface p-8 rounded-2xl border border-border shadow-lg">
        <div className="flex items-center border-b border-border pb-4 mb-6">
          <UserCircleIcon className="w-8 h-8 text-primary mr-4" />
          <h2 className="text-2xl font-bold text-text-main">Personal Information</h2>
        </div>
        <form onSubmit={handleInfoSubmit} className="space-y-6">
          <Message message={infoMessage} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-text-light">Full Name</label>
              <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} className={commonInputClasses} disabled={isSavingInfo} />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-light">Email Address</label>
              <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className={commonInputClasses} disabled={isSavingInfo} />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={isSavingInfo} className={`${commonButtonClasses} ${isSavingInfo ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {isSavingInfo ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Saving...
                </span>
              ) : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Password Section */}
      <div className="bg-surface p-8 rounded-2xl border border-border shadow-lg">
        <div className="flex items-center border-b border-border pb-4 mb-6">
          <KeyIcon className="w-8 h-8 text-primary mr-4" />
          <h2 className="text-2xl font-bold text-text-main">Change Password</h2>
        </div>
        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          <Message message={passwordMessage} />
          <div>
            <label htmlFor="current-password" className="block text-sm font-medium text-text-light">Current Password</label>
            <input type="password" id="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={commonInputClasses} placeholder="••••••••" disabled={isSavingPassword} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-text-light">New Password</label>
              <input type="password" id="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={commonInputClasses} placeholder="••••••••" disabled={isSavingPassword} />
              <p className="mt-1 text-xs text-text-light">Minimum 8 characters</p>
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-text-light">Confirm New Password</label>
              <input type="password" id="confirm-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={commonInputClasses} placeholder="••••••••" disabled={isSavingPassword} />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={isSavingPassword} className={`${commonButtonClasses} ${isSavingPassword ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {isSavingPassword ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Updating...
                </span>
              ) : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Modals */}
      <ConfirmationModal
        isOpen={!!templateToDelete}
        onClose={() => setTemplateToDelete(null)}
        onConfirm={() => {
          if (templateToDelete) onDeleteTemplate(templateToDelete);
          setTemplateToDelete(null);
        }}
        title="Delete Template"
        message="Are you sure you want to delete this template? This action cannot be undone."
        confirmText="Delete"
      />

      {templateToEdit && (
        <EditTemplateModal
          template={templateToEdit}
          onClose={() => setTemplateToEdit(null)}
          onSave={onUpdateTemplate}
        />
      )}
    </ScrollAnimatedSection>
  );
};
