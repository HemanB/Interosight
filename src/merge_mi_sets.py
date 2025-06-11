import json
from pathlib import Path

input_dir = Path("datasets/MI_synthetic_training_pairs")
output_path = Path("datasets/mi_training_data.jsonl")

input_files = sorted(input_dir.glob("set_*.json"))

merged_count = 0

with open(output_path, "w", encoding="utf-8") as fout:
    for fpath in input_files:
        if fpath.stat().st_size == 0:
            print(f"Warning: Skipping empty file: {fpath.name}")
            continue
        try:
            with open(fpath, "r", encoding="utf-8") as fin:
                data = json.load(fin)
                for entry in data:
                    record = {
                        "prompt": entry["prompt"].strip(),
                        "response": entry["response"].strip()
                    }
                    fout.write(json.dumps(record) + "\n")
                    merged_count += 1
        except json.JSONDecodeError:
            print(f"Error: Invalid JSON in: {fpath.name} — skipping.")

print(f"Success: Merged {merged_count} examples → {output_path}")
