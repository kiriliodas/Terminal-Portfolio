import os
import pyperclip

EXCLUDES = {".git", ".gitignore", ".python"}

def generate_tree(path=".", prefix=""):
    entries = sorted(
        [e for e in os.listdir(path) if e not in EXCLUDES]
    )
    files = [f for f in entries if os.path.isfile(os.path.join(path, f))]
    dirs = [d for d in entries if os.path.isdir(os.path.join(path, d))]

    tree_str = ""
    for i, d in enumerate(dirs):
        connector = "├── " if i < len(dirs) - 1 or files else "└── "
        tree_str += f"{prefix}{connector}{d}/\n"
        extension = "│   " if i < len(dirs) - 1 or files else "    "
        tree_str += generate_tree(os.path.join(path, d), prefix + extension)

    for j, f in enumerate(files):
        connector = "├── " if j < len(files) - 1 else "└── "
        tree_str += f"{prefix}{connector}{f}\n"

    return tree_str

def count_items(path="."):
    total_files = 0
    total_dirs = 0
    for root, dirs, files in os.walk(path):
        dirs[:] = [d for d in dirs if d not in EXCLUDES]
        files = [f for f in files if f not in EXCLUDES]
        total_files += len(files)
        total_dirs += len(dirs)
    return total_dirs, total_files

def main():
    root = os.path.basename(os.getcwd())
    tree_output = f"{root}/\n"
    tree_output += generate_tree(".")
    dirs, files = count_items(".")
    tree_output += f"\n{dirs} directories, {files} files`;\n}}"

    formatted_output = f"""function getTreeOutput() {{
\treturn `{tree_output}
"""

    pyperclip.copy(formatted_output)
    print("Output copié dans le presse-papier au format fonction JS.")

if __name__ == "__main__":
    main()
