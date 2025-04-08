import { PrismaClient } from "@prisma/client-generated";
import { matchSeedData } from "./seedData/matches";
const prisma = new PrismaClient();

/**
 * Delete all existing data except userScores
 */
// await prisma.userScore.deleteMany();
await prisma.user.deleteMany();
await prisma.match.deleteMany();
await prisma.team.deleteMany();

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
      name: "Karthik",
      displayName: "Assasino",
    },
    {
      id: "2",
      name: "Naveen",
      displayName: "Naveen",
    },
    {
      id: "3",
      name: "Hari Prasad",
      displayName: "HP",
    },
    {
      id: "4",
      name: "Bharathi Kannan",
      displayName: "BK",
    },
    {
      id: "5",
      name: "Balamurali",
      displayName: "Bala",
    },
  ],
});

/**
 * Create Matches
 */
await prisma.match.createMany({
  data: matchSeedData,
});
