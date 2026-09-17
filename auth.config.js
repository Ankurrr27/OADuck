import Google from "next-auth/providers/google";

const authConfig = {
  providers: [
    Google({
      checks: ["state"],
    }),
  ],
  session: {
    strategy: "jwt",
  },
};

export default authConfig;