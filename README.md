# Tarot Card Picker

This project is a React-based Tarot card picker created with **Vite**. It allows users to draw Tarot cards online and easily generate prompts for ChatGPT to interpret the results.

## Website

![Tarot Card Picker Demo](https://github.com/anduscheung/my-icon-host/blob/main/tarot-picking-demo.gif)

You can access the live version of this app here:

[https://tarot-cards-picking.netlify.app](https://tarot-cards-picking.netlify.app)

---

## Motivation

I created this project for the following reasons:

1. **Interest in Tarot**: I recently developed an interest in Tarot cards, but I don't own a physical deck (introduced to me by a friend).
2. **Learning Tarot**: As a beginner, I struggle to interpret the cards' meanings, so this app makes it convenient to draw cards online and generate results that ChatGPT can explain.
3. **Experimenting with Vite**: I wanted to try Vite as an alternative to Create React App, which has not been updated for a while.
4. **Enhancing CSS Animation Skills**: This project allowed me to practice and implement intensive CSS animations without relying on JavaScript.
5. **Graphic Design Challenge**:
   - I designed the **magic circle** that symbolizes the summoning of the cards.
   - I also created the **back of the cards**.
   - The **front of the cards** are sourced from free resources.

---

## How to Use

1. **Ask a Question**:  
   Enter a question about your life. You can ask about decisions, future outcomes, or guidance. Some examples:

   - _I have a meeting with my friends and we’re deciding between Restaurant A and B._  
     → Ask **two separate questions**:

     - "What will my experience be like at Restaurant A?"
     - "What will my experience be like at Restaurant B?"

   - _I want to buy a car and I’m considering a $10,000, $20,000, or $30,000 option._  
     → Ask **three separate questions**:

     - "What will happen if I buy a $10,000 car?"
     - "What will happen if I buy a $20,000 car?"
     - "What will happen if I buy a $30,000 car?"

   - _I'm currently job hunting. What can I expect in my search?_  
     → Ask **one question**:

     - "How will my job hunting process go?"

   - _I have an upcoming exam. What should I know about it?_  
     → Ask **one question**:
     - "What will I be doing in the upcoming exam?"

2. **Draw the Cards**:  
   Click the button to draw three cards. These cards can represent various aspects of your situation, such as influences, challenges, potential outcomes, or guidance on your best course of action.

3. **Generate a Prompt for ChatGPT**:  
   Click "Ask ChatGPT to explain it" to generate a structured prompt. The prompt is automatically copied to your clipboard.

4. **Interpret the Results**:  
   Paste the prompt into ChatGPT and let it provide a detailed analysis of your Tarot reading.

---

## Understanding Tarot Readings

- **Time Frame**: Tarot readings are most accurate when predicting events within the next **three months**. Longer-term predictions can be influenced by many factors.
- **Future is Fluid**: Tarot reflects the most likely outcome **based on your current energy and circumstances**. Since energy is constantly shifting, your future may change if you make new decisions, take different actions, or external factors evolve.
- **Energy and Influence**: Tarot does not determine fate but helps you understand the energy around a situation. It provides insight into potential paths and influences, allowing you to make more informed choices.
- **Guidance Over Certainty**: Tarot is best used as a tool for insight and self-reflection, rather than as a guarantee of specific events. It empowers you to navigate your life with greater awareness and clarity.

---

## When Can I Ask the Same Question Again?

- **If Nothing Has Changed → Wait at Least 2-4 Weeks**

  - Tarot reflects your **current energy and circumstances**. If nothing significant has changed, asking too soon may result in **similar or conflicting answers** without new insight.

- **If You’ve Taken Action or Made New Decisions → Ask Sooner**

  - If you've made a major change or taken a different approach, you can ask again **after a few days or a week** to see how the energy has shifted.

- **If You Keep Getting Confusing or Contradictory Readings → Take a Break**

  - Instead of repeating the same question, try a different angle:
    - _“What do I need to know about this situation?”_
    - _“What can I do to improve this outcome?”_

- **For Short-Term vs. Long-Term Questions:**

  - **Short-term (weeks/months)** → Wait **2-3 weeks** before asking again.
  - **Long-term (year or more)** → Wait at least **a few months**, unless major events shift.

- **Trust Your Intuition**:
  - If you feel restless or impatient about asking the same question, it might mean you’re looking for reassurance rather than real guidance. Take time to reflect before pulling the cards again.

---

## Future Improvements (roadmap)

- **Add Reversed Card Support**: Include the option to draw reversed cards and their meanings. I haven't learnt that yet so there is not support for this for now.
- **Enhanced Animations**: Introduce additional effects like card shuffling or deck drawing.

---

## Tech Stack

- **React**: For building the user interface.
- **Vite**: A fast and modern build tool for better development experience.
- **TypeScript**: To maintain type safety and improve code reliability.
- **SCSS (CSS Modules)**: For modular and scoped styling.
- **SVG Graphics**: For the magic circle and other custom visuals.
