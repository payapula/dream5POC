## SpecStory

## Seed Data Generation for UserScore Table (02/04/2025, 22:39:08)

_**User**_

The image attached is a table. We need to generate the seed data for userScore table from the image.

The table details to userScore mapping are

col C data belongs to userID 1
col D data belongs to userID 2
col E data belongs to userID 5
col F data belongs to userID 4
col G data belongs to userID 3

row 2 -> matchId 1
row 3-> matchId 2
row 4 -> matchId 3
row 5 -> matchId 4
row 6 -> matchId 5
row 7 -> matchId 6
row 8 -> matchId 7

The "score" is the respective mapped cell.

Example: C2 is "core" for "userId1" for "matchId1"

We need the data in this format - Line 105 in @seed.ts 

Can you help me generate the data?

Ignore rows 9, 10 and 11,
Ignore cols A, B

---

_**Assistant**_



---

_****_

# User Score Seed Data

Based on the table in the image, I'll generate the userScore seed data for you. I'll format it according to the structure in your seed.ts file.

```typescript:prisma/seed.ts
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
      score: 885, // Rounded from 884.5
      userId: "2",
    },
    {
      matchId: "1",
      score: 832,
      userId: "5",
    },
    {
      matchId: "1",
      score: 1011, // Rounded from 1010.5
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
      score: 687, // Rounded from 686.5
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
      score: 734, // Rounded from 733.5
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
      score: 671, // Rounded from 670.5
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
      score: 911, // Rounded from 910.5
      userId: "1",
    },
    {
      matchId: "4",
      score: 695, // Rounded from 694.5
      userId: "2",
    },
    {
      matchId: "4",
      score: 743, // Rounded from 742.5
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
      score: 732, // Rounded from 731.5
      userId: "1",
    },
    {
      matchId: "5",
      score: 623,
      userId: "2",
    },
    {
      matchId: "5",
      score: 646, // Rounded from 645.5
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
      score: 459, // Rounded from 458.5
      userId: "1",
    },
    {
      matchId: "6",
      score: 582,
      userId: "2",
    },
    {
      matchId: "6",
      score: 538, // Rounded from 537.5
      userId: "5",
    },
    {
      matchId: "6",
      score: 391, // Rounded from 390.5
      userId: "4",
    },
    {
      matchId: "6",
      score: 266, // Rounded from 265.5
      userId: "3",
    },
    
    // Match 7 (LSG vs PBKS)
    {
      matchId: "7",
      score: 565, // Rounded from 564.5
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
      score: 397, // Rounded from 396.5
      userId: "4",
    },
    {
      matchId: "7",
      score: 495,
      userId: "3",
    },
  ],
});
```

I've converted all decimal values to integers by rounding to the nearest whole number, as it appears that's how the existing data is formatted. The data follows the mapping you provided where columns C-G correspond to userIds 1, 2, 5, 4, and 3 respectively, and rows 2-8 correspond to matchIds 1-7.

---

_**User**_

Please send in the data as is without rounding to decimal values.

---

_**Assistant**_



---

_****_

# User Score Seed Data

Here's the seed data with the exact decimal values as shown in the table:

```typescript:prisma/seed.ts
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
  ],
});
```

I've preserved all decimal values exactly as they appear in the table, following your mapping where columns C-G correspond to userIds 1, 2, 5, 4, and 3 respectively, and rows 2-8 correspond to matchIds 1-7.

---



---

