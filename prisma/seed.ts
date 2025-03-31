import { PrismaClient } from "@prisma/client";
import { matchSeedData } from "./seedData/matches";
const prisma = new PrismaClient();

/**
 * Delete all existing data
 */
await prisma.match.deleteMany();
await prisma.team.deleteMany();
await prisma.user.deleteMany();

/**
 * Create teams
 */
await prisma.team.createMany({
  data: [
    {
      id: "1",
      name: "CSK",
    },
    {
      id: "2",
      name: "DC",
    },
    {
      id: "3",
      name: "GT",
    },
    {
      id: "4",
      name: "KKR",
    },
    {
      id: "5",
      name: "LSG",
    },
    {
      id: "6",
      name: "MI",
    },
    {
      id: "7",
      name: "PK",
    },
    {
      id: "8",
      name: "RR",
    },
    {
      id: "9",
      name: "RCB",
    },
    {
      id: "10",
      name: "SRH",
    },
  ],
});

/**
 * Create Users
 */
await prisma.user.createMany({
  data: [
    {
      id: "1",
      name: "Bharathi Kannan",
      displayName: "BK",
    },
    {
      id: "2",
      name: "Karthik",
      displayName: "Assasino",
    },
    {
      id: "3",
      name: "Naveen",
      displayName: "NKutty",
    },
    {
      id: "4",
      name: "Balamurali",
      displayName: "Bala",
    },
    {
      id: "5",
      name: "Hari Prasad",
      displayName: "HP",
    },
  ],
});

/**
 * Create Matches
 */
await prisma.match.createMany({
  data: matchSeedData,
});
