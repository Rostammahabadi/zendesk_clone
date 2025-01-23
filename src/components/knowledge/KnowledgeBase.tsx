import { useState } from 'react';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';
import { useFaqs } from '../../hooks/queries/useFaqs';
import { Faq } from '../../types/faq';
import { Transition } from '@headlessui/react';
import { Disclosure } from '@headlessui/react';

export const KnowledgeBase = () => {
  const { data: faqs, isLoading } = useFaqs();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = faqs?.filter(faq => {
    const searchLower = searchQuery.toLowerCase();
    return (
      faq.question.toLowerCase().includes(searchLower) ||
      faq.answer.toLowerCase().includes(searchLower) ||
      (faq.category && faq.category.toLowerCase().includes(searchLower))
    );
  });

  const groupedFaqs = filteredFaqs?.reduce((acc, faq) => {
    const category = faq.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(faq);
    return acc;
  }, {} as Record<string, Faq[]>);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Heading */}
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        Knowledge Base
      </h1>

      {/* Search Bar */}
      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Search knowledge base..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* FAQ List */}
      <div className="space-y-8">
        {groupedFaqs &&
          (Object.entries(groupedFaqs) as [string, Faq[]][]).map(([category, categoryFaqs]) => (
            <div
              key={category}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
            >
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                {category}
              </h2>
              <div className="space-y-2">
                {categoryFaqs.map((faq) => (
                  <Disclosure key={faq.id}>
                    {({ open }) => (
                      <div className="border-b last:border-0 border-gray-200 dark:border-gray-700 py-3">
                        <Disclosure.Button className="flex justify-between items-center w-full text-left text-gray-900 dark:text-gray-100 focus:outline-none">
                          <span className="font-medium">{faq.question}</span>
                          <span className="ml-4">
                            {open ? (
                              <ChevronUp className="h-5 w-5 text-gray-500" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-500" />
                            )}
                          </span>
                        </Disclosure.Button>
                        <Transition
                          show={open}
                          enter="transition duration-200 ease-out"
                          enterFrom="opacity-0 max-h-0"
                          enterTo="opacity-100 max-h-screen"
                          leave="transition duration-150 ease-in"
                          leaveFrom="opacity-100 max-h-screen"
                          leaveTo="opacity-0 max-h-0"
                        >
                          <Disclosure.Panel className="mt-2 text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                            {faq.answer}
                          </Disclosure.Panel>
                        </Transition>
                      </div>
                    )}
                  </Disclosure>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}; 