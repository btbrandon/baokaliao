#!/bin/bash
# Fix edge runtime export position - should be after imports

for file in $(find app/api -name "route.ts" -type f); do
  # Remove existing misplaced runtime export
  sed -i '' '/^export const runtime/d' "$file"
  
  # Find the last import line and add runtime export after it
  awk '
    /^import / { last_import = NR }
    { lines[NR] = $0 }
    END {
      for (i = 1; i <= NR; i++) {
        print lines[i]
        if (i == last_import) {
          print ""
          print "export const runtime = '\''edge'\'';"
        }
      }
    }
  ' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
  
  echo "✅ Fixed: $file"
done

echo "Done!"
