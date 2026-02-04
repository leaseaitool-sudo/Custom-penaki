import React from 'react';
import { Workbench } from '../shared/Workbench';
import { Lease, AbstractedData } from '../../types';

interface AdminWorkbenchProps {
  lease: Lease | null;
  onBack: () => void;
  onSaveDraft: (leaseId: string, data: AbstractedData, timeSpent?: number) => Promise<void>;
  onSubmitReview: (leaseId: string, data: AbstractedData, notes?: string, timeSpent?: number) => Promise<void>;
}

export const AdminWorkbench: React.FC<AdminWorkbenchProps> = (props) => {
    return <Workbench mode="admin" {...props} />;
};