// Inspired by https://github.com/DevStarSJ/javascript.util/blob/master/src/LexoRank.js

// It's represented as a string of the form "bucket|rank:marker", e.g. "0|skdfj3:1"
interface LexoRank {
  bucket: 0 | 1 | 2;
  rank: string;
  marker: 0 | 1 | 2;
}

const minChar = "0";
const maxChar = "z";

function mid(prev: string, next: string): string {
  const middleASCII = parseInt(((prev.charCodeAt(0) + next.charCodeAt(0)) / 2).toString(), 10);
  return String.fromCharCode(middleASCII);
}

export function stringToLexoRank(str: string): LexoRank {
  const [bucket, rank_marker] = str.split("|");
  const [rank, marker] = rank_marker.split(":");
  return {
    bucket: parseInt(bucket, 10) as LexoRank["bucket"],
    rank,
    marker: parseInt(marker, 10) as LexoRank["marker"],
  };
}

export function lexoRankToString(lexoRank: LexoRank): string {
  return `${lexoRank.bucket}|${lexoRank.rank}:${lexoRank.marker}`;
}

const getChar = (str: string, i: number, defaultChar: string): string => (i >= str.length ? defaultChar : str[i]);

export function calculateLexoRank(prev: LexoRank | string, next: LexoRank | string): LexoRank {
  if (typeof prev === "string") prev = stringToLexoRank(prev);
  if (typeof next === "string") next = stringToLexoRank(next);

  let rank = "";
  let i = 0;

  while (true) {
    const prevChar = getChar(prev.rank, i, minChar);
    const nextChar = getChar(next.rank, i, maxChar);
    const nextStep = (): void => {
      rank += prevChar;
      i++;
    };

    if (prevChar === nextChar) {
      nextStep();
      continue;
    }

    const midChar = mid(prevChar, nextChar);
    if (midChar === prevChar || midChar === nextChar) {
      nextStep();
      continue;
    }

    rank += midChar;
    break;
  }

  return rank >= next.rank ? prev : { bucket: prev.bucket, rank, marker: prev.marker };
}
