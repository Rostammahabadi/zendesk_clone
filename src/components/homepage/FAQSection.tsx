import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../components/ui/accordion"

export default function FAQSection() {
  const faqs = [
    {
      question: "What does Medicare Part A cover?",
      answer:
        "Medicare Part A covers inpatient hospital stays, skilled nursing facility care, hospice care, and some home health care.",
    },
    {
      question: "How do I enroll in Medicare?",
      answer:
        "You can enroll in Medicare online at www.ssa.gov, by calling Social Security at 1-800-772-1213, or in person at your local Social Security office.",
    },
    {
      question: "What is the difference between Original Medicare and Medicare Advantage?",
      answer:
        "Original Medicare is provided by the federal government and includes Part A and Part B. Medicare Advantage is offered by private insurance companies and often includes additional benefits like prescription drug coverage and dental care.",
    },
    // Add more FAQs as needed
  ]

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
