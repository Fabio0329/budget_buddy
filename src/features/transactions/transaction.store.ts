"use client";

import { useSyncExternalStore } from "react";
import { mockTransactionManagerItems } from "@/mocks/finance";
import type { TransactionManagerVM } from "@/shared/types/view-models";

type Listener = () => void;

let transactionState = [...mockTransactionManagerItems];
const listeners = new Set<Listener>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return transactionState;
}

function setTransactions(nextTransactions: TransactionManagerVM[]) {
  transactionState = nextTransactions;
  emitChange();
}

export function useTransactionStore() {
  const transactions = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot,
  );

  function createTransaction(transaction: TransactionManagerVM) {
    setTransactions([transaction, ...transactionState]);
  }

  function importTransactions(nextTransactions: TransactionManagerVM[]) {
    setTransactions([...nextTransactions, ...transactionState]);
  }

  function updateTransaction(transaction: TransactionManagerVM) {
    setTransactions(
      transactionState.map((entry) =>
        entry.id === transaction.id ? transaction : entry,
      ),
    );
  }

  function deleteTransaction(transactionId: string) {
    setTransactions(
      transactionState.filter((transaction) => transaction.id !== transactionId),
    );
  }

  return {
    transactions,
    createTransaction,
    importTransactions,
    updateTransaction,
    deleteTransaction,
  };
}
