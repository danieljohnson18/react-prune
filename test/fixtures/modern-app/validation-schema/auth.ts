export const LoginSchema = {};
export const SignupSchema = {};
// These are exported but unused in this fixture, but we want to see if the tool flags them correctly as unused.
// Wait, the user wants us to fix false positives if they ARE used.
// If they are TRULY unused, they should be flagged.
// But if they are just exported and used in a file we haven't created, they will be flagged.
// Let's create a file that uses them.
