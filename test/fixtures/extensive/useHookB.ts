import { useEffect } from "react";

export const useHookB = () => {
  useEffect(() => {
    console.log("Unused hook");
  }, []);
};
