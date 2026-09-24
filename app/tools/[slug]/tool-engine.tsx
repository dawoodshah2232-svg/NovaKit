'use client';

import dynamic from 'next/dynamic';

function ToolEngineFallback() {
  return (
    <div
      aria-hidden="true"
      className="rounded-3xl border border-slate-200/80 bg-white p-10 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="mx-auto h-9 w-44 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
      <div className="mx-auto mt-5 h-36 max-w-lg animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800/70" />
    </div>
  );
}

const ImageCompressor = dynamic(() => import('@/components/tools/image-compressor').then((m) => m.ImageCompressor), {
  loading: () => <ToolEngineFallback />,
});
const PdfMerger = dynamic(() => import('@/components/tools/pdf-merger').then((m) => m.PdfMerger), {
  loading: () => <ToolEngineFallback />,
});
const InvoiceGenerator = dynamic(() => import('@/components/tools/invoice-generator').then((m) => m.InvoiceGenerator), {
  loading: () => <ToolEngineFallback />,
});
const TaxCalculator = dynamic(() => import('@/components/tools/tax-calculator').then((m) => m.TaxCalculator), {
  loading: () => <ToolEngineFallback />,
});
const QrGenerator = dynamic(() => import('@/components/tools/qr-generator').then((m) => m.QrGenerator), {
  loading: () => <ToolEngineFallback />,
});
const ColorExtractor = dynamic(() => import('@/components/tools/color-extractor').then((m) => m.ColorExtractor), {
  loading: () => <ToolEngineFallback />,
});
const TextAnalyzer = dynamic(() => import('@/components/tools/text-analyzer').then((m) => m.TextAnalyzer), {
  loading: () => <ToolEngineFallback />,
});
const PasswordGenerator = dynamic(() => import('@/components/tools/password-generator').then((m) => m.PasswordGenerator), {
  loading: () => <ToolEngineFallback />,
});
const SplitPdf = dynamic(() => import('@/components/tools/split-pdf').then((m) => m.SplitPdf), {
  loading: () => <ToolEngineFallback />,
});
const CompressPdf = dynamic(() => import('@/components/tools/compress-pdf').then((m) => m.CompressPdf), {
  loading: () => <ToolEngineFallback />,
});
const PdfToImage = dynamic(() => import('@/components/tools/pdf-to-image').then((m) => m.PdfToImage), {
  loading: () => <ToolEngineFallback />,
});
const ProtectPdf = dynamic(() => import('@/components/tools/protect-pdf').then((m) => m.ProtectPdf), {
  loading: () => <ToolEngineFallback />,
});
const ImageToPdf = dynamic(() => import('@/components/tools/image-to-pdf').then((m) => m.ImageToPdf), {
  loading: () => <ToolEngineFallback />,
});
const OrganizePdf = dynamic(() => import('@/components/tools/organize-pdf').then((m) => m.OrganizePdf), {
  loading: () => <ToolEngineFallback />,
});
const RotatePdf = dynamic(() => import('@/components/tools/rotate-pdf').then((m) => m.RotatePdf), {
  loading: () => <ToolEngineFallback />,
});
const WatermarkPdf = dynamic(() => import('@/components/tools/watermark-pdf').then((m) => m.WatermarkPdf), {
  loading: () => <ToolEngineFallback />,
});
const UnlockPdf = dynamic(() => import('@/components/tools/unlock-pdf').then((m) => m.UnlockPdf), {
  loading: () => <ToolEngineFallback />,
});
const EditPdfMetadata = dynamic(() => import('@/components/tools/edit-pdf-metadata').then((m) => m.EditPdfMetadata), {
  loading: () => <ToolEngineFallback />,
});
const OcrPdf = dynamic(() => import('@/components/tools/ocr-pdf').then((m) => m.OcrPdf), {
  loading: () => <ToolEngineFallback />,
});
const SignPdf = dynamic(() => import('@/components/tools/sign-pdf').then((m) => m.SignPdf), {
  loading: () => <ToolEngineFallback />,
});
const PdfToWord = dynamic(() => import('@/components/tools/pdf-to-word').then((m) => m.PdfToWord), {
  loading: () => <ToolEngineFallback />,
});
const WordToPdf = dynamic(() => import('@/components/tools/word-to-pdf').then((m) => m.WordToPdf), {
  loading: () => <ToolEngineFallback />,
});
const DeletePdfPages = dynamic(() => import('@/components/tools/delete-pdf-pages').then((m) => m.DeletePdfPages), {
  loading: () => <ToolEngineFallback />,
});
const ExtractPdfPages = dynamic(() => import('@/components/tools/extract-pdf-pages').then((m) => m.ExtractPdfPages), {
  loading: () => <ToolEngineFallback />,
});
const AddPageNumbers = dynamic(() => import('@/components/tools/add-page-numbers').then((m) => m.AddPageNumbers), {
  loading: () => <ToolEngineFallback />,
});
const CropPdf = dynamic(() => import('@/components/tools/crop-pdf').then((m) => m.CropPdf), {
  loading: () => <ToolEngineFallback />,
});
const PdfToText = dynamic(() => import('@/components/tools/pdf-to-text').then((m) => m.PdfToText), {
  loading: () => <ToolEngineFallback />,
});
const FlattenPdf = dynamic(() => import('@/components/tools/flatten-pdf').then((m) => m.FlattenPdf), {
  loading: () => <ToolEngineFallback />,
});
const RedactPdf = dynamic(() => import('@/components/tools/redact-pdf').then((m) => m.RedactPdf), {
  loading: () => <ToolEngineFallback />,
});
const HeicToJpg = dynamic(() => import('@/components/tools/heic-to-jpg').then((m) => m.HeicToJpg), {
  loading: () => <ToolEngineFallback />,
});
const ExcelToPdf = dynamic(() => import('@/components/tools/excel-to-pdf').then((m) => m.ExcelToPdf), {
  loading: () => <ToolEngineFallback />,
});


export function ToolEngine({ slug }: { slug: string }) {
  return (
    <>
{/* Render Tool Engine */}
      {slug === 'image-to-pdf' ? (
        <ImageToPdf />
      ) : slug === 'pdf-to-images' || slug === 'pdf-to-image' ? (
        <PdfToImage />
      ) : slug === 'pdf-to-jpg' ? (
        <PdfToImage jpgOnly analyticsSlug="pdf-to-jpg" />
      ) : slug === 'pdf-to-word' ? (
        <PdfToWord />
      ) : slug === 'word-to-pdf' ? (
        <WordToPdf />
      ) : slug === 'ocr-pdf' ? (
        <OcrPdf />
      ) : slug === 'sign-pdf' ? (
        <SignPdf />
      ) : slug === 'delete-pdf-pages' || slug === 'pdf-page-delete' ? (
        <DeletePdfPages />
      ) : slug === 'extract-pdf-pages' || slug === 'pdf-page-extractor' ? (
        <ExtractPdfPages />
      ) : slug === 'add-page-numbers' || slug === 'pdf-number-pages' ? (
        <AddPageNumbers />
      ) : slug === 'crop-pdf' || slug === 'pdf-cropper' ? (
        <CropPdf />
      ) : slug === 'pdf-to-text' || slug === 'pdf-text-extractor' ? (
        <PdfToText />
      ) : slug === 'flatten-pdf' || slug === 'pdf-flattener' ? (
        <FlattenPdf />
      ) : slug === 'redact-pdf' || slug === 'pdf-redaction' ? (
        <RedactPdf />
      ) : slug === 'organize-pdf' || slug === 'pdf-page-reorder' ? (
        <OrganizePdf />
      ) : slug === 'unlock-pdf' || slug === 'pdf-password-remover' ? (
        <UnlockPdf />
      ) : slug === 'rotate-pdf' || slug === 'pdf-page-rotator' ? (
        <RotatePdf />
      ) : slug === 'watermark-pdf' || slug === 'pdf-watermarker' ? (
        <WatermarkPdf />
      ) : slug === 'split-pdf' || slug === 'pdf-page-splitter' ? (
        <SplitPdf />
      ) : slug === 'edit-pdf-metadata' || slug === 'pdf-metadata-editor' ? (
        <EditPdfMetadata />
      ) : slug === 'pdf-merger' ? (
        <PdfMerger />
      ) : slug === 'compress-pdf' ? (
        <CompressPdf />
      ) : slug === 'protect-pdf' ? (
        <ProtectPdf />
      ) : slug === 'image-compressor' ? (
        <ImageCompressor />
      ) : slug === 'invoice-generator' ? (
        <InvoiceGenerator />
      ) : slug === 'tax-calculator' ? (
        <TaxCalculator />
      ) : slug === 'qr-generator' ? (
        <QrGenerator />
      ) : slug === 'color-extractor' ? (
        <ColorExtractor />
      ) : slug === 'text-analyzer' ? (
        <TextAnalyzer />
      ) : slug === 'password-generator' ? (
        <PasswordGenerator />
      ) : slug === 'heic-to-jpg' ? (
        <HeicToJpg />
      ) : slug === 'excel-to-pdf' ? (
        <ExcelToPdf />
      ) : (
        <div className="text-center py-12 text-slate-400">Tool not found</div>
      )}
    </>
  );
}
