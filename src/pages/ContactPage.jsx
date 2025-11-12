import React from 'react'

function Contact() {
  return (
    <section className="max-w-4xl mx-auto px-4 py-20 text-center">
      <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
      <p className="text-gray-600 mb-6">
        Have questions or feedback? We'd love to hear from you!
      </p>
      <a href="mailto:support@pullshark.ai" className="text-indigo-600 font-medium hover:underline">
        support@pullshark.ai
      </a>
    </section>
  )
}

export default Contact