#!/bin/bash

# ============================================================================
# MODULE 7 - INSTALLATION SCRIPT: KNOWLEDGE BASE
# ============================================================================

echo "=================================================="
echo "MODULE 7: Installing Knowledge Base"
echo "=================================================="
echo ""

# Set script to exit on error
set -e

# Navigate to project root
cd /mnt/project

echo "📦 Creating directories..."
mkdir -p components/incidents
mkdir -p app/incidents/knowledge-base/[id]
mkdir -p app/api/incidents/knowledge-base/[id]/feedback

echo ""
echo "📄 Copying Knowledge Base components..."

# Copy KB article card
cp /home/claude/components/incidents/kb-article-card.tsx \
   components/incidents/kb-article-card.tsx
echo "✓ Copied: kb-article-card.tsx"

# Copy feedback buttons
cp /home/claude/components/incidents/kb-feedback-buttons.tsx \
   components/incidents/kb-feedback-buttons.tsx
echo "✓ Copied: kb-feedback-buttons.tsx"

# Copy KB list page
cp /home/claude/app/incidents/knowledge-base/page.tsx \
   app/incidents/knowledge-base/page.tsx
echo "✓ Copied: app/incidents/knowledge-base/page.tsx"

# Copy KB detail page
cp /home/claude/app/incidents/knowledge-base/[id]/page.tsx \
   app/incidents/knowledge-base/[id]/page.tsx
echo "✓ Copied: app/incidents/knowledge-base/[id]/page.tsx"

# Copy feedback API route
cp /home/claude/app/api/incidents/knowledge-base/[id]/feedback/route.ts \
   app/api/incidents/knowledge-base/[id]/feedback/route.ts
echo "✓ Copied: app/api/incidents/knowledge-base/[id]/feedback/route.ts"

echo ""
echo "=================================================="
echo "✅ Installation Complete!"
echo "=================================================="
echo ""
echo "Files installed:"
echo "  • components/incidents/kb-article-card.tsx"
echo "  • components/incidents/kb-feedback-buttons.tsx"
echo "  • app/incidents/knowledge-base/page.tsx"
echo "  • app/incidents/knowledge-base/[id]/page.tsx"
echo "  • app/api/incidents/knowledge-base/[id]/feedback/route.ts"
echo ""
echo "Next steps:"
echo "  1. Test KB list at: http://localhost:3000/incidents/knowledge-base"
echo "  2. Test search functionality (enter keywords)"
echo "  3. Test category filtering"
echo "  4. Click an article to view detail"
echo "  5. Test 'Was this helpful?' buttons"
echo "  6. Verify view count increments"
echo ""
echo "🎉 ALL MUST-HAVE FEATURES COMPLETE!"
echo "Module 7 MVP is ready for testing and deployment."
echo ""
