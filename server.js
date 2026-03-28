#!/usr/bin/env node

// Railway injects PORT env var — pass it to Next.js standalone server
process.env.PORT = process.env.PORT || "3000";
process.env.HOSTNAME = "0.0.0.0";

require("./.next/standalone/server.js");
