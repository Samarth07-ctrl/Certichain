
import { calculateSHA256 } from './crypto';

export interface MerkleProofStep {
  sibling: string;
  position: 'left' | 'right';
}

export interface MerkleProof {
  leaf: string;
  root: string;
  proof: MerkleProofStep[];
  treeHeight: number;
  totalLeaves: number;
}

export class ClientMerkleTree {
  private rawLeaves: string[];
  public levels: string[][] = [];
  public root: string = '';

  constructor(leaves: string[]) {
    this.rawLeaves = [...leaves];
  }

  public async buildTree(): Promise<string> {
    if (this.rawLeaves.length === 0) {
      this.root = '0'.repeat(64);
      this.levels = [[]];
      return this.root;
    }

    let currentLevel = [...this.rawLeaves];
    this.levels = [currentLevel];

    while (currentLevel.length > 1) {
      const nextLevel: string[] = [];
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        // Odd leaf duplication (standard Bitcoin/blockchain convention)
        const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left;
        const parent = await calculateSHA256(left + right);
        nextLevel.push(parent);
      }
      this.levels.push(nextLevel);
      currentLevel = nextLevel;
    }

    this.root = this.levels[this.levels.length - 1][0] || '0'.repeat(64);
    return this.root;
  }

  public getProof(targetLeaf: string): MerkleProof | null {
    const index = this.rawLeaves.indexOf(targetLeaf);
    if (index === -1) return null;

    let currentIndex = index;
    const proof: MerkleProofStep[] = [];

    for (let levelIdx = 0; levelIdx < this.levels.length - 1; levelIdx++) {
      const level = this.levels[levelIdx];
      const isRightChild = currentIndex % 2 === 1;
      let siblingIndex = isRightChild ? currentIndex - 1 : currentIndex + 1;

      // Handle duplicated node on odd level
      if (siblingIndex >= level.length) {
        siblingIndex = currentIndex;
      }

      const siblingHash = level[siblingIndex];
      proof.push({
        sibling: siblingHash,
        position: isRightChild ? 'left' : 'right',
      });

      currentIndex = Math.floor(currentIndex / 2);
    }

    return {
      leaf: targetLeaf,
      root: this.root,
      proof,
      treeHeight: this.levels.length,
      totalLeaves: this.rawLeaves.length,
    };
  }

  public static async verifyProof(
    leaf: string,
    proof: MerkleProofStep[],
    expectedRoot: string
  ): Promise<{ valid: boolean; calculatedRoot: string; steps: { combined: string; result: string }[] }> {
    let currentHash = leaf;
    const steps: { combined: string; result: string }[] = [];

    for (const step of proof) {
      let combined: string;
      if (step.position === 'left') {
        combined = step.sibling + currentHash;
      } else {
        combined = currentHash + step.sibling;
      }
      const parentHash = await calculateSHA256(combined);
      steps.push({ combined, result: parentHash });
      currentHash = parentHash;
    }

    const valid = currentHash.toLowerCase() === expectedRoot.toLowerCase();
    return { valid, calculatedRoot: currentHash, steps };
  }
}
