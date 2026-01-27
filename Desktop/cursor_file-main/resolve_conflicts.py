import subprocess
import os
import re

def resolve_conflicts():
    # We are in Desktop/cursor_file-main
    cwd = os.getcwd()
    
    # Git root is /Users/sukofi
    # So root relative to here is ../..
    # But let's verify root
    root = subprocess.check_output(['git', 'rev-parse', '--show-toplevel'], text=True).strip()
    
    # Get status in porcelain format with -z
    result_z = subprocess.run(['git', 'status', '--porcelain', '-z'], capture_output=True)
    content = result_z.stdout
    
    i = 0
    while i < len(content):
        status = content[i:i+2].decode('ascii')
        i += 3 # status + space
        
        # Find next NUL
        nul_pos = content.find(b'\0', i)
        if nul_pos == -1:
            break
            
        path_bytes = content[i:nul_pos]
        path_str = path_bytes.decode('utf-8')
        
        # If status is conflict
        if status in ['UA', 'DU', 'AA', 'UU', 'UD', 'AU', 'DD']:
            # path_str is relative to root.
            
            # If path starts with Desktop/cursor_file-main/, it's our local file structure.
            # We want to KEEP this.
            if path_str.startswith('Desktop/cursor_file-main/'):
                print(f"Keeping local path: {path_str}")
                # It should be added.
                # Since we are in Desktop/cursor_file-main, the relative path is path_str without the prefix?
                # No, wait.
                # If path_str is "Desktop/cursor_file-main/file", and we are in "Desktop/cursor_file-main",
                # the file is "./file".
                rel_path = os.path.relpath(os.path.join(root, path_str), cwd)
                subprocess.run(['git', 'add', rel_path], check=False)
                
            else:
                # This is a path at the root (remote change).
                # We want to REMOVE this from index.
                print(f"Removing remote path from index: {path_str}")
                
                # To remove a file at root from here, we need full path or relative.
                # git rm works on the index, so relative to CWD or absolute.
                abs_path = os.path.join(root, path_str)
                subprocess.run(['git', 'rm', '--cached', abs_path], check=False)

        i = nul_pos + 1

    # Handle .gitignore specifically if needed
    # git add .gitignore at root if exists, or Desktop/cursor_file-main/.gitignore
    # Let's just add both if they exist.
    if os.path.exists(os.path.join(root, '.gitignore')):
        subprocess.run(['git', 'add', os.path.join(root, '.gitignore')], check=False)
    if os.path.exists('.gitignore'):
        subprocess.run(['git', 'add', '.gitignore'], check=False)

    # Commit
    subprocess.run(['git', 'commit', '-m', 'Merge remote changes, resolving conflicts by preserving local structure'], check=False)

if __name__ == "__main__":
    resolve_conflicts()
