"""
CertiChain Merkle Tree & Inclusion Proof Engine
-----------------------------------------------
Implements:
1. Complete Binary Merkle Tree calculation from a list of transaction hashes.
2. Pairwise hashing with standard odd-leaf duplication.
3. Generation of Merkle Audit Paths (inclusion proofs) for individual transactions.
4. Cryptographic verification of inclusion proofs without inspecting the entire block.
"""

from typing import List, Dict, Any, Optional
from .crypto import calculate_sha256


class MerkleTree:
    def __init__(self, leaves: List[str]):
        """
        Initializes Merkle Tree from a list of transaction hashes (leaves).
        If leaves is empty, root is a null hash.
        """
        self.raw_leaves = leaves.copy()
        self.levels: List[List[str]] = []
        self.root: str = ""
        self.build_tree()

    def build_tree(self) -> str:
        if not self.raw_leaves:
            self.root = "0" * 64
            self.levels = [[]]
            return self.root

        current_level = self.raw_leaves.copy()
        self.levels = [current_level]

        while len(current_level) > 1:
            next_level: List[str] = []
            for i in range(0, len(current_level), 2):
                left = current_level[i]
                # If odd number of elements, duplicate last node (standard Bitcoin convention)
                right = current_level[i + 1] if i + 1 < len(current_level) else left
                parent = calculate_sha256(left + right)
                next_level.append(parent)

            self.levels.append(next_level)
            current_level = next_level

        self.root = self.levels[-1][0] if self.levels[-1] else "0" * 64
        return self.root

    def get_proof(self, target_leaf: str) -> Optional[Dict[str, Any]]:
        """
        Generates the Merkle Audit Path for `target_leaf`.
        Returns:
        {
            "leaf": target_leaf,
            "root": self.root,
            "proof": [{"sibling": str, "position": "left" | "right"}, ...]
        }
        """
        if target_leaf not in self.raw_leaves:
            return None

        index = self.raw_leaves.index(target_leaf)
        proof = []

        for level_idx in range(len(self.levels) - 1):
            level = self.levels[level_idx]
            is_right_child = (index % 2 == 1)
            sibling_index = index - 1 if is_right_child else index + 1

            # Handle duplicated node on odd level
            if sibling_index >= len(level):
                sibling_index = index

            sibling_hash = level[sibling_index]
            proof.append({
                "sibling": sibling_hash,
                "position": "left" if is_right_child else "right",
            })

            index //= 2

        return {
            "leaf": target_leaf,
            "root": self.root,
            "proof": proof,
            "treeHeight": len(self.levels),
            "totalLeaves": len(self.raw_leaves),
        }

    @staticmethod
    def verify_proof(leaf: str, proof: List[Dict[str, str]], expected_root: str) -> bool:
        """
        Verifies whether `leaf` is part of a Merkle Tree with `expected_root`
        using only the provided audit path steps.
        """
        current_hash = leaf
        for step in proof:
            sibling = step["sibling"]
            position = step["position"]

            if position == "left":
                # sibling is on left: Hash(sibling + current)
                current_hash = calculate_sha256(sibling + current_hash)
            else:
                # sibling is on right: Hash(current + sibling)
                current_hash = calculate_sha256(current_hash + sibling)

        return current_hash.lower() == expected_root.lower()

    def to_dict(self) -> Dict[str, Any]:
        """Returns JSON-serializable representation of the tree structure."""
        return {
            "root": self.root,
            "levels": self.levels,
            "totalLeaves": len(self.raw_leaves),
        }
