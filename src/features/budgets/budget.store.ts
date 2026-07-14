"use client";

import { useSyncExternalStore } from "react";
import { mockBudgetManagerItems } from "@/mocks/finance";
import type { BudgetManagerVM } from "@/shared/types/view-models";

type Listener = () => void;

let budgetState = [...mockBudgetManagerItems];
const listeners = new Set<Listener>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return budgetState;
}

function setBudgets(nextBudgets: BudgetManagerVM[]) {
  budgetState = nextBudgets;
  emitChange();
}

export function useBudgetStore() {
  const budgets = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  function createBudget(budget: BudgetManagerVM) {
    setBudgets([budget, ...budgetState]);
  }

  function updateBudget(budget: BudgetManagerVM) {
    setBudgets(
      budgetState.map((entry) => (entry.id === budget.id ? budget : entry)),
    );
  }

  function deleteBudget(budgetId: string) {
    setBudgets(budgetState.filter((budget) => budget.id !== budgetId));
  }

  return {
    budgets,
    createBudget,
    updateBudget,
    deleteBudget,
  };
}
