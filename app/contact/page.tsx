'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus('error');
        setErrorMessage(data.error || 'Failed to send message');
        return;
      }

      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      // Reset success message after 5 seconds
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setStatus('error');
      setErrorMessage('Failed to send message. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <div className="border-b border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-6 py-8">
          <Link
            href="/"
            className="inline-block text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 tracking-wider uppercase mb-4 transition-colors"
          >
            ← Back
          </Link>
          <h1 className="text-3xl md:text-4xl font-light text-gray-800 dark:text-gray-200 tracking-wide">
            Get in Touch
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-light">
            Send me a message here and I will try my best to get in touch with you. Thanks!
          </p>
        </div>
      </div>

      {/* Contact Form */}
      <div className="container mx-auto px-6 py-12 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-light text-gray-700 dark:text-gray-300 mb-2">
              Name *
            </label>
            <input
              type="text"
              id="name"
              required
              className="block w-full px-4 py-3 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 focus:border-transparent transition-all"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={status === 'loading'}
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-light text-gray-700 dark:text-gray-300 mb-2">
              Email *
            </label>
            <input
              type="email"
              id="email"
              required
              className="block w-full px-4 py-3 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 focus:border-transparent transition-all"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={status === 'loading'}
            />
          </div>

          {/* Subject */}
          <div>
            <label htmlFor="subject" className="block text-sm font-light text-gray-700 dark:text-gray-300 mb-2">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              className="block w-full px-4 py-3 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 focus:border-transparent transition-all"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              disabled={status === 'loading'}
            />
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-light text-gray-700 dark:text-gray-300 mb-2">
              Message *
            </label>
            <textarea
              id="message"
              required
              rows={6}
              className="block w-full px-4 py-3 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 focus:border-transparent transition-all resize-none"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              disabled={status === 'loading'}
            />
          </div>

          {/* Status Messages */}
          {status === 'success' && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 font-light">
                ✓ Message sent successfully! We&apos;ll get back to you soon.
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 font-light">
                ✗ {errorMessage}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full px-6 py-3 bg-gray-900 text-white text-sm font-light tracking-wider uppercase rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-gray-800 py-8 mt-16">
        <div className="container mx-auto px-6 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500 tracking-wide">
            © {new Date().getFullYear()} Copyright Cici Rotell
          </p>
        </div>
      </footer>
    </div>
  );
}
