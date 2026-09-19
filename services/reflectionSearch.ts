export type SearchableReflection = {
  id: string | number;
  title?: string | null;
  status?: string | null;
  projectGroup?: string | null;
  workedOn?: string | null;
  challenges?: string | null;
  learned?: string | null;
  improvement?: string | null;
  otherReflection?: string | null;
  submittedDate?: string;
  updatedAt?: string | null;
};

type WeightedField = {
  value?: string | null;
  weight: number;
};

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "at",
  "for",
  "from",
  "in",
  "is",
  "it",
  "my",
  "of",
  "on",
  "show",
  "that",
  "the",
  "to",
  "was",
  "were",
  "where",
  "with",
]);

const SYNONYM_GROUPS: string[][] = [
  [
    "team",
    "teamwork",
    "collaboration",
    "collaborate",
    "communication",
    "group",
  ],
  [
    "problem",
    "problems",
    "challenge",
    "challenges",
    "issue",
    "issues",
    "difficulty",
    "difficulties",
    "obstacle",
    "debug",
    "debugging",
    "bug",
    "bugs",
    "error",
    "errors",
  ],
  [
    "code",
    "coding",
    "development",
    "developing",
    "programming",
    "implementation",
    "backend",
    "frontend",
  ],
  [
    "database",
    "mysql",
    "sql",
    "data",
    "storage",
  ],
  [
    "test",
    "testing",
    "verification",
    "quality",
  ],
  [
    "learn",
    "learned",
    "learning",
    "knowledge",
    "understand",
    "understanding",
  ],
  [
    "improve",
    "improved",
    "improvement",
    "better",
    "enhance",
    "future",
  ],
  [
    "api",
    "endpoint",
    "request",
    "response",
    "server",
  ],
  [
    "design",
    "interface",
    "ui",
    "ux",
    "layout",
    "screen",
  ],
  [
    "manage",
    "management",
    "organise",
    "organize",
    "planning",
    "schedule",
  ],
];

const synonymMap = new Map<string, Set<string>>();

for (const group of SYNONYM_GROUPS) {
  const relatedWords = new Set(group);

  for (const word of group) {
    synonymMap.set(word, relatedWords);
  }
}

export function normaliseSearchText(value: unknown): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getQueryTokens(query: string): string[] {
  return normaliseSearchText(query)
    .split(" ")
    .filter(
      (word) =>
        word.length > 1 &&
        !STOP_WORDS.has(word)
    );
}

function getRelatedWords(word: string): Set<string> {
  return synonymMap.get(word) ?? new Set([word]);
}

function getFields(
  reflection: SearchableReflection
): WeightedField[] {
  return [
    {
      value: reflection.title,
      weight: 5,
    },
    {
      value: reflection.challenges,
      weight: 4,
    },
    {
      value: reflection.learned,
      weight: 4,
    },
    {
      value: reflection.workedOn,
      weight: 3,
    },
    {
      value: reflection.improvement,
      weight: 3,
    },
    {
      value: reflection.otherReflection,
      weight: 2,
    },
    {
      value: reflection.projectGroup,
      weight: 1.5,
    },
    {
      value: reflection.status,
      weight: 1,
    },
  ];
}

export function scoreReflection(
  reflection: SearchableReflection,
  query: string
): number {
  const normalisedQuery =
    normaliseSearchText(query);

  const queryTokens =
    getQueryTokens(query);

  if (
    !normalisedQuery ||
    queryTokens.length === 0
  ) {
    return 0;
  }

  let score = 0;
  let matchedConcepts = 0;

  for (const token of queryTokens) {
    let bestTokenScore = 0;

    const relatedWords =
      getRelatedWords(token);

    for (const field of getFields(reflection)) {
      const normalisedField =
        normaliseSearchText(field.value);

      if (!normalisedField) {
        continue;
      }

      const fieldWords = new Set(
        normalisedField.split(" ")
      );

      let fieldScore = 0;

      if (fieldWords.has(token)) {
        fieldScore =
          4 * field.weight;
      } else if (
        normalisedField.includes(token)
      ) {
        fieldScore =
          3 * field.weight;
      } else {
        for (const relatedWord of relatedWords) {
          if (relatedWord === token) {
            continue;
          }

          if (fieldWords.has(relatedWord)) {
            fieldScore = Math.max(
              fieldScore,
              2 * field.weight
            );
          } else if (
            normalisedField.includes(
              relatedWord
            )
          ) {
            fieldScore = Math.max(
              fieldScore,
              1 * field.weight
            );
          }
        }
      }

      bestTokenScore = Math.max(
        bestTokenScore,
        fieldScore
      );
    }

    if (bestTokenScore > 0) {
      matchedConcepts += 1;
      score += bestTokenScore;
    }
  }

  for (const field of getFields(reflection)) {
    const normalisedField =
      normaliseSearchText(field.value);

    if (
      normalisedField.includes(
        normalisedQuery
      )
    ) {
      score += 6 * field.weight;
    }
  }

  if (matchedConcepts === 0) {
    return 0;
  }

  const coverage =
    matchedConcepts /
    queryTokens.length;

  return score * coverage;
}

export function rankReflections<
  T extends SearchableReflection,
>(
  reflections: T[],
  query: string
): T[] {
  const normalisedQuery =
    normaliseSearchText(query);

  if (!normalisedQuery) {
    return reflections;
  }

  return reflections
    .map(
      (
        reflection,
        originalIndex
      ) => ({
        reflection,
        originalIndex,
        score: scoreReflection(
          reflection,
          query
        ),
      })
    )
    .filter(
      (result) =>
        result.score > 0
    )
    .sort((first, second) => {
      if (
        second.score !==
        first.score
      ) {
        return (
          second.score -
          first.score
        );
      }

      return (
        first.originalIndex -
        second.originalIndex
      );
    })
    .map(
      (result) =>
        result.reflection
    );
}