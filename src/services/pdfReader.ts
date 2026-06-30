import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

export interface PdfReadResult {
  pages: string[];
  pageCount: number;
  error?: string;
}

interface TextItem {
  str: string;
  transform: number[];
  width: number;
  height: number;
}

function groupByY(items: TextItem[], threshold = 3): TextItem[][] {
  const rows: TextItem[][] = [];
  let currentRow: TextItem[] = [];
  let currentY: number | null = null;

  const sorted = [...items].sort((a, b) => {
    const yDiff = b.transform[5] - a.transform[5];
    if (Math.abs(yDiff) > threshold) return yDiff;
    return a.transform[4] - b.transform[4];
  });

  for (const item of sorted) {
    const y = item.transform[5];
    if (currentY === null || Math.abs(y - currentY) > threshold) {
      if (currentRow.length > 0) rows.push(currentRow);
      currentRow = [item];
      currentY = y;
    } else {
      currentRow.push(item);
    }
  }
  if (currentRow.length > 0) rows.push(currentRow);

  return rows;
}

export async function readPdfPages(file: File): Promise<PdfReadResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pages: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const items = content.items as TextItem[];

      const rows = groupByY(items);
      const pageText = rows
        .map(row => row.map(item => item.str).join(' '))
        .join('\n');

      pages.push(pageText);
    }

    return { pages, pageCount: pdf.numPages };
  } catch (err) {
    return {
      pages: [],
      pageCount: 0,
      error: `Gagal membaca PDF: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
