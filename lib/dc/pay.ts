import { useState } from "react";
import useDC from "./dc";

export const usePay = ({ amount, callback }: { amount: string; callback: () => void }) => {
  const { connected, call, pay } = useDC();
  const [isPaying, setIsPaying] = useState(false);
};
