import { getRandomInt } from "@lib/utils";

test("getRandomInt", () => {
  const f = () => {
    for (let i = 0; i < 1000; i++) {
      const v = getRandomInt(1, 10);
      console.log(v);
      if (v === 10) return true;
      if (v < 1 || v > 10) return false;
    }
    return false;
  };
  expect(f()).toBeTruthy();
});
