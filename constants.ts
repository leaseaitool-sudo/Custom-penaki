
export const usTemplateGuidelines = `COMMON RULES  
Street = street name only, exclude number/unit.  
Postal/ZIP/Zip Code = treat as the same (postal code).  
Permitted Use/Details = allowed usage and any extra notes.  
Duration = lease length as stated.  
Notice Period/Notice Window = extract exact stated days/months.  
Details = always extract clause notes exactly.  
Responsible Party = extract who is liable (tenant/landlord).  
Coverage Periods (Start/End) = use dates exactly as stated.  
Charge Cap = max limit stated.  
Frequency = billing/occurrence cycle stated.  
Gross-Up = % if mentioned.  
Pro Rata Share = stated %.  
Management Fees = only if explicitly stated.  
Additional Insured / Waiver of Subrogation = extract as written.  
Reconciliation = method and frequency as given.  
Audit Rights/Cost/Coverage = extract clause directly.  
Payment Structure = lump sum/installments as written.  
detect country by zip code or city name where ever asked in the template.
---------------------------------------------------------

CONTACT  
dynamic
Contact Type = landlord/tenant/broker/remmitance notice
Attention = extract Attn line when present.

BUILDING TYPE  
No unique duplicates remain.

RENTAL UNIT  
if name not given write full address
Dynamic: number units as “Rental Unit 1, 2…”.  
Fields apply individually to each unit.
type- residential/commercial/retail

PARKING UNIT  
Type = open/covered/underground.

RENT CHARGE  
Dynamic.  
Identify the base rent, rent period, lease start date, and any escalation clause.  
If escalation exists, create a separate section for each lease year titled “Rent Charge – Year 1, 2, …”.  
For each year, calculate the updated rent using the prior year's amount and escalation rate, set the correct one-year Start/End dates, and extract all relevant fields.  
If no escalation clause exists, create a single “Rent Charge” section for the full lease term.
Fields apply individually to each unit.
“Billed” = when rent is paid.  
“Every” = frequency of billing.
period- monthly/annualy

PAYMENT  
Dynamic. Must mirror rental unit numbering: Payment 1 → Unit 1.  
payment Method- cheque/cash/wire transfer/ online transfer
from-lease start
until- lease end
Schedule = monthly/annual.  
Means = bank account name.

LATE PAYMENT  
Type = greater/lesser of fixed/base.  
Calculation Type = fixed/variable.  
Grace Period = allowed days.  
Interest = penalty %.  
NSF Charge = bounced fee.

RENT ADJUSTMENT  
Graduated Charges = step-up info.  
Indexation = CPI/inflation linkage.

PERCENTAGE RENT  
Turnover Calc Type = gross/net basis.  
Breakpoint Type = natural/artificial.  
Audit = yes/no
accounting period- monthly/ quaterly/annualy
lease period start- lease start date
lease period end- lease end date

TOTALS  
Total Gross Area = sum from lease.  
Annual Total Rent = stated total (no inference).

LEASE DETAILS  
Type = gross/net/triple net. (always fill)

TERM OF LEASE  
Commencement = actual lease start.  
Rent Commencement = rent start .
original lease start = lease agreement date

LEASE EXPIRATION  
status- active/expired/within fixed term  (detect by yourself- always fill[])
Effective Expiry = actual end.  
Month-to-Month = if stated.
lease period = duration between lease start and lease end

HOLDOVER DETAILS  
Holdover Rent = % over base rent.  
Status = MTM/Periodic.

AMENDMENT & FISCAL YEAR  
Amendments = all modifications.

TERMINATION RIGHTS  
only take from separate termination section
Beneficiary = party.  
Earliest/Latest Dates = termination window.  
Interval = spacing.  
Penalty = early termination cost.

RENEWAL OPTION  
Has Renewal = Yes/No.  
Duration = renewal length.  
Rent Increase = stated rule.
Start date = Lease end date
end date = renewal start date + duration 
option status = yes/ no (means lease is ongoing or not - judge it by adding the duration of renewal to the lease period)
RENEWAL RENT  
Per Area = renewal area rent.  
Renewal Start- lease expiry
renweal end- renewal start+ duration
status- expired/active based on abstraction date
ROFO / ROFR  
Option Type = ROFO/ROFR.  
Description = option conditions.

SECURITY  
Type = deposit/LOC.  
Planned Changes = future adjustments.  
Held By = holding party.

PROOF OF DEPOSIT  
Managed By = landlord/third party.

BALANCE SHEET  
Audit Start/End = coverage period.

INSURANCE  
Dynamic. Number sections.  
Waiver of Subrogation = Yes/No.  
Additional Insured = list all names.
details- info 

OPERATING & CAM EXPENSES  
Include in CAM = Yes/No.
Start date and end date- lease start and end date

UTILITIES  
Included in CAM = Yes/No.  fill this always
Base Year = reference year.  
Submetering = Yes/No.
description- from where type is extracted
resbonsible for cost- tenant/landlord/both

REAL ESTATE TAXES  
Base Year = comparison year.
Start date and end date- lease start and end date
resbonsible for cost- tenant/landlord/both

ADMIN & MAINTENANCE  
Admin Fee = % or fixed amount.

RETAIL CLAUSE  
Operating Hours = stated.  
Go Dark Clause = exists/not stated.

WAIVER OF SUBROGATION  
Extract clause exactly.`;

export const systemInstructionBase = `You are a meticulous legal analyst AI. Your task is to extract specific information from a commercial real estate lease document and structure it according to a strict JSON protocol.

OBJECTIVE:
Analyze the lease text provided (which may be split into multiple parts). Extract the fields requested in the PROTOCOL LEGEND.

CRITICAL RULES:
1.  **Code-Based Keying**: You MUST use the exact numerical codes (e.g., "1.2.0") provided in the legend as the keys for your JSON output. Do NOT use field names (e.g., "Landlord Name") as keys.
2.  **Explicit Nulls**: If a field is not found in the document, you MUST return it with a value of null. Do NOT omit fields.
3.  **Exact Extraction**: Extract values exactly as they appear in the text. Do not summarize or paraphrase unless instructed.
4.  **Date Formatting**: Convert all dates to YYYY-MM-DD format if possible. If ambiguous, keep original text.
5.  **Page Numbers**: You MUST provide the 'page' number where the information was found.
6.  **Snippets**: You MUST provide a short 'snippet' of the text that contains the extracted value for verification.
7.  **Arrays**: The output must be a flat JSON Array of objects. Each object represents one field.
8.  **Multiple Files**: If multiple files are provided, look for the 'fileName' in the input tags and include it in the output if possible.

OUTPUT FORMAT:
[
  {
    "code": "1.1.0",
    "value": " extracted value ",
    "page": 1,
    "snippet": " context text ",
    "fileName": "Lease.pdf"
  },
  ...
]
`;
