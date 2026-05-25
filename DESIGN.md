# Caretta - Architecture and Design notes

WIP

These are the architectural and design decisions behind the prototype and the reasoning for each one.

1. Component hierarchy
   Describe the main components, how they are organized, and any deliberate boundary decisions (e.g., why something was split into two components rather than kept as one).

   

2. State management decision
   Explain which approach you chose (local state, React Context, an external store, or a combination) and why. If you used more than one approach for different parts of the app, explain the reasoning behind each boundary.

   

3. Slot generation logic
   Describe where this logic lives (utility function, custom hook, service module) and why you placed it there. What would break if it lived somewhere else?

   

4. Concurrency note
   You are not implementing locking, but explain in 3–5 sentences how you would prevent two patients from booking the same slot simultaneously in a production system. Describe the strategy and its trade-offs.

   

5. One trade-off you made
   Pick any decision where you consciously chose one approach over another. Describe both options and why you went with the one you did.

   

6. One product improvement you would propose
   If you were presenting this to the product team after delivering the prototype, what would you suggest adding or changing, and why?

   