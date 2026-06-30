import { useState, useCallback } from 'react';
import type { BankStatement } from '../parsers/types';
import { readPdfPages } from '../services/pdfReader';
import { detectAndParse } from '../parsers/index';

export interface FileItem {
  id: string;
  file: File;
  status: 'queued' | 'processing' | 'done' | 'error';
  progress: number;
  bankDetected?: string;
  result?: BankStatement;
  errorMsg?: string;
}

export function useFileProcessor() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [statements, setStatements] = useState<BankStatement[]>([]);

  const updateFile = useCallback((id: string, patch: Partial<FileItem>) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, ...patch } : f));
  }, []);

  const processFile = useCallback(async (item: FileItem) => {
    updateFile(item.id, { status: 'processing', progress: 10 });

    const { pages, error: readError } = await readPdfPages(item.file);

    if (readError || pages.length === 0) {
      updateFile(item.id, {
        status: 'error',
        progress: 0,
        errorMsg: readError || 'PDF tidak bisa dibaca.',
      });
      return;
    }

    updateFile(item.id, { progress: 60 });

    const result = detectAndParse(pages);

    if (!result.success || !result.data) {
      updateFile(item.id, {
        status: 'error',
        progress: 0,
        errorMsg: result.error || 'Gagal memparse PDF.',
      });
      return;
    }

    result.data.sourceFile = item.file.name;

    updateFile(item.id, {
      status: 'done',
      progress: 100,
      bankDetected: result.data.bankName,
      result: result.data,
    });

    setStatements(prev => [...prev, result.data!]);
  }, [updateFile]);

  const addFiles = useCallback((newFiles: File[]) => {
    const items: FileItem[] = newFiles
      .filter(f => f.type === 'application/pdf')
      .map(f => ({
        id: crypto.randomUUID(),
        file: f,
        status: 'queued',
        progress: 0,
      }));

    if (items.length === 0) return;

    setFiles(prev => [...prev, ...items]);

    items.reduce(
      (chain, item) => chain.then(() => processFile(item)),
      Promise.resolve()
    );
  }, [processFile]);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => {
      const removed = prev.find(f => f.id === id);
      if (removed?.result) {
        setStatements(s => s.filter(stmt => stmt.sourceFile !== removed.file.name));
      }
      return prev.filter(f => f.id !== id);
    });
  }, []);

  const reset = useCallback(() => {
    setFiles([]);
    setStatements([]);
  }, []);

  return { files, statements, addFiles, removeFile, reset };
}
