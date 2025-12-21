import * as pdfjsLib from 'pdfjs-dist';

// Set worker to use local file for offline support
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';

export const extractTextFromPDF = async (file) => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        let fullText = '';

        // Limit to first 10 pages to prevent freezing on large docs
        const maxPages = Math.min(pdf.numPages, 10);

        for (let i = 1; i <= maxPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += `Page ${i}:\n${pageText}\n\n`;
        }

        return {
            text: fullText,
            pageCount: pdf.numPages,
            info: {
                pagesRead: maxPages,
                isTruncated: pdf.numPages > 10
            }
        };
    } catch (error) {
        console.error('Error reading PDF:', error);
        throw new Error('Failed to read PDF file.');
    }
};
