export default function TermsOfService() {
  return (
    <main className='max-w-4xl mx-auto px-4 py-12'>
      <h1 className='text-3xl font-bold mb-6'>Terms of Service</h1>
      <p className='mb-4 text-gray-600'>Last updated: September 19, 2026</p>
      
      <section className='space-y-4 text-gray-700'>
        <h2 className='text-xl font-semibold mt-6'>1. Acceptance of Terms</h2>
        <p>By accessing pdfedit.website, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>

        <h2 className='text-xl font-semibold mt-6'>2. Use of Free Tools</h2>
        <p>PDFEdit Studio provides free client-side PDF utility tools. You are solely responsible for ensuring you have the right to modify or convert any documents you process through our tools.</p>

        <h2 className='text-xl font-semibold mt-6'>3. Limitation of Liability</h2>
        <p>The tools are provided "as is" without warranty of any kind. We are not responsible for any data loss or document corruption resulting from browser-side execution.</p>
      </section>
    </main>
  );
}
