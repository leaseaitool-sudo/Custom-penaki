
import { SelectionSection } from '@/shared/types';

const getUsSections = (): SelectionSection[] => [
    {
        id: 'sec_landlord', title: 'Landlord', fields: [
            { id: 'f_landlord_name', label: 'Name', isSelected: true },
            { id: 'f_landlord_street', label: 'Street', isSelected: true },
            { id: 'f_landlord_street_no', label: 'Street No.', isSelected: true },
            { id: 'f_landlord_zip', label: 'Zip Code', isSelected: true },
            { id: 'f_landlord_city', label: 'City', isSelected: true },
            { id: 'f_landlord_country', label: 'Country', isSelected: true },
            { id: 'f_landlord_state', label: 'State', isSelected: true },
        ]
    },
    {
        id: 'sec_tenant', title: 'Tenant', fields: [
            { id: 'f_tenant_name', label: 'Name', isSelected: true },
            { id: 'f_tenant_street', label: 'Street', isSelected: true },
            { id: 'f_tenant_street_no', label: 'Street No.', isSelected: true },
            { id: 'f_tenant_zip', label: 'Postal Code', isSelected: true },
            { id: 'f_tenant_city', label: 'City', isSelected: true },
            { id: 'f_tenant_state', label: 'State/Province', isSelected: true },
            { id: 'f_tenant_country', label: 'Country', isSelected: true },
        ]
    },
     {
        id: 'sec_guarantor', title: 'Guarantor', fields: [
            { id: 'f_Guarantor_name', label: 'Name', isSelected: true },
            { id: 'f_Guarantor_street', label: 'Street', isSelected: true },
            { id: 'f_Guarantor_street_no', label: 'Street No.', isSelected: true },
            { id: 'f_Guarantor_zip', label: 'Zip Code', isSelected: true },
            { id: 'f_Guarantor_city', label: 'City', isSelected: true },
            { id: 'f_Guarantor_country', label: 'Country', isSelected: true },
            { id: 'f_Guarantor_state', label: 'State', isSelected: true },
        ]
    },
    {
        id: 'sec_contact', title: 'Contact', fields: [
            { id: 'f_contact_type', label: 'Contact Type', isSelected: true },
            { id: 'f_contact_name', label: 'Name', isSelected: true },
            { id: 'f_contact_attention', label: 'Attention', isSelected: true },
            { id: 'f_contact_street', label: 'Street', isSelected: true },
            { id: 'f_contact_street_no', label: 'Street No.', isSelected: true },
            { id: 'f_contact_suite', label: 'Suite/Apt/Unit/Other', isSelected: true },
            { id: 'f_contact_zip', label: 'Zip Code', isSelected: true },
            { id: 'f_contact_city', label: 'City', isSelected: true },
            { id: 'f_contact_state', label: 'State/Province', isSelected: true },
            { id: 'f_contact_email', label: 'Email', isSelected: true },
        ]
    },
    {
        id: 'sec_rental_premises', title: 'Rental Premises', fields: [
            { id: 'f_premises_property_name', label: 'Property Name', isSelected: true },
            { id: 'f_premises_street', label: 'Street', isSelected: true },
            { id: 'f_premises_street_no', label: 'Street No.', isSelected: true },
            { id: 'f_premises_suite', label: 'Suite', isSelected: true },
            { id: 'f_premises_zip', label: 'Postal Code', isSelected: true },
            { id: 'f_premises_city', label: 'City', isSelected: true },
            { id: 'f_premises_county', label: 'County', isSelected: true },
            { id: 'f_premises_state', label: 'State/Province', isSelected: true },
            { id: 'f_premises_country', label: 'Country', isSelected: true },
        ]
    },
    {
        id: 'sec_premises_type', title: 'Premises Type', fields: [
            { id: 'f_premises_permitted_use', label: 'Permitted Use', isSelected: true },
            { id: 'f_premises_permitted_use_details', label: 'Permitted Use Details', isSelected: true },
        ]
    },
    {
        id: 'sec_rental_unit', title: 'Rental Unit', fields: [
            { id: 'f_unit_description', label: 'Description', isSelected: true },
            { id: 'f_unit_suite_number', label: 'Unit/Suite Number', isSelected: true },
            { id: 'f_unit_type', label: 'Type', isSelected: true },
            { id: 'f_unit_gross_area', label: 'Gross Area', isSelected: true },
            { id: 'f_unit_net_area', label: 'Net Area', isSelected: true },
            { id: 'f_unit_floor_no', label: 'Floor No.', isSelected: true },
            { id: 'f_unit_start_date', label: 'Start Date', isSelected: true, isDate: true },
            { id: 'f_unit_end_date', label: 'End Date', isSelected: true, isDate: true },
            { id: 'f_unit_duration', label: 'Duration', isSelected: true },
        ]
    },
    {
        id: 'sec_parking_unit', title: 'Parking Unit', fields: [
            { id: 'f_parking_description', label: 'Description', isSelected: true },
            { id: 'f_parking_suite_number', label: 'Unit/Suite Number', isSelected: true },
            { id: 'f_parking_type', label: 'Type', isSelected: true },
            { id: 'f_parking_gross_area', label: 'Gross Area', isSelected: true },
            { id: 'f_parking_net_area', label: 'Net Area', isSelected: true },
            { id: 'f_parking_floor_no', label: 'Floor No.', isSelected: true },
            { id: 'f_parking_start_date', label: 'Start Date', isSelected: true, isDate: true },
            { id: 'f_parking_end_date', label: 'End Date', isSelected: true, isDate: true },
            { id: 'f_parking_duration', label: 'Duration', isSelected: true },
        ]
    },
     {
        id: 'sec_lease_details', title: 'Lease Details', fields: [
            { id: 'f_lease_type', label: 'Type of Lease', isSelected: true },
            { id: 'f_lease_date', label: 'Date of Lease', isSelected: true, isDate: true },
            { id: 'f_lease_tenant_sig_date', label: 'Tenant Signature Date', isSelected: true, isDate: true },
            { id: 'f_lease_landlord_sig_date', label: 'Landlord Signature Date', isSelected: true, isDate: true },
            { id: 'f_lease_guarantor_sig_date', label: 'Guarantor Signature Date', isSelected: true, isDate: true },
        ]
    },
    {
        id: 'sec_lease_term', title: 'Term of Lease', fields: [
            { id: 'f_term_original_start', label: 'Original Lease Start', isSelected: true, isDate: true },
            { id: 'f_term_original_expiry', label: 'Original Lease Expiry', isSelected: true, isDate: true },
            { id: 'f_term_commencement', label: 'Commencement Date', isSelected: true, isDate: true },
            { id: 'f_term_rent_commencement', label: 'Rent Commencement', isSelected: true, isDate: true },
        ]
    },
    {
        id: 'sec_lease_expiration', title: 'Lease Expiration', fields: [
            { id: 'f_exp_effective_expiry', label: 'Lease Effective Expiry', isSelected: true, isDate: true },
            { id: 'f_exp_lease_period', label: 'Lease Period', isSelected: true },
            { id: 'f_exp_status', label: 'Status of Lease', isSelected: true },
            { id: 'f_exp_mtm_term', label: 'Month-to-Month Term', isSelected: true },
        ]
    },
    {
        id: 'sec_free_rent', title: 'Free Rent', fields: [
            { id: 'f_free_rent_amount', label: 'Amount', isSelected: true },
            { id: 'f_free_rent_amount_per_area', label: 'Amount per Area', isSelected: true },
            { id: 'f_free_rent_start_date', label: 'Start Date', isSelected: true, isDate: true },
            { id: 'f_free_rent_end_date', label: 'End Date', isSelected: true, isDate: true },
            { id: 'f_free_rent_period', label: 'Period', isSelected: true },
            { id: 'f_free_rent_billed', label: 'Billed', isSelected: true },
            { id: 'f_free_rent_every', label: 'Every', isSelected: true },
            { id: 'f_free_rent_percent_increase', label: 'Percent Increase in Rent', isSelected: true },
        ]
    },
    {
        id: 'sec_base_rent', title: 'Base Rent', fields: [
            { id: 'f_base_rent_amount_monthly', label: 'Amount Monthly', isSelected: true },
            { id: 'f_base_rent_amount_annual', label: 'Amount Annual', isSelected: true },
            { id: 'f_base_rent_amount_per_area', label: 'Amount per Area', isSelected: true },
            { id: 'f_base_rent_start_date', label: 'Start Date', isSelected: true, isDate: true },
            { id: 'f_base_rent_end_date', label: 'End Date', isSelected: true, isDate: true },
            { id: 'f_base_rent_period', label: 'Period', isSelected: true },
            { id: 'f_base_rent_billed', label: 'Billed', isSelected: true },
            { id: 'f_base_rent_every', label: 'Every', isSelected: true },
            { id: 'f_base_rent_percent_increase', label: 'Percent Increase in Rent', isSelected: true },
        ]
    },
    {
        id: 'sec_payment', title: 'Payment', fields: [
            { id: 'f_payment_schedule', label: 'Schedule', isSelected: true },
            { id: 'f_payment_date', label: 'Payment Date', isSelected: true, isDate: true },
            { id: 'f_payment_method', label: 'Payment Method', isSelected: true },
            { id: 'f_payment_means', label: 'Means of Payment', isSelected: true },
        ]
    },
    {
        id: 'sec_late_payment', title: 'Late Payment', fields: [
            { id: 'f_late_grace_period', label: 'Grace Period', isSelected: true },
            { id: 'f_late_interest_percent', label: 'Late Payment Interest (%)', isSelected: true },
            { id: 'f_late_nsf_charge', label: 'Non-Sufficient Fund Charge', isSelected: true },
        ]
    },
    {
        id: 'sec_rent_adjustment', title: 'Rent Adjustment', fields: [
            { id: 'f_adj_graduated_details', label: 'Graduated Charges Details', isSelected: true },
            { id: 'f_adj_indexation_details', label: 'Indexation Details', isSelected: true },
        ]
    },
    {
        id: 'sec_percentage_rent', title: 'Percentage Rent', fields: [
            { id: 'f_percent_sales_percent', label: '% of Sales', isSelected: true },
            { id: 'f_percent_sales_type', label: 'Type of Sales', isSelected: true },
            { id: 'f_percent_breakpoint_type', label: 'Breakpoint Type', isSelected: true },
            { id: 'f_percent_breakpoint_period', label: 'Breakpoint Period', isSelected: true },
            { id: 'f_percent_accounting_period', label: 'Accounting Period', isSelected: true },
            { id: 'f_percent_lease_period_start', label: 'Lease Period Start', isSelected: true, isDate: true },
            { id: 'f_percent_lease_period_end', label: 'Lease Period End', isSelected: true, isDate: true },
            { id: 'f_percent_audit', label: 'Percentage Rent Audit', isSelected: true },
            { id: 'f_percent_details', label: 'Details', isSelected: true },
        ]
    },
     {
        id: 'sec_turnover_product', title: 'Turnover Rent Product', fields: [
            { id: 'f_turnover_product_details', label: 'Details', isSelected: true },
        ]
    },
     {
        id: 'sec_termination', title: 'Termination Rights', fields: [
            { id: 'f_term_beneficiary', label: 'Beneficiary', isSelected: true },
            { id: 'f_term_earliest_date', label: 'Earliest Effective Date', isSelected: true, isDate: true },
            { id: 'f_term_latest_date', label: 'Latest Effective Date', isSelected: true, isDate: true },
            { id: 'f_term_interval', label: 'Interval', isSelected: true },
            { id: 'f_term_notice_start', label: 'Notice Period Start', isSelected: true, isDate: true },
            { id: 'f_term_notice_end', label: 'Notice Period End', isSelected: true, isDate: true },
            { id: 'f_term_first_notice_date', label: 'First Date Notice May Be Served', isSelected: true, isDate: true },
            { id: 'f_term_break_option', label: 'Break Option', isSelected: true },
            { id: 'f_term_penalty', label: 'Penalty', isSelected: true },
            { id: 'f_term_option_status', label: 'Option Status', isSelected: true },
            { id: 'f_term_details', label: 'Details', isSelected: true },
        ]
    },
      {
        id: 'sec_rofo_rofr', title: 'ROFO/ROFR Option', fields: [
            { id: 'f_rofo_option_type', label: 'Option Type (ROFO/ROFR)', isSelected: true },
            { id: 'f_rofo_type', label: 'Type', isSelected: true },
            { id: 'f_rofo_start_date', label: 'Start Date', isSelected: true, isDate: true },
            { id: 'f_rofo_end_date', label: 'End Date', isSelected: true, isDate: true },
            { id: 'f_rofo_notice_start', label: 'Notice Period Start', isSelected: true, isDate: true },
            { id: 'f_rofo_notice_end', label: 'Notice Period End', isSelected: true, isDate: true },
            { id: 'f_rofo_option_status', label: 'Option Status', isSelected: true },
            { id: 'f_rofo_description', label: 'Description', isSelected: true },
        ]
    },
    {
        id: 'sec_relocation', title: 'Relocation Option', fields: [
            { id: 'f_relocation_details', label: 'Details', isSelected: true },
        ]
    },
    {
        id: 'sec_renewal', title: 'Renewal Option', fields: [
            { id: 'f_renewal_option_exists', label: 'Renewal Option (Yes/No)', isSelected: true },
            { id: 'f_renewal_type', label: 'Type', isSelected: true },
            { id: 'f_renewal_start', label: 'Renewal Start', isSelected: true, isDate: true },
            { id: 'f_renewal_end', label: 'Renewal End', isSelected: true, isDate: true },
            { id: 'f_renewal_duration', label: 'Duration', isSelected: true },
            { id: 'f_renewal_indefinite_duration', label: 'Indefinite Duration', isSelected: true },
            { id: 'f_renewal_number', label: 'Number of Renewals', isSelected: true },
            { id: 'f_renewal_indefinite_number', label: 'Indefinite Number of Renewals', isSelected: true },
            { id: 'f_renewal_notice_start', label: 'Notice Period Start', isSelected: true, isDate: true },
            { id: 'f_renewal_notice_end', label: 'Notice Period End', isSelected: true, isDate: true },
            { id: 'f_renewal_option_status', label: 'Option Status', isSelected: true },
            { id: 'f_renewal_rent_increase', label: 'Rent Increase', isSelected: true },
            { id: 'f_renewal_details', label: 'Details', isSelected: true },
        ]
    },
    {
        id: 'sec_renewal_rent', title: 'Renewal Rent', fields: [
            { id: 'f_renewal_rent_annual_amount', label: 'Annual Amount', isSelected: true },
            { id: 'f_renewal_rent_annual_amount_per_area', label: 'Annual Amount per Area', isSelected: true },
            { id: 'f_renewal_rent_monthly_amount', label: 'Monthly Amount', isSelected: true },
            { id: 'f_renewal_rent_monthly_amount_per_area', label: 'Monthly Amount per Area', isSelected: true },
            { id: 'f_renewal_rent_start_date', label: 'Start Date', isSelected: true, isDate: true },
            { id: 'f_renewal_rent_end_date', label: 'End Date', isSelected: true, isDate: true },
            { id: 'f_renewal_rent_details', label: 'Details', isSelected: true },
        ]
    },
    {
        id: 'sec_security_deposit', title: 'Security - Lease Deposit', fields: [
            { id: 'f_deposit_type', label: 'Type', isSelected: true },
            { id: 'f_deposit_amount', label: 'Security Deposit Amount', isSelected: true },
            { id: 'f_deposit_amount_per_area', label: 'Amount per Area', isSelected: true },
            { id: 'f_deposit_return_date', label: 'Return Date', isSelected: true, isDate: true },
            { id: 'f_deposit_held_by', label: 'Deposit Held By', isSelected: true },
            { id: 'f_deposit_interest', label: 'Interest on Deposit', isSelected: true },
            { id: 'f_deposit_notes', label: 'Additional Notes', isSelected: true },
        ]
    },
    {
        id: 'sec_security_proof', title: 'Security - Proof of Deposit', fields: [
            { id: 'f_proof_payment_structure', label: 'Payment Structure', isSelected: true },
            { id: 'f_proof_recon_method', label: 'Reconciliation Method', isSelected: true },
            { id: 'f_proof_recon_freq', label: 'Reconciliation Frequency', isSelected: true },
            { id: 'f_proof_landlord_recon_by', label: 'Landlord Reconciliation By', isSelected: true },
            { id: 'f_proof_mgmt_fees', label: 'Management Fees', isSelected: true },
        ]
    },
    {
        id: 'sec_insurance', title: 'Insurance', fields: [
            { id: 'f_ins_type', label: 'Type', isSelected: true },
            { id: 'f_ins_responsible_party', label: 'Responsible Party', isSelected: true },
            { id: 'f_ins_tenant_provides_evidence', label: 'Tenant Provides Evidence', isSelected: true },
            { id: 'f_ins_self_insurance', label: 'Self-Insurance Possible', isSelected: true },
            { id: 'f_ins_premium', label: 'Premium', isSelected: true },
            { id: 'f_ins_aggregate_coverage', label: 'Aggregate Coverage Amount', isSelected: true },
            { id: 'f_ins_coverage_per_occupancy', label: 'Coverage Amount per Occupancy', isSelected: true },
            { id: 'f_ins_waiver_of_subrogation', label: 'Waiver of Subrogation', isSelected: true },
            { id: 'f_ins_renewal_date', label: 'Insurance Renewal Date', isSelected: true, isDate: true },
            { id: 'f_ins_additional_insured', label: 'Additional Insured Party', isSelected: true },
            { id: 'f_ins_charge_notice', label: 'Charge Notice', isSelected: true },
            { id: 'f_ins_details', label: 'Details', isSelected: true },
        ]
    },
    {
        id: 'sec_operating_expenses', title: 'Operating Expenses', fields: [
            { id: 'f_op_include_in_cam', label: 'Include in CAM', isSelected: true },
            { id: 'f_op_type', label: 'Type', isSelected: true },
            { id: 'f_op_description', label: 'Description', isSelected: true },
            { id: 'f_op_responsible', label: 'Responsible for Cost', isSelected: true },
            { id: 'f_op_annual_amount', label: 'Annual Amount', isSelected: true },
            { id: 'f_op_annual_amount_per_area', label: 'Annual Amount per Area', isSelected: true },
            { id: 'f_op_monthly_amount', label: 'Monthly Amount', isSelected: true },
            { id: 'f_op_monthly_amount_per_area', label: 'Monthly Amount per Area', isSelected: true },
            { id: 'f_op_charge_cap', label: 'Charge Cap', isSelected: true },
            { id: 'f_op_charge_cap_period', label: 'Charge Cap Period', isSelected: true },
            { id: 'f_op_expense_start', label: 'Expense Start Date', isSelected: true, isDate: true },
            { id: 'f_op_expense_end', label: 'Expense End Date', isSelected: true, isDate: true },
            { id: 'f_op_payment_structure', label: 'Payment Structure', isSelected: true },
            { id: 'f_op_recon_method', label: 'Reconciliation Method', isSelected: true },
            { id: 'f_op_recon_freq', label: 'Reconciliation Frequency', isSelected: true },
            { id: 'f_op_landlord_recon_by', label: 'Landlord Reconciliation By', isSelected: true },
            { id: 'f_op_mgmt_fees', label: 'Management Fees', isSelected: true },
        ]
    },
    {
        id: 'sec_cam', title: 'CAM', fields: [
            { id: 'f_cam_description', label: 'Description', isSelected: true },
            { id: 'f_cam_responsible', label: 'Responsible for Cost', isSelected: true },
            { id: 'f_cam_annual_amount', label: 'Annual Amount', isSelected: true },
            { id: 'f_cam_annual_amount_per_area', label: 'Annual Amount per Area', isSelected: true },
            { id: 'f_cam_monthly_amount', label: 'Monthly Amount', isSelected: true },
            { id: 'f_cam_monthly_amount_per_area', label: 'Monthly Amount per Area', isSelected: true },
            { id: 'f_cam_charge_cap', label: 'Charge Cap', isSelected: true },
            { id: 'f_cam_charge_cap_period', label: 'Charge Cap Period', isSelected: true },
            { id: 'f_cam_expense_start', label: 'Expense Start Date', isSelected: true, isDate: true },
            { id: 'f_cam_expense_end', label: 'Expense End Date', isSelected: true, isDate: true },
            { id: 'f_cam_payment_structure', label: 'Payment Structure', isSelected: true },
            { id: 'f_cam_recon_freq', label: 'Reconciliation Frequency', isSelected: true },
        ]
    },
    {
        id: 'sec_real_estate_taxes', title: 'Real Estate Taxes', fields: [
            { id: 'f_tax_include_in_cam', label: 'Included in CAM', isSelected: true },
            { id: 'f_tax_description', label: 'Description', isSelected: true },
            { id: 'f_tax_responsible', label: 'Responsible for Cost', isSelected: true },
            { id: 'f_tax_annual_amount', label: 'Annual Amount', isSelected: true },
            { id: 'f_tax_annual_amount_per_area', label: 'Annual Amount per Area', isSelected: true },
            { id: 'f_tax_monthly_amount', label: 'Monthly Amount', isSelected: true },
            { id: 'f_tax_monthly_amount_per_area', label: 'Monthly Amount per Area', isSelected: true },
            { id: 'f_tax_expense_start', label: 'Expense Start Date', isSelected: true, isDate: true },
            { id: 'f_tax_expense_end', label: 'Expense End Date', isSelected: true, isDate: true },
            { id: 'f_tax_prorata_share', label: 'Pro-Rata Share (%)', isSelected: true },
            { id: 'f_tax_prorata_details', label: 'Pro Rata Details', isSelected: true },
            { id: 'f_tax_recon_freq', label: 'Reconciliation Frequency', isSelected: true },
        ]
    },
     {
        id: 'sec_admin_fee', title: 'Administrative Fee', fields: [
            { id: 'f_admin_fee_details', label: 'Details', isSelected: true },
        ]
    },
    {
        id: 'sec_maintenance', title: 'Maintenance and Improvement', fields: [
            { id: 'f_maint_details', label: 'Details', isSelected: true },
        ]
    },
    {
        id: 'sec_retail_clause', title: 'Retail Clause', fields: [
            { id: 'f_retail_operating_hours', label: 'Operating Hours', isSelected: true },
            { id: 'f_retail_continuous_operating', label: 'Continuous Operating Clause', isSelected: true },
            { id: 'f_retail_go_dark', label: 'Go Dark Clause', isSelected: true },
             { id: 'f_retail_sub_lease', label: 'Sub lease', isSelected: true },
        ]
    },
    {
        id: 'sec_balance_audit', title: 'Balance Sheet - Audit', fields: [
            { id: 'f_audit_contractual_right', label: 'Contractual Right to Audit', isSelected: true },
            { id: 'f_audit_costs_paid_by', label: 'Audit Costs Paid By', isSelected: true },
            { id: 'f_audit_period_start', label: 'Audit Period Start', isSelected: true, isDate: true },
            { id: 'f_audit_period_end', label: 'Audit Period End', isSelected: true, isDate: true },
            { id: 'f_audit_notice_period', label: 'Audit Notice Period', isSelected: true },
            { id: 'f_audit_time_coverage', label: 'Audit Time Coverage', isSelected: true },
        ]
    },
    {
        id: 'sec_utilities', title: 'Utilities', fields: [
            { id: 'f_util_include_in_cam', label: 'Included in CAM', isSelected: true },
            { id: 'f_util_type', label: 'Type', isSelected: true },
            { id: 'f_util_description', label: 'Description', isSelected: true },
            { id: 'f_util_responsible', label: 'Responsible for Cost', isSelected: true },
            { id: 'f_util_annual_amount', label: 'Annual Amount', isSelected: true },
            { id: 'f_util_annual_amount_per_area', label: 'Annual Amount per Area', isSelected: true },
            { id: 'f_util_monthly_amount', label: 'Monthly Amount', isSelected: true },
            { id: 'f_util_monthly_amount_per_area', label: 'Monthly Amount per Area', isSelected: true },
            { id: 'f_util_charge_cap', label: 'Charge Cap', isSelected: true },
            { id: 'f_util_charge_cap_period', label: 'Charge Cap Period', isSelected: true },
            { id: 'f_util_expense_start', label: 'Expense Start Date', isSelected: true, isDate: true },
            { id: 'f_util_expense_end', label: 'Expense End Date', isSelected: true, isDate: true },
            { id: 'f_util_prorata_details', label: 'Pro Rata Details', isSelected: true },
            { id: 'f_util_recon_freq', label: 'Reconciliation Frequency', isSelected: true },
            { id: 'f_util_mgmt_fees', label: 'Management Fees', isSelected: true },
        ]
    },
     {
        id: 'sec_holdover', title: 'Holdover Details', fields: [
            { id: 'f_holdover_percent_rent', label: 'Holdover Percentage Rent', isSelected: true },
            { id: 'f_holdover_notice_period', label: 'Notice Period', isSelected: true },
            { id: 'f_holdover_status', label: 'Holdover Status (MTM/Periodic)', isSelected: true },
        ]
    },
    { 
        id: 'sec_waiver_of_subrogation', title: 'Waiver of Subrogation', fields: [
            { id: 'f_waiver_of_subrogation_details', label: 'Details', isSelected: true }
        ]
    },
];

const getEuSections = (): SelectionSection[] => [
    {
        id: 'eu_landlord', title: 'LANDLORD', fields: [
            { id: 'eu_l_name', label: 'Name', isSelected: true },
            { id: 'eu_l_street', label: 'Street', isSelected: true },
            { id: 'eu_l_street_no', label: 'Street no.', isSelected: true },
            { id: 'eu_l_zip', label: 'Zip code', isSelected: true },
            { id: 'eu_l_city', label: 'City', isSelected: true },
            { id: 'eu_l_country', label: 'Country', isSelected: true },
            { id: 'eu_l_state', label: 'State', isSelected: true },
        ]
    },
    {
        id: 'eu_tenant', title: 'TENANT', fields: [
            { id: 'eu_t_name', label: 'Name', isSelected: true },
            { id: 'eu_t_street', label: 'Street', isSelected: true },
            { id: 'eu_t_street_no', label: 'Street No.', isSelected: true },
            { id: 'eu_t_zip', label: 'Postal Code', isSelected: true },
            { id: 'eu_t_city', label: 'City', isSelected: true },
            { id: 'eu_t_county', label: 'County', isSelected: true },
            { id: 'eu_t_country', label: 'Country', isSelected: true },
        ]
    },
    {
        id: 'eu_guarantor', title: 'GUARANTOR', fields: [
            { id: 'eu_g_name', label: 'Name', isSelected: true },
            { id: 'eu_g_street', label: 'Street', isSelected: true },
            { id: 'eu_g_street_no', label: 'Street no.', isSelected: true },
            { id: 'eu_g_zip', label: 'Zip code', isSelected: true },
            { id: 'eu_g_city', label: 'City', isSelected: true },
            { id: 'eu_g_country', label: 'Country', isSelected: true },
            { id: 'eu_g_state', label: 'State', isSelected: true },
        ]
    },
    {
        id: 'eu_rental_premises', title: 'RENTAL PREMISES', fields: [
            { id: 'eu_p_name', label: 'Property name', isSelected: true },
            { id: 'eu_p_street', label: 'street', isSelected: true },
            { id: 'eu_p_street_no', label: 'Street no', isSelected: true },
            { id: 'eu_p_zip', label: 'Postal Code', isSelected: true },
            { id: 'eu_p_city', label: 'City', isSelected: true },
            { id: 'eu_p_county', label: 'County', isSelected: true },
            { id: 'eu_p_country', label: 'Country', isSelected: true },
        ]
    },
    {
        id: 'eu_rental_unit', title: 'RENTAL UNIT', fields: [
            { id: 'eu_u_desc', label: 'Description', isSelected: true },
            { id: 'eu_u_area', label: 'Gross Area', isSelected: true },
            { id: 'eu_u_floor', label: 'Floor No', isSelected: true },
            { id: 'eu_u_start', label: 'Start Date', isSelected: true, isDate: true },
            { id: 'eu_u_end', label: 'End Date', isSelected: true, isDate: true },
            { id: 'eu_u_dur', label: 'Duration', isSelected: true },
        ]
    },
    {
        id: 'eu_parking_unit', title: 'PARKING UNIT', fields: [
            { id: 'eu_pk_desc', label: 'Description', isSelected: true },
            { id: 'eu_pk_type', label: 'Type', isSelected: true },
            { id: 'eu_pk_area', label: 'Gross Area', isSelected: true },
            { id: 'eu_pk_floor', label: 'Floor No', isSelected: true },
            { id: 'eu_pk_start', label: 'Start Date', isSelected: true, isDate: true },
            { id: 'eu_pk_end', label: 'End Date', isSelected: true, isDate: true },
            { id: 'eu_pk_dur', label: 'Duration', isSelected: true },
        ]
    },
    {
        id: 'eu_base_rent', title: 'BASE RENT', fields: [
            { id: 'eu_br_amount', label: 'Amount', isSelected: true },
            { id: 'eu_br_area_amount', label: 'Amount per area', isSelected: true },
            { id: 'eu_br_period', label: 'Period', isSelected: true },
            { id: 'eu_br_monthly', label: 'Monthly Amount', isSelected: true },
            { id: 'eu_br_annual', label: 'Annual amount', isSelected: true },
            { id: 'eu_br_start', label: 'Start Date', isSelected: true, isDate: true },
            { id: 'eu_br_end', label: 'End date', isSelected: true, isDate: true },
            { id: 'eu_br_ref_unit', label: 'refers to rental unit', isSelected: true },
            { id: 'eu_br_ref_pay', label: 'refers to payment', isSelected: true },
        ]
    },
    { id: 'eu_deferred_rent', title: 'DEFERRED RENT', fields: [{ id: 'eu_dr_det', label: 'details', isSelected: true }] },
    { id: 'eu_refused_rent', title: 'REFUSED RENT', fields: [{ id: 'eu_rr_det', label: 'details', isSelected: true }] },
    { id: 'eu_free_rent', title: 'FREE RENT', fields: [{ id: 'eu_fr_det', label: 'details', isSelected: true }] },
    { id: 'eu_other_charges', title: 'OTHER CHARGES', fields: [{ id: 'eu_oc_det', label: 'details', isSelected: true }] },
    { id: 'eu_direct_costs', title: 'INITIAL DIRECT COSTS', fields: [{ id: 'eu_idc_det', label: 'details', isSelected: true }] },
    {
        id: 'eu_payment', title: 'PAYMENT', fields: [
            { id: 'eu_pay_sched', label: 'schedule', isSelected: true },
            { id: 'eu_pay_dates', label: 'payment dates', isSelected: true },
            { id: 'eu_pay_meth', label: 'payment method', isSelected: true },
        ]
    },
    { id: 'eu_adjustment', title: 'RENT ADJUSMENT', fields: [{ id: 'eu_adj_rev', label: 'rent review', isSelected: true }] },
    { id: 'eu_graduation', title: 'GRADUATION', fields: [{ id: 'eu_grad_det', label: 'details', isSelected: true }] },
    { id: 'eu_indexation', title: 'INDEXATION', fields: [{ id: 'eu_ind_det', label: 'details', isSelected: true }] },
    { id: 'eu_sales_report', title: 'SALES REPORT', fields: [{ id: 'eu_sr_det', label: 'details', isSelected: true }] },
    { id: 'eu_turnover_params', title: 'TURNOVER RENT PARAMETERS', fields: [{ id: 'eu_trp_det', label: 'details', isSelected: true }] },
    { id: 'eu_turnover_prod', title: 'TURNOVER RENT PRODUCT', fields: [{ id: 'eu_trpr_det', label: 'details', isSelected: true }] },
    {
        id: 'eu_lease_details', title: 'LEASE DETAILS', fields: [
            { id: 'eu_ld_type', label: 'type of lease', isSelected: true },
            { id: 'eu_ld_date', label: 'Date of lease', isSelected: true, isDate: true },
            { id: 'eu_ld_t_sig', label: 'Tenant Signature date', isSelected: true, isDate: true },
            { id: 'eu_ld_l_sig', label: 'Landlord Signature date', isSelected: true, isDate: true },
            { id: 'eu_ld_g_sig', label: 'Guarantor Signature date', isSelected: true, isDate: true },
        ]
    },
    {
        id: 'eu_term', title: 'TERM OF LEASE', fields: [
            { id: 'eu_tm_o_start', label: 'original lease start', isSelected: true, isDate: true },
            { id: 'eu_tm_o_expiry', label: 'original lease expiry', isSelected: true, isDate: true },
            { id: 'eu_tm_commence', label: 'Commencement date', isSelected: true, isDate: true },
            { id: 'eu_tm_rent_commence', label: 'Rent Commencement', isSelected: true, isDate: true },
            { id: 'eu_tm_eff_expiry', label: 'Lease effective expiry', isSelected: true, isDate: true },
            { id: 'eu_tm_period', label: 'Lease Period', isSelected: true },
            { id: 'eu_tm_status', label: 'Status of lease', isSelected: true },
            { id: 'eu_tm_mtm', label: 'Month-to Month Term', isSelected: true },
        ]
    },
    {
        id: 'eu_break', title: 'BREAK OPTION', fields: [
            { id: 'eu_bo_type', label: 'type', isSelected: true },
            { id: 'eu_bo_ben', label: 'Beneficiary', isSelected: true },
            { id: 'eu_bo_first', label: 'First possible break date', isSelected: true, isDate: true },
            { id: 'eu_bo_last', label: 'Last possible break date', isSelected: true, isDate: true },
            { id: 'eu_bo_int', label: 'break date interval', isSelected: true },
            { id: 'eu_bo_n_start', label: 'Notice period start', isSelected: true, isDate: true },
            { id: 'eu_bo_n_end', label: 'Notice period end', isSelected: true, isDate: true },
            { id: 'eu_bo_next', label: 'Break option: next upcoming date', isSelected: true, isDate: true },
            { id: 'eu_bo_cond', label: 'Conditions to break', isSelected: true },
            { id: 'eu_bo_status', label: 'Option Status', isSelected: true },
        ]
    },
    {
        id: 'eu_renewal', title: 'RENEWAL OPTION', fields: [
            { id: 'eu_rn_type', label: 'Type', isSelected: true },
            { id: 'eu_rn_start', label: 'Renewal Start', isSelected: true, isDate: true },
            { id: 'eu_rn_end', label: 'Renewal End', isSelected: true, isDate: true },
            { id: 'eu_rn_dur', label: 'Duration', isSelected: true },
            { id: 'eu_rn_ind_dur', label: 'Indefinite Duration', isSelected: true },
            { id: 'eu_rn_num', label: 'Number of Renewals', isSelected: true },
            { id: 'eu_rn_ind_num', label: 'Indefinite Number of Renewals', isSelected: true },
            { id: 'eu_rn_n_start', label: 'Notice Period Start', isSelected: true, isDate: true },
            { id: 'eu_rn_n_end', label: 'Notice Period End', isSelected: true, isDate: true },
            { id: 'eu_rn_status', label: 'Option Status', isSelected: true },
            { id: 'eu_rn_inc', label: 'Rent Increase', isSelected: true },
            { id: 'eu_rn_det', label: 'Details', isSelected: true },
        ]
    },
    {
        id: 'eu_security', title: 'SECURITY', fields: [
            { id: 'eu_sec_type', label: 'type', isSelected: true },
            { id: 'eu_sec_dep_type', label: 'Security deposit type', isSelected: true },
            { id: 'eu_sec_notes', label: 'Additional notes', isSelected: true },
        ]
    },
    {
        id: 'eu_insurance', title: 'INSURANCE', fields: [
            { id: 'eu_ins_obl', label: 'Obligation of', isSelected: true },
            { id: 'eu_ins_det', label: 'Details', isSelected: true },
        ]
    },
    {
        id: 'eu_cam', title: 'OPERATING AND CAM EXPENSES', fields: [
            { id: 'eu_cam_type', label: 'Type', isSelected: true },
            { id: 'eu_cam_desc', label: 'Description', isSelected: true },
            { id: 'eu_cam_resp', label: 'Responsible for Cost', isSelected: true },
            { id: 'eu_cam_ann', label: 'Annual Amount', isSelected: true },
            { id: 'eu_cam_ann_area', label: 'Annual Amount per Area', isSelected: true },
            { id: 'eu_cam_mon', label: 'Monthly Amount', isSelected: true },
            { id: 'eu_cam_mon_area', label: 'Monthly Amount per Area', isSelected: true },
            { id: 'eu_cam_cap', label: 'Charge Cap', isSelected: true },
            { id: 'eu_cam_cap_p', label: 'Charge Cap Period', isSelected: true },
            { id: 'eu_cam_start', label: 'Expense Start Date', isSelected: true, isDate: true },
            { id: 'eu_cam_p_start', label: 'Lease Period Start', isSelected: true, isDate: true },
            { id: 'eu_cam_end', label: 'Expense End Date', isSelected: true, isDate: true },
            { id: 'eu_cam_p_end', label: 'Lease Period End', isSelected: true, isDate: true },
            { id: 'eu_cam_struct', label: 'Payment Structure', isSelected: true },
            { id: 'eu_cam_meth', label: 'Reconciliation Method', isSelected: true },
            { id: 'eu_cam_freq', label: 'Reconciliation Frequency', isSelected: true },
            { id: 'eu_cam_l_recon', label: 'Landlord Reconciliation By', isSelected: true },
            { id: 'eu_cam_fees', label: 'Management Fees', isSelected: true },
        ]
    },
    { id: 'eu_maintenance', title: 'MAINTENANCE AND IMPROVEMENTS', fields: [{ id: 'eu_maint_det', label: 'details', isSelected: true }] },
    {
        id: 'eu_overhaul', title: 'OPERATIONS/OVERHAUL', fields: [
            { id: 'eu_ov_resp', label: 'Responsible for execution', isSelected: true },
            { id: 'eu_ov_det', label: 'Details', isSelected: true },
        ]
    },
    {
        id: 'eu_cosmetic', title: 'COSMETIC REPAIR OBLIGATION', fields: [
            { id: 'eu_cr_resp', label: 'Responsible party', isSelected: true },
            { id: 'eu_cr_det', label: 'Details', isSelected: true },
        ]
    },
    {
        id: 'eu_alterations', title: 'TENANT ALTERATIONS', fields: [
            { id: 'eu_ta_type', label: 'Type', isSelected: true },
            { id: 'eu_ta_det', label: 'Details', isSelected: true },
        ]
    },
    {
        id: 'eu_assignment', title: 'ASSIGNMENT', fields: [
            { id: 'eu_as_ben', label: 'beneficiary', isSelected: true },
            { id: 'eu_as_det', label: 'Details', isSelected: true },
        ]
    },
    { id: 'eu_sublease', title: 'SUBLEASE', fields: [{ id: 'eu_sl_det', label: 'Details', isSelected: true }] },
    {
        id: 'eu_clauses', title: 'CLAUSES', fields: [
            { id: 'eu_cl_surr', label: 'Surrender condition details', isSelected: true },
            { id: 'eu_cl_env', label: 'Environmental obligation', isSelected: true },
            { id: 'eu_cl_sust', label: 'sustainability clause', isSelected: true },
            { id: 'eu_cl_cont', label: 'Sections Contracted out', isSelected: true },
        ]
    },
];

export const getCanonicalSectionOrder = (type: 'us' | 'eu'): string[] => {
    const sections = type === 'us' ? getUsSections() : getEuSections();
    return sections.map(s => s.id);
};

export const generateTemplateData = (templateType: 'us' | 'eu'): { main: SelectionSection[], optional: SelectionSection[] } => {
    const sections = templateType === 'us' ? getUsSections() : getEuSections();
    
    const optionalSectionTitles = templateType === 'us' ? new Set([
        'Relocation Option',
        'Parking Unit',
        'Free Rent',
        'ROFO/ROFR Option',
        'Turnover Rent Product',
        'Administrative Fee',
        'Maintenance and Improvement',
        'Balance Sheet - Audit',
        'Guarantor',
        'Waiver of Subrogation',
    ]) : new Set([
   
    ]);

    const main: SelectionSection[] = [];
    const optional: SelectionSection[] = [];

    sections.forEach(section => {
        if (optionalSectionTitles.has(section.title)) {
            optional.push(section);
        } else {
            main.push(section);
        }
    });
    
    return { main, optional };
};
