import jwt from "jsonwebtoken";

const CRON_JWT_SECRET = "6af467228f7e63d73b4d6b50bdcb2e9592d559dd74350a4773787756a81830c8";

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzb3VyY2UiOiJnaXRodWIiLCJ0eXBlIjoiY3JvbiIsIm5hbWUiOiJjaGVja19jaGFyZ2Vfc3RhdGUiLCJpYXQiOjE2NTE2NTk0MzR9.xLZr9Lj8CyJpineE5M_me7mJ-4D8u6nbiK01jTZKiz0
test("jwt", () => {
  const f = () => {
    try {
      const jwtPayload = { source: "github", type: "cron", name: "check_charge_state" };
      const token = jwt.sign(jwtPayload, CRON_JWT_SECRET);
      console.log(token);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  };
  expect(f()).toBeTruthy();
});
