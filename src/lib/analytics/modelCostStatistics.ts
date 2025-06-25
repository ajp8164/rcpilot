import { Model } from 'realmdb/Model';

export type ModelCostStatistics = {
  perEventCost: number;
  totalMaintenanceCost: number;
  uncertainCost: boolean;
};

export const modelCostStatistics = (
  model: Model,
  maintenance?: {
    oldValue?: number;
    newValue?: number;
  },
) => {
  // Operating costs.
  // Can only compute per event cost here.
  let uncertainCost = model.statistics.uncertainCost || false;
  if (!model.purchasePrice) {
    uncertainCost = true;
  }

  // Maintenance cost.
  let totalMaintenanceCost =
    model.statistics.totalMaintenanceCost -
    (maintenance?.oldValue || 0) +
    (maintenance?.newValue || 0);
  totalMaintenanceCost = totalMaintenanceCost || 0;

  // Per-event cost.
  let perEventCost = 0;
  if (model.statistics.totalEvents > 0) {
    perEventCost =
      ((model.purchasePrice || 0) + totalMaintenanceCost) /
      model.statistics.totalEvents;
  } else {
    perEventCost = (model.purchasePrice || 0) + totalMaintenanceCost;
  }

  return {
    perEventCost,
    totalMaintenanceCost,
    uncertainCost,
  } as ModelCostStatistics;
};

export const updateMaintenanceCost = (
  model: Model,
  oldValue: number,
  newValue: number,
) => {
  model.statistics.totalMaintenanceCost =
    model.statistics.totalMaintenanceCost - oldValue + newValue;
};
