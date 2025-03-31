import { PrismaClient } from "@prisma/client";
import { matchSeedData } from "./seedData/matches";
const prisma = new PrismaClient();

/**
 * Delete all existing data
 */
await prisma.match.deleteMany();
await prisma.team.deleteMany();
await prisma.user.deleteMany();
await prisma.userScore.deleteMany();

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
      displayName: "NKutty",
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

/**
 * Create User Scores
 */
await prisma.userScore.createMany({
  data: [
    {
      matchId: "1",
      score: 866,
      userId: "1",
    },
    {
      matchId: "1",
      score: 884,
      userId: "2",
    },
    {
      matchId: "1",
      score: 768,
      userId: "3",
    },
    {
      matchId: "1",
      score: 1011,
      userId: "4",
    },
    {
      matchId: "1",
      score: 832,
      userId: "5",
    },
  ],
});
