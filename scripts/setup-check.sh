#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 BoLui Setup Check${NC}\n"

# Check Node.js version
echo -e "${YELLOW}Checking Node.js version...${NC}"
NODE_VERSION=$(node -v)
echo -e "Node.js version: ${GREEN}$NODE_VERSION${NC}\n"

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✓${NC} .env.local file found"
    
    # Check for required environment variables
    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local && \
       grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; then
        echo -e "${GREEN}✓${NC} Supabase credentials configured"
    else
        echo -e "${RED}✗${NC} Missing Supabase credentials in .env.local"
        echo -e "${YELLOW}Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY${NC}"
    fi
else
    echo -e "${RED}✗${NC} .env.local file not found"
    echo -e "${YELLOW}Please create .env.local with your Supabase credentials${NC}"
fi

echo ""

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} Dependencies installed"
else
    echo -e "${YELLOW}⚠${NC}  Dependencies not installed"
    echo -e "${YELLOW}Run: npm install${NC}"
fi

echo ""

# Check if Supabase schema exists
if [ -f "supabase/schema.sql" ]; then
    echo -e "${GREEN}✓${NC} Database schema file found"
    echo -e "${YELLOW}Remember to run this SQL in your Supabase dashboard${NC}"
else
    echo -e "${RED}✗${NC} Database schema file not found"
fi

echo ""
echo -e "${GREEN}Next steps:${NC}"
echo -e "1. ${YELLOW}npm install${NC} - Install dependencies (if not done)"
echo -e "2. Configure ${YELLOW}.env.local${NC} with Supabase credentials"
echo -e "3. Run the SQL from ${YELLOW}supabase/schema.sql${NC} in Supabase"
echo -e "4. ${YELLOW}npm run dev${NC} - Start the development server"
echo -e "5. Open ${YELLOW}http://localhost:3000${NC} in your browser"
echo ""
