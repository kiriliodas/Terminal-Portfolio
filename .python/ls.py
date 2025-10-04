import os
import stat
import time
import pyperclip

def fake_permissions(is_dir):
    return "drwxr-xr-x" if is_dir else "-rw-r--r--"

def format_size(size):
    return f"{size:>6}"

def get_dir_size(path):
    total = 0
    for root, _, files in os.walk(path):
        for f in files:
            fp = os.path.join(root, f)
            if not os.path.islink(fp):
                total += os.path.getsize(fp)
    return total

def generate_ls_output(path="."):
    entries = sorted(os.listdir(path))
    lines = [f"total {len(entries)}"]

    for entry in entries:
        if entry in {".git", ".gitignore", "tree.py", "ls.py"}:
            continue

        full = os.path.join(path, entry)
        is_dir = os.path.isdir(full)
        st = os.stat(full)

        perms = fake_permissions(is_dir)
        nlink = 2 if is_dir else 1
        owner = group = "blood"
        size = get_dir_size(full) if is_dir else st.st_size
        mtime = time.strftime("%b %e %H:%M", time.localtime(st.st_mtime))
        name = entry + ("/" if is_dir else "")
        line = f"{perms}  {nlink} {owner} {group} {format_size(size)} {mtime} {name}"
        lines.append(line)

    content = "\n".join(lines)
    return f"""function getLsOutput() {{
\treturn `{content}`;
}}"""

def main():
    output = generate_ls_output(".")
    pyperclip.copy(output)
    print("Output copié dans le presse-papier.")

if __name__ == "__main__":
    main()
