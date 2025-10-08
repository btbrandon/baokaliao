#!/bin/bash
# Add edge runtime export to all API routes

for file in $(find app/api -name "route.ts" -type f); do
  # Check if file already has runtime export
  if ! grep -q "export const runtime" "$file"; then
    # Add edge runtime export after imports
    sed -i '' "1a\\
export const runtime = 'edge';\\
" "$file"
    echo "✅ Added edge runtime to: $file"
  else
    echo "⏭️  Skipped (already has runtime): $file"
  fi
done

echo "Done!"
