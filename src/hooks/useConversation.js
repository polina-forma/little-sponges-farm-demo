import { useState, useCallback } from 'react';

/**
 * useConversation - Hook for managing conversation state and AI interactions
 *
 * Returns:
 * - messages: Array of conversation messages
 * - addMessage: Add a new message to the conversation
 * - sendToTutor: Send child's message to AI and get response
 * - isProcessing: Whether AI is currently generating response
 * - clearHistory: Reset conversation
 */
export function useConversation() {
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const addMessage = useCallback((message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const sendToTutor = useCallback(async (childMessage) => {
    setIsProcessing(true);

    try {
      // Build conversation history for context
      const conversationHistory = messages.map(msg => ({
        role: msg.role === 'tutor' ? 'assistant' : 'user',
        content: msg.content
      }));

      // Add current message
      conversationHistory.push({
        role: 'user',
        content: childMessage
      });

      // Send to API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: conversationHistory
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get tutor response');
      }

      const data = await response.json();
      const tutorResponse = data.response;

      // Add tutor's response to messages
      addMessage({
        role: 'tutor',
        content: tutorResponse,
        timestamp: new Date()
      });

      return tutorResponse;

    } catch (error) {
      console.error('Error getting tutor response:', error);

      // Demo fallback - in production, remove this
      const demoResponses = getDemoResponse(childMessage);
      addMessage({
        role: 'tutor',
        content: demoResponses,
        timestamp: new Date()
      });
      return demoResponses;

    } finally {
      setIsProcessing(false);
    }
  }, [messages, addMessage]);

  const clearHistory = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    addMessage,
    sendToTutor,
    isProcessing,
    clearHistory
  };
}

/**
 * Demo responses for testing without API
 * Remove in production
 */
function getDemoResponse(input) {
  const lowerInput = input.toLowerCase();

  // Check for animal mentions
  if (lowerInput.includes('vaca') || lowerInput.includes('cow')) {
    return '¡Muy bien! 🐄 Yes, la vaca! The cow says "moo" - in Spanish we say "muuu". ¿De qué color es la vaca? What color is the cow?';
  }

  if (lowerInput.includes('cerdo') || lowerInput.includes('pig')) {
    return '¡Excelente! 🐷 El cerdo - the pig! Pigs say "oink oink" - in Spanish: "oinc oinc". ¿Cuántos cerdos ves? How many pigs do you see?';
  }

  if (lowerInput.includes('pollo') || lowerInput.includes('chicken')) {
    return '¡Fantástico! 🐔 El pollo makes "pío pío" in Spanish! That\'s "peep peep". Can you count the chickens? ¿Puedes contar los pollos?';
  }

  if (lowerInput.includes('caballo') || lowerInput.includes('horse')) {
    return '¡Muy bien! 🐴 El caballo is big and strong! Horses say "hiiii" in Spanish. ¿De qué color es el caballo? Is it brown - marrón?';
  }

  // Check for colors
  if (lowerInput.includes('rojo') || lowerInput.includes('red')) {
    return '¡Sí! Rojo means red! Great job! 🔴 What else do you see that is rojo on the farm?';
  }

  if (lowerInput.includes('marrón') || lowerInput.includes('brown')) {
    return '¡Muy bien! Marrón is brown! 🤎 Many farm animals are marrón. Can you find one?';
  }

  // Check for numbers
  if (lowerInput.match(/uno|dos|tres|cuatro|cinco|one|two|three|four|five/)) {
    return '¡Excelente counting! You\'re doing great with your numbers! 🔢 ¿Puedes contar más animales? Can you count more animals?';
  }

  // Default encouraging response
  const defaultResponses = [
    '¡Muy bien! I heard you say something! Can you tell me more? ¿Qué animales ves en la granja? What animals do you see on the farm?',
    'Great try! Let\'s practice together. Can you point to an animal and tell me its name in Spanish? 🐾',
    '¡Buen trabajo! Keep going! Look at the farm - ¿ves la vaca? Do you see the cow?',
    'You\'re doing wonderfully! Let\'s count together. ¿Cuántos animales hay? How many animals are there? Uno, dos, tres...'
  ];

  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

export default useConversation;
