import { PrismaClient } from "@prisma/client-generated";
import { matchSeedData } from "./seedData/matches";
const prisma = new PrismaClient();

/**
 * Delete all existing data
 */
await prisma.userScore.deleteMany();
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

/**
 * Create User Scores
 */
await prisma.userScore.createMany({
  data: [
    // Match 1 (GT vs PBKS)
    {
      matchId: "1",
      score: 866,
      userId: "1",
    },
    {
      matchId: "1",
      score: 884.5,
      userId: "2",
    },
    {
      matchId: "1",
      score: 832,
      userId: "5",
    },
    {
      matchId: "1",
      score: 1010.5,
      userId: "4",
    },
    {
      matchId: "1",
      score: 768,
      userId: "3",
    },

    // Match 2 (RR vs KKR)
    {
      matchId: "2",
      score: 586,
      userId: "1",
    },
    {
      matchId: "2",
      score: 686.5,
      userId: "2",
    },
    {
      matchId: "2",
      score: 550,
      userId: "5",
    },
    {
      matchId: "2",
      score: 634,
      userId: "4",
    },
    {
      matchId: "2",
      score: 550,
      userId: "3",
    },

    // Match 3 (CHE vs RCB)
    {
      matchId: "3",
      score: 733.5,
      userId: "1",
    },
    {
      matchId: "3",
      score: 856,
      userId: "2",
    },
    {
      matchId: "3",
      score: 736,
      userId: "5",
    },
    {
      matchId: "3",
      score: 670.5,
      userId: "4",
    },
    {
      matchId: "3",
      score: 756,
      userId: "3",
    },

    // Match 4 (GT vs MI)
    {
      matchId: "4",
      score: 910.5,
      userId: "1",
    },
    {
      matchId: "4",
      score: 694.5,
      userId: "2",
    },
    {
      matchId: "4",
      score: 742.5,
      userId: "5",
    },
    {
      matchId: "4",
      score: 722,
      userId: "4",
    },
    {
      matchId: "4",
      score: 813,
      userId: "3",
    },

    // Match 5 (RR vs CHE)
    {
      matchId: "5",
      score: 731.5,
      userId: "1",
    },
    {
      matchId: "5",
      score: 623,
      userId: "2",
    },
    {
      matchId: "5",
      score: 645.5,
      userId: "5",
    },
    {
      matchId: "5",
      score: 546,
      userId: "4",
    },
    {
      matchId: "5",
      score: 697,
      userId: "3",
    },

    // Match 6 (MI vs KKR)
    {
      matchId: "6",
      score: 458.5,
      userId: "1",
    },
    {
      matchId: "6",
      score: 582,
      userId: "2",
    },
    {
      matchId: "6",
      score: 537.5,
      userId: "5",
    },
    {
      matchId: "6",
      score: 390.5,
      userId: "4",
    },
    {
      matchId: "6",
      score: 265.5,
      userId: "3",
    },

    // Match 7 (LSG vs PBKS)
    {
      matchId: "7",
      score: 564.5,
      userId: "1",
    },
    {
      matchId: "7",
      score: 350,
      userId: "2",
    },
    {
      matchId: "7",
      score: 466,
      userId: "5",
    },
    {
      matchId: "7",
      score: 396.5,
      userId: "4",
    },
    {
      matchId: "7",
      score: 495,
      userId: "3",
    },

    // Match 8 (RCB vs GT)
    {
      matchId: "8",
      score: 785,
      userId: "1",
    },
    {
      matchId: "8",
      score: 685,
      userId: "2",
    },
    {
      matchId: "8",
      score: 510.5,
      userId: "5",
    },
    {
      matchId: "8",
      score: 796.5,
      userId: "4",
    },
    {
      matchId: "8",
      score: 651,
      userId: "3",
    },

    // Match 9 (RCB vs GT)
    {
      matchId: "9",
      score: 602,
      userId: "1",
    },
    {
      matchId: "9",
      score: 483,
      userId: "2",
    },
    {
      matchId: "9",
      score: 540,
      userId: "5",
    },
    {
      matchId: "9",
      score: 749,
      userId: "4",
    },
    {
      matchId: "9",
      score: 630.5,
      userId: "3",
    },

    // Match 10 (RCB vs GT)
    {
      matchId: "10",
      score: 1010.5,
      userId: "1",
    },
    {
      matchId: "10",
      score: 554.5,
      userId: "2",
    },
    {
      matchId: "10",
      score: 965.5,
      userId: "5",
    },
    {
      matchId: "10",
      score: 863.5,
      userId: "4",
    },
    {
      matchId: "10",
      score: 826.5,
      userId: "3",
    },
  ],
});
