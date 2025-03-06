import { useEffect, useRef } from 'react';

// Keep the JSX namespace declaration for the custom element
declare namespace JSX {
  interface IntrinsicElements {
    'elevenlabs-convai': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      'agent-id': string;
    }, HTMLElement>;
  }
}

export default function ChatBot() {
  const convaiContainerRef = useRef<HTMLDivElement>(null);

  // Add the script loading for ElevenLabs Convai and create the element
  useEffect(() => {
    // Load the script
    const script = document.createElement('script');
    script.src = 'https://elevenlabs.io/convai-widget/index.js';
    script.async = true;
    script.type = 'text/javascript';
    document.body.appendChild(script);

    // Create and append the custom element
    if (convaiContainerRef.current) {
      const convaiElement = document.createElement('elevenlabs-convai');
      convaiElement.setAttribute('agent-id', 'oKVHap86tWaKI54Z55UL');
      convaiContainerRef.current.appendChild(convaiElement);
    }

    return () => {
      // Clean up the script when component unmounts
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      // Clean up the element too
      if (convaiContainerRef.current) {
        convaiContainerRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div
      ref={convaiContainerRef}
      className="fixed bottom-6 right-6 z-50"
    ></div>
  );
}
