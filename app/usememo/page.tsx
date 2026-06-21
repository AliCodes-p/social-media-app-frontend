/*"use client";
import { useState, useMemo } from "react";

export default function App() {
  const [count, setCount] = useState(0);

  const number = 5;

  const factorial = useMemo(() => {
    console.log("Calculating factorial...");

    let result = 1;
    for (let i = 1; i <= number; i++) {
      result *= i;
    }

    return result;
  }, [number]);

  return (
    <div>
      <h2>Factorial: {factorial}</h2>

      <button onClick={() => setCount(count + 1)}>Click Me ({count})</button>
    </div>
  );
}*/
"use client";

import { useState } from "react";

export default function App() {
  const [count, setCount] = useState(0);

  const number = 5;

  console.log("Component rendered");

  console.log("Calculating factorial...");

  let result = 1;

  for (let i = 1; i <= number; i++) {
    result = result * i;
  }

  return (
    <div>
      <h2>
        Factorial of {number} = {result}
      </h2>

      <button onClick={() => setCount(count + 1)}>Re-render ({count})</button>
    </div>
  );
}
