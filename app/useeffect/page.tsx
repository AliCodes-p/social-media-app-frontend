/*"use client";

import { useEffect } from "react";

export default function Page() {
  useEffect(() => {
    console.log("Page loaded");
  }, []);

  return <h1>Hello</h1>;
}*/
"use client";

import { useContext, useEffect } from "react";
import { UserContext } from "@/context/context";

export default function Counter() {
  const { count, setCount } = useContext(UserContext);

  useEffect(() => {
    console.log("Count changed:", count);
  }, [count]);

  return (
    <div>
      <h1>{count}</h1>

      <button onClick={() => setCount(count + 1)}>Increase</button>
    </div>
  );
}
