
import Sidebar from '@/components/sidebar';
import React, { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: 'How can I sell my computer parts?',
    answer: 'Click the "selling" button in the sidebar on the left, then select "add-items" from the buttons that open below. On this page, you can add your products to the site for sale.'
  },
  {
    question: 'How do I determine the value of my parts?',
    answer: 'Note down the model numbers and current condition of your parts (working, cosmetic condition). You can estimate a value by looking at the current selling prices of the same or similar parts on online marketplaces.'
  },
  {
    question: 'Which parts can I sell?',
    answer: 'Generally, main components like CPU, GPU, RAM, motherboard, storage units (SSD, HDD), power supply (PSU), and cases can be sold.'
  },
  {
    question: 'What should I pay attention to when selling?',
    answer: 'Communicate openly with the buyer, honestly state the condition of the parts, and prefer secure payment methods.'
  },
  {
    question: 'What should I pay attention to when shipping by cargo?',
    answer: 'Package the parts well, use anti-static bags, box them securely to prevent breakage, and prefer insured shipping methods with tracking numbers.'
  },
  {
    question: 'Does warranty status affect the selling price?',
    answer: 'Yes, parts that are still under warranty or newly purchased can generally be sold at a higher price. It is important to keep warranty documents.'
  },
  {
    question: 'Can I sell old or faulty parts?',
    answer: 'Yes, some buyers may purchase these parts for repair or as spare parts. Clearly state the condition of the part in your listing.'
  },
  {
    question: 'Is an invoice or box required?',
    answer: 'An invoice and the original box can increase the value of the part and provide confidence to the buyer, but they are not mandatory for sale.'
  },
  {
    question: 'Can I sell multiple parts together?',
    answer: 'You can sell multiple units of the same product at once, but it is not possible to sell multiple types of products as a set.'
  },
  {
    question: 'What should I do in case of returns or exchanges?',
    answer: 'Before selling, determine your return or exchange policy and inform the buyer. Generally, returns are not accepted in second-hand sales, but this depends on your preference.'
  },
  
];

const HelpPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <Sidebar/>
      <p>Here are answers to your questions about selling computer parts.</p>

      <div style={{ marginTop: '30px' }}>
        {faqData.map((item, index) => (
          <div key={index} style={{ marginBottom: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
            <button
              onClick={() => handleToggle(index)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '15px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '1.1em',
                fontWeight: 'bold',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              {item.question}
              <span>{openIndex === index ? '-' : '+'}</span>
            </button>
            {openIndex === index && (
              <div style={{ padding: '15px', borderTop: '1px solid #eee', background: '#f9f9f9' }}>
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HelpPage;
