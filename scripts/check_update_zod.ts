import { UpdateUserBody } from "../lib/api-zod/src";

const body = {
  name: "New Full Name",
  username: "cold_barista",
  role: "barista",
  branchId: null,
  isActive: true
};

const parsed = UpdateUserBody.safeParse(body);
console.log("Parsed:", JSON.stringify(parsed, null, 2));
process.exit(0);
