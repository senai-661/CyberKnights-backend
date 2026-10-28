
import express from "express";
import cors from "cors";
import { router } from "./routes.js";

const server = express();

const origensPermitidas = [
  "http://localhost:5173",
  "https://deployando-r7f2d8sfj-cyberknights.vercel.app",
];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || origensPermitidas.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Origem não permitida pelo CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-access-token"],
  credentials: true,
};

server.use(cors(corsOptions));
server.use(express.json());
server.use(router);

export { server };
