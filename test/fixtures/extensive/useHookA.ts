import { useState } from "react";

export const useHookA = () => {
  const [val, setVal] = useState(0);
  return val;
};
