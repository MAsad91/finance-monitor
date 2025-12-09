import ProjectModel, { IProject } from "@/lib/models/project";
import ExpenseModel from "@/lib/models/expense";

// Exchange rates for currency conversion (same as in project.ts)
const EXCHANGE_RATES_TO_INR: { [key: string]: number } = {
  inr: 1,
  dollars: 0.012,
  dollar: 0.012,
  euro: 0.011,
  pkr: 3.33,
  gbp: 0.0095,
  cad: 0.016,
  aud: 0.018,
};

function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number {
  if (fromCurrency === toCurrency) return amount;

  const normalizeCurrency = (curr: string): string => {
    const normalized = curr.toLowerCase();
    if (normalized === "dollars" || normalized === "dollar") return "dollar";
    return normalized;
  };

  const from = normalizeCurrency(fromCurrency);
  const to = normalizeCurrency(toCurrency);

  if (from === to) return amount;

  const fromRate = EXCHANGE_RATES_TO_INR[from];
  const toRate = EXCHANGE_RATES_TO_INR[to];

  if (!fromRate || !toRate) {
    console.warn(`Currency conversion rate not found: ${from} or ${to}`);
    return amount;
  }

  const amountInINR = from === "inr" ? amount : amount / fromRate;
  const result = to === "inr" ? amountInINR : amountInINR * toRate;

  return result;
}

/**
 * Recalculate project amounts including allocated expenses and disputes
 * This should be called whenever expenses or disputes are linked/unlinked to a project
 */
export async function recalculateProjectAmounts(projectId: string): Promise<void> {
  const project = await ProjectModel.findById(projectId);
  if (!project) {
    console.error(`[recalculateProjectAmounts] Project not found: ${projectId}`);
    return;
  }

  // Get all expenses allocated to this project
  // First, get ALL expenses to debug (regardless of status)
  const allExpenses = await ExpenseModel.find({});
  console.log(`[recalculateProjectAmounts] === EXPENSE DEBUGGING ===`);
  console.log(`[recalculateProjectAmounts] Total expenses in database: ${allExpenses.length}`);
  console.log(`[recalculateProjectAmounts] Looking for project ID: ${projectId}`);
  
  // Show ALL expenses and their details
  allExpenses.forEach((e, index) => {
    const hasProject = e.projectIds && e.projectIds.includes(projectId.toString());
    console.log(`[recalculateProjectAmounts] Expense ${index + 1}: "${e.name}"`);
    console.log(`  - Status: ${e.status}`);
    console.log(`  - Amount: ${e.amount} ${e.currency}`);
    console.log(`  - ProjectIds: ${JSON.stringify(e.projectIds)}`);
    console.log(`  - Has this project: ${hasProject ? 'YES' : 'NO'}`);
  });
  
  // Now get only Active expenses with this project
  const expenses = allExpenses.filter(e => {
    return e.status === "Active" && e.projectIds && e.projectIds.includes(projectId.toString());
  });
  
  console.log(`[recalculateProjectAmounts] Found ${expenses.length} ACTIVE expenses linked to this project`);

  // Convert expenses to project currency and sum
  let totalExpenses = 0;
  for (const expense of expenses) {
    const convertedAmount = convertCurrency(
      expense.amount,
      expense.currency,
      project.priceType
    );
    totalExpenses += convertedAmount;
    console.log(`[recalculateProjectAmounts] Expense: ${expense.name}, Amount: ${expense.amount} ${expense.currency}, Converted: ${convertedAmount} ${project.priceType}`);
  }

  console.log(`[recalculateProjectAmounts] Total expenses: ${totalExpenses} ${project.priceType}`);

  // Update project with calculated amounts
  project.allocatedExpenses = totalExpenses;
  project.allocatedDisputes = 0;

  // Mark fields as modified to ensure they're saved
  project.markModified('allocatedExpenses');
  project.markModified('allocatedDisputes');
  
  // Ensure partners array is properly set for calculation
  if (!Array.isArray(project.partners)) {
    project.partners = [];
  }
  
  // Mark partners as modified to ensure they're included in save
  if (project.partners.length > 0) {
    project.markModified('partners');
    console.log(`[recalculateProjectAmounts] Project has ${project.partners.length} partners:`, project.partners.map(p => `${p.name} (${p.sharePercentage}%)`));
  }

  // Save to trigger pre-save hook which will recalculate all amounts
  // The pre-save hook will calculate partnerShareAmount based on finalAmount and partners
  await project.save();
  
  // CRITICAL: Reload and verify the calculation
  let savedProject = await ProjectModel.findById(projectId);
  if (!savedProject) {
    console.error(`[recalculateProjectAmounts] ERROR: Project not found after save: ${projectId}`);
    return;
  }
  
  const partners = Array.isArray(savedProject.partners) ? savedProject.partners : [];
  const totalShare = partners.reduce((sum, p) => sum + (p.sharePercentage || 0), 0);
  const finalAmount = savedProject.finalAmount || 0;
  
  console.log(`[recalculateProjectAmounts] After save check:`, {
    projectId: projectId.toString(),
    finalAmount,
    partnerShareAmount: savedProject.partnerShareAmount,
    partnersCount: partners.length,
    totalShare,
    partners: partners.map(p => `${p.name} (${p.sharePercentage}%)`),
    allocatedExpenses: savedProject.allocatedExpenses,
  });
  
  // FORCE partnerShareAmount if partners exist
  if (totalShare > 0 && finalAmount > 0) {
    const expectedPartnerShare = finalAmount;
    if (savedProject.partnerShareAmount !== expectedPartnerShare) {
      console.log(`[recalculateProjectAmounts] FORCING partnerShareAmount: ${savedProject.partnerShareAmount} -> ${expectedPartnerShare}`);
      
      // Update using findByIdAndUpdate to ensure it's saved
      await ProjectModel.findByIdAndUpdate(
        projectId,
        { 
          $set: { partnerShareAmount: expectedPartnerShare } 
        },
        { new: true }
      );
      
      // Verify it was saved
      savedProject = await ProjectModel.findById(projectId);
      console.log(`[recalculateProjectAmounts] Verification - partnerShareAmount is now: ${savedProject?.partnerShareAmount}`);
    }
  }
}

/**
 * Recalculate amounts for all projects (useful for bulk updates)
 */
export async function recalculateAllProjects(userId: string): Promise<void> {
  const projects = await ProjectModel.find({ userId });
  
  for (const project of projects) {
    await recalculateProjectAmounts(project._id.toString());
  }
}

