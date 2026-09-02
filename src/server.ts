import express from "express";
import cors from "cors";
import { router } from "./routes.js";

const server = express();
const corsOptions = {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token'],
  credentials: true,
};

server.use(express.json());
server.use(cors(corsOptions));
server.options(/.*/, cors(corsOptions));
server.use(router);

export { server }